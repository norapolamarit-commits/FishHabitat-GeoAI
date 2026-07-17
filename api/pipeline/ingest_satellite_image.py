"""Real satellite imagery from NASA's public Worldview Snapshots API (no auth).

Used as the input to the frozen EfficientNet-B0 feature extractor. True-colour
optical imagery is genuinely subject to cloud cover and orbital swath gaps —
that's a real characteristic of remote sensing, not something to hide.
"""

import datetime

from pipeline.common import CACHE_ROOT, cached_bytes_get

SNAPSHOT_URL = "https://wvs.earthdata.nasa.gov/api/v1/snapshot"

TRUE_COLOR_LAYER = "MODIS_Terra_CorrectedReflectance_TrueColor"
NIGHTLIGHT_LAYER = "VIIRS_SNPP_DayNightBand_ENCC"


def fetch_true_color_image(
    lat_min: float, lon_min: float, lat_max: float, lon_max: float, date: str, size: int = 512
) -> bytes:
    """Real MODIS Terra true-colour image crop for a bounding box on a given date."""
    url = (
        f"{SNAPSHOT_URL}?REQUEST=GetSnapshot&LAYERS={TRUE_COLOR_LAYER}"
        f"&CRS=EPSG:4326&TIME={date}&BBOX={lat_min},{lon_min},{lat_max},{lon_max}"
        f"&FORMAT=image/jpeg&WIDTH={size}&HEIGHT={size}"
    )
    cache_key = f"truecolor_{lat_min}_{lon_min}_{lat_max}_{lon_max}_{date}_{size}"
    return cached_bytes_get(url, cache_key, max_age_seconds=7 * 24 * 3600)


def fetch_nightlight_image(
    lat_min: float, lon_min: float, lat_max: float, lon_max: float, date: str, size: int = 512
) -> bytes:
    """Real VIIRS Day/Night Band nighttime lights image crop — a proxy used in
    real fisheries research to detect lit fishing fleets (squid/purse-seine)."""
    url = (
        f"{SNAPSHOT_URL}?REQUEST=GetSnapshot&LAYERS={NIGHTLIGHT_LAYER}"
        f"&CRS=EPSG:4326&TIME={date}&BBOX={lat_min},{lon_min},{lat_max},{lon_max}"
        f"&FORMAT=image/jpeg&WIDTH={size}&HEIGHT={size}"
    )
    cache_key = f"nightlight_{lat_min}_{lon_min}_{lat_max}_{lon_max}_{date}_{size}"
    return cached_bytes_get(url, cache_key, max_age_seconds=7 * 24 * 3600)


def most_recent_usable_date(days_back: int = 10) -> str:
    """Returns yesterday's date; the pipeline retries earlier dates itself if
    a given day's crop turns out to be mostly cloud/swath-gap (see features.py)."""
    return (datetime.date.today() - datetime.timedelta(days=1)).isoformat()


if __name__ == "__main__":
    from config import BBOX

    date = most_recent_usable_date()
    print(f"Fetching real true-colour image for {date}...")
    img_bytes = fetch_true_color_image(
        BBOX["lat_min"], BBOX["lon_min"], BBOX["lat_max"], BBOX["lon_max"], date
    )
    out = CACHE_ROOT / "sample_true_color.jpg"
    out.write_bytes(img_bytes)
    print(f"Wrote {len(img_bytes)} bytes to {out}")
