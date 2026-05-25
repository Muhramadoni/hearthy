import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.graph_objects as go


# ======================================================
# PAGE CONFIG
# ======================================================
st.set_page_config(
    page_title="Dashboard Cardiovascular Risk Analysis",
    page_icon="❤️",
    layout="wide"
)


# ======================================================
# DATA PATH
# ======================================================
DATA_PATH = r"C:\Users\Thinkpad\Downloads\Streamlit Capstone\cardiovascular_risk_dataset_clean (1).csv"


# ======================================================
# CONSTANTS
# ======================================================
RISK_ORDER = ["Low", "Medium", "High"]
AGE_ORDER = ["<30", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"]
SMOKING_ORDER = ["Never", "Former", "Current"]
FAMILY_ORDER = ["No", "Yes"]
BMI_ORDER = ["Underweight", "Normal", "Overweight", "Obese"]

COLORS = {
    "navy": "#0B1F5B",
    "blue": "#2563EB",
    "green": "#22A55A",
    "orange": "#F59E0B",
    "red": "#EF4444",
    "purple": "#7C3AED",
    "teal": "#14B8A6",
    "bg": "#F5F8FD",
    "card": "#FFFFFF",
    "border": "#DCE6F2",
    "text": "#1E293B",
    "muted": "#64748B",
}

RISK_COLORS = {
    "Low": COLORS["green"],
    "Medium": COLORS["orange"],
    "High": COLORS["red"],
}


# ======================================================
# CSS
# ======================================================
st.markdown(
    f"""
    <style>
        html, body, [data-testid="stAppViewContainer"] {{
            background-color: {COLORS["bg"]};
            color: {COLORS["text"]};
        }}

        [data-testid="stHeader"] {{
            background: rgba(0,0,0,0);
        }}

        [data-testid="stToolbar"], #MainMenu, footer {{
            display: none !important;
        }}

        .block-container {{
            max-width: 1600px;
            padding-top: 1rem;
            padding-bottom: 2rem;
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }}

        .header-box {{
            background: linear-gradient(135deg, #FFFFFF 0%, #F0F6FF 100%);
            border: 1px solid {COLORS["border"]};
            border-radius: 22px;
            padding: 24px 28px;
            box-shadow: 0 6px 22px rgba(15,23,42,0.05);
            margin-bottom: 18px;
        }}

        .header-title {{
            font-size: 38px;
            font-weight: 900;
            color: {COLORS["navy"]};
            line-height: 1.1;
            margin-bottom: 6px;
        }}

        .header-subtitle {{
            font-size: 16px;
            color: {COLORS["muted"]};
            font-weight: 500;
        }}

        .filter-title {{
            font-size: 18px;
            font-weight: 900;
            color: {COLORS["navy"]};
            margin-bottom: 8px;
        }}

        .kpi-card {{
            background: white;
            border: 1px solid {COLORS["border"]};
            border-radius: 18px;
            padding: 20px 18px;
            box-shadow: 0 5px 16px rgba(15,23,42,0.05);
            min-height: 135px;
        }}

        .kpi-label {{
            font-size: 14px;
            font-weight: 800;
            color: {COLORS["navy"]};
            margin-bottom: 10px;
            line-height: 1.25;
        }}

        .kpi-value {{
            font-size: 34px;
            font-weight: 900;
            line-height: 1;
        }}

        .kpi-unit {{
            font-size: 14px;
            font-weight: 700;
            color: {COLORS["muted"]};
            margin-top: 8px;
        }}

        .section-title {{
            font-size: 22px;
            font-weight: 900;
            color: {COLORS["navy"]};
            margin-top: 18px;
            margin-bottom: 12px;
        }}

        .chart-title {{
            font-size: 17px;
            font-weight: 900;
            color: {COLORS["navy"]};
            margin-bottom: 10px;
            line-height: 1.25;
        }}

        .chart-badge {{
            display: inline-flex;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: {COLORS["blue"]};
            color: white;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 900;
            margin-right: 8px;
        }}

        .priority-item {{
            background: #F8FBFF;
            border: 1px solid #E8EEF7;
            border-radius: 14px;
            padding: 14px 14px;
            margin-bottom: 12px;
        }}

        .priority-title {{
            font-size: 14px;
            font-weight: 900;
            color: {COLORS["navy"]};
            margin-bottom: 4px;
        }}

        .priority-sub {{
            font-size: 13px;
            font-weight: 600;
            color: {COLORS["muted"]};
            line-height: 1.35;
        }}

        .stSelectbox label {{
            color: {COLORS["navy"]} !important;
            font-size: 14px !important;
            font-weight: 800 !important;
        }}

        div[data-baseweb="select"] > div {{
            background: white !important;
            border: 1px solid {COLORS["border"]} !important;
            border-radius: 12px !important;
            min-height: 44px !important;
            color: {COLORS["text"]} !important;
        }}

        div[data-baseweb="select"] * {{
            color: {COLORS["text"]} !important;
        }}

        [data-testid="stVerticalBlockBorderWrapper"] {{
            background: white !important;
            border-radius: 18px !important;
            border: 1px solid {COLORS["border"]} !important;
            box-shadow: 0 5px 16px rgba(15,23,42,0.05) !important;
            padding: 10px !important;
        }}
    </style>
    """,
    unsafe_allow_html=True
)


# ======================================================
# LOAD DATA
# ======================================================
@st.cache_data
def load_data(path):
    df = pd.read_csv(path)

    numeric_cols = [
        "age",
        "bmi",
        "systolic_bp",
        "diastolic_bp",
        "cholesterol_mg_dl",
        "resting_heart_rate",
        "daily_steps",
        "stress_level",
        "physical_activity_hours_per_week",
        "sleep_hours",
        "diet_quality_score",
        "alcohol_units_per_week",
        "heart_disease_risk_score",
    ]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    if "age_group" not in df.columns:
        df["age_group"] = pd.cut(
            df["age"],
            bins=[0, 30, 40, 50, 60, 70, 80, 120],
            labels=AGE_ORDER,
            right=False,
        ).astype(str)

    if "bmi_category" not in df.columns:
        df["bmi_category"] = pd.cut(
            df["bmi"],
            bins=[0, 18.5, 25, 30, 100],
            labels=BMI_ORDER,
            right=False,
        ).astype(str)

    return df


df = load_data(DATA_PATH)


# ======================================================
# HELPER FUNCTIONS
# ======================================================
def safe_mean(dataframe, col):
    if dataframe.empty or col not in dataframe.columns:
        return 0
    return dataframe[col].mean()


def style_fig(fig, height=420, showlegend=True, margin=None):
    if margin is None:
        margin = dict(l=45, r=35, t=70, b=60)

    fig.update_layout(
        height=height,
        paper_bgcolor="white",
        plot_bgcolor="white",
        margin=margin,
        font=dict(
            family="Arial",
            size=12,
            color=COLORS["text"],
        ),
        showlegend=showlegend,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.08,
            xanchor="left",
            x=0,
            font=dict(
                size=12,
                color=COLORS["text"],
            ),
            title=dict(
                font=dict(
                    size=12,
                    color=COLORS["navy"],
                )
            ),
            bgcolor="rgba(255,255,255,0)",
        ),
    )

    fig.update_xaxes(
        showgrid=False,
        linecolor="#D5E1EE",
        tickfont=dict(size=11, color=COLORS["text"]),
        title_font=dict(size=12, color=COLORS["text"]),
    )

    fig.update_yaxes(
        gridcolor="#EEF3F8",
        linecolor="#D5E1EE",
        tickfont=dict(size=11, color=COLORS["text"]),
        title_font=dict(size=12, color=COLORS["text"]),
    )

    return fig


def chart_title(letter, title):
    st.markdown(
        f"""
        <div class="chart-title">
            <span class="chart-badge">{letter}</span>{title}
        </div>
        """,
        unsafe_allow_html=True,
    )


def kpi_card(label, value, unit, color):
    st.markdown(
        f"""
        <div class="kpi-card">
            <div class="kpi-label">{label}</div>
            <div class="kpi-value" style="color:{color};">{value}</div>
            <div class="kpi-unit">{unit}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def make_small_lifestyle_chart(data, column, title, y_title, color_map):
    fig = px.bar(
        data,
        x="risk_category",
        y=column,
        color="risk_category",
        text=data[column].round(1),
        color_discrete_map=color_map,
        category_orders={"risk_category": RISK_ORDER},
    )

    fig.update_traces(
        textposition="outside",
        marker_line_width=0.8,
        marker_line_color="white",
    )

    fig.update_layout(
        height=330,
        paper_bgcolor="white",
        plot_bgcolor="white",
        margin=dict(l=45, r=25, t=30, b=45),
        font=dict(family="Arial", size=12, color=COLORS["text"]),
        showlegend=False,
        xaxis_title="Kategori Risiko",
        yaxis_title=y_title,
        title=dict(
            text=title,
            font=dict(size=15, color=COLORS["navy"]),
            x=0,
            xanchor="left",
        ),
    )

    fig.update_xaxes(
        showgrid=False,
        linecolor="#D5E1EE",
        tickfont=dict(size=11, color=COLORS["text"]),
        title_font=dict(size=12, color=COLORS["text"]),
    )

    fig.update_yaxes(
        gridcolor="#EEF3F8",
        linecolor="#D5E1EE",
        tickfont=dict(size=11, color=COLORS["text"]),
        title_font=dict(size=12, color=COLORS["text"]),
    )

    return fig


def make_scatter_matrix_dashboard(data, numeric_features, target_col):
    n_cols = 3
    n_rows = int(np.ceil(len(numeric_features) / n_cols))

    subplot_titles = [
        f"Risk Score vs {feature}"
        for feature in numeric_features
    ]

    fig = make_subplots(
        rows=n_rows,
        cols=n_cols,
        subplot_titles=subplot_titles,
        horizontal_spacing=0.08,
        vertical_spacing=0.12,
    )

    for i, feature in enumerate(numeric_features):
        row = i // n_cols + 1
        col = i % n_cols + 1

        temp = data[[feature, target_col]].dropna()

        fig.add_trace(
            go.Scatter(
                x=temp[feature],
                y=temp[target_col],
                mode="markers",
                marker=dict(
                    size=5,
                    color="rgba(90, 88, 170, 0.35)",
                    line=dict(width=0),
                ),
                name=feature,
                showlegend=False,
            ),
            row=row,
            col=col,
        )

        if len(temp) >= 2 and temp[feature].nunique() > 1:
            x = temp[feature].values
            y = temp[target_col].values

            coef = np.polyfit(x, y, 1)
            poly_fn = np.poly1d(coef)

            x_line = np.linspace(np.nanmin(x), np.nanmax(x), 100)
            y_line = poly_fn(x_line)

            fig.add_trace(
                go.Scatter(
                    x=x_line,
                    y=y_line,
                    mode="lines",
                    line=dict(color="#F97316", width=2),
                    name=f"Trend {feature}",
                    showlegend=False,
                ),
                row=row,
                col=col,
            )

        fig.update_xaxes(title_text=feature, row=row, col=col)
        fig.update_yaxes(title_text="Heart Disease Risk Score", row=row, col=col)

    fig.update_layout(
        height=360 * n_rows,
        title=dict(
            text="Relationship Between Numeric Features and Heart Disease Risk Score",
            x=0.5,
            xanchor="center",
            font=dict(size=22, color=COLORS["navy"]),
        ),
        paper_bgcolor="white",
        plot_bgcolor="white",
        font=dict(family="Arial", size=11, color=COLORS["text"]),
        margin=dict(l=40, r=40, t=80, b=40),
    )

    fig.update_xaxes(
        showgrid=False,
        linecolor="#D5E1EE",
        tickfont=dict(size=10, color=COLORS["text"]),
        title_font=dict(size=11, color=COLORS["text"]),
    )

    fig.update_yaxes(
        gridcolor="#EEF3F8",
        linecolor="#D5E1EE",
        tickfont=dict(size=10, color=COLORS["text"]),
        title_font=dict(size=11, color=COLORS["text"]),
    )

    return fig


# ======================================================
# HEADER
# ======================================================
st.markdown(
    """
    <div class="header-box">
        <div class="header-title">❤️ Dashboard Cardiovascular Risk Analysis</div>
        <div class="header-subtitle">
            Analisis risiko kardiovaskular berdasarkan faktor klinis dan gaya hidup pasien
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)


# ======================================================
# FILTERS
# ======================================================
st.markdown('<div class="filter-title">Filter Data</div>', unsafe_allow_html=True)

f1, f2, f3, f4, f5 = st.columns(5)

with f1:
    selected_risk = st.selectbox(
        "Kategori Risiko",
        ["Semua"] + [x for x in RISK_ORDER if x in df["risk_category"].dropna().astype(str).unique().tolist()],
    )

with f2:
    selected_smoking = st.selectbox(
        "Status Merokok",
        ["Semua"] + [x for x in SMOKING_ORDER if x in df["smoking_status"].dropna().astype(str).unique().tolist()],
    )

with f3:
    selected_family = st.selectbox(
        "Riwayat Keluarga",
        ["Semua"] + [x for x in FAMILY_ORDER if x in df["family_history_heart_disease"].dropna().astype(str).unique().tolist()],
    )

with f4:
    selected_age = st.selectbox(
        "Age",
        ["Semua"] + [x for x in AGE_ORDER if x in df["age_group"].dropna().astype(str).unique().tolist()],
    )

with f5:
    selected_bmi = st.selectbox(
        "BMI",
        ["Semua"] + [x for x in BMI_ORDER if x in df["bmi_category"].dropna().astype(str).unique().tolist()],
    )


# ======================================================
# APPLY FILTER
# ======================================================
filtered = df.copy()

if selected_risk != "Semua":
    filtered = filtered[filtered["risk_category"].astype(str) == selected_risk]

if selected_smoking != "Semua":
    filtered = filtered[filtered["smoking_status"].astype(str) == selected_smoking]

if selected_family != "Semua":
    filtered = filtered[filtered["family_history_heart_disease"].astype(str) == selected_family]

if selected_age != "Semua":
    filtered = filtered[filtered["age_group"].astype(str) == selected_age]

if selected_bmi != "Semua":
    filtered = filtered[filtered["bmi_category"].astype(str) == selected_bmi]

if filtered.empty:
    st.warning("Tidak ada data yang sesuai dengan filter yang dipilih.")
    st.stop()


# ======================================================
# KPI
# ======================================================
st.divider()

total_patients = len(filtered)
avg_cholesterol = safe_mean(filtered, "cholesterol_mg_dl")
avg_steps = safe_mean(filtered, "daily_steps")
avg_heart_risk = safe_mean(filtered, "heart_disease_risk_score")
avg_activity = safe_mean(filtered, "physical_activity_hours_per_week")

k1, k2, k3, k4, k5 = st.columns(5)

with k1:
    kpi_card("Jumlah Pasien", f"{total_patients:,.0f}", "pasien", COLORS["blue"])

with k2:
    kpi_card("Rata-rata Kolesterol", f"{avg_cholesterol:,.0f}", "mg/dL", COLORS["green"])

with k3:
    kpi_card("Rata-rata Langkah Harian", f"{avg_steps:,.0f}", "langkah/hari", COLORS["orange"])

with k4:
    kpi_card("Rata-rata Heart Risk", f"{avg_heart_risk:,.1f}", "score", COLORS["red"])

with k5:
    kpi_card("Rata-rata Aktivitas Seminggu", f"{avg_activity:,.1f}", "jam/minggu", COLORS["purple"])


st.info(
    f"Data ditampilkan berdasarkan filter aktif: "
    f"Kategori Risiko = {selected_risk}, "
    f"Status Merokok = {selected_smoking}, "
    f"Riwayat Keluarga = {selected_family}, "
    f"Age = {selected_age}, "
    f"BMI = {selected_bmi}."
)

st.divider()


# ======================================================
# CHART DATA
# ======================================================
risk_count = (
    filtered["risk_category"]
    .value_counts()
    .reindex(RISK_ORDER)
    .fillna(0)
    .reset_index()
)
risk_count.columns = ["risk_category", "count"]


age_risk_score = (
    filtered
    .groupby("age_group", observed=False)["heart_disease_risk_score"]
    .mean()
    .reindex(AGE_ORDER)
    .fillna(0)
    .reset_index()
)
age_risk_score.columns = ["age_group", "avg_risk_score"]


clinical_avg = (
    filtered.groupby("risk_category", observed=False)[
        ["systolic_bp", "diastolic_bp", "cholesterol_mg_dl", "heart_disease_risk_score"]
    ]
    .mean()
    .reindex(RISK_ORDER)
    .reset_index()
)

clinical_long = clinical_avg.melt(
    id_vars="risk_category",
    var_name="indikator",
    value_name="rata_rata",
)

clinical_long["indikator"] = clinical_long["indikator"].map(
    {
        "systolic_bp": "Sistolik",
        "diastolic_bp": "Diastolik",
        "cholesterol_mg_dl": "Kolesterol",
        "heart_disease_risk_score": "Heart Risk",
    }
)


lifestyle_avg = (
    filtered.groupby("risk_category", observed=False)[
        [
            "physical_activity_hours_per_week",
            "daily_steps",
            "sleep_hours",
            "diet_quality_score",
            "alcohol_units_per_week",
        ]
    ]
    .mean()
    .reindex(RISK_ORDER)
    .reset_index()
)


smoking_prop = pd.crosstab(
    filtered["risk_category"],
    filtered["smoking_status"],
    normalize="index",
).reindex(index=RISK_ORDER, columns=SMOKING_ORDER).fillna(0).mul(100).reset_index()

smoking_long = smoking_prop.melt(
    id_vars="risk_category",
    var_name="smoking_status",
    value_name="persentase",
)


family_prop = pd.crosstab(
    filtered["risk_category"],
    filtered["family_history_heart_disease"],
    normalize="index",
).reindex(index=RISK_ORDER, columns=FAMILY_ORDER).fillna(0).mul(100).reset_index()

family_long = family_prop.melt(
    id_vars="risk_category",
    var_name="family_history",
    value_name="persentase",
)


feature_cols = [
    "age",
    "bmi",
    "cholesterol_mg_dl",
    "systolic_bp",
    "diastolic_bp",
    "physical_activity_hours_per_week",
    "diet_quality_score",
    "daily_steps",
]

feature_labels = {
    "age": "Age",
    "bmi": "BMI",
    "cholesterol_mg_dl": "Kolesterol",
    "systolic_bp": "Sistolik",
    "diastolic_bp": "Diastolik",
    "physical_activity_hours_per_week": "Aktivitas Fisik",
    "diet_quality_score": "Diet Score",
    "daily_steps": "Langkah Harian",
}

low_mean = df[df["risk_category"] == "Low"][feature_cols].mean()
high_mean = df[df["risk_category"] == "High"][feature_cols].mean()

feature_delta = ((high_mean - low_mean) / low_mean * 100).replace([np.inf, -np.inf], np.nan).dropna()
feature_delta = feature_delta.rename("delta_pct").reset_index().rename(columns={"index": "feature"})
feature_delta["feature_label"] = feature_delta["feature"].map(feature_labels)
feature_delta = feature_delta.sort_values("delta_pct", ascending=True)
feature_delta["direction"] = np.where(feature_delta["delta_pct"] >= 0, "Naik", "Turun")


# ======================================================
# FIGURES
# ======================================================
fig_risk = px.pie(
    risk_count,
    names="risk_category",
    values="count",
    hole=0.55,
    color="risk_category",
    color_discrete_map=RISK_COLORS,
)

fig_risk.update_traces(
    textposition="inside",
    texttemplate="%{percent:.1%}",
    marker=dict(line=dict(color="white", width=2)),
    domain=dict(x=[0.00, 0.72], y=[0.00, 1.00]),
)

fig_risk.update_layout(
    height=420,
    paper_bgcolor="white",
    plot_bgcolor="white",
    margin=dict(l=10, r=10, t=25, b=10),
    font=dict(size=12, color=COLORS["text"]),
    legend=dict(
        orientation="v",
        x=0.78,
        y=0.86,
        font=dict(size=12, color=COLORS["text"]),
        title=dict(text="Kategori Risiko"),
    ),
    annotations=[
        dict(
            text=f"<b>Total</b><br>{risk_count['count'].sum():,.0f}",
            x=0.36,
            y=0.50,
            showarrow=False,
            font=dict(size=16, color=COLORS["navy"]),
            xanchor="center",
            yanchor="middle",
            align="center",
        )
    ],
)


fig_age = px.line(
    age_risk_score,
    x="age_group",
    y="avg_risk_score",
    markers=True,
    text=age_risk_score["avg_risk_score"].round(1),
)

fig_age.update_traces(
    line=dict(color=COLORS["red"], width=4),
    marker=dict(size=10, color=COLORS["red"]),
    textposition="top center",
)

fig_age.update_layout(
    xaxis_title="Kelompok Usia",
    yaxis_title="Rata-rata Heart Disease Risk Score",
    yaxis=dict(range=[0, max(100, age_risk_score["avg_risk_score"].max() + 10)]),
)

fig_age = style_fig(fig_age, height=420, showlegend=False)


fig_clinical = px.bar(
    clinical_long,
    x="risk_category",
    y="rata_rata",
    color="indikator",
    barmode="group",
    text=clinical_long["rata_rata"].round(1),
    color_discrete_map={
        "Sistolik": COLORS["blue"],
        "Diastolik": COLORS["teal"],
        "Kolesterol": COLORS["purple"],
        "Heart Risk": COLORS["orange"],
    },
)

fig_clinical.update_traces(textposition="outside")

fig_clinical.update_layout(
    xaxis_title="Kategori Risiko",
    yaxis_title="Rata-rata",
    legend_title_text="Indikator Klinis",
)

fig_clinical = style_fig(
    fig_clinical,
    height=420,
    showlegend=True,
    margin=dict(l=55, r=30, t=75, b=60),
)


fig_smoking = px.bar(
    smoking_long,
    x="persentase",
    y="risk_category",
    color="smoking_status",
    orientation="h",
    text=smoking_long["persentase"].round(1).astype(str) + "%",
    color_discrete_map={
        "Never": COLORS["blue"],
        "Former": COLORS["teal"],
        "Current": COLORS["red"],
    },
    category_orders={
        "risk_category": RISK_ORDER,
        "smoking_status": SMOKING_ORDER,
    },
)

fig_smoking.update_traces(
    textposition="inside",
    insidetextfont=dict(color="white", size=12),
)

fig_smoking.update_layout(
    barmode="stack",
    xaxis=dict(range=[0, 100], ticksuffix="%"),
    xaxis_title="Persentase (%)",
    yaxis_title="Kategori Risiko",
    legend_title_text="Status Merokok",
)

fig_smoking = style_fig(
    fig_smoking,
    height=420,
    showlegend=True,
    margin=dict(l=90, r=30, t=75, b=60),
)


fig_family = px.bar(
    family_long,
    x="persentase",
    y="risk_category",
    color="family_history",
    orientation="h",
    text=family_long["persentase"].round(1).astype(str) + "%",
    color_discrete_map={
        "No": COLORS["blue"],
        "Yes": COLORS["red"],
    },
    category_orders={
        "risk_category": RISK_ORDER,
        "family_history": FAMILY_ORDER,
    },
)

fig_family.update_traces(
    textposition="inside",
    insidetextfont=dict(color="white", size=12),
)

fig_family.update_layout(
    barmode="stack",
    xaxis=dict(range=[0, 100], ticksuffix="%"),
    xaxis_title="Persentase (%)",
    yaxis_title="Kategori Risiko",
    legend_title_text="Riwayat Keluarga",
)

fig_family = style_fig(
    fig_family,
    height=420,
    showlegend=True,
    margin=dict(l=90, r=30, t=75, b=60),
)


fig_feature = px.bar(
    feature_delta,
    x="delta_pct",
    y="feature_label",
    orientation="h",
    text=feature_delta["delta_pct"].map(lambda x: f"{x:+.1f}%"),
    color="direction",
    color_discrete_map={
        "Naik": COLORS["red"],
        "Turun": COLORS["blue"],
    },
)

fig_feature.update_traces(textposition="outside", cliponaxis=False)
fig_feature.add_vline(x=0, line_width=1, line_color="#94A3B8")

max_abs = max(60, np.abs(feature_delta["delta_pct"]).max() + 10)

fig_feature.update_layout(
    xaxis=dict(range=[-max_abs, max_abs], ticksuffix="%"),
    xaxis_title="Perubahan Relatif High Risk vs Low Risk",
    yaxis_title="",
)

fig_feature = style_fig(
    fig_feature,
    height=420,
    showlegend=False,
    margin=dict(l=140, r=50, t=40, b=60),
)


# Lifestyle separated figures
fig_activity = make_small_lifestyle_chart(
    lifestyle_avg,
    "physical_activity_hours_per_week",
    "Rata-rata Aktivitas Fisik",
    "Jam per Minggu",
    RISK_COLORS,
)

fig_steps = make_small_lifestyle_chart(
    lifestyle_avg,
    "daily_steps",
    "Rata-rata Langkah Harian",
    "Langkah per Hari",
    RISK_COLORS,
)

fig_sleep = make_small_lifestyle_chart(
    lifestyle_avg,
    "sleep_hours",
    "Rata-rata Durasi Tidur",
    "Jam per Hari",
    RISK_COLORS,
)

fig_diet = make_small_lifestyle_chart(
    lifestyle_avg,
    "diet_quality_score",
    "Rata-rata Kualitas Diet",
    "Skor Diet",
    RISK_COLORS,
)

fig_alcohol = make_small_lifestyle_chart(
    lifestyle_avg,
    "alcohol_units_per_week",
    "Rata-rata Konsumsi Alkohol",
    "Unit per Minggu",
    RISK_COLORS,
)


# Scatterplot relationship figures
scatter_features = [
    "age",
    "bmi",
    "systolic_bp",
    "diastolic_bp",
    "cholesterol_mg_dl",
    "resting_heart_rate",
    "daily_steps",
    "physical_activity_hours_per_week",
    "sleep_hours",
    "alcohol_units_per_week",
]

scatter_features = [
    col for col in scatter_features
    if col in filtered.columns and "heart_disease_risk_score" in filtered.columns
]

fig_scatter = make_scatter_matrix_dashboard(
    filtered,
    scatter_features,
    "heart_disease_risk_score",
)


# ======================================================
# CHART LAYOUT
# ======================================================
row1_col1, row1_col2 = st.columns(2)

with row1_col1:
    with st.container(border=True):
        chart_title("A", "Persentase Pasien per Kategori Risiko")
        st.plotly_chart(fig_risk, use_container_width=True, config={"displayModeBar": False})

with row1_col2:
    with st.container(border=True):
        chart_title("B", "Usia vs Heart Disease Risk Score")
        st.plotly_chart(fig_age, use_container_width=True, config={"displayModeBar": False})


row2_col1, row2_col2 = st.columns(2)

with row2_col1:
    with st.container(border=True):
        chart_title("C", "Rata-rata Tekanan Darah, Kolesterol, dan Heart Risk")
        st.plotly_chart(fig_clinical, use_container_width=True, config={"displayModeBar": False})

with row2_col2:
    with st.container(border=True):
        chart_title("D", "Status Merokok per Kategori Risiko")
        st.plotly_chart(fig_smoking, use_container_width=True, config={"displayModeBar": False})


row3_col1, row3_col2 = st.columns(2)

with row3_col1:
    with st.container(border=True):
        chart_title("E", "Riwayat Keluarga Penyakit Jantung")
        st.plotly_chart(fig_family, use_container_width=True, config={"displayModeBar": False})

with row3_col2:
    with st.container(border=True):
        chart_title("F", "Fitur yang Menonjol pada Pasien High Risk")
        st.plotly_chart(fig_feature, use_container_width=True, config={"displayModeBar": False})


# ======================================================
# POLA GAYA HIDUP DIPISAH
# ======================================================
st.markdown('<div class="section-title">G. Pola Gaya Hidup per Kategori Risiko</div>', unsafe_allow_html=True)

g1, g2, g3 = st.columns(3)

with g1:
    with st.container(border=True):
        st.plotly_chart(fig_activity, use_container_width=True, config={"displayModeBar": False})

with g2:
    with st.container(border=True):
        st.plotly_chart(fig_steps, use_container_width=True, config={"displayModeBar": False})

with g3:
    with st.container(border=True):
        st.plotly_chart(fig_sleep, use_container_width=True, config={"displayModeBar": False})


g4, g5 = st.columns(2)

with g4:
    with st.container(border=True):
        st.plotly_chart(fig_diet, use_container_width=True, config={"displayModeBar": False})

with g5:
    with st.container(border=True):
        st.plotly_chart(fig_alcohol, use_container_width=True, config={"displayModeBar": False})


# ======================================================
# SCATTERPLOT RELATIONSHIP
# ======================================================
st.markdown(
    '<div class="section-title">H. Relationship Between Numeric Features and Heart Disease Risk Score</div>',
    unsafe_allow_html=True,
)

with st.container(border=True):
    st.plotly_chart(fig_scatter, use_container_width=True, config={"displayModeBar": False})


# ======================================================
# PRIORITAS EDUKASI
# ======================================================
st.markdown('<div class="section-title">I. Prioritas Edukasi Pencegahan</div>', unsafe_allow_html=True)

with st.container(border=True):
    st.markdown(
        """
        <div class="priority-item">
            <div class="priority-title">1. Prioritaskan pasien kategori High Risk.</div>
            <div class="priority-sub">Kelompok ini paling membutuhkan monitoring dan edukasi pencegahan.</div>
        </div>

        <div class="priority-item">
            <div class="priority-title">2. Kontrol tekanan darah dan kolesterol secara rutin.</div>
            <div class="priority-sub">Dua indikator ini dominan pada pasien berisiko tinggi.</div>
        </div>

        <div class="priority-item">
            <div class="priority-title">3. Dorong aktivitas fisik dan peningkatan langkah harian.</div>
            <div class="priority-sub">Gaya hidup kurang aktif berkaitan dengan risiko yang lebih tinggi.</div>
        </div>

        <div class="priority-item">
            <div class="priority-title">4. Perbaiki kualitas diet dan tidur pasien.</div>
            <div class="priority-sub">Pola hidup sehat membantu menurunkan faktor risiko kardiovaskular.</div>
        </div>

        <div class="priority-item">
            <div class="priority-title">5. Fokus pada pasien dengan riwayat keluarga penyakit jantung.</div>
            <div class="priority-sub">Kelompok ini perlu skrining dan edukasi lebih dini.</div>
        </div>
        """,
        unsafe_allow_html=True,
    )