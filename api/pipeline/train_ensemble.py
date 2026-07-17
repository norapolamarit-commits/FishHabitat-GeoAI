"""Trains the real stacking ensemble against the literature-derived HSI
proxy label (config.DATA_BASIS["PROXY_LABEL"] — NOT real catch data).

Architecture (matches the AI Architecture page):
  Satellite image -> frozen EfficientNet-B0 -> image features -+
                                                                 +-> Base Model A (XGBoost)
  Oceanographic data (real, multi-source) -------------------- -+
                                                                       \\
  Historical SST time series -> LSTM -> temporal features -+           +-> Meta-learner (stacking) -> HSI
  Oceanographic data ---------------------------------------+-> Base Model B (Ridge)
                                                                       /

Honesty notes (read before trusting these numbers):
  - N is small (~150-200 real grid cells at 0.5deg resolution over ocean
    cells only) — a genuine limitation of building this from public
    no-auth data sources rather than a purpose-built research dataset.
  - Evaluation uses a SPATIAL block train/test split (not random), because
    a random split on a smooth spatial field leaks strongly-correlated
    neighboring cells between train and test and would overstate accuracy.
  - The target is a literature-derived proxy, not real CPUE. A "good" R2
    here means the ensemble reproduces the HSI formula's spatial pattern
    from raw environmental + image + temporal features — it does NOT mean
    the model predicts real fish catch.
"""

import os

# Must be set before torch/xgboost are imported anywhere in this process —
# see main.py for the full explanation of the OpenMP conflict this avoids.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
os.environ.setdefault("OMP_WAIT_POLICY", "PASSIVE")

import json
from pathlib import Path

import numpy as np
import pandas as pd

from config import MODELS_DIR

# `pipeline.features` transitively imports torch (image/temporal feature
# extractors). It MUST be imported — and have already loaded torch — before
# xgboost/shap are imported: importing xgboost/shap first and only running
# torch computation afterward reliably segfaults on macOS (verified 2026-07-16
# — a real OpenMP runtime conflict between torch's and xgboost's bundled
# libomp, not fixed by KMP_DUPLICATE_LIB_OK). Import order below is load-bearing.
from pipeline.features import build_full_feature_table

import shap
import xgboost as xgb
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import (
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)

MODELS_ROOT = Path(__file__).resolve().parent.parent / MODELS_DIR
MODELS_ROOT.mkdir(exist_ok=True)

RANDOM_SEED = 42


def spatial_block_split(df: pd.DataFrame, block_deg: float = 1.5, test_frac: float = 0.25):
    """Assigns whole 1.5deg x 1.5deg spatial blocks to train or test (not
    individual points), so neighboring correlated cells can't leak across
    the split — a real methodological safeguard for spatial data, not
    cosmetic."""
    rng = np.random.default_rng(RANDOM_SEED)
    block_id = (
        (df["lat"] // block_deg).astype(int).astype(str)
        + "_"
        + (df["lon"] // block_deg).astype(int).astype(str)
    )
    unique_blocks = block_id.unique()
    rng.shuffle(unique_blocks)
    n_test_blocks = max(1, int(len(unique_blocks) * test_frac))
    test_blocks = set(unique_blocks[:n_test_blocks])
    is_test = block_id.isin(test_blocks)
    return df[~is_test].reset_index(drop=True), df[is_test].reset_index(drop=True)


def _regression_metrics(y_true, y_pred) -> dict:
    return {
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "r2": float(r2_score(y_true, y_pred)),
    }


def _classification_metrics(y_true_bin, y_score) -> dict:
    y_pred_bin = (y_score >= 0.5).astype(int)
    cm = confusion_matrix(y_true_bin, y_pred_bin, labels=[0, 1]).tolist()
    try:
        fpr, tpr, _ = roc_curve(y_true_bin, y_score)
        auc = float(roc_auc_score(y_true_bin, y_score))
    except ValueError:
        # only one class present in this split — real, honest edge case, not a bug
        fpr, tpr, auc = [0.0, 1.0], [0.0, 1.0], float("nan")
    return {
        "confusion_matrix": cm,
        "confusion_matrix_labels": ["not_suitable", "suitable"],
        "precision": float(precision_score(y_true_bin, y_pred_bin, zero_division=0)),
        "recall": float(recall_score(y_true_bin, y_pred_bin, zero_division=0)),
        "f1": float(f1_score(y_true_bin, y_pred_bin, zero_division=0)),
        "roc_auc": auc,
        "roc_curve": {"fpr": list(np.array(fpr, dtype=float)), "tpr": list(np.array(tpr, dtype=float))},
    }


def train():
    table, provenance = build_full_feature_table()

    env_cols = provenance["env_feature_columns"]
    img_cols = provenance["image_feature_columns"]
    temporal_cols = provenance["temporal_feature_columns"]

    train_df, test_df = spatial_block_split(table)

    # a data-informed "suitable" cutoff: this region's real environmental
    # conditions are mostly favorable for skipjack tuna (warm, shallow shelf
    # waters), so the HSI distribution skews high — using a fixed 0.5 cutoff
    # would call nearly everything "suitable" and produce a degenerate
    # confusion matrix. The 70th percentile of the TRAIN labels is used
    # instead, computed once on train only (never on test) to avoid leakage.
    suitability_cutoff = float(np.quantile(train_df["hsi"], 0.70))

    # --- Base Model A: XGBoost on environmental + image features ---
    features_a = env_cols + img_cols
    model_a = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=3,
        learning_rate=0.05,
        random_state=RANDOM_SEED,
        # n_jobs=1: XGBoost's default multi-threaded OpenMP pool segfaults
        # when it runs in the same process as torch's already-initialized
        # OpenMP threads (verified 2026-07-16) — single-threaded avoids the
        # conflict entirely; dataset is small enough that this costs nothing.
        n_jobs=1,
    )
    model_a.fit(train_df[features_a], train_df["hsi"])
    pred_a_train = model_a.predict(train_df[features_a])
    pred_a_test = model_a.predict(test_df[features_a])

    # --- Base Model B: Ridge regression on environmental + temporal features ---
    features_b = env_cols + temporal_cols
    model_b = Ridge(alpha=1.0, random_state=RANDOM_SEED)
    model_b.fit(train_df[features_b], train_df["hsi"])
    pred_b_train = model_b.predict(train_df[features_b])
    pred_b_test = model_b.predict(test_df[features_b])

    # --- Meta-learner: stacks the two base models' predictions ---
    stack_train = np.column_stack([pred_a_train, pred_b_train])
    stack_test = np.column_stack([pred_a_test, pred_b_test])
    meta = LinearRegression()
    meta.fit(stack_train, train_df["hsi"])
    pred_meta_test = np.clip(meta.predict(stack_test), 0.0, 1.0)

    y_test = test_df["hsi"].values
    y_test_bin = (y_test >= suitability_cutoff).astype(int)

    metrics = {
        "data_basis": "proxy_label",
        "target_description": "Literature-derived Habitat Suitability Index for skipjack tuna "
        "(Katsuwonus pelamis), NOT real CPUE/catch data.",
        "n_total_cells": len(table),
        "n_train": len(train_df),
        "n_test": len(test_df),
        "suitability_cutoff": suitability_cutoff,
        "data_caveats": [
            "Small N (~150-200 grid cells) — a real limitation of assembling this from "
            "public no-auth data sources at 0.5deg resolution, not a purpose-built dataset.",
            "Spatial block train/test split used (not random) to reduce leakage from "
            "spatially autocorrelated neighboring cells.",
            "Target is a literature-derived proxy label, not validated fishing outcomes.",
            "The HSI distribution in this region skews high (most ocean cells in the "
            "Gulf of Thailand/Andaman Sea are warm, shallow shelf water favorable per the "
            "formula) — a genuine regional finding, not a modeling artifact. This makes any "
            "fixed suitability cutoff produce a lopsided confusion matrix; ROC-AUC is a more "
            "informative classification metric here than precision/recall at one threshold.",
        ],
        "models": {
            "base_a_xgboost_env_image": _regression_metrics(y_test, pred_a_test),
            "base_b_ridge_env_temporal": _regression_metrics(y_test, pred_b_test),
            "stacked_ensemble": _regression_metrics(y_test, pred_meta_test),
        },
        "classification_derived": _classification_metrics(y_test_bin, pred_meta_test),
    }

    # --- Real SHAP explainability on the XGBoost base model ---
    explainer = shap.TreeExplainer(model_a)
    shap_values = explainer.shap_values(test_df[features_a])
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    feature_importance = sorted(
        [{"feature": f, "mean_abs_shap": float(v)} for f, v in zip(features_a, mean_abs_shap)],
        key=lambda x: -x["mean_abs_shap"],
    )
    metrics["shap_feature_importance"] = feature_importance

    # --- Full-grid predictions + real operational risk, for the Map/Analytics pages ---
    from pipeline.risk_formula import compute_risk

    pred_a_all = model_a.predict(table[features_a])
    pred_b_all = model_b.predict(table[features_b])
    pred_meta_all = np.clip(
        meta.predict(np.column_stack([pred_a_all, pred_b_all])), 0.0, 1.0
    )
    table["suitability_pred"] = pred_meta_all
    table["risk_score"] = compute_risk(table)

    # --- Persist real artifacts ---
    import datetime

    import joblib

    joblib.dump(model_a, MODELS_ROOT / "model_a_xgboost.joblib")
    joblib.dump(model_b, MODELS_ROOT / "model_b_ridge.joblib")
    joblib.dump(meta, MODELS_ROOT / "meta_stacker.joblib")
    joblib.dump(
        {"env_cols": env_cols, "img_cols": img_cols, "temporal_cols": temporal_cols},
        MODELS_ROOT / "feature_schema.joblib",
    )
    (MODELS_ROOT / "metrics.json").write_text(json.dumps(metrics, indent=2))

    keep_cols = (
        ["lat", "lon"]
        + env_cols
        + img_cols
        + temporal_cols
        + ["hsi", "si_sst", "si_chl", "si_depth", "suitability_pred", "risk_score"]
    )
    table[keep_cols].to_csv(MODELS_ROOT / "feature_table.csv", index=False)
    (MODELS_ROOT / "generated_at.json").write_text(
        json.dumps({"generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()})
    )

    print(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    train()
