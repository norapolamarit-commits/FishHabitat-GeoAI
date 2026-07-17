import io
from pathlib import Path

import numpy as np
import pandas as pd

# Import order is load-bearing: torch (via pipeline.image_features) must be
# imported before xgboost/shap in this process, or real inference segfaults
# (verified 2026-07-16, see pipeline/train_ensemble.py for the full story).
from pipeline.image_features import _embed_image

import joblib
import shap
from fastapi import APIRouter, File, HTTPException, UploadFile, Form
from pydantic import BaseModel

from config import DATA_BASIS, TARGET_SPECIES
from pipeline.risk_formula import compute_risk

router = APIRouter()

MODELS_ROOT = Path(__file__).resolve().parent.parent / "models"

_models = None


def _load_models():
    global _models
    if _models is None:
        schema = joblib.load(MODELS_ROOT / "feature_schema.joblib")
        _models = {
            "model_a": joblib.load(MODELS_ROOT / "model_a_xgboost.joblib"),
            "model_b": joblib.load(MODELS_ROOT / "model_b_ridge.joblib"),
            "meta": joblib.load(MODELS_ROOT / "meta_stacker.joblib"),
            "schema": schema,
            "feature_table": pd.read_csv(MODELS_ROOT / "feature_table.csv"),
        }
    return _models


def _nearest_grid_row(feature_table: pd.DataFrame, lat: float, lon: float) -> pd.Series:
    dists = (feature_table["lat"] - lat) ** 2 + (feature_table["lon"] - lon) ** 2
    return feature_table.loc[dists.idxmin()]


class PredictResponse(BaseModel):
    lat: float
    lon: float
    suitability: float
    risk: float
    confidence: str
    data_basis: dict
    sub_scores: dict
    shap_feature_importance: list
    used_uploaded_image: bool
    nearest_grid_cell_km: float


@router.post("", response_model=PredictResponse)
async def predict(
    lat: float = Form(...),
    lon: float = Form(...),
    species: str = Form("Katsuwonus pelamis"),
    image: UploadFile | None = File(None),
):
    if not MODELS_ROOT.joinpath("model_a_xgboost.joblib").exists():
        raise HTTPException(
            status_code=503,
            detail="No trained model yet. Run: python -m pipeline.train_ensemble",
        )
    if species not in [s["scientific_name"] for s in TARGET_SPECIES]:
        raise HTTPException(status_code=400, detail=f"Unknown species '{species}'")

    models = _load_models()
    schema = models["schema"]
    table = models["feature_table"]

    nearest = _nearest_grid_row(table, lat, lon)
    # rough km distance for transparency (equirectangular approx, fine at this scale)
    dist_km = (
        ((nearest["lat"] - lat) * 111.0) ** 2 + ((nearest["lon"] - lon) * 111.0 * 0.98) ** 2
    ) ** 0.5

    env_vals = {c: float(nearest[c]) for c in schema["env_cols"]}
    temporal_vals = {c: float(nearest[c]) for c in schema["temporal_cols"]}

    used_uploaded_image = image is not None
    if used_uploaded_image:
        img_bytes = await image.read()
        embedding = _embed_image(img_bytes)
        img_vals = {c: float(v) for c, v in zip(schema["img_cols"], embedding)}
    else:
        img_vals = {c: float(nearest[c]) for c in schema["img_cols"]}

    row_a = pd.DataFrame([{**env_vals, **img_vals}])[schema["env_cols"] + schema["img_cols"]]
    row_b = pd.DataFrame([{**env_vals, **temporal_vals}])[
        schema["env_cols"] + schema["temporal_cols"]
    ]

    pred_a = float(models["model_a"].predict(row_a)[0])
    pred_b = float(models["model_b"].predict(row_b)[0])
    pred_meta = float(np.clip(models["meta"].predict([[pred_a, pred_b]])[0], 0.0, 1.0))

    risk_row = pd.DataFrame([env_vals])
    risk = float(compute_risk(risk_row).iloc[0])

    explainer = shap.TreeExplainer(models["model_a"])
    shap_values = explainer.shap_values(row_a)[0]
    importance = sorted(
        [
            {"feature": f, "shap_value": float(v)}
            for f, v in zip(schema["env_cols"] + schema["img_cols"], shap_values)
        ],
        key=lambda x: -abs(x["shap_value"]),
    )[:8]

    confidence = "high" if dist_km < 30 else ("medium" if dist_km < 80 else "low")

    return PredictResponse(
        lat=lat,
        lon=lon,
        suitability=round(pred_meta, 4),
        risk=round(risk, 4),
        confidence=confidence,
        data_basis={
            "suitability": DATA_BASIS["PROXY_LABEL"],
            "risk": DATA_BASIS["REAL_DERIVED"],
            "environmental_inputs": DATA_BASIS["REAL_OBSERVED"],
        },
        sub_scores={
            "sst_c": env_vals["sst_c"],
            "chl_mg_m3": env_vals["chl_mg_m3"],
            "depth_m": env_vals["depth_m"],
            "salinity_psu": env_vals["salinity_psu"],
            "wind_speed_kmh": env_vals["wind_speed_kmh"],
            "wave_height_m": env_vals["wave_height_m"],
            "current_velocity_kmh": env_vals["current_velocity_kmh"],
        },
        shap_feature_importance=importance,
        used_uploaded_image=used_uploaded_image,
        nearest_grid_cell_km=round(dist_km, 1),
    )
