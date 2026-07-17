"""Literature-derived Habitat Suitability Index (HSI) — the proxy label this
project's model is trained against, since no public real CPUE (catch per
unit effort) dataset exists for this region.

This is NOT real catch data. Every prediction response must carry
config.DATA_BASIS["PROXY_LABEL"] alongside any suitability number derived
from this formula, and the UI must show that badge, never presenting it as
validated fishing outcomes.

Method and citations (verified against real sources, not invented):
  - Per-variable Gaussian suitability index (SI in [0,1], peak at the
    species' optimal range, falling off with a tolerance bandwidth) is a
    standard technique in the fisheries habitat-suitability literature.
  - Per-variable SIs are combined via an ARITHMETIC mean (not geometric),
    following Yu, W., Chen, X., Yi, Q., Chen, Y., Zhang, Y. (2015).
    "Habitat suitability modelling for chub mackerel (Scomber japonicus) in
    the Northwest Pacific Ocean." PLOS ONE 10(4):e0122997 — that study
    directly compared an Arithmetic Mean Model (AMM) against a Geometric
    Mean Model (GMM) and found AMM performed better.
  - Species optimal SST/chlorophyll-a ranges: see config.TARGET_SPECIES
    docstring for per-species citations (Nurdin et al. 2015 for Indian
    mackerel; multiple corroborating Indo-Pacific skipjack tuna studies for
    skipjack tuna).

Depth is included as a hard habitat constraint (both species are epipelagic
and rarely fished far outside continental-shelf/upper-slope depths), not a
literature-cited Gaussian curve — this is a coarse, disclosed simplification.
"""

import numpy as np
import pandas as pd

from config import TARGET_SPECIES


def _gaussian_si(value: np.ndarray, optimal_range: tuple[float, float], tolerance: float) -> np.ndarray:
    """Suitability index in [0,1]: 1.0 inside the optimal range, falling off
    as a Gaussian outside it with the given tolerance bandwidth (std dev)."""
    lo, hi = optimal_range
    dist = np.where(value < lo, lo - value, np.where(value > hi, value - hi, 0.0))
    return np.exp(-(dist**2) / (2 * tolerance**2))


def _depth_constraint_si(depth_m: np.ndarray) -> np.ndarray:
    """Hard constraint: both target species are epipelagic/coastal-pelagic.
    depth_m is negative underwater (ETOPO convention). Land (depth_m > 0) and
    very deep water (> 200m, beyond the continental shelf) get low
    suitability; the shelf (0-200m) is fully suitable on this axis."""
    depth = -depth_m  # flip so positive = underwater depth
    si = np.where(depth <= 0, 0.0, 1.0)  # land -> 0
    si = np.where((depth > 0) & (depth <= 200), 1.0, si)
    si = np.where(depth > 200, np.exp(-((depth - 200) ** 2) / (2 * 150.0**2)), si)
    return si


def compute_hsi(features: pd.DataFrame, species_key: str = "Katsuwonus pelamis") -> pd.DataFrame:
    """features must have columns: sst_c, chl_mg_m3, depth_m.
    Returns the input DataFrame with added columns si_sst, si_chl, si_depth, hsi.
    """
    species = next(s for s in TARGET_SPECIES if s["scientific_name"] == species_key)

    out = features.copy()
    out["si_sst"] = _gaussian_si(
        out["sst_c"].values, species["sst_optimal_c"], species["sst_tolerance_c"]
    )
    out["si_chl"] = _gaussian_si(
        out["chl_mg_m3"].values, species["chl_optimal_mg_m3"], species["chl_tolerance_mg_m3"]
    )
    out["si_depth"] = _depth_constraint_si(out["depth_m"].values)
    out["hsi"] = (out["si_sst"] + out["si_chl"] + out["si_depth"]) / 3.0
    return out


if __name__ == "__main__":
    demo = pd.DataFrame(
        {
            "sst_c": [29.5, 25.0, 33.0, 29.8],
            "chl_mg_m3": [0.25, 0.05, 2.0, 0.28],
            "depth_m": [-50, -50, -50, 300],
        }
    )
    print("Skipjack tuna HSI:")
    print(compute_hsi(demo, "Katsuwonus pelamis"))
    print("\nIndian mackerel HSI:")
    print(compute_hsi(demo, "Rastrelliger kanagurta"))
