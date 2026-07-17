"""Curated real knowledge base for the chatbot's RAG retrieval. Every chunk
here describes something genuinely true about this platform's actual data
and methodology — no invented facts, matching what the rest of the app
already discloses (Datasets, Research, AI Architecture pages)."""

KNOWLEDGE_CHUNKS = [
    {
        "id": "what_is_suitability",
        "text": (
            "Suitability in this platform is a Habitat Suitability Index (HSI) score "
            "from 0 to 1, estimating how favorable ocean conditions are for skipjack "
            "tuna or Indian mackerel at a location. It is NOT based on real fishing "
            "catch data — no public catch-per-unit-effort (CPUE) dataset exists for "
            "this region. Instead it is computed from a literature-derived formula "
            "using real sea surface temperature, chlorophyll-a, and depth."
        ),
    },
    {
        "id": "what_is_risk",
        "text": (
            "The Risk score is an operational safety indicator computed from real "
            "wave height and wind speed observations (Open-Meteo). It estimates sea "
            "conditions relevant to small-craft safety, and is unrelated to whether "
            "fish are present."
        ),
    },
    {
        "id": "data_basis_labels",
        "text": (
            "Every number in this platform is labeled with a data_basis: "
            "'real_observed' (measured directly from a live public data source), "
            "'real_derived' (computed from real inputs via a disclosed formula, e.g. "
            "the risk score), or 'proxy_label' (a literature-based stand-in for "
            "something we cannot measure directly, e.g. suitability, since no real "
            "catch data exists)."
        ),
    },
    {
        "id": "confidence",
        "text": (
            "Confidence in a prediction reflects how far the nearest real data grid "
            "cell is from the requested location (grid resolution is about 0.5 "
            "degrees, roughly 55km). 'High' means under 30km away, 'medium' under "
            "80km, 'low' beyond that."
        ),
    },
    {
        "id": "data_sources",
        "text": (
            "Real data sources used: NOAA CoastWatch ERDDAP for sea surface "
            "temperature (daily) and chlorophyll-a (weekly composite), bathymetry, "
            "and historical salinity; Open-Meteo for wind, wave height, and ocean "
            "current; NASA Worldview for true-colour and nighttime satellite "
            "imagery; World Bank for fisheries statistics; Marine Regions for the "
            "Thailand EEZ reference boundary. All are free, public, and require no "
            "account."
        ),
    },
    {
        "id": "not_wired_datasets",
        "text": (
            "Some datasets from the original project scope are not yet integrated "
            "because they require a paid account or registration this build "
            "doesn't have: THEOS-2 (no public API), SAR/Sentinel-1 (needs a "
            "Copernicus or ASF account), Sentinel Hub optical imagery (needs an "
            "OAuth client), hyperspectral imagery, and Thailand NSO statistics. The "
            "Datasets page lists these honestly as 'not wired' rather than faking "
            "them."
        ),
    },
    {
        "id": "model_architecture",
        "text": (
            "The prediction model is a stacking ensemble: a frozen, ImageNet-"
            "pretrained EfficientNet-B0 extracts features from real satellite image "
            "crops (not fine-tuned, since no labeled fishing-habitat imagery "
            "exists); XGBoost combines those image features with real "
            "oceanographic data (base model A); a real LSTM trained on historical "
            "sea surface temperature produces a temporal trend feature, combined "
            "with oceanographic data via Ridge regression (base model B); a linear "
            "meta-learner stacks both base models' predictions into the final "
            "suitability score. SHAP values explain which features drove each "
            "prediction."
        ),
    },
    {
        "id": "model_performance",
        "text": (
            "The stacking ensemble's real evaluation used a spatial block train/"
            "test split (whole 1.5-degree blocks held out, not random points, to "
            "avoid leakage from spatially correlated neighboring cells). One base "
            "model (Ridge on environment+temporal features) genuinely "
            "underperforms, with negative R-squared on the held-out test set - this "
            "is reported honestly rather than hidden. Full metrics including "
            "confusion matrix, ROC-AUC, precision/recall/F1, RMSE and MAE are on "
            "the Research page."
        ),
    },
    {
        "id": "species",
        "text": (
            "This platform focuses on two commercially important species in the "
            "Gulf of Thailand and Andaman Sea: skipjack tuna (Katsuwonus pelamis) "
            "and Indian mackerel (Rastrelliger kanagurta). Their optimal sea "
            "surface temperature and chlorophyll-a ranges used in the suitability "
            "formula come from published fisheries literature, cited on the "
            "Research page."
        ),
    },
    {
        "id": "study_region",
        "text": (
            "The study region covers roughly 5 to 14 degrees North latitude and 97 "
            "to 106 degrees East longitude, spanning both the Gulf of Thailand and "
            "the Andaman Sea coast of Thailand."
        ),
    },
    {
        "id": "how_to_use_map",
        "text": (
            "On the Map page, you can switch between layers (suitability, risk, "
            "SST, chlorophyll, salinity, bathymetry, wind, wave, current), adjust "
            "opacity, switch basemaps, toggle a real NASA satellite image overlay "
            "or the Thailand EEZ reference boundary, draw a rectangular area to "
            "filter and export data as CSV, and click any point to get a real, "
            "live prediction for that exact location."
        ),
    },
    {
        "id": "how_to_use_predict",
        "text": (
            "On the Prediction page, you can pick a location on a map and choose a "
            "target species. This calls the real backend stacking ensemble — "
            "EfficientNet-B0 runs on the nearest cached real satellite tile for "
            "that location — not a canned demo response."
        ),
    },
]
