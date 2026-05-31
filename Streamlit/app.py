import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.graph_objects as go


# ======================================================
# PAGE CONFIG
st.set_page_config(
    page_title="Dashboard Cardiovascular Risk Analysis",
    page_icon="❤️",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ======================================================
# DATA PATH
# ======================================================
DATA_PATH = "cardiovascular_risk_dataset_clean.csv"


# ======================================================
# CONSTANTS
# ======================================================
RISK_ORDER = ["Low", "Medium", "High"]
AGE_ORDER = ["<30", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"]
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
            text-align: center;
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

        [data-testid="stRadio"] label {{
            color: #0B1F5B !important;
            font-weight: 800 !important;
        }}

        [data-testid="stRadio"] label p {{
            color: #0B1F5B !important;
            font-size: 15px !important;
            font-weight: 800 !important;
        }}

        [data-testid="stRadio"] div[role="radiogroup"] > label {{
            background: #FFFFFF !important;
            border: 1px solid #DCE6F2 !important;
            border-radius: 12px !important;
            padding: 10px 12px !important;
            margin-bottom: 8px !important;
        }}

        [data-testid="stRadio"] div[role="radiogroup"] > label:hover {{
            background: #EEF6FF !important;
            border-color: #2563EB !important;
        }}


       [data-testid="stSlider"] {{     
        background: #FFFFFF !important;
        border: 1px solid #DCE6F2 !important;
        border-radius: 12px !important;
        padding: 4px 16px 0px 16px !important;
        min-height: 40px !important;
        height: 40px !important;
        }}

        [data-testid="stSlider"] label {{
        display: none !important;
        }}

         [data-testid="stSlider"] > div {{
        padding-top: 0px !important;
        padding-bottom: 0px !important;
         }}

         [data-testid="stSlider"] [data-baseweb="slider"] {{
        margin-top: -4px !important;
    }}


        .lifestyle-note {{
            background: #F8FBFF;
            border: 1px solid #E8EEF7;
            border-radius: 14px;
            padding: 14px 18px;
            color: #64748B;
            font-size: 15px;
            font-weight: 600;
            margin-top: 10px;
            text-align: center;
        }}

        .lifestyle-note b {{
            color: #0B1F5B;
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
            font=dict(size=18, color=COLORS["navy"]),
            x=0.5,
            xanchor="center",
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


def make_activity_progress_chart(data, column, title, x_title, color_map, max_value=None):
    temp = data[["risk_category", column]].copy()
    temp["risk_category"] = pd.Categorical(
        temp["risk_category"],
        categories=RISK_ORDER,
        ordered=True
    )
    temp = temp.sort_values("risk_category", ascending=False)

    if max_value is None:
        max_value = max(6, float(temp[column].max()) + 1)

    fig = go.Figure()

    fig.add_trace(
        go.Bar(
            x=[max_value] * len(temp),
            y=temp["risk_category"],
            orientation="h",
            marker=dict(
                color="#EAF0F7",
                line=dict(width=0),
            ),
            hoverinfo="skip",
            showlegend=False,
        )
    )

    fig.add_trace(
        go.Bar(
            x=temp[column],
            y=temp["risk_category"],
            orientation="h",
            marker=dict(
                color=[color_map[r] for r in temp["risk_category"]],
                line=dict(width=0),
            ),
            text=temp[column].round(1),
            textposition="outside",
            textfont=dict(size=13, color=COLORS["text"]),
            showlegend=False,
        )
    )

    fig.update_layout(
        barmode="overlay",
        height=330,
        paper_bgcolor="white",
        plot_bgcolor="white",
        margin=dict(l=80, r=60, t=45, b=50),
        font=dict(family="Arial", size=12, color=COLORS["text"]),
        title=dict(
            text=title,
            font=dict(size=18, color=COLORS["navy"]),
            x=0.5,
            xanchor="center",
        ),
        xaxis_title=x_title,
        yaxis_title="",
        xaxis=dict(range=[0, max_value]),
    )

    fig.update_xaxes(
        showgrid=False,
        linecolor="#D5E1EE",
        tickfont=dict(size=11, color=COLORS["text"]),
        title_font=dict(size=12, color=COLORS["text"]),
    )

    fig.update_yaxes(
        showgrid=False,
        linecolor="#D5E1EE",
        tickfont=dict(size=12, color=COLORS["text"]),
    )

    return fig

def make_sleep_lollipop_chart(data, column, title, x_title, color_map):
    temp = data[["risk_category", column]].copy()
    temp = temp.dropna(subset=[column])

    temp["risk_category"] = pd.Categorical(
        temp["risk_category"],
        categories=RISK_ORDER,
        ordered=True
    )
    temp = temp.sort_values("risk_category", ascending=False)

    fig = go.Figure()

    if temp.empty:
        fig.update_layout(
            height=330,
            paper_bgcolor="white",
            plot_bgcolor="white",
            title=dict(
                text=title,
                font=dict(size=18, color=COLORS["navy"]),
                x=0.5,
                xanchor="center",
            ),
        )
        return fig

    x_min = max(0, float(temp[column].min()) - 0.3)
    x_max = float(temp[column].max()) + 0.3

    for risk in temp["risk_category"].astype(str):
        value = float(temp.loc[temp["risk_category"].astype(str) == risk, column].iloc[0])
        color = color_map[risk]

        fig.add_trace(
            go.Scatter(
                x=[x_min, value],
                y=[risk, risk],
                mode="lines",
                line=dict(
                    color=color,
                    width=5,
                ),
                showlegend=False,
                hoverinfo="skip",
            )
        )

        fig.add_trace(
            go.Scatter(
                x=[value],
                y=[risk],
                mode="markers+text",
                marker=dict(
                    size=18,
                    color=color,
                    line=dict(color="white", width=2),
                ),
                text=[f"{value:.1f} jam"],
                textposition="middle right",
                textfont=dict(size=14, color=color, family="Arial"),
                showlegend=False,
                hoverinfo="skip",
            )
        )

    fig.update_layout(
        height=330,
        paper_bgcolor="white",
        plot_bgcolor="white",
        margin=dict(l=75, r=85, t=55, b=50),
        font=dict(family="Arial", size=14, color=COLORS["text"]),
        title=dict(
            text=title,
            font=dict(size=18, color=COLORS["navy"]),
            x=0.5,
            xanchor="center",
        ),
        xaxis_title=x_title,
        yaxis_title="",
        xaxis=dict(range=[x_min, x_max]),
    )

    fig.update_xaxes(
        showgrid=True,
        gridcolor="#EEF3F8",
        linecolor="#D5E1EE",
        tickfont=dict(size=13, color=COLORS["text"]),
        title_font=dict(size=14, color=COLORS["text"]),
    )

    fig.update_yaxes(
        categoryorder="array",
        categoryarray=list(reversed(RISK_ORDER)),
        showgrid=False,
        linecolor="#D5E1EE",
        tickfont=dict(size=13, color=COLORS["text"]),
    )

    return fig


def make_diet_gauge_chart(data, column, title, color_map, max_score=10):
    temp = data[["risk_category", column]].copy()
    temp = temp.dropna(subset=[column])

    temp["risk_category"] = pd.Categorical(
        temp["risk_category"],
        categories=RISK_ORDER,
        ordered=True
    )
    temp = temp.sort_values("risk_category")

    available_risks = [
        risk for risk in RISK_ORDER
        if risk in temp["risk_category"].astype(str).tolist()
    ]

    fig = go.Figure()

    if len(available_risks) == 0:
        fig.update_layout(
            height=330,
            paper_bgcolor="white",
            plot_bgcolor="white",
            title=dict(
                text=title,
                font=dict(size=18, color=COLORS["navy"]),
                x=0.5,
                xanchor="center",
            ),
        )
        return fig

    if len(available_risks) == 1:
        domains = {
            available_risks[0]: (0.30, 0.70)
        }
    elif len(available_risks) == 2:
        domains = {
            available_risks[0]: (0.10, 0.45),
            available_risks[1]: (0.55, 0.90),
        }
    else:
        domains = {
            "Low": (0.00, 0.30),
            "Medium": (0.35, 0.65),
            "High": (0.70, 1.00),
        }

    for risk in available_risks:
        value = float(temp.loc[temp["risk_category"].astype(str) == risk, column].iloc[0])

        fig.add_trace(
            go.Indicator(
                mode="gauge+number",
                value=value,
                domain={"x": domains[risk], "y": [0.15, 0.95]},
                title={
                    "text": risk,
                    "font": {"size": 18, "color": COLORS["navy"]},
                },
                number={
                    "font": {"size": 38, "color": color_map[risk]},
                    "valueformat": ".1f",
                },
                gauge={
                    "axis": {
                        "range": [0, max_score],
                        "tickwidth": 0,
                        "tickfont": {"size": 11, "color": COLORS["muted"]},
                    },
                    "bar": {"color": color_map[risk], "thickness": 0.35},
                    "bgcolor": "#EAF0F7",
                    "borderwidth": 0,
                    "steps": [
                        {"range": [0, max_score], "color": "#EAF0F7"}
                    ],
                },
            )
        )

    fig.update_layout(
        height=330,
        paper_bgcolor="white",
        plot_bgcolor="white",
        margin=dict(l=35, r=35, t=60, b=35),
        font=dict(family="Arial", size=14, color=COLORS["text"]),
        title=dict(
            text=title,
            font=dict(size=18, color=COLORS["navy"]),
            x=0.5,
            xanchor="center",
        ),
        annotations=[
            dict(
                text="Skor Diet (0-10). Semakin tinggi skor, semakin baik kualitas diet.",
                x=0.5,
                y=0.02,
                xref="paper",
                yref="paper",
                showarrow=False,
                font=dict(size=14, color=COLORS["muted"]),
            )
        ],
    )

    return fig


def make_alcohol_dot_chart(data, column, title, x_title, color_map):
    temp = data[["risk_category", column]].copy()
    temp = temp.dropna(subset=[column])

    temp["risk_category"] = pd.Categorical(
        temp["risk_category"],
        categories=RISK_ORDER,
        ordered=True
    )
    temp = temp.sort_values("risk_category")

    if temp.empty:
        fig = go.Figure()
        fig.update_layout(
            height=330,
            paper_bgcolor="white",
            plot_bgcolor="white",
            title=dict(
                text=title,
                font=dict(size=18, color=COLORS["navy"]),
                x=0.5,
                xanchor="center",
            ),
        )
        return fig

    available_risks = [
        risk for risk in RISK_ORDER
        if risk in temp["risk_category"].astype(str).tolist()
    ]

    fig = go.Figure()

    max_unit = max(6, int(np.ceil(temp[column].max())) + 1)
    x_positions = list(range(max_unit + 1))

    for risk in available_risks:
        value = float(temp.loc[temp["risk_category"].astype(str) == risk, column].iloc[0])
        full_units = int(np.floor(value))
        color = color_map[risk]

        marker_colors = [
            color if x <= full_units and x > 0 else "#EAF0F7"
            for x in x_positions
        ]

        fig.add_trace(
            go.Scatter(
                x=x_positions,
                y=[risk] * len(x_positions),
                mode="markers",
                marker=dict(
                    size=18,
                    symbol="square",
                    color=marker_colors,
                    line=dict(color="white", width=1),
                ),
                showlegend=False,
                hoverinfo="skip",
            )
        )

        fig.add_trace(
            go.Scatter(
                x=[value],
                y=[risk],
                mode="text",
                text=[f"{value:.1f}"],
                textposition="middle right",
                textfont=dict(size=18, color=color, family="Arial"),
                showlegend=False,
                hoverinfo="skip",
            )
        )


    fig.update_layout(
        height=330,
        paper_bgcolor="white",
        plot_bgcolor="white",
        margin=dict(l=75, r=85, t=55, b=50),
        font=dict(family="Arial", size=14, color=COLORS["text"]),
        title=dict(
            text=title,
            font=dict(size=18, color=COLORS["navy"]),
            x=0.5,
            xanchor="center",
        ),
        xaxis_title=x_title,
        yaxis_title="",
        xaxis=dict(range=[-0.5, max_unit + 1]),
    )

    fig.update_xaxes(
        showgrid=True,
        gridcolor="#EEF3F8",
        linecolor="#D5E1EE",
        dtick=1,
        tickfont=dict(size=13, color=COLORS["text"]),
        title_font=dict(size=14, color=COLORS["text"]),
    )

    fig.update_yaxes(
        categoryorder="array",
        categoryarray=available_risks,
        showgrid=False,
        linecolor="#D5E1EE",
        tickfont=dict(size=13, color=COLORS["text"]),
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
        <div class="header-title"> Dashboard Risiko Penyakit Jantung</div>
        <div class="header-subtitle">
            Analisis risiko kardiovaskular berdasarkan faktor klinis dan gaya hidup pasien
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ======================================================
# LEFT MENU NAVIGATION
# ======================================================
menu_col, content_col = st.columns([1.2, 5])

with menu_col:
    st.markdown(
        """
        <div style="
            background:white;
            border:1px solid #DCE6F2;
            border-radius:18px;
            padding:18px 16px;
            box-shadow:0 5px 16px rgba(15,23,42,0.05);
            margin-bottom:18px;
        ">
            <div style="
                font-size:18px;
                font-weight:900;
                color:#0B1F5B;
                margin-bottom:12px;
            ">
                Menu Dashboard
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    page = st.radio(
        label="",
        options=[
            "Dashboard",
            "Relationship Features",
            "Prioritas Edukasi"
        ],
        label_visibility="collapsed"
    )


with content_col:

    # ======================================================
    # FILTERS
    # ======================================================
    st.markdown('<div class="filter-title">Filter Data</div>', unsafe_allow_html=True)

    f1, f2, f3, f4 = st.columns(4)

    with f1:
        selected_risk = st.selectbox(
            "Kategori Risiko",
            ["Semua"] + [x for x in RISK_ORDER if x in df["risk_category"].dropna().astype(str).unique().tolist()],
        )

    with f2:
        selected_family = st.selectbox(
            "Riwayat Keluarga",
            ["Semua"] + [x for x in FAMILY_ORDER if x in df["family_history_heart_disease"].dropna().astype(str).unique().tolist()],
        )

    with f3:
        selected_age = st.selectbox(
            "Age",
            ["Semua"] + [x for x in AGE_ORDER if x in df["age_group"].dropna().astype(str).unique().tolist()],
        )


    with f4:
        bmi_min = float(df["bmi"].min())
        bmi_max = float(df["bmi"].max())

        st.markdown(
            '<div style="color:#0B1F5B; font-size:14px; font-weight:400; margin-bottom:6px;">BMI</div>',
            unsafe_allow_html=True
        )

        selected_bmi_range = st.slider(
            "BMI",
            min_value=round(bmi_min, 1),
            max_value=round(bmi_max, 1),
            value=(round(bmi_min, 1), round(bmi_max, 1)),
            step=0.1,
            format="%.1f",
            label_visibility="collapsed"
        )

    # ======================================================
    # APPLY FILTER
    # ======================================================
    filtered = df.copy()

    if selected_risk != "Semua":
        filtered = filtered[filtered["risk_category"].astype(str) == selected_risk]

    if selected_family != "Semua":
        filtered = filtered[filtered["family_history_heart_disease"].astype(str) == selected_family]

    if selected_age != "Semua":
        filtered = filtered[filtered["age_group"].astype(str) == selected_age]

    filtered = filtered[
        filtered["bmi"].between(
            selected_bmi_range[0],
            selected_bmi_range[1]
        )
    ]

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
        f"Riwayat Keluarga = {selected_family}, "
        f"Age = {selected_age}, "
        f"BMI = {selected_bmi_range[0]:.1f} - {selected_bmi_range[1]:.1f}."
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


    fig_age = px.box(
        filtered,
        x="age_group",
        y="heart_disease_risk_score",
        color="age_group",
        category_orders={"age_group": AGE_ORDER},
        points="outliers",
    )

    fig_age.update_layout(
        xaxis_title="Kelompok Usia",
        yaxis_title="Heart Disease Risk Score",
        showlegend=False,
    )

    fig_age.update_traces(
        marker=dict(size=4),
        line=dict(width=1.5),
    )

    fig_age = style_fig(
        fig_age,
        height=420,
        showlegend=False,
        margin=dict(l=55, r=30, t=55, b=60),
    )

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
    fig_activity = make_activity_progress_chart(
        lifestyle_avg,
        "physical_activity_hours_per_week",
        "Rata-rata Aktivitas Fisik",
        "Jam per Minggu",
        RISK_COLORS,
        max_value=6,
    )

    fig_steps = make_small_lifestyle_chart(
        lifestyle_avg,
        "daily_steps",
        "Rata-rata Langkah Harian",
        "Langkah per Hari",
        RISK_COLORS,
    )

    fig_sleep = make_sleep_lollipop_chart(
        lifestyle_avg,
        "sleep_hours",
        "Rata-rata Durasi Tidur",
        "Jam per Hari",
        RISK_COLORS,
    )

    fig_diet = make_diet_gauge_chart(
        lifestyle_avg,
        "diet_quality_score",
        "Skor Kualitas Diet",
        RISK_COLORS,
        max_score=10,
    )

    fig_alcohol = make_alcohol_dot_chart(
        lifestyle_avg,
        "alcohol_units_per_week",
        "Konsumsi Alkohol per Kategori Risiko",
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
    # PAGE 1: DASHBOARD
    # ======================================================
    if page == "Dashboard":

        row1_col1, row1_col2 = st.columns(2)

        with row1_col1:
            with st.container(border=True):
                chart_title("A", "Persentase Pasien per Kategori Risiko")
                st.plotly_chart(fig_risk, use_container_width=True, config={"displayModeBar": False})

        with row1_col2:
            with st.container(border=True):
                chart_title("B", "Distribusi Heart Risk Score berdasarkan Kelompok Usia")
                st.plotly_chart(fig_age, use_container_width=True, config={"displayModeBar": False})


        row2_col1, row2_col2 = st.columns(2)

        with row2_col1:
            with st.container(border=True):
                chart_title("C", "Rata-rata Tekanan Darah, Kolesterol, dan Heart Risk")
                st.plotly_chart(fig_clinical, use_container_width=True, config={"displayModeBar": False})

        with row2_col2:
            with st.container(border=True):
                chart_title("D", "Riwayat Keluarga Penyakit Jantung")
                st.plotly_chart(fig_family, use_container_width=True, config={"displayModeBar": False})


        with st.container(border=True):
            chart_title("E", "Fitur yang Menonjol pada Pasien High Risk")
            st.plotly_chart(fig_feature, use_container_width=True, config={"displayModeBar": False})


        # ======================================================
        # POLA GAYA HIDUP DIPISAH
        # ======================================================
        with st.container(border=True):
            chart_title("F", "Pola Gaya Hidup per Kategori Risiko")

            g1, g2, g3 = st.columns(3)

            with g1:
                st.plotly_chart(fig_activity, use_container_width=True, config={"displayModeBar": False})

            with g2:
                st.plotly_chart(fig_steps, use_container_width=True, config={"displayModeBar": False})

            with g3:
                st.plotly_chart(fig_sleep, use_container_width=True, config={"displayModeBar": False})


            g4, g5 = st.columns(2)

            with g4:
                st.plotly_chart(fig_diet, use_container_width=True, config={"displayModeBar": False})

            with g5:
                st.plotly_chart(fig_alcohol, use_container_width=True, config={"displayModeBar": False})

    # ======================================================
    # PAGE 2: RELATIONSHIP FEATURES
    # ======================================================
    elif page == "Relationship Features":

        st.markdown(
            '<div class="section-title">Relationship Between Numeric Features and Heart Disease Risk Score</div>',
            unsafe_allow_html=True,
        )

        with st.container(border=True):
            st.plotly_chart(fig_scatter, use_container_width=True, config={"displayModeBar": False})


    # ======================================================
    # PAGE 3: PRIORITAS EDUKASI
    # ======================================================
    elif page == "Prioritas Edukasi":

        st.markdown(
            '<div class="section-title">Prioritas Edukasi Pencegahan</div>',
            unsafe_allow_html=True
        )

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
