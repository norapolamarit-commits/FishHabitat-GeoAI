"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Rectangle,
  ImageOverlay,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngBoundsLiteral, LatLngTuple } from "leaflet";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  Layers as LayersIcon,
  Loader2,
  MousePointerClick,
  Pencil,
  Satellite,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DataBasisBadge } from "@/components/data-basis-badge";
import { colorForValue, gradientCss } from "@/lib/colormap";
import { api, type GridPoint, type GridResponse, type LayersResponse, type PredictResponse } from "@/lib/api";
import { useT } from "@/lib/locale";

const BBOX: LatLngBoundsLiteral = [
  [5.0, 97.0],
  [14.0, 106.0],
];
const CENTER: LatLngTuple = [9.5, 101.5];

// Thailand EEZ reference extent (Marine Regions Gazetteer, MRGID 25444) —
// a simplified bounding rectangle, not the precise boundary polygon.
const EEZ_BOUNDS: LatLngBoundsLiteral = [
  [8.78, 101.33],
  [11.83, 104.45],
];

function yesterdayIso() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function ClickCatcher({
  onClick,
  active,
}: {
  onClick: (lat: number, lon: number) => void;
  active: boolean;
}) {
  useMapEvents({
    click(e) {
      if (active) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function toCsv(points: GridPoint[]): string {
  if (points.length === 0) return "";
  const headers = Object.keys(points[0]);
  const rows = points.map((p) => headers.map((h) => (p as unknown as Record<string, number>)[h]).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export function FishingMap() {
  const t = useT();

  const BASEMAPS = {
    satellite: {
      label: t("Satellite", "ภาพถ่ายดาวเทียม"),
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri",
    },
    dark: {
      label: t("Dark reference", "อ้างอิงโทนมืด"),
      url: "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
      attribution: "&copy; CARTO &copy; OpenStreetMap contributors",
    },
    light: {
      label: t("Light reference", "อ้างอิงโทนสว่าง"),
      url: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      attribution: "&copy; CARTO &copy; OpenStreetMap contributors",
    },
  };

  const LAYER_GROUPS = [
    { label: t("Model output", "ผลลัพธ์จากโมเดล"), keys: ["suitability_pred", "risk_score"] },
    {
      label: t("Environmental data", "ข้อมูลสิ่งแวดล้อม"),
      keys: [
        "sst_c",
        "chl_mg_m3",
        "salinity_psu",
        "depth_m",
        "wind_speed_kmh",
        "wave_height_m",
        "current_velocity_kmh",
      ],
    },
  ];

  const [grid, setGrid] = useState<GridResponse | null>(null);
  const [layers, setLayers] = useState<LayersResponse | null>(null);
  const [selectedLayer, setSelectedLayer] = useState("suitability_pred");
  const [opacity, setOpacity] = useState(80);
  const [basemap, setBasemap] = useState<keyof typeof BASEMAPS>("dark");
  const [showOptical, setShowOptical] = useState(false);
  const [showEez, setShowEez] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [drawBounds, setDrawBounds] = useState<LatLngBoundsLiteral | null>(null);
  const [drawStart, setDrawStart] = useState<LatLngTuple | null>(null);
  const [selected, setSelected] = useState<{ lat: number; lon: number } | null>(null);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [layerPanelOpen, setLayerPanelOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    Promise.all([api.grid(), api.layers()]).then(([g, l]) => {
      if (!mountedRef.current) return;
      setGrid(g);
      setLayers(l);
    });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const points = useMemo(() => grid?.points ?? [], [grid]);

  const { min, max } = useMemo(() => {
    if (points.length === 0) return { min: 0, max: 1 };
    const values = points.map((p) => (p as unknown as Record<string, number>)[selectedLayer]);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [points, selectedLayer]);

  const meta = layers?.layers[selectedLayer];
  const colormap = meta?.colormap ?? "viridis";

  const filteredPoints = useMemo(() => {
    if (!drawBounds) return points;
    const [[latMin, lonMin], [latMax, lonMax]] = drawBounds;
    return points.filter((p) => p.lat >= latMin && p.lat <= latMax && p.lon >= lonMin && p.lon <= lonMax);
  }, [points, drawBounds]);

  async function handlePointClick(lat: number, lon: number) {
    if (drawMode) return;
    setSelected({ lat, lon });
    setPrediction(null);
    setPredictLoading(true);
    try {
      const res = await api.predict({ lat, lon, species: "Katsuwonus pelamis" });
      if (mountedRef.current) setPrediction(res);
    } catch {
      // real prediction failed (e.g. API not running) — leave panel showing coordinates only
    } finally {
      if (mountedRef.current) setPredictLoading(false);
    }
  }

  function handleMapClickForDraw(lat: number, lon: number) {
    if (!drawMode) return;
    if (!drawStart) {
      setDrawStart([lat, lon]);
      setDrawBounds(null);
    } else {
      const bounds: LatLngBoundsLiteral = [
        [Math.min(drawStart[0], lat), Math.min(drawStart[1], lon)],
        [Math.max(drawStart[0], lat), Math.max(drawStart[1], lon)],
      ];
      setDrawBounds(bounds);
      setDrawStart(null);
      setDrawMode(false);
    }
  }

  function downloadCsv() {
    const csv = toCsv(filteredPoints);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = drawBounds ? "fishing_habitat_selected_area.csv" : "fishing_habitat_full_grid.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const opticalBounds: LatLngBoundsLiteral = BBOX;
  const opticalUrl = `https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG:4326&TIME=${yesterdayIso()}&BBOX=${BBOX[0][0]},${BBOX[0][1]},${BBOX[1][0]},${BBOX[1][1]}&FORMAT=image/jpeg&WIDTH=1024&HEIGHT=1024`;

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      <MapContainer
        center={CENTER}
        zoom={6}
        minZoom={5}
        maxZoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "#04101C" }}
      >
        <TileLayer url={BASEMAPS[basemap].url} attribution={BASEMAPS[basemap].attribution} />

        {showOptical && (
          <ImageOverlay url={opticalUrl} bounds={opticalBounds} opacity={0.85} />
        )}

        {showEez && (
          <Rectangle
            bounds={EEZ_BOUNDS}
            pathOptions={{ color: "#F4B942", weight: 2, dashArray: "6 4", fillOpacity: 0.03 }}
          />
        )}

        {drawBounds && (
          <Rectangle bounds={drawBounds} pathOptions={{ color: "#00B4D8", weight: 2, fillOpacity: 0.08 }} />
        )}

        {filteredPoints.map((p) => (
          <CircleMarker
            key={`${p.lat}-${p.lon}`}
            center={[p.lat, p.lon]}
            radius={9}
            pathOptions={{
              color: "transparent",
              fillColor: colorForValue(
                (p as unknown as Record<string, number>)[selectedLayer],
                min,
                max,
                colormap
              ),
              fillOpacity: opacity / 100,
            }}
            eventHandlers={{ click: () => handlePointClick(p.lat, p.lon) }}
          />
        ))}

        <ClickCatcher
          active={drawMode}
          onClick={(lat, lon) => handleMapClickForDraw(lat, lon)}
        />
      </MapContainer>

      {/* LAYER SELECTOR PANEL */}
      <div className="absolute left-2 top-2 z-[500] w-72 max-w-[78vw] sm:left-4 sm:top-4">
        <div className="glass-light flex max-h-[min(70vh,32rem)] flex-col rounded-2xl border border-border/60 shadow-lg">
          <button
            className="flex w-full shrink-0 items-center justify-between p-4 pb-2 text-sm font-semibold"
            onClick={() => setLayerPanelOpen((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <LayersIcon className="size-4 text-accent" />
              {t("Layers", "ชั้นข้อมูล")}
            </span>
            {layerPanelOpen ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>

          {layerPanelOpen && (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 pt-2">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MousePointerClick className="size-3.5 shrink-0" />
                {t("Click any point on the map to inspect it.", "คลิกจุดใดก็ได้บนแผนที่เพื่อตรวจสอบข้อมูล")}
              </p>

              {LAYER_GROUPS.map((group) => {
                const available = group.keys.filter((k) => layers?.layers[k]);
                if (available.length === 0) return null;
                return (
                  <div key={group.label}>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {available.map((key) => (
                        <button
                          key={key}
                          onClick={() => setSelectedLayer(key)}
                          className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                            selectedLayer === key
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {layers!.layers[key].label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-border pt-3">
                <label className="text-xs font-medium text-muted-foreground">{t("Opacity", "ความทึบแสง")}</label>
                <Slider
                  value={[opacity]}
                  onValueChange={(v) => setOpacity(Array.isArray(v) ? v[0] : v)}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="border-t border-border pt-3">
                <button
                  className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setAdvancedOpen((v) => !v)}
                >
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="size-3.5" />
                    {t("Advanced options", "ตัวเลือกขั้นสูง")}
                  </span>
                  {advancedOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>

                {advancedOpen && (
                  <div className="mt-3 space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">{t("Basemap", "แผนที่พื้นฐาน")}</p>
                      <div className="flex gap-1">
                        {(Object.keys(BASEMAPS) as (keyof typeof BASEMAPS)[]).map((k) => (
                          <button
                            key={k}
                            onClick={() => setBasemap(k)}
                            className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                              basemap === k ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {BASEMAPS[k].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={showOptical}
                          onChange={(e) => setShowOptical(e.target.checked)}
                        />
                        <Satellite className="size-3.5" />
                        {t("Real NASA optical overlay", "ภาพถ่ายออปติคอลจริงจาก NASA")}
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={showEez}
                          onChange={(e) => setShowEez(e.target.checked)}
                        />
                        {t("Thailand EEZ reference", "เขตเศรษฐกิจจำเพาะ (EEZ) ของไทย")}
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={drawMode ? "default" : "outline"}
                        className="flex-1 gap-1.5"
                        onClick={() => {
                          setDrawMode((v) => !v);
                          setDrawStart(null);
                        }}
                      >
                        <Pencil className="size-3.5" />
                        {drawMode ? t("Click 2 points...", "คลิก 2 จุด...") : t("Draw Area", "วาดพื้นที่")}
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={downloadCsv}>
                        <Download className="size-3.5" />
                        {t("CSV", "CSV")}
                      </Button>
                    </div>
                    {drawBounds && (
                      <button
                        className="text-[11px] text-muted-foreground underline"
                        onClick={() => setDrawBounds(null)}
                      >
                        {t(
                          `Clear selected area (${filteredPoints.length} cells)`,
                          `ล้างพื้นที่ที่เลือก (${filteredPoints.length} เซลล์)`
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LEGEND */}
      {meta && (
        <div className="absolute bottom-2 left-2 z-[500] w-56 rounded-xl glass-light border border-border/60 p-3 sm:bottom-6 sm:left-4 sm:w-64">
          <p className="text-xs font-semibold">{meta.label}</p>
          <div className="mt-2 h-2 w-full rounded-full" style={{ background: gradientCss(colormap) }} />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{min.toFixed(2)} {meta.unit}</span>
            <span>{max.toFixed(2)} {meta.unit}</span>
          </div>
          <div className="mt-2">
            <DataBasisBadge basis={meta.data_basis} />
          </div>
        </div>
      )}

      {/* INSPECT PANEL */}
      {selected && (
        <div className="absolute right-2 top-2 z-[500] max-h-[min(80vh,34rem)] w-80 max-w-[78vw] overflow-y-auto rounded-2xl glass-light border border-border/60 p-5 shadow-xl sm:right-4 sm:top-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold">{t("Location Inspector", "ตัวตรวจสอบตำแหน่ง")}</h3>
            <button onClick={() => setSelected(null)}>
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {selected.lat.toFixed(3)}°N, {selected.lon.toFixed(3)}°E
          </p>

          {predictLoading && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {t("Running real prediction...", "กำลังประมวลผลการทำนายจริง...")}
            </div>
          )}

          {!predictLoading && prediction && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-primary/10 p-3">
                  <p className="text-[10px] text-muted-foreground">{t("Suitability", "ความเหมาะสม")}</p>
                  <p className="font-heading text-xl font-bold text-primary dark:text-accent">
                    {(prediction.suitability * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-lg bg-danger/10 p-3">
                  <p className="text-[10px] text-muted-foreground">{t("Risk", "ความเสี่ยง")}</p>
                  <p className="font-heading text-xl font-bold text-danger">
                    {(prediction.risk * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("Confidence", "ความเชื่อมั่น")}</span>
                <span className="font-medium capitalize">{prediction.confidence}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("Nearest real data cell", "เซลล์ข้อมูลจริงที่ใกล้ที่สุด")}</span>
                <span className="font-medium">
                  {t(`${prediction.nearest_grid_cell_km} km away`, `ห่างออกไป ${prediction.nearest_grid_cell_km} กม.`)}
                </span>
              </div>

              <div className="border-t border-border pt-3">
                <button
                  className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setShowDetails((v) => !v)}
                >
                  {t("Environmental details", "รายละเอียดสิ่งแวดล้อม")}
                  {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>

                {showDetails && (
                  <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
                    <span className="text-muted-foreground">{t("Temperature", "อุณหภูมิ")}</span>
                    <span className="text-right font-medium">{prediction.sub_scores.sst_c?.toFixed(2)} °C</span>
                    <span className="text-muted-foreground">{t("Chlorophyll-a", "คลอโรฟิลล์-เอ")}</span>
                    <span className="text-right font-medium">{prediction.sub_scores.chl_mg_m3?.toFixed(3)} mg/m³</span>
                    <span className="text-muted-foreground">{t("Salinity", "ความเค็ม")}</span>
                    <span className="text-right font-medium">{prediction.sub_scores.salinity_psu?.toFixed(2)} PSU</span>
                    <span className="text-muted-foreground">{t("Depth", "ความลึก")}</span>
                    <span className="text-right font-medium">{prediction.sub_scores.depth_m?.toFixed(1)} m</span>
                    <span className="text-muted-foreground">{t("Wind", "ลม")}</span>
                    <span className="text-right font-medium">{prediction.sub_scores.wind_speed_kmh?.toFixed(1)} km/h</span>
                    <span className="text-muted-foreground">{t("Current", "กระแสน้ำ")}</span>
                    <span className="text-right font-medium">
                      {prediction.sub_scores.current_velocity_kmh?.toFixed(2)} km/h
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <DataBasisBadge basis={prediction.data_basis.suitability as "proxy_label"} />
              </div>
            </div>
          )}

          {!predictLoading && !prediction && (
            <p className="mt-4 text-xs text-muted-foreground">
              {t("Prediction unavailable — is the API running?", "ไม่สามารถทำนายผลได้ — API กำลังทำงานอยู่หรือไม่?")}
            </p>
          )}
        </div>
      )}

      {/* PREV/NEXT — explicit way off a full-screen map, no scrolling required */}
      <div className="absolute bottom-2 right-2 z-[500] flex gap-2 sm:bottom-4 sm:right-4">
        <Link
          href="/areas"
          className="flex items-center gap-1.5 rounded-full glass-light border border-border/60 px-3 py-2 text-xs font-medium text-foreground shadow-lg hover:bg-muted"
        >
          <ArrowLeft className="size-3.5" />
          {t("Areas", "พื้นที่")}
        </Link>
        <Link
          href="/predict"
          className="flex items-center gap-1.5 rounded-full glass-light border border-border/60 px-3 py-2 text-xs font-medium text-foreground shadow-lg hover:bg-muted"
        >
          {t("Prediction", "การทำนาย")}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
