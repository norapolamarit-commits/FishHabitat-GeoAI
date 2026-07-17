import json
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException

router = APIRouter()

MODELS_ROOT = Path(__file__).resolve().parent.parent / "models"
SUITABLE_CUTOFF_DEFAULT = 0.9
HIGH_RISK_CUTOFF = 0.6


def _load_feature_table() -> pd.DataFrame:
    path = MODELS_ROOT / "feature_table.csv"
    if not path.exists():
        raise HTTPException(
            status_code=503,
            detail="No trained model/feature table yet. Run: python -m pipeline.train_ensemble",
        )
    return pd.read_csv(path)


def _load_metrics() -> dict:
    path = MODELS_ROOT / "metrics.json"
    if not path.exists():
        raise HTTPException(status_code=503, detail="No metrics.json yet — run the training pipeline.")
    return json.loads(path.read_text())


@router.get("/summary")
def summary():
    df = _load_feature_table()
    metrics = _load_metrics()
    # Note: metrics.json's suitability_cutoff (70th percentile of TRAIN HSI
    # labels) was computed for the classification evaluation at training
    # time and can land at exactly 1.0 given how skewed this region's HSI
    # distribution is (see data_caveats) — using it here against continuous
    # model predictions (which top out just under 1.0) would always yield
    # zero "suitable" cells. SUITABLE_CUTOFF_DEFAULT is used for this
    # display count instead, deliberately distinct from the training cutoff.
    cutoff = SUITABLE_CUTOFF_DEFAULT

    return {
        "current_sst_c": round(float(df["sst_c"].mean()), 2),
        "current_chl_mg_m3": round(float(df["chl_mg_m3"].mean()), 3),
        "current_wind_kmh": round(float(df["wind_speed_kmh"].mean()), 1),
        "stacked_ensemble_r2": metrics["models"]["stacked_ensemble"]["r2"],
        "classification_roc_auc": metrics["classification_derived"]["roc_auc"],
        "n_suitable_cells": int((df["suitability_pred"] >= cutoff).sum()),
        "n_high_risk_cells": int((df["risk_score"] >= HIGH_RISK_CUTOFF).sum()),
        "n_total_cells": len(df),
        "data_basis_note": "SST/chlorophyll/wind are real observed means over the study grid. "
        "Suitability figures are model predictions against a literature-derived HSI proxy, "
        "not real catch data. Risk is a real-derived operational wave/wind heuristic.",
    }


@router.get("/regional_comparison")
def regional_comparison():
    """Real bar-chart data: mean suitability/risk split between the Gulf of
    Thailand (east, lon >= 101) and the Andaman Sea (west, lon < 101)."""
    df = _load_feature_table()
    df["region"] = df["lon"].apply(lambda lon: "Gulf of Thailand" if lon >= 101 else "Andaman Sea")
    grouped = df.groupby("region").agg(
        mean_suitability=("suitability_pred", "mean"),
        mean_risk=("risk_score", "mean"),
        mean_sst_c=("sst_c", "mean"),
        mean_chl_mg_m3=("chl_mg_m3", "mean"),
        n_cells=("lat", "count"),
    ).reset_index()
    return {"regions": grouped.to_dict(orient="records")}


@router.get("/suitability_profile")
def suitability_profile():
    """Real radar-chart data: mean per-variable suitability sub-scores."""
    df = _load_feature_table()
    return {
        "axes": [
            {"axis": "SST suitability", "value": round(float(df["si_sst"].mean()), 3)},
            {"axis": "Chlorophyll suitability", "value": round(float(df["si_chl"].mean()), 3)},
            {"axis": "Depth suitability", "value": round(float(df["si_depth"].mean()), 3)},
            {"axis": "Overall HSI", "value": round(float(df["hsi"].mean()), 3)},
            {"axis": "Operational safety (1 - risk)", "value": round(1 - float(df["risk_score"].mean()), 3)},
        ]
    }


@router.get("/sst_timeseries")
def sst_timeseries(lat: float = 9.5, lon: float = 100.5, days: int = 120):
    """Real historical daily SST at a point, fetched live (single-point
    ERDDAP query, fast) — for the Analytics line chart."""
    from pipeline.ingest_erddap import fetch_sst_timeseries

    df = fetch_sst_timeseries(lat, lon, days=days)
    return {
        "lat": lat,
        "lon": lon,
        "series": [
            {"date": str(row.time.date()), "sst_c": row.sst_c} for row in df.itertuples()
        ],
    }
