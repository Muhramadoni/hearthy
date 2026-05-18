import sys
import json
import os
import joblib
import numpy as np
import pandas as pd
import traceback

# Disable TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

def main():
    try:
        # 1. Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"status": "error", "message": "No input data provided"}))
            return
            
        data = json.loads(input_data)
        
        # Required features based on the training dataset
        required_features = [
            'age', 'bmi', 'systolic_bp', 'diastolic_bp', 'cholesterol_mg_dl', 
            'resting_heart_rate', 'daily_steps', 'stress_level', 
            'physical_activity_hours_per_week', 'sleep_hours', 
            'family_history_heart_disease', 'diet_quality_score', 'alcohol_units_per_week'
        ]
        
        # Ensure all required features are present
        features = {}
        for feature in required_features:
            if feature not in data:
                print(json.dumps({"status": "error", "message": f"Missing required feature: {feature}"}))
                return
            features[feature] = [float(data[feature])]
            
        # --- Feature Engineering ---
        age = features['age'][0]
        bmi = features['bmi'][0]
        sys_bp = features['systolic_bp'][0]
        dia_bp = features['diastolic_bp'][0]
        chol = features['cholesterol_mg_dl'][0]
        steps = features['daily_steps'][0]
        smoke = 2 # Default to non-smoker (2) since it was removed from UI
        diet = features['diet_quality_score'][0]
        sleep = features['sleep_hours'][0]
        alc = features['alcohol_units_per_week'][0]
        stress = features['stress_level'][0]
        fh = features['family_history_heart_disease'][0]

        def get_age_group(age):
            if age < 30: return 6
            elif age < 40: return 0
            elif age < 50: return 1
            elif age < 60: return 2
            elif age < 70: return 3
            elif age < 80: return 4
            else: return 5

        def get_hypertension_stage(sys_bp, dia_bp):
            if sys_bp >= 140 or dia_bp >= 90: return 3
            elif sys_bp >= 130 or dia_bp >= 80: return 2
            elif sys_bp >= 120 and dia_bp < 80: return 1
            else: return 0

        def get_bmi_category(bmi):
            if bmi >= 30: return 3
            elif bmi >= 25: return 2
            elif bmi >= 18.5: return 1
            else: return 0

        def get_cholesterol_category(chol):
            if chol >= 240: return 2
            elif chol >= 200: return 1
            else: return 0

        def get_activity_level(steps):
            if steps >= 10000: return 2
            elif steps >= 5000: return 1
            else: return 0
            
        def get_sleep_category(sleep):
            if sleep > 8.0: return 2
            elif sleep >= 6.0: return 1
            else: return 0

        def get_alcohol_category(alc):
            if alc >= 7: return 2
            elif alc >= 3: return 1
            else: return 0

        def get_lifestyle_risk_score(smoke, diet, act, sleep, alc, stress):
            risk = 0
            if smoke == 0: risk += 1 # smoker
            if diet <= 3: risk += 1 # poor diet
            if act == 0: risk += 1 # sedentary
            if sleep == 0: risk += 1 # poor sleep
            if alc == 2: risk += 1 # heavy drinker
            if stress >= 7: risk += 1 # high stress
            return risk

        def get_clinical_risk_score(age_group, hyp, bmi_cat, chol_cat, fh):
            risk = 0
            if age_group >= 3 and age_group != 6: risk += 1 # >= 60
            if hyp >= 2: risk += 1 # stage 1 or 2
            if bmi_cat == 3: risk += 1 # obese
            if chol_cat == 2: risk += 1 # high chol
            if fh == 1: risk += 1 # family history
            return risk

        features['age_group'] = [get_age_group(age)]
        features['pulse_pressure'] = [sys_bp - dia_bp]
        features['blood_pressure_ratio'] = [sys_bp / dia_bp if dia_bp > 0 else 0]
        features['hypertension_stage'] = [get_hypertension_stage(sys_bp, dia_bp)]
        features['bmi_category'] = [get_bmi_category(bmi)]
        features['cholesterol_category'] = [get_cholesterol_category(chol)]
        features['activity_level'] = [get_activity_level(steps)]
        features['sleep_category'] = [get_sleep_category(sleep)]
        features['alcohol_category'] = [get_alcohol_category(alc)]
        
        features['lifestyle_risk_score'] = [get_lifestyle_risk_score(
            smoke, diet, features['activity_level'][0], features['sleep_category'][0], features['alcohol_category'][0], stress
        )]
        
        features['clinical_risk_score'] = [get_clinical_risk_score(
            features['age_group'][0], features['hypertension_stage'][0], features['bmi_category'][0], features['cholesterol_category'][0], fh
        )]
        
        # Define the exact column order expected by the scaler (25 features)
        column_order = [
            'age', 'bmi', 'systolic_bp', 'diastolic_bp', 'cholesterol_mg_dl', 
            'resting_heart_rate', 'smoking_status', 'daily_steps', 'stress_level', 
            'physical_activity_hours_per_week', 'sleep_hours', 'family_history_heart_disease', 
            'diet_quality_score', 'alcohol_units_per_week', 'age_group', 'pulse_pressure', 
            'blood_pressure_ratio', 'hypertension_stage', 'bmi_category', 'cholesterol_category', 
            'activity_level', 'sleep_category', 'alcohol_category', 'lifestyle_risk_score', 'clinical_risk_score'
        ]

        # 2. Convert to DataFrame with explicit order
        features['smoking_status'] = [smoke]
        df = pd.DataFrame(features)[column_order]
        
        # 3. Load Models and Encoders
        # Resolve paths relative to this script's location
        script_dir = os.path.dirname(os.path.abspath(__file__))
        ai_dir = os.path.abspath(os.path.join(script_dir, '../../AI'))
        
        scaler_path = os.path.join(ai_dir, 'scaler_attn.pkl')
        encoder_path = os.path.join(ai_dir, 'label_encoder_attn.pkl')
        model_path = os.path.join(ai_dir, 'cardio_attention_model_final_fixed.keras')
        
        if not os.path.exists(scaler_path) or not os.path.exists(encoder_path) or not os.path.exists(model_path):
            print(json.dumps({
                "status": "error", 
                "message": f"Model artifacts not found in {ai_dir}. Please ensure scaler, encoder, and model exist."
            }))
            return

        # Load scaler and encoder
        scaler = joblib.load(scaler_path)
        label_encoder = joblib.load(encoder_path)
        
        # Load Keras model
        import tensorflow as tf
        from tensorflow.keras import layers
        
        @tf.keras.utils.register_keras_serializable()
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
                    "units": self.units,
                    "reduction_ratio": self.reduction_ratio,
                    "dropout_rate": self.dropout_rate,
                })
                return config

        @tf.keras.utils.register_keras_serializable()
        class MinorityAwareLoss(tf.keras.losses.Loss):
            def __init__(self, gamma=2.0, class_weights=None, name='minority_aware_loss', **kwargs):
                super(MinorityAwareLoss, self).__init__(name=name, **kwargs)
                self.gamma = gamma
                if class_weights is None:
                    self.class_weights = tf.constant([1.293, 0.998, 0.817], dtype=tf.float32)
                else:
                    self.class_weights = tf.constant(class_weights, dtype=tf.float32)

            def call(self, y_true, y_pred):
                y_pred    = tf.clip_by_value(y_pred, 1e-7, 1.0 - 1e-7)
                n_classes = tf.shape(y_pred)[-1]
                # Try to reshape y_true if it's not a scalar
                y_true = tf.reshape(y_true, [-1])
                y_true_oh = tf.one_hot(tf.cast(y_true, tf.int32), n_classes)
                y_true_oh = tf.cast(y_true_oh, tf.float32)
                p_t = tf.reduce_sum(y_true_oh * y_pred, axis=-1)
                ce = -tf.math.log(p_t)
                focal_w = tf.pow(1.0 - p_t, self.gamma)
                sample_weights = tf.reduce_sum(y_true_oh * self.class_weights, axis=-1)
                return sample_weights * focal_w * ce

            def get_config(self):
                config = super().get_config()
                config.update({"gamma": self.gamma})
                return config
        
        # We need to compile=False to avoid needing loss function, but we provide it just in case
        model = tf.keras.models.load_model(model_path, custom_objects={
            'FeatureAttentionBlock': FeatureAttentionBlock,
            'MinorityAwareLoss': MinorityAwareLoss
        }, compile=False)
        
        # 4. Preprocess Data
        # Scale the features
        X_scaled = scaler.transform(df)
        
        # 5. Predict
        predictions = model.predict(X_scaled, verbose=0)
        
        # Check if multi-output
        if isinstance(predictions, list) or isinstance(predictions, tuple):
            # Assume first output is classification (probabilities for risk category)
            # and second is regression (heart disease risk score)
            # We can identify which is which by shape: classification has >1 columns
            class_preds = predictions[0] if predictions[0].shape[1] > 1 else predictions[1]
            reg_preds = predictions[1] if predictions[0].shape[1] > 1 else predictions[0]
        else:
            class_preds = predictions
            reg_preds = None
            
        # 6. Post-process
        # The model likely outputs probabilities for multi-class classification
        predicted_class_idx = np.argmax(class_preds, axis=1)
        risk_category = label_encoder.inverse_transform(predicted_class_idx)[0]
        
        # Get the probability of the predicted class or high risk
        probability_score = float(np.max(class_preds[0])) * 100
        
        # Get regression score if available
        risk_score_val = float(reg_preds[0][0]) if reg_preds is not None else None
        
        # Output format
        response = {
            "status": "success",
            "prediction": {
                "risk_category": str(risk_category),
                "score": round(probability_score, 2), # e.g., 85.45
                "severity_mapped": map_risk_to_severity(str(risk_category))
            }
        }
        
        if risk_score_val is not None:
            response["prediction"]["heart_disease_risk_score"] = round(risk_score_val, 2)
        
        print(json.dumps(response))
        
    except json.JSONDecodeError:
        print(json.dumps({"status": "error", "message": "Invalid JSON format"}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e), "trace": traceback.format_exc()}))


def map_risk_to_severity(risk_category):
    # This maps the AI risk category to the severity expected by Hearthy (low, moderate, high, very_high)
    # Adjust according to actual classes output by your model!
    risk_category_lower = risk_category.lower()
    
    if "high" in risk_category_lower or "severe" in risk_category_lower or risk_category_lower == "2" or risk_category_lower == "3":
        return "high"
    elif "moderate" in risk_category_lower or "elevated" in risk_category_lower or risk_category_lower == "1":
        return "moderate"
    elif "low" in risk_category_lower or "normal" in risk_category_lower or risk_category_lower == "0":
        return "low"
    else:
        return "moderate" # Fallback


if __name__ == "__main__":
    main()
