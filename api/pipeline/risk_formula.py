"""Operational sea-state risk score — a real, disclosed formula derived
directly from real wave height + wind speed observations. Distinct from the
HSI proxy label: this is not standing in for anything unmeasurable, it's a
direct (simplified) computation from real inputs, so it carries
config.DATA_BASIS["REAL_DERIVED"], not "proxy_label".

Thresholds are a simplified small-craft-safety heuristic broadly consistent
with the general shape of small-craft advisory criteria used by national
weather services (elevated risk above roughly 2m seas or ~50 km/h sustained
wind) — presented here as a demo heuristic, not an official marine forecast
or a substitute for real maritime safety warnings.
"""

import numpy as np
import pandas as pd

WAVE_RISK_THRESHOLD_M = 2.0
WIND_RISK_THRESHOLD_KMH = 50.0


def compute_risk(features: pd.DataFrame) -> pd.Series:
    """features must have columns wave_height_m, wind_speed_kmh.
    Returns a risk score in [0,1], where 1.0 = highest operational risk."""
    wave_component = np.clip(features["wave_height_m"] / WAVE_RISK_THRESHOLD_M, 0, 1.5) / 1.5
    wind_component = np.clip(features["wind_speed_kmh"] / WIND_RISK_THRESHOLD_KMH, 0, 1.5) / 1.5
    return ((wave_component + wind_component) / 2.0).clip(0, 1)


if __name__ == "__main__":
    demo = pd.DataFrame({"wave_height_m": [0.3, 1.5, 2.5, 4.0], "wind_speed_kmh": [10, 30, 55, 70]})
    demo["risk"] = compute_risk(demo)
    print(demo)
