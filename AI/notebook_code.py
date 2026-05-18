# Import packages
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import datetime
import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, mean_absolute_error

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)
tf.random.set_seed(RANDOM_STATE)

print('TensorFlow version:', tf.__version__)
print('GPU available:', len(tf.config.list_physical_devices("GPU")) > 0)
# Load Data
df = pd.read_csv('/content/cardiovascular_risk_dataset_feature_engineered.csv')
df_model = df.copy()

# Preprocessing Data
# Labelling
le_target = LabelEncoder()
df_model['risk_category_encoded'] = le_target.fit_transform(df_model['risk_category'])
print('Class mapping:', dict(enumerate(le_target.classes_)))

# Menghapus fitur yang merupakan target dan juga identifier
drop_cols = ['Patient_ID', 'risk_category', 'heart_disease_risk_score', 'risk_category_encoded']
X = df_model.drop(columns=drop_cols)
y_class = df_model['risk_category_encoded'].values
y_score = df_model['heart_disease_risk_score'].values

NUM_CLASSES  = len(le_target.classes_)
NUM_FEATURES = X.shape[1]
print('Jumlah fitur :', NUM_FEATURES)   # 25
print('Jumlah kelas :', NUM_CLASSES)    # 3
print('Distribusi  :', pd.Series(y_class).value_counts().sort_index().to_dict())
# Split data menjadi training, validasi, dan testing
X_train, X_test, y_train, y_test, ys_train, ys_test = train_test_split(
    X.values, y_class, y_score,
    test_size=0.2, random_state=RANDOM_STATE, stratify=y_class
)
X_train, X_val, y_train, y_val, ys_train, ys_val = train_test_split(
    X_train, y_train, ys_train,
    test_size=0.2, random_state=RANDOM_STATE, stratify=y_train
)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_val   = scaler.transform(X_val)
X_test  = scaler.transform(X_test)

SCORE_MAX              = ys_train.max()   # 100.0
y_score_norm           = ys_train / SCORE_MAX
y_score_val_norm       = ys_val   / SCORE_MAX

print('Train:', X_train.shape, '| Val:', X_val.shape, '| Test:', X_test.shape)
# Custom Layer - Feature Attention Block
class FeatureAttentionBlock(tf.keras.layers.Layer):

    def __init__(self, units, reduction_ratio=4, dropout_rate=0.2, **kwargs):
        super(FeatureAttentionBlock, self).__init__(**kwargs)
        self.units           = units
        self.reduction_ratio = reduction_ratio
        self.dropout_rate    = dropout_rate
        self.dense_main = layers.Dense(units, activation='gelu')
        self.layer_norm = layers.LayerNormalization()
        self.dropout    = layers.Dropout(dropout_rate)
        se_units        = max(units // reduction_ratio, 8)
        self.se_squeeze = layers.Dense(se_units, activation='relu')
        self.se_excite  = layers.Dense(units,    activation='sigmoid')
        self.proj = layers.Dense(units, use_bias=False)

    def build(self, input_shape):
        self.dense_main.build(input_shape)
        self.proj.build(input_shape)
        dense_main_shape = (input_shape[0], self.units)
        self.layer_norm.build(dense_main_shape)
        se_units = max(self.units // self.reduction_ratio, 8)
        self.se_squeeze.build(dense_main_shape)
        se_shape = (input_shape[0], se_units)
        self.se_excite.build(se_shape)
        super(FeatureAttentionBlock, self).build(input_shape)

    def call(self, inputs, training=False):
        x = self.dense_main(inputs)
        x = self.layer_norm(x)
        x = self.dropout(x, training=training)
        attn = self.se_squeeze(x)
        attn = self.se_excite(attn)
        x    = x * attn
        residual = self.proj(inputs)
        return tf.keras.activations.gelu(x + residual)

    def get_config(self):
        config = super().get_config()
        config.update({
            'units'          : self.units,
            'reduction_ratio': self.reduction_ratio,
            'dropout_rate'   : self.dropout_rate,
        })
        return config

# Quick test
_t = tf.random.normal([4, 25])
_o = FeatureAttentionBlock(units=64)(_t, training=False)
print('FeatureAttentionBlock output shape:', _o.shape)
# Custom Loss - Minority Aware Loss
class MinorityAwareLoss(tf.keras.losses.Loss):
    def __init__(self, gamma=2.0,
                 class_weights=None,
                 name='minority_aware_loss', **kwargs):
        super(MinorityAwareLoss, self).__init__(name=name, **kwargs)
        self.gamma = gamma

        if class_weights is None:
            # Formula: total / (n_classes * count_per_class)
            # kelas 0: 5500/(3*1418)=1.293,
            # kelas 1: 5500/(3*1838)=0.998,
            # kelas 2: 5500/(3*2244)=0.817
            self.class_weights = tf.constant([1.293, 0.998, 0.817], dtype=tf.float32)
        else:
            self.class_weights = tf.constant(class_weights, dtype=tf.float32)

    def call(self, y_true, y_pred):
        y_pred    = tf.clip_by_value(y_pred, 1e-7, 1.0 - 1e-7)
        n_classes = tf.shape(y_pred)[-1]
        y_true_oh = tf.one_hot(tf.cast(y_true, tf.int32), n_classes)
        y_true_oh = tf.cast(y_true_oh, tf.float32)

        # Probabilitas kelas benar
        p_t = tf.reduce_sum(y_true_oh * y_pred, axis=-1)

        # Cross-entropy
        ce = -tf.math.log(p_t)

        # Focal weight
        focal_w = tf.pow(1.0 - p_t, self.gamma)

        # Class weight
        sample_weights = tf.reduce_sum(
            y_true_oh * self.class_weights, axis=-1
        )

        return sample_weights * focal_w * ce

    def get_config(self):
        config = super().get_config()
        config.update({
            'gamma'         : self.gamma,
            'class_weights' : self.class_weights.numpy().tolist(),
        })
        return config

# Quick test
_yt = tf.constant([0, 1, 2])
_yp = tf.constant([[0.9, 0.05, 0.05],
                   [0.1, 0.80, 0.10],
                   [0.2, 0.20, 0.60]])
print('MinorityAwareLoss test:', MinorityAwareLoss()(_yt, _yp).numpy())
# Custom Callback - Adaptive Training Monitor
class AdaptiveTrainingMonitor(tf.keras.callbacks.Callback):
    def __init__(self, warmup_epochs=5, initial_lr=1e-3,
                 patience_plateau=5, overfit_threshold=0.05):
        super(AdaptiveTrainingMonitor, self).__init__()
        self.warmup_epochs      = warmup_epochs
        self.initial_lr         = initial_lr
        self.patience_plateau   = patience_plateau
        self.overfit_threshold  = overfit_threshold

        self.best_val_loss      = float('inf')
        self.best_val_acc       = 0.0
        self.best_epoch         = 0
        self.plateau_counter    = 0
        self.history_log        = []

    def on_epoch_begin(self, epoch, logs=None):
        if epoch < self.warmup_epochs:
            warmup_lr = self.initial_lr * ((epoch + 1) / self.warmup_epochs)
            self.model.optimizer.learning_rate.assign(warmup_lr)
            print(f'\n  [Warmup] Epoch {epoch+1}: LR = {warmup_lr:.6f}')

    def on_epoch_end(self, epoch, logs=None):
        logs      = logs or {}
        val_loss  = logs.get('val_loss', float('inf'))
        val_acc   = logs.get('val_class_output_accuracy',
                    logs.get('val_accuracy', 0.0))
        train_acc = logs.get('class_output_accuracy',
                    logs.get('accuracy', 0.0))

        self.history_log.append({
            'epoch'    : epoch + 1,
            'val_loss' : round(val_loss,  5),
            'val_acc'  : round(val_acc,   5),
            'train_acc': round(train_acc, 5),
        })

        if val_acc > self.best_val_acc:
            self.best_val_acc = val_acc

        # Cek plateau
        if val_loss < self.best_val_loss:
            self.best_val_loss   = val_loss
            self.best_epoch      = epoch + 1
            self.plateau_counter = 0
        else:
            self.plateau_counter += 1
            if self.plateau_counter >= self.patience_plateau:
                print(f'\n  [WARNING] Epoch {epoch+1}: val_loss tidak membaik '
                      f'selama {self.patience_plateau} epoch.')

        # Cek overfitting
        gap = train_acc - val_acc
        if gap > self.overfit_threshold:
            print(f'\n  [WARNING] Epoch {epoch+1}: overfitting terdeteksi. '
                  f'Gap train-val acc = {gap:.3f} '
                  f'(train={train_acc:.3f}, val={val_acc:.3f})')

    def on_train_end(self, logs=None):
        print('\n' + '='*60)
        print('  Training Selesai, AdaptiveTrainingMonitor Summary')
        print('='*60)
        print(f'  Best epoch   : {self.best_epoch}')
        print(f'  Best val_loss: {self.best_val_loss:.5f}')
        print(f'  Best val_acc : {self.best_val_acc:.5f}')

        top3 = sorted(self.history_log,
                      key=lambda x: x['val_acc'], reverse=True)[:3]
        print('\n  Top-3 Epoch (Val Accuracy):')
        for r in top3:
            print(f"    Epoch {r['epoch']:3d} | "
                  f"val_acc={r['val_acc']:.4f} | "
                  f"val_loss={r['val_loss']:.5f} | "
                  f"train_acc={r['train_acc']:.4f}")
        print('='*60)

print('Custom components defined')
# Functional API + Feature Attention Block

def build_attention_model(num_features, num_classes):
    inputs = layers.Input(shape=(num_features,), name='input_layer')

    # Stem
    x = layers.Dense(256, activation='gelu')(inputs)
    x = layers.LayerNormalization()(x)
    x = layers.Dropout(0.1)(x)

    # FeatureAttentionBlocks
    x = FeatureAttentionBlock(units=128, reduction_ratio=4, dropout_rate=0.15)(x)
    x = FeatureAttentionBlock(units=128, reduction_ratio=4, dropout_rate=0.15)(x)
    x = FeatureAttentionBlock(units=64,  reduction_ratio=4, dropout_rate=0.10)(x)

    # Shared representation
    shared = layers.Dense(32, activation='gelu')(x)

    # Output
    # Output 1: Klasifikasi risiko (3 kelas)
    out_class = layers.Dense(num_classes, activation='softmax',
                             name='class_output')(shared)

    # Output 2: Regresi skor kontinu (0-1, lalu rescale ke 0-100)
    score_branch = layers.Dense(64, activation='gelu')(shared)
    score_branch = layers.LayerNormalization()(score_branch)
    score_branch = layers.Dense(32, activation='gelu')(score_branch)
    score_branch = layers.Dropout(0.1)(score_branch)
    out_score    = layers.Dense(1, activation='sigmoid',
                                name='score_output')(score_branch)

    return Model(inputs=inputs, outputs=[out_class, out_score])

model_attn = build_attention_model(NUM_FEATURES, NUM_CLASSES)
model_attn.summary()
# Compile
# AdamW: lebih stabil dari Adam karena ada weight decay

model_attn.compile(
    optimizer=tf.keras.optimizers.AdamW(
        learning_rate=1e-3,
        weight_decay=1e-4
    ),
    loss={
        'class_output': MinorityAwareLoss(gamma=2.0),
        'score_output' : 'huber'
    },
    loss_weights={
        'class_output': 0.1,
        'score_output' : 20.0
    },
    metrics={
        'class_output': 'accuracy',
        'score_output' : 'mae'
    }
)
print('Model compiled')
# Training
log_dir = os.path.join('logs', 'attention_model',
                       datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))

callbacks_attn = [
    AdaptiveTrainingMonitor(
        warmup_epochs     = 5,
        initial_lr        = 1e-3,
        patience_plateau  = 5,
        overfit_threshold = 0.05
    ),
    EarlyStopping(
        monitor             = 'val_loss',
        patience            = 30,
        restore_best_weights= True,
        verbose             = 1
    ),
    ModelCheckpoint(
        filepath      = 'best_attention_model.keras',
        monitor       = 'val_loss',
        save_best_only= True,
        mode          = 'min',
        verbose       = 1
    ),
    tf.keras.callbacks.TensorBoard(
        log_dir        = log_dir,
        histogram_freq = 1,
        write_graph    = True
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor  = 'val_loss',
        factor   = 0.5,
        patience = 8,
        min_lr   = 1e-6,
        verbose  = 1
    )
]

history_attn = model_attn.fit(
    X_train,
    {'class_output': y_train, 'score_output': y_score_norm},
    validation_data=(
        X_val,
        {'class_output': y_val, 'score_output': y_score_val_norm}
    ),
    epochs     = 100,
    batch_size = 32,
    callbacks  = callbacks_attn,
    verbose    = 1
)
# Visualisasi training
fig, axes = plt.subplots(1, 3, figsize=(18, 5))

axes[0].plot(history_attn.history['class_output_accuracy'],     label='Train Acc')
axes[0].plot(history_attn.history['val_class_output_accuracy'], label='Val Acc')
axes[0].set_title('Accuracy (FeatureAttention Model)')
axes[0].set_xlabel('Epoch'); axes[0].set_ylabel('Accuracy')
axes[0].legend()

axes[1].plot(history_attn.history['loss'],     label='Train Loss')
axes[1].plot(history_attn.history['val_loss'], label='Val Loss')
axes[1].set_title('Total Loss')
axes[1].set_xlabel('Epoch'); axes[1].set_ylabel('Loss')
axes[1].legend()

axes[2].plot(history_attn.history['score_output_mae'],     label='Train MAE')
axes[2].plot(history_attn.history['val_score_output_mae'], label='Val MAE')
axes[2].set_title('Score MAE')
axes[2].set_xlabel('Epoch'); axes[2].set_ylabel('MAE')
axes[2].legend()

plt.tight_layout()
plt.show()
# Evaluasi
y_pred_prob, score_pred = model_attn.predict(X_test)
y_pred = np.argmax(y_pred_prob, axis=1)

acc       = accuracy_score(y_test, y_pred)
score_rescaled = score_pred.flatten() * SCORE_MAX
mae_norm  = mean_absolute_error(ys_test / SCORE_MAX, score_pred.flatten())

print(f'Accuracy   : {acc:.4f}  ({"≥85%" if acc >= 0.85 else "<85%"})')
print(f'MAE (norm) : {mae_norm:.4f}  ({"≤0.02" if mae_norm <= 0.02 else ">0.02"})')
print()
print('Classification Report:')
print(classification_report(y_test, y_pred,
                            target_names=['Low', 'Medium', 'High']))

cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(7, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Low', 'Medium', 'High'],
            yticklabels=['Low', 'Medium', 'High'])
plt.title('Confusion Matrix (FeatureAttentionBlock Model)')
plt.xlabel('Predicted'); plt.ylabel('True')
plt.tight_layout(); plt.show()
# Simpan Model
import joblib

model_attn.save('cardio_attention_model_final.keras')
model_attn.export('cardio_attention_savedmodel')

joblib.dump(scaler,    'scaler_attn.pkl')
joblib.dump(le_target, 'label_encoder_attn.pkl')

print('Model & artifacts disimpan')
# Inference
loaded_model   = tf.keras.models.load_model(
    'cardio_attention_model_final.keras',
    custom_objects={
        'FeatureAttentionBlock': FeatureAttentionBlock,
        'MinorityAwareLoss'    : MinorityAwareLoss
    }
)
loaded_scaler  = joblib.load('scaler_attn.pkl')
loaded_encoder = joblib.load('label_encoder_attn.pkl')

RISK_LABELS = {0: 'Low', 1: 'Medium', 2: 'High'}

def predict_risk(raw_features: np.ndarray) -> pd.DataFrame:

    scaled      = loaded_scaler.transform(raw_features)
    class_probs, score_pred = loaded_model.predict(scaled, verbose=0)

    pred_idx    = np.argmax(class_probs, axis=1)
    pred_label  = [RISK_LABELS[i] for i in pred_idx]

    result = pd.DataFrame(
        class_probs,
        columns=['prob_Low', 'prob_Medium', 'prob_High']
    )
    result.insert(0, 'predicted_class', pred_label)
    result.insert(1, 'confidence',      class_probs.max(axis=1).round(4))
    result.insert(2, 'risk_score_0_100',(score_pred.flatten() * SCORE_MAX).round(2))
    return result

# Contoh inference — ambil 3 sampel dari val set
sample_raw = scaler.inverse_transform(X_val[:3])
print(predict_risk(sample_raw))
# Custom Training Loop

model_ct   = build_attention_model(NUM_FEATURES, NUM_CLASSES)
opt_ct     = tf.keras.optimizers.AdamW(learning_rate=1e-3, weight_decay=1e-4)
loss_fn_ct = MinorityAwareLoss(gamma=2.0)

train_loss_m = tf.keras.metrics.Mean(name='train_loss')
train_acc_m  = tf.keras.metrics.SparseCategoricalAccuracy(name='train_acc')
val_loss_m   = tf.keras.metrics.Mean(name='val_loss')
val_acc_m    = tf.keras.metrics.SparseCategoricalAccuracy(name='val_acc')

# Metrics untuk score/regresi
train_mae_m  = tf.keras.metrics.MeanAbsoluteError(name='train_mae')
val_mae_m    = tf.keras.metrics.MeanAbsoluteError(name='val_mae')

log_dir_ct = os.path.join('logs', 'attention_custom_loop',
                          datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
writer_ct  = tf.summary.create_file_writer(log_dir_ct)

@tf.function
def train_step(x_batch, y_class_batch, y_score_batch):
    with tf.GradientTape() as tape:
        class_out, score_out = model_ct(x_batch, training=True)
        loss_class = tf.reduce_mean(loss_fn_ct(y_class_batch, class_out))
        loss_score = tf.reduce_mean(
            tf.keras.losses.huber(y_score_batch, tf.squeeze(score_out, axis=-1))
        )
        loss = 0.1 * loss_class + 20.0 * loss_score
    grads = tape.gradient(loss, model_ct.trainable_variables)
    grads, _ = tf.clip_by_global_norm(grads, clip_norm=1.0)
    opt_ct.apply_gradients(zip(grads, model_ct.trainable_variables))
    train_loss_m.update_state(loss)
    train_acc_m.update_state(y_class_batch, class_out)
    train_mae_m.update_state(y_score_batch, tf.squeeze(score_out, axis=-1))

@tf.function
def val_step(x_batch, y_class_batch, y_score_batch):
    class_out, score_out = model_ct(x_batch, training=False)
    loss_class = tf.reduce_mean(loss_fn_ct(y_class_batch, class_out))
    loss_score = tf.reduce_mean(
        tf.keras.losses.huber(y_score_batch, tf.squeeze(score_out, axis=-1))
    )
    loss = 0.1 * loss_class + 20.0 * loss_score
    val_loss_m.update_state(loss)
    val_acc_m.update_state(y_class_batch, class_out)
    val_mae_m.update_state(y_score_batch, tf.squeeze(score_out, axis=-1))

EPOCHS_CT   = 50
BATCH_SIZE  = 32
PATIENCE_CT = 10
best_vl     = float('inf')
no_imp      = 0

train_ds = (tf.data.Dataset
            .from_tensor_slices((X_train.astype('float32'),
                                 y_train.astype('int32'),
                                 y_score_norm.astype('float32')))
            .shuffle(1000).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE))
val_ds   = (tf.data.Dataset
            .from_tensor_slices((X_val.astype('float32'),
                                 y_val.astype('int32'),
                                 y_score_val_norm.astype('float32')))
            .batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE))

for epoch in range(EPOCHS_CT):
    for xb, yb_class, yb_score in train_ds:
        train_step(xb, yb_class, yb_score)
    for xb, yb_class, yb_score in val_ds:
        val_step(xb, yb_class, yb_score)

    t_loss = train_loss_m.result().numpy()
    t_acc  = train_acc_m.result().numpy()
    t_mae  = train_mae_m.result().numpy()
    v_loss = val_loss_m.result().numpy()
    v_acc  = val_acc_m.result().numpy()
    v_mae  = val_mae_m.result().numpy()

    with writer_ct.as_default():
        tf.summary.scalar('loss',     t_loss, step=epoch)
        tf.summary.scalar('accuracy', t_acc,  step=epoch)
        tf.summary.scalar('mae',      t_mae,  step=epoch)
        tf.summary.scalar('val_loss', v_loss, step=epoch)
        tf.summary.scalar('val_acc',  v_acc,  step=epoch)
        tf.summary.scalar('val_mae',  v_mae,  step=epoch)

    train_loss_m.reset_state(); train_acc_m.reset_state(); train_mae_m.reset_state()
    val_loss_m.reset_state();   val_acc_m.reset_state();   val_mae_m.reset_state()

    if (epoch + 1) % 5 == 0 or epoch == 0:
        print(f'Epoch {epoch+1:3d}/{EPOCHS_CT} — '
              f'loss: {t_loss:.4f} | acc: {t_acc:.4f} | mae: {t_mae:.4f} | '
              f'val_loss: {v_loss:.4f} | val_acc: {v_acc:.4f} | val_mae: {v_mae:.4f}')

    if v_loss < best_vl:
        best_vl = v_loss; no_imp = 0
        model_ct.save('best_attention_custom_loop.keras')
    else:
        no_imp += 1
        if no_imp >= PATIENCE_CT:
            print(f'\nEarly stopping epoch {epoch+1}. Best: {best_vl:.4f}')
            break

print('\nCustom training loop selesai')
# Checklist

%load_ext tensorboard
%tensorboard --logdir logs

y_pp, sp    = model_attn.predict(X_test)
yp          = np.argmax(y_pp, axis=1)
acc_final   = accuracy_score(y_test, yp)
mae_final   = mean_absolute_error(ys_test / SCORE_MAX, sp.flatten())

checklist = [
    ('Main', 'Model DL Functional API',                    True),
    ('Main', 'Custom Layer (FeatureAttentionBlock)',        True),
    ('Main', 'Custom Loss (MinorityAwareLoss)',             True),
    ('Main', 'Custom Callback (AdaptiveTrainingMonitor)',   True),
    ('Main', 'Simpan model (.keras & SavedModel)',          True),
    ('Main', 'Kode inference model',                       True),
    ('Side', 'Custom Training Loop (GradientTape)',         True),
    ('Side', 'TensorBoard integration',                    True),
    ('Side', f'Akurasi ≥85% = {acc_final:.2%}',           acc_final >= 0.85),
    ('Side', f'MAE ≤0.02 = {mae_final:.4f}',              mae_final <= 0.02),
]

print('\n RINGKASAN CHECKLIST')
print('='*55)
for cat, item, ok in checklist:
    print(f'  {"Yes" if ok else "No"} [{cat}] {item}')
# ============================================================
# RISK COMPARISON + REKOMENDASI
# Sumber: AHA/ACC 2017, AHA/ACC 2018, WHO 2020,
#         JAMA 2021, National Sleep Foundation 2015
# ============================================================

# ── HELPER: parse tekanan darah "120/80" ────────────────────
def parse_blood_pressure(bp_string: str):
    """'120/80' → systolic=120, diastolic=80"""
    try:
        parts = str(bp_string).strip().split('/')
        return float(parts[0]), float(parts[1])
    except:
        raise ValueError(f"Format salah: '{bp_string}'. Gunakan format '120/80'")


# ── KODE A: Klasifikasi klinis per parameter ────────────────
def get_clinical_category(feature: str, value: float) -> dict:
    """
    Klasifikasikan nilai user ke kategori klinis berdasarkan referensi medis.
    Return dict: {category, label, status, ref}
    """
    if feature == 'systolic_bp':
        if value < 120:
            return {'category': 'normal',   'label': 'Normal',             'status': '[NORMAL]',    'ref': '< 120 mmHg (AHA 2017)'}
        elif value < 130:
            return {'category': 'elevated', 'label': 'Elevated',           'status': '[PERHATIAN]', 'ref': '120-129 mmHg (AHA 2017)'}
        elif value < 140:
            return {'category': 'stage1',   'label': 'Hipertensi Stage 1', 'status': '[PERHATIAN]', 'ref': '130-139 mmHg (AHA 2017)'}
        else:
            return {'category': 'stage2',   'label': 'Hipertensi Stage 2', 'status': '[BERISIKO]',  'ref': '>= 140 mmHg (AHA 2017)'}

    elif feature == 'diastolic_bp':
        if value < 80:
            return {'category': 'normal',  'label': 'Normal',             'status': '[NORMAL]',    'ref': '< 80 mmHg (AHA 2017)'}
        elif value < 90:
            return {'category': 'stage1',  'label': 'Hipertensi Stage 1', 'status': '[PERHATIAN]', 'ref': '80-89 mmHg (AHA 2017)'}
        else:
            return {'category': 'stage2',  'label': 'Hipertensi Stage 2', 'status': '[BERISIKO]',  'ref': '>= 90 mmHg (AHA 2017)'}

    elif feature == 'cholesterol_mg_dl':
        if value < 200:
            return {'category': 'optimal',    'label': 'Optimal',           'status': '[NORMAL]',    'ref': '< 200 mg/dL (AHA 2018)'}
        elif value < 240:
            return {'category': 'borderline', 'label': 'Borderline Tinggi', 'status': '[PERHATIAN]', 'ref': '200-239 mg/dL (AHA 2018)'}
        else:
            return {'category': 'high',       'label': 'Tinggi',            'status': '[BERISIKO]',  'ref': '>= 240 mg/dL (AHA 2018)'}

    elif feature == 'bmi':
        if value < 18.5:
            return {'category': 'underweight', 'label': 'Berat Badan Kurang', 'status': '[PERHATIAN]', 'ref': '< 18.5 (WHO)'}
        elif value < 25.0:
            return {'category': 'normal',      'label': 'Normal',             'status': '[NORMAL]',    'ref': '18.5-24.9 (WHO)'}
        elif value < 30.0:
            return {'category': 'overweight',  'label': 'Overweight',         'status': '[PERHATIAN]', 'ref': '25.0-29.9 (WHO)'}
        else:
            return {'category': 'obese',       'label': 'Obesitas',           'status': '[BERISIKO]',  'ref': '>= 30.0 (WHO)'}

    elif feature == 'resting_heart_rate':
        if value < 60:
            return {'category': 'low',    'label': 'Rendah (Bradikardia)', 'status': '[PERHATIAN]', 'ref': '< 60 bpm (AHA)'}
        elif value <= 100:
            return {'category': 'normal', 'label': 'Normal',               'status': '[NORMAL]',    'ref': '60-100 bpm (AHA)'}
        else:
            return {'category': 'high',   'label': 'Tinggi (Takikardia)',  'status': '[BERISIKO]',  'ref': '> 100 bpm (AHA)'}

    elif feature == 'daily_steps':
        if value < 5000:
            return {'category': 'low',        'label': 'Kurang Aktif', 'status': '[BERISIKO]',  'ref': '< 5.000 langkah (JAMA 2021)'}
        elif value < 7500:
            return {'category': 'moderate',   'label': 'Cukup Aktif',  'status': '[PERHATIAN]', 'ref': '5.000-7.499 langkah (JAMA 2021)'}
        elif value < 10000:
            return {'category': 'active',     'label': 'Aktif',        'status': '[NORMAL]',    'ref': '7.500-9.999 langkah (JAMA 2021)'}
        else:
            return {'category': 'very_active','label': 'Sangat Aktif', 'status': '[NORMAL]',    'ref': '>= 10.000 langkah (JAMA 2021)'}

    elif feature == 'physical_activity_hours_per_week':
        if value < 1.25:
            return {'category': 'low',      'label': 'Kurang', 'status': '[BERISIKO]',  'ref': '< 1.25 jam/minggu (WHO 2020)'}
        elif value < 2.5:
            return {'category': 'moderate', 'label': 'Cukup',  'status': '[PERHATIAN]', 'ref': '1.25-2.5 jam/minggu (WHO 2020)'}
        else:
            return {'category': 'good',     'label': 'Baik',   'status': '[NORMAL]',    'ref': '>= 2.5 jam/minggu (WHO 2020)'}

    elif feature == 'sleep_hours':
        if value < 6:
            return {'category': 'insufficient', 'label': 'Kurang',     'status': '[BERISIKO]',  'ref': '< 6 jam (NSF 2015)'}
        elif value <= 9:
            return {'category': 'normal',       'label': 'Normal',     'status': '[NORMAL]',    'ref': '7-9 jam (NSF 2015)'}
        else:
            return {'category': 'excessive',    'label': 'Berlebihan', 'status': '[PERHATIAN]', 'ref': '> 9 jam (NSF 2015)'}

    elif feature == 'alcohol_units_per_week':
        if value == 0:
            return {'category': 'none',     'label': 'Tidak Minum',       'status': '[NORMAL]',    'ref': '0 unit (WHO)'}
        elif value <= 7:
            return {'category': 'low',      'label': 'Rendah',            'status': '[NORMAL]',    'ref': '1-7 unit/minggu (WHO)'}
        elif value <= 14:
            return {'category': 'moderate', 'label': 'Sedang',            'status': '[PERHATIAN]', 'ref': '8-14 unit/minggu (WHO)'}
        else:
            return {'category': 'high',     'label': 'Tinggi (Berisiko)', 'status': '[BERISIKO]',  'ref': '> 14 unit/minggu (WHO)'}

    elif feature == 'stress_level':
        if value <= 3:
            return {'category': 'low',      'label': 'Rendah', 'status': '[NORMAL]',    'ref': '1-3 / 10 (skala subjektif)'}
        elif value <= 6:
            return {'category': 'moderate', 'label': 'Sedang', 'status': '[PERHATIAN]', 'ref': '4-6 / 10 (skala subjektif)'}
        else:
            return {'category': 'high',     'label': 'Tinggi', 'status': '[BERISIKO]',  'ref': '7-10 / 10 (skala subjektif)'}

    elif feature == 'diet_quality_score':
        if value <= 3:
            return {'category': 'poor', 'label': 'Buruk', 'status': '[BERISIKO]',  'ref': '1-3 / 10 (skala kontekstual)'}
        elif value <= 6:
            return {'category': 'fair', 'label': 'Cukup', 'status': '[PERHATIAN]', 'ref': '4-6 / 10 (skala kontekstual)'}
        else:
            return {'category': 'good', 'label': 'Baik',  'status': '[NORMAL]',    'ref': '7-10 / 10 (skala kontekstual)'}

    else:
        return {'category': 'unknown', 'label': 'Tidak diketahui', 'status': '[N/A]', 'ref': '-'}


# ── KODE A: Generate narasi perbandingan ────────────────────
def generate_risk_comparison(user_input: dict) -> list:
    """
    Input  : user_input dict {nama_fitur: nilai}
    Output : list of dict, tiap dict = satu baris perbandingan
    """
    FEATURE_META = [
        ('systolic_bp',                      'Tekanan Darah Sistolik',  'mmHg'),
        ('diastolic_bp',                     'Tekanan Darah Diastolik', 'mmHg'),
        ('cholesterol_mg_dl',                'Kolesterol Total',        'mg/dL'),
        ('bmi',                              'BMI',                     ''),
        ('resting_heart_rate',               'Detak Jantung Istirahat', 'bpm'),
        ('daily_steps',                      'Langkah per Hari',        'langkah'),
        ('physical_activity_hours_per_week', 'Aktivitas Fisik',         'jam/minggu'),
        ('sleep_hours',                      'Jam Tidur',               'jam/hari'),
        ('alcohol_units_per_week',           'Konsumsi Alkohol',        'unit/minggu'),
        ('stress_level',                     'Tingkat Stres',           '/10'),
        ('diet_quality_score',               'Kualitas Diet',           '/10'),
    ]

    rows = []
    for key, label, unit in FEATURE_META:
        if key not in user_input:
            continue
        value    = user_input[key]
        clinical = get_clinical_category(key, value)
        unit_str = f' {unit}' if unit else ''
        narasi   = (
            f"{clinical['status']} {label}: {value}{unit_str} "
            f"| Kategori: {clinical['label']} "
            f"| Batas normal: {clinical['ref']}"
        )
        rows.append({
            'feature':  key,
            'label':    label,
            'value':    f'{value}{unit_str}',
            'category': clinical['label'],
            'status':   clinical['status'],
            'ref':      clinical['ref'],
            'narasi':   narasi,
        })
    return rows


# ── KODE B: Generate rekomendasi ────────────────────────────
def generate_recommendations(user_input: dict) -> dict:
    """
    Return dict: {urgent: [...], warning: [...], good: [...]}
    """
    urgent  = []
    warning = []
    good    = []

    # Tekanan darah sistolik
    sys_bp = user_input.get('systolic_bp', 0)
    if sys_bp >= 140:
        urgent.append({
            'parameter': 'Tekanan Darah Sistolik',
            'kondisi': f'{sys_bp} mmHg — Hipertensi Stage 2',
            'rekomendasi': [
                'Kurangi konsumsi garam (sodium) di bawah 1.500 mg/hari',
                'Terapkan diet DASH (perbanyak buah, sayur, biji-bijian, rendah lemak jenuh)',
                'Olahraga aerobik minimal 30 menit/hari, 5 hari/minggu',
                'Hindari rokok dan batasi kafein',
                'Segera konsultasi dokter untuk evaluasi obat antihipertensi',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    elif sys_bp >= 130:
        warning.append({
            'parameter': 'Tekanan Darah Sistolik',
            'kondisi': f'{sys_bp} mmHg — Hipertensi Stage 1',
            'rekomendasi': [
                'Mulai terapkan diet DASH secara bertahap',
                'Kurangi konsumsi garam bertahap ke bawah 2.300 mg/hari',
                'Tambah aktivitas fisik ringan-sedang secara rutin',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    elif sys_bp >= 120:
        warning.append({
            'parameter': 'Tekanan Darah Sistolik',
            'kondisi': f'{sys_bp} mmHg — Elevated',
            'rekomendasi': [
                'Jaga pola makan rendah garam',
                'Pertahankan berat badan ideal',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    else:
        good.append('Tekanan Darah Sistolik dalam batas normal')

    # Tekanan darah diastolik
    dia_bp = user_input.get('diastolic_bp', 0)
    if dia_bp >= 90:
        urgent.append({
            'parameter': 'Tekanan Darah Diastolik',
            'kondisi': f'{dia_bp} mmHg — Hipertensi Stage 2',
            'rekomendasi': [
                'Segera konsultasi dokter — diastolik >=90 mmHg memerlukan evaluasi medis',
                'Hindari stres berlebih dan istirahat cukup',
                'Batasi konsumsi alkohol',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    elif dia_bp >= 80:
        warning.append({
            'parameter': 'Tekanan Darah Diastolik',
            'kondisi': f'{dia_bp} mmHg — Hipertensi Stage 1',
            'rekomendasi': [
                'Kelola stres dengan meditasi atau teknik relaksasi',
                'Kurangi konsumsi alkohol',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    else:
        good.append('Tekanan Darah Diastolik dalam batas normal')

    # Kolesterol
    chol = user_input.get('cholesterol_mg_dl', 0)
    if chol >= 240:
        urgent.append({
            'parameter': 'Kolesterol Total',
            'kondisi': f'{chol} mg/dL — Tinggi',
            'rekomendasi': [
                'Kurangi makanan tinggi lemak jenuh (daging merah, produk susu tinggi lemak)',
                'Perbanyak serat larut (oatmeal, kacang-kacangan, buah apel, pir)',
                'Konsumsi ikan berlemak (salmon, sarden) 2x seminggu untuk omega-3',
                'Hindari makanan trans fat (gorengan, makanan olahan)',
                'Konsultasi dokter untuk pertimbangan terapi statin',
            ],
            'sumber': 'AHA/ACC 2018 Cholesterol Guidelines'
        })
    elif chol >= 200:
        warning.append({
            'parameter': 'Kolesterol Total',
            'kondisi': f'{chol} mg/dL — Borderline Tinggi',
            'rekomendasi': [
                'Mulai kurangi lemak jenuh dalam makanan sehari-hari',
                'Tambah konsumsi serat dan sayuran hijau',
                'Rutin periksa kolesterol setiap 6 bulan',
            ],
            'sumber': 'AHA/ACC 2018 Cholesterol Guidelines'
        })
    else:
        good.append('Kolesterol Total dalam batas optimal')

    # BMI
    bmi = user_input.get('bmi', 0)
    if bmi >= 30:
        urgent.append({
            'parameter': 'BMI',
            'kondisi': f'{bmi:.1f} — Obesitas',
            'rekomendasi': [
                'Target penurunan berat badan 5-10% dari berat saat ini secara bertahap',
                'Defisit kalori moderat (300-500 kkal/hari), hindari diet ekstrem',
                'Kombinasikan latihan aerobik dan latihan kekuatan minimal 3x/minggu',
                'Konsultasi ahli gizi untuk program diet yang aman',
            ],
            'sumber': 'AHA Lifestyle Guidelines & WHO BMI Classification'
        })
    elif bmi >= 25:
        warning.append({
            'parameter': 'BMI',
            'kondisi': f'{bmi:.1f} — Overweight',
            'rekomendasi': [
                'Perbanyak konsumsi sayur dan protein tanpa lemak',
                'Kurangi makanan tinggi kalori kosong (minuman manis, snack olahan)',
                'Tambah aktivitas fisik harian minimal 30 menit/hari',
            ],
            'sumber': 'AHA Lifestyle Guidelines & WHO BMI Classification'
        })
    elif bmi < 18.5:
        warning.append({
            'parameter': 'BMI',
            'kondisi': f'{bmi:.1f} — Berat Badan Kurang',
            'rekomendasi': [
                'Tingkatkan asupan kalori dari sumber nutrisi padat gizi',
                'Konsultasi dokter atau ahli gizi',
            ],
            'sumber': 'WHO BMI Classification'
        })
    else:
        good.append(f'BMI dalam batas normal ({bmi:.1f})')

    # Aktivitas fisik
    activity     = user_input.get('physical_activity_hours_per_week', 0)
    activity_min = activity * 60
    if activity_min < 75:
        urgent.append({
            'parameter': 'Aktivitas Fisik',
            'kondisi': f'{activity:.1f} jam/minggu — Sangat Kurang',
            'rekomendasi': [
                'Target minimal 150 menit/minggu aktivitas aerobik intensitas sedang',
                'Mulai bertahap: jalan kaki 10 menit/hari, tingkatkan setiap minggu',
                'Pilih aktivitas yang menyenangkan: bersepeda, renang, senam',
                'Tambah latihan kekuatan (resistance training) 2x/minggu',
            ],
            'sumber': 'WHO Physical Activity Guidelines 2020'
        })
    elif activity_min < 150:
        warning.append({
            'parameter': 'Aktivitas Fisik',
            'kondisi': f'{activity:.1f} jam/minggu — Kurang dari rekomendasi',
            'rekomendasi': [
                'Tingkatkan durasi olahraga hingga 150 menit/minggu',
                'Coba tambah 1 sesi olahraga per minggu secara bertahap',
            ],
            'sumber': 'WHO Physical Activity Guidelines 2020'
        })
    else:
        good.append(f'Aktivitas fisik sudah memenuhi rekomendasi WHO ({activity:.1f} jam/minggu)')

    # Langkah per hari
    steps = user_input.get('daily_steps', 0)
    if steps < 5000:
        urgent.append({
            'parameter': 'Langkah per Hari',
            'kondisi': f'{int(steps)} langkah — Kurang Aktif',
            'rekomendasi': [
                'Target minimal 7.500-10.000 langkah/hari',
                'Gunakan tangga daripada lift, parkir lebih jauh',
                'Jalan kaki saat istirahat makan siang 10-15 menit',
            ],
            'sumber': 'JAMA Internal Medicine 2021'
        })
    elif steps < 7500:
        warning.append({
            'parameter': 'Langkah per Hari',
            'kondisi': f'{int(steps)} langkah — Cukup Aktif',
            'rekomendasi': [
                'Tingkatkan ke 7.500-10.000 langkah/hari untuk manfaat optimal',
            ],
            'sumber': 'JAMA Internal Medicine 2021'
        })
    else:
        good.append(f'Jumlah langkah harian sudah baik ({int(steps)} langkah/hari)')

    # Tidur
    sleep = user_input.get('sleep_hours', 0)
    if sleep < 6:
        urgent.append({
            'parameter': 'Durasi Tidur',
            'kondisi': f'{sleep} jam/malam — Kurang',
            'rekomendasi': [
                'Target 7-9 jam tidur per malam untuk orang dewasa',
                'Tetapkan jadwal tidur dan bangun yang konsisten setiap hari',
                'Hindari layar gadget minimal 1 jam sebelum tidur',
                'Ciptakan lingkungan tidur yang gelap, sejuk, dan tenang',
            ],
            'sumber': 'National Sleep Foundation 2015'
        })
    elif sleep > 9:
        warning.append({
            'parameter': 'Durasi Tidur',
            'kondisi': f'{sleep} jam/malam — Berlebihan',
            'rekomendasi': [
                'Tidur >9 jam dapat mengindikasikan masalah kesehatan tertentu',
                'Konsultasi dokter jika sering merasa lelah meski tidur lama',
            ],
            'sumber': 'National Sleep Foundation 2015'
        })
    else:
        good.append(f'Durasi tidur normal ({sleep} jam/malam)')

    # Alkohol
    alcohol = user_input.get('alcohol_units_per_week', 0)
    if alcohol > 14:
        urgent.append({
            'parameter': 'Konsumsi Alkohol',
            'kondisi': f'{alcohol} unit/minggu — Tinggi (Berisiko)',
            'rekomendasi': [
                'Kurangi konsumsi alkohol secara bertahap',
                'Target di bawah 14 unit/minggu, idealnya lebih rendah',
                'Cari dukungan profesional jika sulit mengurangi sendiri',
                'Alkohol berlebih meningkatkan risiko hipertensi dan kardiomiopati',
            ],
            'sumber': 'WHO Alcohol Guidelines'
        })
    elif alcohol > 7:
        warning.append({
            'parameter': 'Konsumsi Alkohol',
            'kondisi': f'{alcohol} unit/minggu — Sedang',
            'rekomendasi': [
                'Pertimbangkan untuk mengurangi ke bawah 7 unit/minggu',
                'Selipkan hari-hari bebas alkohol dalam seminggu',
            ],
            'sumber': 'WHO Alcohol Guidelines'
        })
    else:
        good.append('Konsumsi alkohol dalam batas aman')

    # Stres
    stress = user_input.get('stress_level', 0)
    if stress >= 7:
        urgent.append({
            'parameter': 'Tingkat Stres',
            'kondisi': f'{stress}/10 — Tinggi',
            'rekomendasi': [
                'Latihan pernapasan dalam (deep breathing) 5-10 menit/hari',
                'Meditasi atau mindfulness minimal 10 menit/hari',
                'Olahraga rutin terbukti signifikan menurunkan hormon stres',
                'Batasi paparan berita negatif dan media sosial',
                'Pertimbangkan konsultasi dengan psikolog atau konselor',
            ],
            'sumber': 'AHA Stress & Heart Disease'
        })
    elif stress >= 4:
        warning.append({
            'parameter': 'Tingkat Stres',
            'kondisi': f'{stress}/10 — Sedang',
            'rekomendasi': [
                'Luangkan waktu untuk hobi dan aktivitas relaksasi',
                'Jaga keseimbangan kerja dan istirahat',
            ],
            'sumber': 'AHA Stress & Heart Disease'
        })
    else:
        good.append(f'Tingkat stres terkendali ({stress}/10)')

    # ── TAMBAHAN: Diet quality ───────────────────────────────
    diet = user_input.get('diet_quality_score', 0)
    if diet <= 3:
        urgent.append({
            'parameter': 'Kualitas Diet',
            'kondisi': f'{diet}/10 — Buruk',
            'rekomendasi': [
                'Perbanyak konsumsi buah dan sayuran minimal 5 porsi/hari',
                'Kurangi makanan ultra-processed (mie instan, fast food, minuman manis)',
                'Ganti karbohidrat sederhana dengan karbohidrat kompleks (nasi merah, oat)',
                'Konsultasi ahli gizi untuk panduan diet yang terstruktur',
            ],
            'sumber': 'AHA Lifestyle Guidelines'
        })
    elif diet <= 6:
        warning.append({
            'parameter': 'Kualitas Diet',
            'kondisi': f'{diet}/10 — Cukup',
            'rekomendasi': [
                'Tingkatkan variasi sayuran dan buah dalam menu harian',
                'Kurangi konsumsi gula tambahan dan garam berlebih',
            ],
            'sumber': 'AHA Lifestyle Guidelines'
        })
    else:
        good.append(f'Kualitas diet sudah baik ({diet}/10)')

    # ── TAMBAHAN: Family history ─────────────────────────────
    family_history = user_input.get('family_history_heart_disease', False)
    if family_history:
        warning.append({
            'parameter': 'Riwayat Keluarga',
            'kondisi': 'Ada riwayat penyakit jantung dalam keluarga',
            'rekomendasi': [
                'Lakukan skrining jantung rutin minimal 1x per tahun',
                'Informasikan riwayat keluarga ke dokter untuk asesmen risiko genetik',
                'Jaga semua parameter gaya hidup lebih ketat dari rata-rata orang',
            ],
            'sumber': 'AHA Family History & Heart Disease'
        })

    return {'urgent': urgent, 'warning': warning, 'good': good}


# ── KODE B: Print output lengkap ────────────────────────────
def print_results(bp_string: str, bmi: float, cholesterol: float,
                  resting_hr: float, daily_steps: float,
                  activity_hours: float, sleep_hours: float,
                  alcohol_units: float, stress_level: float,
                  family_history: bool, diet_quality: float,
                  age: float, risk_score: float = None,
                  risk_category: str = None):

    sys_bp, dia_bp = parse_blood_pressure(bp_string)

    user_input = {
        'systolic_bp'                      : sys_bp,
        'diastolic_bp'                     : dia_bp,
        'cholesterol_mg_dl'                : cholesterol,
        'bmi'                              : bmi,
        'resting_heart_rate'               : resting_hr,
        'daily_steps'                      : daily_steps,
        'physical_activity_hours_per_week' : activity_hours,
        'sleep_hours'                      : sleep_hours,
        'alcohol_units_per_week'           : alcohol_units,
        'stress_level'                     : stress_level,
        'diet_quality_score'               : diet_quality,
        'family_history_heart_disease'     : family_history,
    }

    # Header
    print("\n" + "="*60)
    print("         HASIL SKRINING RISIKO KARDIOVASKULAR")
    print("="*60)
    if risk_score is not None:
        print(f"  Skor Risiko     : {risk_score:.1f} / 100")
    if risk_category:
        status_map = {'Low': '[RENDAH]', 'Medium': '[SEDANG]', 'High': '[TINGGI]'}
        print(f"  Kategori Risiko : {status_map.get(risk_category, '')} {risk_category}")
    print(f"  Usia            : {int(age)} tahun")
    print(f"  Riwayat Keluarga: {'Ada' if family_history else 'Tidak Ada'}")
    print("="*60)

    # Risk Comparison
    print("\nPERBANDINGAN KONDISI ANDA vs STANDAR MEDIS\n")
    for r in generate_risk_comparison(user_input):
        print(f"  {r['narasi']}")

    # Rekomendasi
    recs = generate_recommendations(user_input)

    if recs['urgent']:
        print("\n\n[PRIORITAS] Perlu Tindakan Segera\n")
        for i, item in enumerate(recs['urgent'], 1):
            print(f"  {i}. {item['parameter']} ({item['kondisi']})")
            for r in item['rekomendasi']:
                print(f"      - {r}")
            print(f"      Sumber: {item['sumber']}\n")

    if recs['warning']:
        print("\n[PERHATIAN] Monitor dan Perbaiki Bertahap\n")
        for i, item in enumerate(recs['warning'], 1):
            print(f"  {i}. {item['parameter']} ({item['kondisi']})")
            for r in item['rekomendasi']:
                print(f"      - {r}")
            print(f"      Sumber: {item['sumber']}\n")

    if recs['good']:
        print("\n[BAIK] Parameter yang Sudah dalam Batas Normal\n")
        for item in recs['good']:
            print(f"  - {item}")

    print("\n" + "="*60)
    print("  Disclaimer: Hasil ini adalah skrining awal.")
    print("  Konsultasikan dengan dokter untuk diagnosis resmi.")
    print("="*60 + "\n")


# ── TEST ─────────────────────────────────────────────────────
print_results(
    bp_string      = "155/98",
    bmi            = 30.5,
    cholesterol    = 260,
    resting_hr     = 80,
    daily_steps    = 3000,
    activity_hours = 1.0,
    sleep_hours    = 5.5,
    alcohol_units  = 6,
    stress_level   = 7,
    family_history = True,
    diet_quality   = 3,
    age            = 45,
    risk_score     = 72.5,
    risk_category  = "High"
)
# =============================================
# RISK COMPARISON — Berdasarkan Referensi Medis
# Sumber: AHA/ACC 2017, WHO 2020, JAMA 2021,
#         National Sleep Foundation 2015
# =============================================

def get_clinical_category(feature: str, value: float) -> dict:
    """
    Klasifikasikan nilai user ke kategori klinis berdasarkan referensi medis.
    Return dict: {category, label, color, description}
    """

    if feature == 'systolic_bp':
        # AHA/ACC 2017 Hypertension Guidelines
        if value < 120:
            return {'category': 'normal',    'label': 'Normal',               'emoji': '🟢', 'ref': '< 120 mmHg (AHA 2017)'}
        elif value < 130:
            return {'category': 'elevated',  'label': 'Elevated',             'emoji': '🟡', 'ref': '120–129 mmHg (AHA 2017)'}
        elif value < 140:
            return {'category': 'stage1',    'label': 'Hipertensi Stage 1',   'emoji': '🟠', 'ref': '130–139 mmHg (AHA 2017)'}
        else:
            return {'category': 'stage2',    'label': 'Hipertensi Stage 2',   'emoji': '🔴', 'ref': '≥ 140 mmHg (AHA 2017)'}

    elif feature == 'diastolic_bp':
        # AHA/ACC 2017
        if value < 80:
            return {'category': 'normal',    'label': 'Normal',               'emoji': '🟢', 'ref': '< 80 mmHg (AHA 2017)'}
        elif value < 90:
            return {'category': 'stage1',    'label': 'Hipertensi Stage 1',   'emoji': '🟠', 'ref': '80–89 mmHg (AHA 2017)'}
        else:
            return {'category': 'stage2',    'label': 'Hipertensi Stage 2',   'emoji': '🔴', 'ref': '≥ 90 mmHg (AHA 2017)'}

    elif feature == 'cholesterol_mg_dl':
        # AHA/ACC 2018 Cholesterol Guidelines
        if value < 200:
            return {'category': 'optimal',    'label': 'Optimal',             'emoji': '🟢', 'ref': '< 200 mg/dL (AHA 2018)'}
        elif value < 240:
            return {'category': 'borderline', 'label': 'Borderline Tinggi',   'emoji': '🟡', 'ref': '200–239 mg/dL (AHA 2018)'}
        else:
            return {'category': 'high',       'label': 'Tinggi',              'emoji': '🔴', 'ref': '≥ 240 mg/dL (AHA 2018)'}

    elif feature == 'bmi':
        # WHO BMI Classification
        if value < 18.5:
            return {'category': 'underweight', 'label': 'Berat Badan Kurang', 'emoji': '🟡', 'ref': '< 18.5 (WHO)'}
        elif value < 25.0:
            return {'category': 'normal',      'label': 'Normal',             'emoji': '🟢', 'ref': '18.5–24.9 (WHO)'}
        elif value < 30.0:
            return {'category': 'overweight',  'label': 'Overweight',         'emoji': '🟡', 'ref': '25.0–29.9 (WHO)'}
        else:
            return {'category': 'obese',       'label': 'Obesitas',           'emoji': '🔴', 'ref': '≥ 30.0 (WHO)'}

    elif feature == 'resting_heart_rate':
        # AHA Normal Resting Heart Rate
        if value < 60:
            return {'category': 'low',     'label': 'Rendah (Bradikardia)',    'emoji': '🟡', 'ref': '< 60 bpm (AHA)'}
        elif value <= 100:
            return {'category': 'normal',  'label': 'Normal',                 'emoji': '🟢', 'ref': '60–100 bpm (AHA)'}
        else:
            return {'category': 'high',    'label': 'Tinggi (Takikardia)',     'emoji': '🔴', 'ref': '> 100 bpm (AHA)'}

    elif feature == 'daily_steps':
        # JAMA Internal Medicine 2021
        if value < 5000:
            return {'category': 'low',         'label': 'Kurang Aktif',       'emoji': '🔴', 'ref': '< 5.000 langkah (JAMA 2021)'}
        elif value < 7500:
            return {'category': 'moderate',    'label': 'Cukup Aktif',        'emoji': '🟡', 'ref': '5.000–7.499 langkah (JAMA 2021)'}
        elif value < 10000:
            return {'category': 'active',      'label': 'Aktif',              'emoji': '🟢', 'ref': '7.500–9.999 langkah (JAMA 2021)'}
        else:
            return {'category': 'very_active', 'label': 'Sangat Aktif',       'emoji': '🟢', 'ref': '≥ 10.000 langkah (JAMA 2021)'}

    elif feature == 'physical_activity_hours_per_week':
        # WHO Physical Activity Guidelines 2020
        if value < 1.25:
            return {'category': 'low',      'label': 'Kurang',                'emoji': '🔴', 'ref': '< 1.25 jam/minggu (WHO 2020)'}
        elif value < 2.5:
            return {'category': 'moderate', 'label': 'Cukup',                 'emoji': '🟡', 'ref': '1.25–2.5 jam/minggu (WHO 2020)'}
        else:
            return {'category': 'good',     'label': 'Baik',                  'emoji': '🟢', 'ref': '≥ 2.5 jam/minggu (WHO 2020)'}

    elif feature == 'sleep_hours':
        # National Sleep Foundation 2015
        if value < 6:
            return {'category': 'insufficient', 'label': 'Kurang',            'emoji': '🔴', 'ref': '< 6 jam (NSF 2015)'}
        elif value <= 9:
            return {'category': 'normal',       'label': 'Normal',            'emoji': '🟢', 'ref': '7–9 jam (NSF 2015)'}
        else:
            return {'category': 'excessive',    'label': 'Berlebihan',        'emoji': '🟡', 'ref': '> 9 jam (NSF 2015)'}

    elif feature == 'alcohol_units_per_week':
        # WHO / UK Chief Medical Officers' Guidelines
        if value == 0:
            return {'category': 'none',     'label': 'Tidak Minum',           'emoji': '🟢', 'ref': '0 unit (WHO)'}
        elif value <= 7:
            return {'category': 'low',      'label': 'Rendah',                'emoji': '🟢', 'ref': '1–7 unit/minggu (WHO)'}
        elif value <= 14:
            return {'category': 'moderate', 'label': 'Sedang',                'emoji': '🟡', 'ref': '8–14 unit/minggu (WHO)'}
        else:
            return {'category': 'high',     'label': 'Tinggi (Berisiko)',      'emoji': '🔴', 'ref': '> 14 unit/minggu (WHO)'}

    elif feature == 'stress_level':
        # Skala subjektif 1–10 (tidak ada referensi medis resmi)
        if value <= 3:
            return {'category': 'low',      'label': 'Rendah',                'emoji': '🟢', 'ref': '1–3 / 10 (skala subjektif)'}
        elif value <= 6:
            return {'category': 'moderate', 'label': 'Sedang',                'emoji': '🟡', 'ref': '4–6 / 10 (skala subjektif)'}
        else:
            return {'category': 'high',     'label': 'Tinggi',                'emoji': '🔴', 'ref': '7–10 / 10 (skala subjektif)'}

    elif feature == 'diet_quality_score':
        # Skala kontekstual 1–10
        if value <= 3:
            return {'category': 'poor',     'label': 'Buruk',                 'emoji': '🔴', 'ref': '1–3 / 10 (skala kontekstual)'}
        elif value <= 6:
            return {'category': 'fair',     'label': 'Cukup',                 'emoji': '🟡', 'ref': '4–6 / 10 (skala kontekstual)'}
        else:
            return {'category': 'good',     'label': 'Baik',                  'emoji': '🟢', 'ref': '7–10 / 10 (skala kontekstual)'}

    else:
        return {'category': 'unknown', 'label': 'Tidak diketahui', 'emoji': '⚪', 'ref': '-'}


def generate_risk_comparison(user_input: dict) -> list:
    """
    Input  : user_input — dict {nama_fitur: nilai_user}
    Output : list of dict, tiap dict = satu baris perbandingan

    Contoh user_input:
    {
        'systolic_bp': 155,
        'diastolic_bp': 98,
        'cholesterol_mg_dl': 260,
        'bmi': 30.5,
        'resting_heart_rate': 80,
        'daily_steps': 3000,
        'physical_activity_hours_per_week': 1.0,
        'sleep_hours': 5.5,
        'alcohol_units_per_week': 6,
        'stress_level': 7,
        'diet_quality_score': 3,
    }
    """

    # Meta: (key_fitur, label_tampil, satuan)
    FEATURE_META = [
        ('systolic_bp',                      'Tekanan Darah Sistolik',   'mmHg'),
        ('diastolic_bp',                     'Tekanan Darah Diastolik',  'mmHg'),
        ('cholesterol_mg_dl',                'Kolesterol Total',         'mg/dL'),
        ('bmi',                              'BMI',                      ''),
        ('resting_heart_rate',               'Detak Jantung Istirahat',  'bpm'),
        ('daily_steps',                      'Langkah per Hari',         'langkah'),
        ('physical_activity_hours_per_week', 'Aktivitas Fisik',          'jam/minggu'),
        ('sleep_hours',                      'Jam Tidur',                'jam/hari'),
        ('alcohol_units_per_week',           'Konsumsi Alkohol',         'unit/minggu'),
        ('stress_level',                     'Tingkat Stres',            '/10'),
        ('diet_quality_score',               'Kualitas Diet',            '/10'),
    ]

    rows = []
    for key, label, unit in FEATURE_META:
        if key not in user_input:
            continue

        value    = user_input[key]
        clinical = get_clinical_category(key, value)
        unit_str = f' {unit}' if unit else ''

        narasi = (
            f"{clinical['emoji']} **{label}** Anda: **{value}{unit_str}** "
            f"→ Kategori: **{clinical['label']}** "
            f"*(Batas normal: {clinical['ref']})*"
        )

        rows.append({
            'feature':  key,
            'label':    label,
            'value':    f'{value}{unit_str}',
            'category': clinical['label'],
            'emoji':    clinical['emoji'],
            'ref':      clinical['ref'],
            'narasi':   narasi,
        })

    return rows


# =============================================
# TEST — jalankan cell ini untuk cek output
# =============================================

sample_user = {
    'systolic_bp':                      155,
    'diastolic_bp':                     98,
    'cholesterol_mg_dl':                260,
    'bmi':                              30.5,
    'resting_heart_rate':               80,
    'daily_steps':                      3000,
    'physical_activity_hours_per_week': 1.0,
    'sleep_hours':                      5.5,
    'alcohol_units_per_week':           6,
    'stress_level':                     7,
    'diet_quality_score':               3,
}

results = generate_risk_comparison(sample_user)

print("=== RISK COMPARISON RESULT ===\n")
for r in results:
    print(r['narasi'])
    print()
# ============================================================
# RISK COMPARISON + REKOMENDASI — Testing di Colab
# ============================================================

# ── HELPER: parse tekanan darah dari format "120/80" ────────
def parse_blood_pressure(bp_string: str):
    """'120/80' → systolic=120, diastolic=80"""
    try:
        parts = str(bp_string).strip().split('/')
        return float(parts[0]), float(parts[1])
    except:
        raise ValueError(f"Format tekanan darah salah: '{bp_string}'. Gunakan format '120/80'")


# ── RISK COMPARISON (sudah ada sebelumnya, pastikan sudah dirun) ─
# Fungsi get_clinical_category() dan generate_risk_comparison()
# harus sudah ada dari cell sebelumnya


# ── REKOMENDASI BERBASIS KONDISI ─────────────────────────────
def generate_recommendations(user_input: dict) -> dict:
    """
    Generate rekomendasi terkelompok berdasarkan kondisi user.
    Return dict: {urgent, warning, good}
    """
    urgent   = []  # 🔴 parameter buruk
    warning  = []  # 🟡 parameter perlu perhatian
    good     = []  # 🟢 parameter sudah bagus

    # Tekanan darah sistolik
    sys_bp = user_input.get('systolic_bp', 0)
    if sys_bp >= 140:
        urgent.append({
            'parameter': 'Tekanan Darah Sistolik',
            'kondisi': f'{sys_bp} mmHg — Hipertensi Stage 2',
            'rekomendasi': [
                'Kurangi konsumsi garam (sodium) di bawah 1.500 mg/hari',
                'Terapkan diet DASH (perbanyak buah, sayur, biji-bijian, rendah lemak jenuh)',
                'Olahraga aerobik minimal 30 menit/hari, 5 hari/minggu',
                'Hindari rokok dan batasi kafein',
                'Segera konsultasi dokter untuk evaluasi obat antihipertensi',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    elif sys_bp >= 130:
        warning.append({
            'parameter': 'Tekanan Darah Sistolik',
            'kondisi': f'{sys_bp} mmHg — Hipertensi Stage 1',
            'rekomendasi': [
                'Mulai terapkan diet DASH secara bertahap',
                'Kurangi konsumsi garam bertahap ke bawah 2.300 mg/hari',
                'Tambah aktivitas fisik ringan-sedang secara rutin',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    elif sys_bp >= 120:
        warning.append({
            'parameter': 'Tekanan Darah Sistolik',
            'kondisi': f'{sys_bp} mmHg — Elevated (batas atas normal)',
            'rekomendasi': [
                'Jaga pola makan rendah garam',
                'Pertahankan berat badan ideal',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    else:
        good.append('Tekanan Darah Sistolik dalam batas normal')

    # Tekanan darah diastolik
    dia_bp = user_input.get('diastolic_bp', 0)
    if dia_bp >= 90:
        urgent.append({
            'parameter': 'Tekanan Darah Diastolik',
            'kondisi': f'{dia_bp} mmHg — Hipertensi Stage 2',
            'rekomendasi': [
                'Segera konsultasi dokter — diastolik ≥90 mmHg memerlukan evaluasi medis',
                'Hindari stres berlebih dan istirahat cukup',
                'Batasi konsumsi alkohol',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    elif dia_bp >= 80:
        warning.append({
            'parameter': 'Tekanan Darah Diastolik',
            'kondisi': f'{dia_bp} mmHg — Hipertensi Stage 1',
            'rekomendasi': [
                'Kelola stres dengan meditasi atau teknik relaksasi',
                'Kurangi konsumsi alkohol',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    else:
        good.append('Tekanan Darah Diastolik dalam batas normal')

    # Kolesterol
    chol = user_input.get('cholesterol_mg_dl', 0)
    if chol >= 240:
        urgent.append({
            'parameter': 'Kolesterol Total',
            'kondisi': f'{chol} mg/dL — Tinggi',
            'rekomendasi': [
                'Kurangi makanan tinggi lemak jenuh (daging merah, produk susu tinggi lemak)',
                'Perbanyak serat larut (oatmeal, kacang-kacangan, buah apel, pir)',
                'Konsumsi ikan berlemak (salmon, sarden) 2x seminggu untuk omega-3',
                'Hindari makanan trans fat (gorengan, makanan olahan)',
                'Konsultasi dokter untuk pertimbangan terapi statin',
            ],
            'sumber': 'AHA/ACC 2018 Cholesterol Guidelines'
        })
    elif chol >= 200:
        warning.append({
            'parameter': 'Kolesterol Total',
            'kondisi': f'{chol} mg/dL — Borderline Tinggi',
            'rekomendasi': [
                'Mulai kurangi lemak jenuh dalam makanan sehari-hari',
                'Tambah konsumsi serat dan sayuran hijau',
                'Rutin periksa kolesterol setiap 6 bulan',
            ],
            'sumber': 'AHA/ACC 2018 Cholesterol Guidelines'
        })
    else:
        good.append('Kolesterol Total dalam batas optimal')

    # BMI
    bmi = user_input.get('bmi', 0)
    if bmi >= 30:
        urgent.append({
            'parameter': 'BMI',
            'kondisi': f'{bmi:.1f} — Obesitas',
            'rekomendasi': [
                'Target penurunan berat badan 5–10% dari berat saat ini secara bertahap',
                'Defisit kalori moderat (300–500 kkal/hari), hindari diet ekstrem',
                'Kombinasikan latihan aerobik dan latihan kekuatan minimal 3x/minggu',
                'Konsultasi ahli gizi untuk program diet yang aman',
            ],
            'sumber': 'AHA Lifestyle Guidelines & WHO BMI Classification'
        })
    elif bmi >= 25:
        warning.append({
            'parameter': 'BMI',
            'kondisi': f'{bmi:.1f} — Overweight',
            'rekomendasi': [
                'Perbanyak konsumsi sayur dan protein tanpa lemak',
                'Kurangi makanan tinggi kalori kosong (minuman manis, snack olahan)',
                'Tambah aktivitas fisik harian minimal 30 menit/hari',
            ],
            'sumber': 'AHA Lifestyle Guidelines & WHO BMI Classification'
        })
    elif bmi < 18.5:
        warning.append({
            'parameter': 'BMI',
            'kondisi': f'{bmi:.1f} — Berat Badan Kurang',
            'rekomendasi': [
                'Tingkatkan asupan kalori dari sumber nutrisi padat gizi',
                'Konsultasi dokter atau ahli gizi',
            ],
            'sumber': 'WHO BMI Classification'
        })
    else:
        good.append(f'BMI dalam batas normal ({bmi:.1f})')

    # Aktivitas fisik
    activity = user_input.get('physical_activity_hours_per_week', 0)
    activity_min = activity * 60
    if activity_min < 75:
        urgent.append({
            'parameter': 'Aktivitas Fisik',
            'kondisi': f'{activity:.1f} jam/minggu — Sangat Kurang',
            'rekomendasi': [
                'Target minimal 150 menit/minggu aktivitas aerobik intensitas sedang',
                'Mulai bertahap: jalan kaki 10 menit/hari, tingkatkan setiap minggu',
                'Pilih aktivitas yang menyenangkan: bersepeda, renang, senam',
                'Tambah latihan kekuatan (resistance training) 2x/minggu',
            ],
            'sumber': 'WHO Physical Activity Guidelines 2020'
        })
    elif activity_min < 150:
        warning.append({
            'parameter': 'Aktivitas Fisik',
            'kondisi': f'{activity:.1f} jam/minggu — Kurang dari rekomendasi',
            'rekomendasi': [
                'Tingkatkan durasi olahraga hingga 150 menit/minggu',
                'Coba tambah 1 sesi olahraga per minggu secara bertahap',
            ],
            'sumber': 'WHO Physical Activity Guidelines 2020'
        })
    else:
        good.append(f'Aktivitas fisik sudah memenuhi rekomendasi WHO ({activity:.1f} jam/minggu)')

    # Langkah per hari
    steps = user_input.get('daily_steps', 0)
    if steps < 5000:
        urgent.append({
            'parameter': 'Langkah per Hari',
            'kondisi': f'{int(steps)} langkah — Kurang Aktif',
            'rekomendasi': [
                'Target minimal 7.500–10.000 langkah/hari',
                'Gunakan tangga daripada lift, parkir lebih jauh',
                'Jalan kaki saat istirahat makan siang 10–15 menit',
            ],
            'sumber': 'JAMA Internal Medicine 2021'
        })
    elif steps < 7500:
        warning.append({
            'parameter': 'Langkah per Hari',
            'kondisi': f'{int(steps)} langkah — Cukup Aktif',
            'rekomendasi': [
                'Tingkatkan ke 7.500–10.000 langkah/hari untuk manfaat optimal',
            ],
            'sumber': 'JAMA Internal Medicine 2021'
        })
    else:
        good.append(f'Jumlah langkah harian sudah baik ({int(steps)} langkah/hari)')

    # Tidur
    sleep = user_input.get('sleep_hours', 0)
    if sleep < 6:
        urgent.append({
            'parameter': 'Durasi Tidur',
            'kondisi': f'{sleep} jam/malam — Kurang',
            'rekomendasi': [
                'Target 7–9 jam tidur per malam untuk orang dewasa',
                'Tetapkan jadwal tidur dan bangun yang konsisten setiap hari',
                'Hindari layar gadget minimal 1 jam sebelum tidur',
                'Ciptakan lingkungan tidur yang gelap, sejuk, dan tenang',
            ],
            'sumber': 'National Sleep Foundation 2015'
        })
    elif sleep > 9:
        warning.append({
            'parameter': 'Durasi Tidur',
            'kondisi': f'{sleep} jam/malam — Berlebihan',
            'rekomendasi': [
                'Tidur >9 jam dapat mengindikasikan masalah kesehatan tertentu',
                'Konsultasi dokter jika sering merasa lelah meski tidur lama',
            ],
            'sumber': 'National Sleep Foundation 2015'
        })
    else:
        good.append(f'Durasi tidur normal ({sleep} jam/malam)')

    # Alkohol
    alcohol = user_input.get('alcohol_units_per_week', 0)
    if alcohol > 14:
        urgent.append({
            'parameter': 'Konsumsi Alkohol',
            'kondisi': f'{alcohol} unit/minggu — Tinggi (Berisiko)',
            'rekomendasi': [
                'Kurangi konsumsi alkohol secara bertahap',
                'Target di bawah 14 unit/minggu, idealnya lebih rendah',
                'Cari dukungan profesional jika sulit mengurangi sendiri',
                'Alkohol berlebih meningkatkan risiko hipertensi dan kardiomiopati',
            ],
            'sumber': 'WHO Alcohol Guidelines'
        })
    elif alcohol > 7:
        warning.append({
            'parameter': 'Konsumsi Alkohol',
            'kondisi': f'{alcohol} unit/minggu — Sedang',
            'rekomendasi': [
                'Pertimbangkan untuk mengurangi ke bawah 7 unit/minggu',
                'Selipkan hari-hari bebas alkohol dalam seminggu',
            ],
            'sumber': 'WHO Alcohol Guidelines'
        })
    else:
        good.append('Konsumsi alkohol dalam batas aman')

    # Stres
    stress = user_input.get('stress_level', 0)
    if stress >= 7:
        urgent.append({
            'parameter': 'Tingkat Stres',
            'kondisi': f'{stress}/10 — Tinggi',
            'rekomendasi': [
                'Latihan pernapasan dalam (deep breathing) 5–10 menit/hari',
                'Meditasi atau mindfulness minimal 10 menit/hari',
                'Olahraga rutin terbukti signifikan menurunkan hormon stres',
                'Batasi paparan berita negatif dan media sosial',
                'Pertimbangkan konsultasi dengan psikolog atau konselor',
            ],
            'sumber': 'AHA Stress & Heart Disease'
        })
    elif stress >= 4:
        warning.append({
            'parameter': 'Tingkat Stres',
            'kondisi': f'{stress}/10 — Sedang',
            'rekomendasi': [
                'Luangkan waktu untuk hobi dan aktivitas relaksasi',
                'Jaga keseimbangan kerja dan istirahat',
            ],
            'sumber': 'AHA Stress & Heart Disease'
        })
    else:
        good.append(f'Tingkat stres terkendali ({stress}/10)')

    return {'urgent': urgent, 'warning': warning, 'good': good}


# ── PRINT OUTPUT ─────────────────────────────────────────────
def print_results(bp_string: str, bmi: float, cholesterol: float,
                  resting_hr: float, daily_steps: float,
                  activity_hours: float, sleep_hours: float,
                  alcohol_units: float, stress_level: float,
                  family_history: bool, diet_quality: float,
                  age: float, risk_score: float = None,
                  risk_category: str = None):
    """
    Cetak Risk Comparison + Rekomendasi lengkap.
    risk_score      : output model (0–100), opsional
    risk_category   : 'Low'/'Medium'/'High', opsional
    """
    sys_bp, dia_bp = parse_blood_pressure(bp_string)

    user_input = {
        'systolic_bp'                      : sys_bp,
        'diastolic_bp'                     : dia_bp,
        'cholesterol_mg_dl'                : cholesterol,
        'bmi'                              : bmi,
        'resting_heart_rate'               : resting_hr,
        'daily_steps'                      : daily_steps,
        'physical_activity_hours_per_week' : activity_hours,
        'sleep_hours'                      : sleep_hours,
        'alcohol_units_per_week'           : alcohol_units,
        'stress_level'                     : stress_level,
        'diet_quality_score'               : diet_quality,
    }

    # ── Header
    print("\n" + "="*60)
    print("         HASIL SKRINING RISIKO KARDIOVASKULAR")
    print("="*60)
    if risk_score is not None:
        print(f"  Skor Risiko    : {risk_score:.1f} / 100")
    if risk_category:
        emoji_map = {'Low': '🟢', 'Medium': '🟡', 'High': '🔴'}
        print(f"  Kategori Risiko: {emoji_map.get(risk_category, '')} {risk_category}")
    print(f"  Usia           : {int(age)} tahun")
    print(f"  Riwayat Keluarga: {'Ada ⚠️' if family_history else 'Tidak Ada ✅'}")
    print("="*60)

    # ── Risk Comparison
    print("\n📊 PERBANDINGAN KONDISI ANDA vs STANDAR MEDIS\n")
    comparison = generate_risk_comparison(user_input)
    for r in comparison:
        print(f"  {r['narasi']}")

    # ── Rekomendasi
    recs = generate_recommendations(user_input)

    if recs['urgent']:
        print("\n\n🚨 PRIORITAS UTAMA — Perlu Tindakan Segera\n")
        for i, item in enumerate(recs['urgent'], 1):
            print(f"  {i}. {item['parameter']} ({item['kondisi']})")
            for r in item['rekomendasi']:
                print(f"      • {r}")
            print(f"      📚 Sumber: {item['sumber']}\n")

    if recs['warning']:
        print("\n⚠️  PERLU DIPERHATIKAN — Monitor & Perbaiki Bertahap\n")
        for i, item in enumerate(recs['warning'], 1):
            print(f"  {i}. {item['parameter']} ({item['kondisi']})")
            for r in item['rekomendasi']:
                print(f"      • {r}")
            print(f"      📚 Sumber: {item['sumber']}\n")

    if recs['good']:
        print("\n✅ YANG SUDAH BAIK — Pertahankan!\n")
        for item in recs['good']:
            print(f"  • {item}")

    print("\n" + "="*60)
    print("  ⚕️  Disclaimer: Hasil ini adalah skrining awal.")
    print("  Konsultasikan dengan dokter untuk diagnosis resmi.")
    print("="*60 + "\n")


# ============================================================
# TEST — ganti nilai di sini sesuai input form
# ============================================================
print_results(
    bp_string       = "155/98",
    bmi             = 30.5,
    cholesterol     = 260,
    resting_hr      = 80,
    daily_steps     = 3000,
    activity_hours  = 1.0,
    sleep_hours     = 5.5,
    alcohol_units   = 6,
    stress_level    = 7,
    family_history  = True,
    diet_quality    = 3,
    age             = 45,
    risk_score      = 72.5,    # dari output model, opsional
    risk_category   = "High"   # dari output model, opsional
)
# ============================================================
# RISK COMPARISON + REKOMENDASI
# Sumber: AHA/ACC 2017, AHA/ACC 2018, WHO 2020,
#         JAMA 2021, National Sleep Foundation 2015
# ============================================================

# ── HELPER: parse tekanan darah "120/80" ────────────────────
def parse_blood_pressure(bp_string: str):
    """'120/80' → systolic=120, diastolic=80"""
    try:
        parts = str(bp_string).strip().split('/')
        return float(parts[0]), float(parts[1])
    except:
        raise ValueError(f"Format salah: '{bp_string}'. Gunakan format '120/80'")


# ── KODE A: Klasifikasi klinis per parameter ────────────────
def get_clinical_category(feature: str, value: float) -> dict:
    """
    Klasifikasikan nilai user ke kategori klinis berdasarkan referensi medis.
    Return dict: {category, label, emoji, ref}
    """
    if feature == 'systolic_bp':
        if value < 120:
            return {'category': 'normal',   'label': 'Normal',             'emoji': '🟢', 'ref': '< 120 mmHg (AHA 2017)'}
        elif value < 130:
            return {'category': 'elevated', 'label': 'Elevated',           'emoji': '🟡', 'ref': '120–129 mmHg (AHA 2017)'}
        elif value < 140:
            return {'category': 'stage1',   'label': 'Hipertensi Stage 1', 'emoji': '🟠', 'ref': '130–139 mmHg (AHA 2017)'}
        else:
            return {'category': 'stage2',   'label': 'Hipertensi Stage 2', 'emoji': '🔴', 'ref': '≥ 140 mmHg (AHA 2017)'}

    elif feature == 'diastolic_bp':
        if value < 80:
            return {'category': 'normal',  'label': 'Normal',             'emoji': '🟢', 'ref': '< 80 mmHg (AHA 2017)'}
        elif value < 90:
            return {'category': 'stage1',  'label': 'Hipertensi Stage 1', 'emoji': '🟠', 'ref': '80–89 mmHg (AHA 2017)'}
        else:
            return {'category': 'stage2',  'label': 'Hipertensi Stage 2', 'emoji': '🔴', 'ref': '≥ 90 mmHg (AHA 2017)'}

    elif feature == 'cholesterol_mg_dl':
        if value < 200:
            return {'category': 'optimal',    'label': 'Optimal',          'emoji': '🟢', 'ref': '< 200 mg/dL (AHA 2018)'}
        elif value < 240:
            return {'category': 'borderline', 'label': 'Borderline Tinggi','emoji': '🟡', 'ref': '200–239 mg/dL (AHA 2018)'}
        else:
            return {'category': 'high',       'label': 'Tinggi',           'emoji': '🔴', 'ref': '≥ 240 mg/dL (AHA 2018)'}

    elif feature == 'bmi':
        if value < 18.5:
            return {'category': 'underweight', 'label': 'Berat Badan Kurang', 'emoji': '🟡', 'ref': '< 18.5 (WHO)'}
        elif value < 25.0:
            return {'category': 'normal',      'label': 'Normal',             'emoji': '🟢', 'ref': '18.5–24.9 (WHO)'}
        elif value < 30.0:
            return {'category': 'overweight',  'label': 'Overweight',         'emoji': '🟡', 'ref': '25.0–29.9 (WHO)'}
        else:
            return {'category': 'obese',       'label': 'Obesitas',           'emoji': '🔴', 'ref': '≥ 30.0 (WHO)'}

    elif feature == 'resting_heart_rate':
        if value < 60:
            return {'category': 'low',    'label': 'Rendah (Bradikardia)', 'emoji': '🟡', 'ref': '< 60 bpm (AHA)'}
        elif value <= 100:
            return {'category': 'normal', 'label': 'Normal',               'emoji': '🟢', 'ref': '60–100 bpm (AHA)'}
        else:
            return {'category': 'high',   'label': 'Tinggi (Takikardia)',  'emoji': '🔴', 'ref': '> 100 bpm (AHA)'}

    elif feature == 'daily_steps':
        if value < 5000:
            return {'category': 'low',       'label': 'Kurang Aktif',  'emoji': '🔴', 'ref': '< 5.000 langkah (JAMA 2021)'}
        elif value < 7500:
            return {'category': 'moderate',  'label': 'Cukup Aktif',   'emoji': '🟡', 'ref': '5.000–7.499 langkah (JAMA 2021)'}
        elif value < 10000:
            return {'category': 'active',    'label': 'Aktif',         'emoji': '🟢', 'ref': '7.500–9.999 langkah (JAMA 2021)'}
        else:
            return {'category': 'very_active','label': 'Sangat Aktif', 'emoji': '🟢', 'ref': '≥ 10.000 langkah (JAMA 2021)'}

    elif feature == 'physical_activity_hours_per_week':
        if value < 1.25:
            return {'category': 'low',      'label': 'Kurang', 'emoji': '🔴', 'ref': '< 1.25 jam/minggu (WHO 2020)'}
        elif value < 2.5:
            return {'category': 'moderate', 'label': 'Cukup',  'emoji': '🟡', 'ref': '1.25–2.5 jam/minggu (WHO 2020)'}
        else:
            return {'category': 'good',     'label': 'Baik',   'emoji': '🟢', 'ref': '≥ 2.5 jam/minggu (WHO 2020)'}

    elif feature == 'sleep_hours':
        if value < 6:
            return {'category': 'insufficient', 'label': 'Kurang',      'emoji': '🔴', 'ref': '< 6 jam (NSF 2015)'}
        elif value <= 9:
            return {'category': 'normal',       'label': 'Normal',      'emoji': '🟢', 'ref': '7–9 jam (NSF 2015)'}
        else:
            return {'category': 'excessive',    'label': 'Berlebihan',  'emoji': '🟡', 'ref': '> 9 jam (NSF 2015)'}

    elif feature == 'alcohol_units_per_week':
        if value == 0:
            return {'category': 'none',     'label': 'Tidak Minum',      'emoji': '🟢', 'ref': '0 unit (WHO)'}
        elif value <= 7:
            return {'category': 'low',      'label': 'Rendah',           'emoji': '🟢', 'ref': '1–7 unit/minggu (WHO)'}
        elif value <= 14:
            return {'category': 'moderate', 'label': 'Sedang',           'emoji': '🟡', 'ref': '8–14 unit/minggu (WHO)'}
        else:
            return {'category': 'high',     'label': 'Tinggi (Berisiko)','emoji': '🔴', 'ref': '> 14 unit/minggu (WHO)'}

    elif feature == 'stress_level':
        if value <= 3:
            return {'category': 'low',      'label': 'Rendah', 'emoji': '🟢', 'ref': '1–3 / 10 (skala subjektif)'}
        elif value <= 6:
            return {'category': 'moderate', 'label': 'Sedang', 'emoji': '🟡', 'ref': '4–6 / 10 (skala subjektif)'}
        else:
            return {'category': 'high',     'label': 'Tinggi', 'emoji': '🔴', 'ref': '7–10 / 10 (skala subjektif)'}

    elif feature == 'diet_quality_score':
        if value <= 3:
            return {'category': 'poor', 'label': 'Buruk', 'emoji': '🔴', 'ref': '1–3 / 10 (skala kontekstual)'}
        elif value <= 6:
            return {'category': 'fair', 'label': 'Cukup', 'emoji': '🟡', 'ref': '4–6 / 10 (skala kontekstual)'}
        else:
            return {'category': 'good', 'label': 'Baik',  'emoji': '🟢', 'ref': '7–10 / 10 (skala kontekstual)'}

    else:
        return {'category': 'unknown', 'label': 'Tidak diketahui', 'emoji': '⚪', 'ref': '-'}


# ── KODE A: Generate narasi perbandingan ────────────────────
def generate_risk_comparison(user_input: dict) -> list:
    """
    Input  : user_input dict {nama_fitur: nilai}
    Output : list of dict, tiap dict = satu baris perbandingan
    """
    FEATURE_META = [
        ('systolic_bp',                      'Tekanan Darah Sistolik',  'mmHg'),
        ('diastolic_bp',                     'Tekanan Darah Diastolik', 'mmHg'),
        ('cholesterol_mg_dl',                'Kolesterol Total',        'mg/dL'),
        ('bmi',                              'BMI',                     ''),
        ('resting_heart_rate',               'Detak Jantung Istirahat', 'bpm'),
        ('daily_steps',                      'Langkah per Hari',        'langkah'),
        ('physical_activity_hours_per_week', 'Aktivitas Fisik',         'jam/minggu'),
        ('sleep_hours',                      'Jam Tidur',               'jam/hari'),
        ('alcohol_units_per_week',           'Konsumsi Alkohol',        'unit/minggu'),
        ('stress_level',                     'Tingkat Stres',           '/10'),
        ('diet_quality_score',               'Kualitas Diet',           '/10'),
    ]

    rows = []
    for key, label, unit in FEATURE_META:
        if key not in user_input:
            continue
        value    = user_input[key]
        clinical = get_clinical_category(key, value)
        unit_str = f' {unit}' if unit else ''
        narasi   = (
            f"{clinical['emoji']} **{label}** Anda: **{value}{unit_str}** "
            f"→ Kategori: **{clinical['label']}** "
            f"*(Batas normal: {clinical['ref']})*"
        )
        rows.append({
            'feature':  key,
            'label':    label,
            'value':    f'{value}{unit_str}',
            'category': clinical['label'],
            'emoji':    clinical['emoji'],
            'ref':      clinical['ref'],
            'narasi':   narasi,
        })
    return rows


# ── KODE B: Generate rekomendasi ────────────────────────────
def generate_recommendations(user_input: dict) -> dict:
    """
    Return dict: {urgent: [...], warning: [...], good: [...]}
    """
    urgent  = []
    warning = []
    good    = []

    # Tekanan darah sistolik
    sys_bp = user_input.get('systolic_bp', 0)
    if sys_bp >= 140:
        urgent.append({
            'parameter': 'Tekanan Darah Sistolik',
            'kondisi': f'{sys_bp} mmHg — Hipertensi Stage 2',
            'rekomendasi': [
                'Kurangi konsumsi garam (sodium) di bawah 1.500 mg/hari',
                'Terapkan diet DASH (perbanyak buah, sayur, biji-bijian, rendah lemak jenuh)',
                'Olahraga aerobik minimal 30 menit/hari, 5 hari/minggu',
                'Hindari rokok dan batasi kafein',
                'Segera konsultasi dokter untuk evaluasi obat antihipertensi',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    elif sys_bp >= 130:
        warning.append({
            'parameter': 'Tekanan Darah Sistolik',
            'kondisi': f'{sys_bp} mmHg — Hipertensi Stage 1',
            'rekomendasi': [
                'Mulai terapkan diet DASH secara bertahap',
                'Kurangi konsumsi garam bertahap ke bawah 2.300 mg/hari',
                'Tambah aktivitas fisik ringan-sedang secara rutin',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    elif sys_bp >= 120:
        warning.append({
            'parameter': 'Tekanan Darah Sistolik',
            'kondisi': f'{sys_bp} mmHg — Elevated',
            'rekomendasi': [
                'Jaga pola makan rendah garam',
                'Pertahankan berat badan ideal',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    else:
        good.append('Tekanan Darah Sistolik dalam batas normal')

    # Tekanan darah diastolik
    dia_bp = user_input.get('diastolic_bp', 0)
    if dia_bp >= 90:
        urgent.append({
            'parameter': 'Tekanan Darah Diastolik',
            'kondisi': f'{dia_bp} mmHg — Hipertensi Stage 2',
            'rekomendasi': [
                'Segera konsultasi dokter — diastolik ≥90 mmHg memerlukan evaluasi medis',
                'Hindari stres berlebih dan istirahat cukup',
                'Batasi konsumsi alkohol',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    elif dia_bp >= 80:
        warning.append({
            'parameter': 'Tekanan Darah Diastolik',
            'kondisi': f'{dia_bp} mmHg — Hipertensi Stage 1',
            'rekomendasi': [
                'Kelola stres dengan meditasi atau teknik relaksasi',
                'Kurangi konsumsi alkohol',
            ],
            'sumber': 'AHA/ACC 2017 Hypertension Guidelines'
        })
    else:
        good.append('Tekanan Darah Diastolik dalam batas normal')

    # Kolesterol
    chol = user_input.get('cholesterol_mg_dl', 0)
    if chol >= 240:
        urgent.append({
            'parameter': 'Kolesterol Total',
            'kondisi': f'{chol} mg/dL — Tinggi',
            'rekomendasi': [
                'Kurangi makanan tinggi lemak jenuh (daging merah, produk susu tinggi lemak)',
                'Perbanyak serat larut (oatmeal, kacang-kacangan, buah apel, pir)',
                'Konsumsi ikan berlemak (salmon, sarden) 2x seminggu untuk omega-3',
                'Hindari makanan trans fat (gorengan, makanan olahan)',
                'Konsultasi dokter untuk pertimbangan terapi statin',
            ],
            'sumber': 'AHA/ACC 2018 Cholesterol Guidelines'
        })
    elif chol >= 200:
        warning.append({
            'parameter': 'Kolesterol Total',
            'kondisi': f'{chol} mg/dL — Borderline Tinggi',
            'rekomendasi': [
                'Mulai kurangi lemak jenuh dalam makanan sehari-hari',
                'Tambah konsumsi serat dan sayuran hijau',
                'Rutin periksa kolesterol setiap 6 bulan',
            ],
            'sumber': 'AHA/ACC 2018 Cholesterol Guidelines'
        })
    else:
        good.append('Kolesterol Total dalam batas optimal')

    # BMI
    bmi = user_input.get('bmi', 0)
    if bmi >= 30:
        urgent.append({
            'parameter': 'BMI',
            'kondisi': f'{bmi:.1f} — Obesitas',
            'rekomendasi': [
                'Target penurunan berat badan 5–10% dari berat saat ini secara bertahap',
                'Defisit kalori moderat (300–500 kkal/hari), hindari diet ekstrem',
                'Kombinasikan latihan aerobik dan latihan kekuatan minimal 3x/minggu',
                'Konsultasi ahli gizi untuk program diet yang aman',
            ],
            'sumber': 'AHA Lifestyle Guidelines & WHO BMI Classification'
        })
    elif bmi >= 25:
        warning.append({
            'parameter': 'BMI',
            'kondisi': f'{bmi:.1f} — Overweight',
            'rekomendasi': [
                'Perbanyak konsumsi sayur dan protein tanpa lemak',
                'Kurangi makanan tinggi kalori kosong (minuman manis, snack olahan)',
                'Tambah aktivitas fisik harian minimal 30 menit/hari',
            ],
            'sumber': 'AHA Lifestyle Guidelines & WHO BMI Classification'
        })
    elif bmi < 18.5:
        warning.append({
            'parameter': 'BMI',
            'kondisi': f'{bmi:.1f} — Berat Badan Kurang',
            'rekomendasi': [
                'Tingkatkan asupan kalori dari sumber nutrisi padat gizi',
                'Konsultasi dokter atau ahli gizi',
            ],
            'sumber': 'WHO BMI Classification'
        })
    else:
        good.append(f'BMI dalam batas normal ({bmi:.1f})')

    # Aktivitas fisik
    activity     = user_input.get('physical_activity_hours_per_week', 0)
    activity_min = activity * 60
    if activity_min < 75:
        urgent.append({
            'parameter': 'Aktivitas Fisik',
            'kondisi': f'{activity:.1f} jam/minggu — Sangat Kurang',
            'rekomendasi': [
                'Target minimal 150 menit/minggu aktivitas aerobik intensitas sedang',
                'Mulai bertahap: jalan kaki 10 menit/hari, tingkatkan setiap minggu',
                'Pilih aktivitas yang menyenangkan: bersepeda, renang, senam',
                'Tambah latihan kekuatan (resistance training) 2x/minggu',
            ],
            'sumber': 'WHO Physical Activity Guidelines 2020'
        })
    elif activity_min < 150:
        warning.append({
            'parameter': 'Aktivitas Fisik',
            'kondisi': f'{activity:.1f} jam/minggu — Kurang dari rekomendasi',
            'rekomendasi': [
                'Tingkatkan durasi olahraga hingga 150 menit/minggu',
                'Coba tambah 1 sesi olahraga per minggu secara bertahap',
            ],
            'sumber': 'WHO Physical Activity Guidelines 2020'
        })
    else:
        good.append(f'Aktivitas fisik sudah memenuhi rekomendasi WHO ({activity:.1f} jam/minggu)')

    # Langkah per hari
    steps = user_input.get('daily_steps', 0)
    if steps < 5000:
        urgent.append({
            'parameter': 'Langkah per Hari',
            'kondisi': f'{int(steps)} langkah — Kurang Aktif',
            'rekomendasi': [
                'Target minimal 7.500–10.000 langkah/hari',
                'Gunakan tangga daripada lift, parkir lebih jauh',
                'Jalan kaki saat istirahat makan siang 10–15 menit',
            ],
            'sumber': 'JAMA Internal Medicine 2021'
        })
    elif steps < 7500:
        warning.append({
            'parameter': 'Langkah per Hari',
            'kondisi': f'{int(steps)} langkah — Cukup Aktif',
            'rekomendasi': [
                'Tingkatkan ke 7.500–10.000 langkah/hari untuk manfaat optimal',
            ],
            'sumber': 'JAMA Internal Medicine 2021'
        })
    else:
        good.append(f'Jumlah langkah harian sudah baik ({int(steps)} langkah/hari)')

    # Tidur
    sleep = user_input.get('sleep_hours', 0)
    if sleep < 6:
        urgent.append({
            'parameter': 'Durasi Tidur',
            'kondisi': f'{sleep} jam/malam — Kurang',
            'rekomendasi': [
                'Target 7–9 jam tidur per malam untuk orang dewasa',
                'Tetapkan jadwal tidur dan bangun yang konsisten setiap hari',
                'Hindari layar gadget minimal 1 jam sebelum tidur',
                'Ciptakan lingkungan tidur yang gelap, sejuk, dan tenang',
            ],
            'sumber': 'National Sleep Foundation 2015'
        })
    elif sleep > 9:
        warning.append({
            'parameter': 'Durasi Tidur',
            'kondisi': f'{sleep} jam/malam — Berlebihan',
            'rekomendasi': [
                'Tidur >9 jam dapat mengindikasikan masalah kesehatan tertentu',
                'Konsultasi dokter jika sering merasa lelah meski tidur lama',
            ],
            'sumber': 'National Sleep Foundation 2015'
        })
    else:
        good.append(f'Durasi tidur normal ({sleep} jam/malam)')

    # Alkohol
    alcohol = user_input.get('alcohol_units_per_week', 0)
    if alcohol > 14:
        urgent.append({
            'parameter': 'Konsumsi Alkohol',
            'kondisi': f'{alcohol} unit/minggu — Tinggi (Berisiko)',
            'rekomendasi': [
                'Kurangi konsumsi alkohol secara bertahap',
                'Target di bawah 14 unit/minggu, idealnya lebih rendah',
                'Cari dukungan profesional jika sulit mengurangi sendiri',
                'Alkohol berlebih meningkatkan risiko hipertensi dan kardiomiopati',
            ],
            'sumber': 'WHO Alcohol Guidelines'
        })
    elif alcohol > 7:
        warning.append({
            'parameter': 'Konsumsi Alkohol',
            'kondisi': f'{alcohol} unit/minggu — Sedang',
            'rekomendasi': [
                'Pertimbangkan untuk mengurangi ke bawah 7 unit/minggu',
                'Selipkan hari-hari bebas alkohol dalam seminggu',
            ],
            'sumber': 'WHO Alcohol Guidelines'
        })
    else:
        good.append('Konsumsi alkohol dalam batas aman')

    # Stres
    stress = user_input.get('stress_level', 0)
    if stress >= 7:
        urgent.append({
            'parameter': 'Tingkat Stres',
            'kondisi': f'{stress}/10 — Tinggi',
            'rekomendasi': [
                'Latihan pernapasan dalam (deep breathing) 5–10 menit/hari',
                'Meditasi atau mindfulness minimal 10 menit/hari',
                'Olahraga rutin terbukti signifikan menurunkan hormon stres',
                'Batasi paparan berita negatif dan media sosial',
                'Pertimbangkan konsultasi dengan psikolog atau konselor',
            ],
            'sumber': 'AHA Stress & Heart Disease'
        })
    elif stress >= 4:
        warning.append({
            'parameter': 'Tingkat Stres',
            'kondisi': f'{stress}/10 — Sedang',
            'rekomendasi': [
                'Luangkan waktu untuk hobi dan aktivitas relaksasi',
                'Jaga keseimbangan kerja dan istirahat',
            ],
            'sumber': 'AHA Stress & Heart Disease'
        })
    else:
        good.append(f'Tingkat stres terkendali ({stress}/10)')

    # ── TAMBAHAN: Diet quality ───────────────────────────────
    diet = user_input.get('diet_quality_score', 0)
    if diet <= 3:
        urgent.append({
            'parameter': 'Kualitas Diet',
            'kondisi': f'{diet}/10 — Buruk',
            'rekomendasi': [
                'Perbanyak konsumsi buah dan sayuran minimal 5 porsi/hari',
                'Kurangi makanan ultra-processed (mie instan, fast food, minuman manis)',
                'Ganti karbohidrat sederhana dengan karbohidrat kompleks (nasi merah, oat)',
                'Konsultasi ahli gizi untuk panduan diet yang terstruktur',
            ],
            'sumber': 'AHA Lifestyle Guidelines'
        })
    elif diet <= 6:
        warning.append({
            'parameter': 'Kualitas Diet',
            'kondisi': f'{diet}/10 — Cukup',
            'rekomendasi': [
                'Tingkatkan variasi sayuran dan buah dalam menu harian',
                'Kurangi konsumsi gula tambahan dan garam berlebih',
            ],
            'sumber': 'AHA Lifestyle Guidelines'
        })
    else:
        good.append(f'Kualitas diet sudah baik ({diet}/10)')

    # ── TAMBAHAN: Family history ─────────────────────────────
    family_history = user_input.get('family_history_heart_disease', False)
    if family_history:
        warning.append({
            'parameter': 'Riwayat Keluarga',
            'kondisi': 'Ada riwayat penyakit jantung dalam keluarga',
            'rekomendasi': [
                'Lakukan skrining jantung rutin minimal 1x per tahun',
                'Informasikan riwayat keluarga ke dokter untuk asesmen risiko genetik',
                'Jaga semua parameter gaya hidup lebih ketat dari rata-rata orang',
            ],
            'sumber': 'AHA Family History & Heart Disease'
        })

    return {'urgent': urgent, 'warning': warning, 'good': good}


# ── KODE B: Print output lengkap ────────────────────────────
def print_results(bp_string: str, bmi: float, cholesterol: float,
                  resting_hr: float, daily_steps: float,
                  activity_hours: float, sleep_hours: float,
                  alcohol_units: float, stress_level: float,
                  family_history: bool, diet_quality: float,
                  age: float, risk_score: float = None,
                  risk_category: str = None):

    sys_bp, dia_bp = parse_blood_pressure(bp_string)

    user_input = {
        'systolic_bp'                      : sys_bp,
        'diastolic_bp'                     : dia_bp,
        'cholesterol_mg_dl'                : cholesterol,
        'bmi'                              : bmi,
        'resting_heart_rate'               : resting_hr,
        'daily_steps'                      : daily_steps,
        'physical_activity_hours_per_week' : activity_hours,
        'sleep_hours'                      : sleep_hours,
        'alcohol_units_per_week'           : alcohol_units,
        'stress_level'                     : stress_level,
        'diet_quality_score'               : diet_quality,
        'family_history_heart_disease'     : family_history,
    }

    # Header
    print("\n" + "="*60)
    print("         HASIL SKRINING RISIKO KARDIOVASKULAR")
    print("="*60)
    if risk_score is not None:
        print(f"  Skor Risiko     : {risk_score:.1f} / 100")
    if risk_category:
        emoji_map = {'Low': '🟢', 'Medium': '🟡', 'High': '🔴'}
        print(f"  Kategori Risiko : {emoji_map.get(risk_category, '')} {risk_category}")
    print(f"  Usia            : {int(age)} tahun")
    print(f"  Riwayat Keluarga: {'Ada ⚠️' if family_history else 'Tidak Ada ✅'}")
    print("="*60)

    # Risk Comparison
    print("\n📊 PERBANDINGAN KONDISI ANDA vs STANDAR MEDIS\n")
    for r in generate_risk_comparison(user_input):
        print(f"  {r['narasi']}")

    # Rekomendasi
    recs = generate_recommendations(user_input)

    if recs['urgent']:
        print("\n\n🚨 PRIORITAS UTAMA — Perlu Tindakan Segera\n")
        for i, item in enumerate(recs['urgent'], 1):
            print(f"  {i}. {item['parameter']} ({item['kondisi']})")
            for r in item['rekomendasi']:
                print(f"      • {r}")
            print(f"      📚 Sumber: {item['sumber']}\n")

    if recs['warning']:
        print("\n⚠️  PERLU DIPERHATIKAN — Monitor & Perbaiki Bertahap\n")
        for i, item in enumerate(recs['warning'], 1):
            print(f"  {i}. {item['parameter']} ({item['kondisi']})")
            for r in item['rekomendasi']:
                print(f"      • {r}")
            print(f"      📚 Sumber: {item['sumber']}\n")

    if recs['good']:
        print("\n✅ YANG SUDAH BAIK — Pertahankan!\n")
        for item in recs['good']:
            print(f"  • {item}")

    print("\n" + "="*60)
    print("  ⚕️  Disclaimer: Hasil ini adalah skrining awal.")
    print("  Konsultasikan dengan dokter untuk diagnosis resmi.")
    print("="*60 + "\n")


# ── TEST ─────────────────────────────────────────────────────
print_results(
    bp_string      = "155/98",
    bmi            = 30.5,
    cholesterol    = 260,
    resting_hr     = 80,
    daily_steps    = 3000,
    activity_hours = 1.0,
    sleep_hours    = 5.5,
    alcohol_units  = 6,
    stress_level   = 7,
    family_history = True,
    diet_quality   = 3,
    age            = 45,
    risk_score     = 72.5,
    risk_category  = "High"
)