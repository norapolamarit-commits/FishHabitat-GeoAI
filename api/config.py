"""Shared configuration constants for the fishing habitat suitability platform.

Single source of truth for the study region, species, and data-honesty
labels — imported by both the ingestion pipeline and the API routers so the
"real vs proxy" framing can never drift between training and serving.
"""

# Study region: Gulf of Thailand + Andaman Sea (Thai EEZ waters).
# Bounding box chosen to cover both coasts per the project's design decision.
BBOX = {
    "lat_min": 5.0,
    "lat_max": 14.0,
    "lon_min": 97.0,
    "lon_max": 106.0,
}

# Coarser grid used for map layers / model features (0.5 deg ~ 55km cells).
GRID_STEP_DEG = 0.5

# Target species this project's Habitat Suitability Index is grounded in.
# Ranges below were verified against real published literature (see
# pipeline/hsi_formula.py docstring for full citations) rather than invented:
#   - Skipjack tuna: SST/chl-a optima consistent with multiple Indo-Pacific
#     skipjack tuna habitat studies (~29-30.5 deg C, ~0.2-0.5 mg/m3).
#   - Indian mackerel: Nurdin, S., Mustapha, M.A., Lihan, T., Abd Ghaffar,
#     M.A.Z.L.A. (2015). "Determination of Potential Fishing Grounds of
#     Rastrelliger kanagurta." Sains Malaysiana 44(2):225-232 — East
#     Peninsular Malaysia EEZ (adjacent to this project's study region):
#     SST 29-30 deg C, chl-a 0.20-0.30 mg/m3.
TARGET_SPECIES = [
    {
        "common_name": "Skipjack tuna",
        "scientific_name": "Katsuwonus pelamis",
        "sst_optimal_c": (29.0, 30.5),
        "sst_tolerance_c": 2.5,
        "chl_optimal_mg_m3": (0.2, 0.5),
        "chl_tolerance_mg_m3": 0.3,
    },
    {
        "common_name": "Indian mackerel",
        "scientific_name": "Rastrelliger kanagurta",
        "sst_optimal_c": (29.0, 30.0),
        "sst_tolerance_c": 2.0,
        "chl_optimal_mg_m3": (0.20, 0.30),
        "chl_tolerance_mg_m3": 0.2,
    },
]

# Every API response that carries a suitability/risk number must include a
# `data_basis` field using one of these values, never silently omitted.
DATA_BASIS = {
    "REAL_OBSERVED": "real_observed",       # measured from a real public data source
    "REAL_DERIVED": "real_derived",         # computed from real inputs (e.g. HSI formula)
    "PROXY_LABEL": "proxy_label",           # literature-based suitability proxy, not real catch data
}

CACHE_DIR = "cache"
MODELS_DIR = "models"

# Single source of truth for the Datasets page + /api/datasets endpoint.
# `status` is either "live" (a real, no-auth public source is wired into the
# pipeline right now) or "not_wired" (requires an account/credentials this
# build doesn't have, or no public API exists — shown honestly, never faked).
DATASET_CATALOG = [
    {
        "id": "sst",
        "name": "Sea Surface Temperature",
        "category": "Oceanographic",
        "status": "live",
        "source": "NOAA CoastWatch ERDDAP — JPL MUR SST (jplMURSST41)",
        "resolution": "~1 km",
        "update_frequency": "Daily",
        "description": "Multi-scale Ultra-high Resolution (MUR) analysed sea surface temperature, blended from multiple satellite sensors.",
    },
    {
        "id": "chlorophyll",
        "name": "Chlorophyll-a",
        "category": "Oceanographic",
        "status": "live",
        "source": "NOAA CoastWatch ERDDAP — VIIRS NOAA-20 (nesdisVHNnoaa20chlaWeekly)",
        "resolution": "4 km",
        "update_frequency": "Weekly composite",
        "description": "Ocean colour-derived chlorophyll-a concentration, a proxy for phytoplankton/prey density. Weekly composite used to avoid single-day cloud gaps.",
    },
    {
        "id": "bathymetry",
        "name": "Bathymetry",
        "category": "Oceanographic",
        "status": "live",
        "source": "NOAA CoastWatch ERDDAP — ETOPO (etopo180)",
        "resolution": "~1/6°  (~18 km)",
        "update_frequency": "Static",
        "description": "Global relief model of seafloor depth and land elevation.",
    },
    {
        "id": "wind",
        "name": "Wind",
        "category": "Atmospheric",
        "status": "live",
        "source": "Open-Meteo Forecast API",
        "resolution": "~11 km model grid",
        "update_frequency": "Hourly",
        "description": "10 m wind speed and direction from operational weather models.",
    },
    {
        "id": "wave_height",
        "name": "Wave Height",
        "category": "Oceanographic",
        "status": "live",
        "source": "Open-Meteo Marine API",
        "resolution": "~25 km model grid",
        "update_frequency": "Hourly",
        "description": "Significant wave height from an operational wave forecast model.",
    },
    {
        "id": "ocean_current",
        "name": "Ocean Current",
        "category": "Oceanographic",
        "status": "live",
        "source": "Open-Meteo Marine API",
        "resolution": "~25 km model grid",
        "update_frequency": "Hourly",
        "description": "Surface current velocity and direction from an operational ocean forecast model.",
    },
    {
        "id": "salinity",
        "name": "Salinity",
        "category": "Oceanographic",
        "status": "live",
        "source": "NRL HYCOM+NCODA GLBu0.08 reanalysis (nrlHycomGLBu008e912D), via NOAA ERDDAP",
        "resolution": "1/12°  (~9 km)",
        "update_frequency": "Historical climatology (2016-2018 reanalysis, not live)",
        "description": "Real historical ocean reanalysis salinity, used as a monthly climatology since no live no-auth salinity feed exists for this region.",
    },
    {
        "id": "optical",
        "name": "Optical Satellite Imagery",
        "category": "Satellite",
        "status": "live",
        "source": "NASA Worldview Snapshots — MODIS/VIIRS Corrected Reflectance (true colour)",
        "resolution": "250 m - 1 km",
        "update_frequency": "Daily (subject to cloud cover)",
        "description": "Real true-colour satellite image crops of the study region, used as the input to the frozen EfficientNet-B0 feature extractor.",
    },
    {
        "id": "viirs_nightlight",
        "name": "VIIRS Nighttime Light",
        "category": "Satellite",
        "status": "live",
        "source": "NASA Worldview Snapshots — VIIRS Day/Night Band",
        "resolution": "~750 m",
        "update_frequency": "Daily",
        "description": "Nighttime lights imagery, used in fisheries research as a proxy for detecting lit fishing fleets (e.g. squid/purse-seine boats).",
    },
    {
        "id": "era5",
        "name": "ERA5 Climate Reanalysis",
        "category": "Atmospheric",
        "status": "live",
        "source": "Open-Meteo Historical Weather API (ECMWF ERA5)",
        "resolution": "~31 km",
        "update_frequency": "Historical archive",
        "description": "ECMWF ERA5 reanalysis air temperature and related variables, accessed via Open-Meteo's free archive mirror.",
    },
    {
        "id": "osm",
        "name": "OpenStreetMap",
        "category": "Reference",
        "status": "live",
        "source": "OpenStreetMap contributors",
        "resolution": "Vector",
        "update_frequency": "Continuously updated",
        "description": "Coastline, port, and land reference layer used as basemap context.",
    },
    {
        "id": "fishing_zones",
        "name": "Fishing Zones (EEZ reference)",
        "category": "Administrative",
        "status": "live",
        "source": "Marine Regions Gazetteer (VLIZ), MRGID 25444",
        "resolution": "Simplified bounding extent (not the precise boundary polygon)",
        "update_frequency": "Static reference",
        "description": "Thailand Exclusive Economic Zone reference extent, shown as context — not a fishing-effort dataset.",
    },
    {
        "id": "world_bank",
        "name": "World Bank Fisheries Indicators",
        "category": "Socioeconomic",
        "status": "live",
        "source": "World Bank Open Data API (ER.FSH.CAPT.MT and related indicators)",
        "resolution": "National, annual",
        "update_frequency": "Annual",
        "description": "Thailand capture fisheries production and related national indicators, for context in the Analytics/Research pages.",
    },
    {
        "id": "cpue",
        "name": "CPUE (Catch Per Unit Effort)",
        "category": "Fisheries",
        "status": "not_wired",
        "source": "Not publicly available — typically licensed per-country by fisheries departments",
        "resolution": "N/A",
        "update_frequency": "N/A",
        "description": "No real CPUE ground truth is used in this build. The suitability model is instead trained against a literature-derived Habitat Suitability Index proxy — see the Research page for details.",
    },
    {
        "id": "theos2",
        "name": "THEOS-2",
        "category": "Satellite",
        "status": "not_wired",
        "source": "GISTDA (Thailand) — no public no-auth API available",
        "resolution": "0.5 m (design spec)",
        "update_frequency": "N/A",
        "description": "Thailand's THEOS-2 Earth observation satellite. Shown for architectural completeness; not integrated in this build.",
    },
    {
        "id": "sar",
        "name": "SAR (Synthetic Aperture Radar)",
        "category": "Satellite",
        "status": "not_wired",
        "source": "Sentinel-1 via Copernicus / Alaska Satellite Facility — requires a free account",
        "resolution": "5-20 m",
        "update_frequency": "N/A",
        "description": "All-weather radar imagery useful for detecting vessels through cloud cover. Requires registering a Copernicus Data Space or ASF account to wire in.",
    },
    {
        "id": "sentinel",
        "name": "Sentinel Hub Optical",
        "category": "Satellite",
        "status": "not_wired",
        "source": "Sentinel Hub — requires a free account and OAuth client",
        "resolution": "10 m",
        "update_frequency": "N/A",
        "description": "Higher-resolution Sentinel-2 imagery via Sentinel Hub. This build uses NASA's public MODIS/VIIRS imagery instead, which needs no account.",
    },
    {
        "id": "hyperspectral",
        "name": "Hyperspectral Imagery",
        "category": "Satellite",
        "status": "not_wired",
        "source": "No public no-auth source identified",
        "resolution": "N/A",
        "update_frequency": "N/A",
        "description": "Shown for architectural completeness only; not integrated in this build.",
    },
    {
        "id": "nso",
        "name": "Thailand NSO Statistics",
        "category": "Socioeconomic",
        "status": "not_wired",
        "source": "Thailand National Statistical Office — no simple public REST API identified",
        "resolution": "N/A",
        "update_frequency": "N/A",
        "description": "Shown for architectural completeness only; this build uses the World Bank API for real socioeconomic context instead.",
    },
]
