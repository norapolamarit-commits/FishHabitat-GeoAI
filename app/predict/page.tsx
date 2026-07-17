"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Bar,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Sparkles, Loader2, MapPin, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/section-heading";
import { PageNav } from "@/components/page-nav";
import { Gauge } from "@/components/charts/gauge";
import { DataBasisBadge } from "@/components/data-basis-badge";
import { api, type PredictResponse } from "@/lib/api";
import { useLocale, useT } from "@/lib/locale";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const LocationPicker = dynamic(
  () => import("@/components/predict/location-picker").then((m) => m.LocationPicker),
  { ssr: false }
);

const SPECIES_VALUES = ["Katsuwonus pelamis", "Rastrelliger kanagurta"] as const;

export default function PredictPage() {
  const t = useT();
  const locale = useLocale();
  const SPECIES = [
    { value: "Katsuwonus pelamis", label: t("Skipjack tuna", "ปลาโอแถบ") },
    { value: "Rastrelliger kanagurta", label: t("Indian mackerel", "ปลาทู") },
  ];
  const [lat, setLat] = useState(9.5);
  const [lon, setLon] = useState(100.5);
  const [species, setSpecies] = useState<string>(SPECIES_VALUES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runPrediction() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.predict({ lat, lon, species, image: null });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Prediction failed", "การพยากรณ์ล้มเหลว"));
    } finally {
      setLoading(false);
    }
  }

  const shapData = result
    ? {
        labels: result.shap_feature_importance.map((f) => f.feature),
        datasets: [
          {
            label: t("SHAP value", "ค่า SHAP"),
            data: result.shap_feature_importance.map((f) => f.shap_value),
            backgroundColor: result.shap_feature_importance.map((f) =>
              f.shap_value >= 0 ? "#2ECC71" : "#E74C3C"
            ),
            borderRadius: 4,
          },
        ],
      }
    : null;

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow={t("AI Prediction", "การพยากรณ์ด้วย AI")}
            title={t(
              "Run a real habitat suitability prediction",
              "รันการพยากรณ์ความเหมาะสมของถิ่นที่อยู่จริง"
            )}
            description={t(
              "Pick a location on the map to run the actual stacking ensemble — not a mock response.",
              "เลือกตำแหน่งบนแผนที่เพื่อรันโมเดล stacking ensemble ตัวจริง ไม่ใช่ข้อมูลจำลอง"
            )}
          />
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-5">
          {/* FORM */}
          <div className="lg:col-span-2 space-y-5 rounded-2xl border border-border bg-card p-6">
            <div>
              <Label className="flex items-center gap-1.5 text-xs">
                <MapPin className="size-3.5" /> {t("Choose location", "เลือกตำแหน่ง")}
              </Label>
              <div className="mt-2">
                <LocationPicker lat={lat} lon={lon} onChange={(la, lo) => { setLat(la); setLon(lo); }} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  aria-label={t("Latitude", "ละติจูด")}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={lon}
                  onChange={(e) => setLon(parseFloat(e.target.value))}
                  aria-label={t("Longitude", "ลองจิจูด")}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">{t("Target species", "ชนิดพันธุ์เป้าหมาย")}</Label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {SPECIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="flex items-center gap-1.5 text-xs">
                <CalendarDays className="size-3.5" /> {t("Date", "วันที่")}
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t(
                  "Informational only — this build serves the latest cached real data snapshot, not per-date historical re-inference.",
                  "ใช้เพื่อข้อมูลเท่านั้น — เวอร์ชันนี้ให้บริการข้อมูลจริงล่าสุดที่แคชไว้ ไม่ใช่การประมวลผลย้อนหลังตามวันที่ที่เลือก"
                )}
              </p>
            </div>

            <Button onClick={runPrediction} disabled={loading} className="w-full gap-2" size="lg">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading
                ? t("Running real prediction...", "กำลังรันการพยากรณ์จริง...")
                : t("Run Prediction", "รันการพยากรณ์")}
            </Button>
          </div>

          {/* RESULT */}
          <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6">
            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[420px] flex-col items-center justify-center text-center text-muted-foreground"
              >
                <Sparkles className="mb-3 size-8 text-accent/60" />
                <p className="text-sm">
                  {error ??
                    t(
                      "Choose a location and run a prediction to see results here.",
                      "เลือกตำแหน่งและรันการพยากรณ์เพื่อดูผลลัพธ์ที่นี่"
                    )}
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="size-10 text-accent" />
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Running the real stacking ensemble (XGBoost + Ridge + meta-learner)...",
                    "กำลังรันโมเดล stacking ensemble ตัวจริง (XGBoost + Ridge + meta-learner)..."
                  )}
                </p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-around rounded-xl bg-muted/40 py-4">
                  <Gauge value={result.suitability} label={t("Suitability", "ความเหมาะสม")} color="var(--accent)" />
                  <Gauge value={result.risk} label={t("Operational Risk", "ความเสี่ยงในการปฏิบัติงาน")} color="var(--danger)" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-muted-foreground">{t("Confidence", "ความเชื่อมั่น")}</p>
                    <p className="mt-1 font-semibold capitalize">{result.confidence}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-muted-foreground">{t("Nearest data", "ข้อมูลที่ใกล้ที่สุด")}</p>
                    <p className="mt-1 font-semibold">{result.nearest_grid_cell_km} km</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("SHAP Feature Importance", "ความสำคัญของฟีเจอร์ (SHAP)")}
                  </p>
                  {shapData && (
                    <div className="h-64">
                      <Bar
                        data={shapData}
                        options={{
                          indexAxis: "y" as const,
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            x: { grid: { color: "rgba(128,128,128,0.1)" } },
                            y: { grid: { display: false } },
                          },
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
                  <p className="mb-1 font-semibold text-foreground">{t("Explanation", "คำอธิบาย")}</p>
                  {locale === "th" ? (
                    <>
                      ที่พิกัด {result.lat.toFixed(2)}°N, {result.lon.toFixed(2)}°E ค่าอุณหภูมิผิวน้ำทะเล (SST) ที่สังเกตได้จริงอยู่ที่{" "}
                      {result.sub_scores.sst_c?.toFixed(1)}°C และคลอโรฟิลล์-เอ อยู่ที่{" "}
                      {result.sub_scores.chl_mg_m3?.toFixed(2)} mg/m³ ปัจจัยขับเคลื่อนหลักตาม SHAP คือ{" "}
                      <strong>{result.shap_feature_importance[0]?.feature}</strong> ซึ่งส่งผลในทิศทาง
                      {result.shap_feature_importance[0]?.shap_value >= 0 ? "บวก" : "ลบ"}
                      ต่อคะแนนความเหมาะสม
                    </>
                  ) : (
                    <>
                      At {result.lat.toFixed(2)}°N, {result.lon.toFixed(2)}°E, real observed SST was{" "}
                      {result.sub_scores.sst_c?.toFixed(1)}°C and chlorophyll-a was{" "}
                      {result.sub_scores.chl_mg_m3?.toFixed(2)} mg/m³. The top SHAP driver was{" "}
                      <strong>{result.shap_feature_importance[0]?.feature}</strong>, contributing{" "}
                      {result.shap_feature_importance[0]?.shap_value >= 0 ? "positively" : "negatively"}{" "}
                      to the suitability score.
                    </>
                  )}
                </div>

                <DataBasisBadge basis={result.data_basis.suitability as "proxy_label"} />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <PageNav current="/predict" />
    </div>
  );
}
