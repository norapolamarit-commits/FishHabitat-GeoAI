"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Line, Bar, Radar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  Thermometer,
  Droplets,
  Wind,
  Target,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { PageNav } from "@/components/page-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { colorForValue } from "@/lib/colormap";
import { useT } from "@/lib/locale";
import {
  api,
  type AnalyticsSummary,
  type RegionalComparison,
  type SuitabilityProfile,
  type SstTimeseries,
  type GridResponse,
} from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler
);

function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  tone,
}: {
  icon: typeof Thermometer;
  label: string;
  value: string;
  caption: string;
  tone: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className={`flex size-9 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="size-4.5" />
      </div>
      <p className="mt-3 font-heading text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground/70">{caption}</p>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const t = useT();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [regional, setRegional] = useState<RegionalComparison | null>(null);
  const [profile, setProfile] = useState<SuitabilityProfile | null>(null);
  const [ts, setTs] = useState<SstTimeseries | null>(null);
  const [grid, setGrid] = useState<GridResponse | null>(null);

  useEffect(() => {
    api.analyticsSummary().then(setSummary).catch(() => {});
    api.regionalComparison().then(setRegional).catch(() => {});
    api.suitabilityProfile().then(setProfile).catch(() => {});
    api.sstTimeseries(9.5, 100.5, 120).then(setTs).catch(() => {});
    api.grid().then(setGrid).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow={t("Analytics", "การวิเคราะห์")}
        title={t("Live Dashboard, Real Data", "แดชบอร์ดสด ข้อมูลจริง")}
        subtitleThai="ทุกการ์ดและกราฟด้านล่างคำนวณจากชุดข้อมูลจริงชุดเดียวกับที่หน้าแผนที่และหน้าพยากรณ์ใช้"
        subtitleEn="Every card and chart below is computed from the same cached real-data snapshot the Map and Prediction pages use."
      />

      <section className="px-4 pt-14 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            {t(
              "This dashboard has three layers: the six stat cards at the top summarize the whole study area right now (real observed averages plus the model's own evaluation numbers); the four charts below break that down by time, by environmental factor, by sub-region, and by how two key variables relate to each other; the heatmap at the bottom shows every individual grid cell's score by position, so you can see where suitability is concentrated. Nothing here is a mock chart — every number traces back to the same real data and trained model the Map and Prediction pages use.",
              "แดชบอร์ดนี้มีสามชั้นข้อมูล ชั้นแรกคือการ์ดสถิติ 6 การ์ดด้านบนที่สรุปภาพรวมของพื้นที่ศึกษาทั้งหมด ณ ขณะนี้ (ค่าเฉลี่ยจากการสังเกตจริง รวมถึงตัวเลขประเมินผลของโมเดลเอง) ชั้นที่สองคือกราฟทั้ง 4 ด้านล่างที่แจกแจงข้อมูลตามช่วงเวลา ตามปัจจัยสิ่งแวดล้อม ตามพื้นที่ย่อย และตามความสัมพันธ์ระหว่างตัวแปรสำคัญสองตัว ส่วนชั้นสุดท้ายคือฮีทแมปด้านล่างสุดที่แสดงคะแนนของแต่ละเซลล์ตารางตามตำแหน่งจริง ทำให้เห็นว่าความเหมาะสมกระจุกตัวอยู่ที่ใด ไม่มีกราฟจำลองในหน้านี้ ทุกตัวเลขย้อนกลับไปยังข้อมูลจริงและโมเดลที่ผ่านการฝึกชุดเดียวกับที่หน้าแผนที่และหน้าพยากรณ์ใช้"
            )}
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-10">
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {summary ? (
              <>
                <StatCard
                  icon={Thermometer}
                  label={t("Mean SST", "SST เฉลี่ย")}
                  value={`${summary.current_sst_c}°C`}
                  caption={t("Real ERDDAP observation", "ข้อมูลสังเกตจริงจาก ERDDAP")}
                  tone="bg-secondary/10 text-secondary dark:text-accent"
                />
                <StatCard
                  icon={Droplets}
                  label={t("Mean Chlorophyll", "คลอโรฟิลล์เฉลี่ย")}
                  value={`${summary.current_chl_mg_m3}`}
                  caption={t("mg/m³, VIIRS weekly", "mg/m³ รายสัปดาห์จาก VIIRS")}
                  tone="bg-success/10 text-success"
                />
                <StatCard
                  icon={Wind}
                  label={t("Mean Wind", "ลมเฉลี่ย")}
                  value={`${summary.current_wind_kmh} km/h`}
                  caption={t("Open-Meteo forecast", "พยากรณ์จาก Open-Meteo")}
                  tone="bg-accent/10 text-accent"
                />
                <StatCard
                  icon={Target}
                  label={t("Classification ROC-AUC", "ROC-AUC ของการจำแนกประเภท")}
                  value={summary.classification_roc_auc.toFixed(3)}
                  caption={t("Held-out spatial split", "ชุดทดสอบเชิงพื้นที่ที่แยกไว้")}
                  tone="bg-primary/10 text-primary dark:text-accent"
                />
                <StatCard
                  icon={CheckCircle2}
                  label={t("Suitable Cells", "เซลล์ที่เหมาะสม")}
                  value={`${summary.n_suitable_cells}`}
                  caption={t(
                    `of ${summary.n_total_cells} grid cells`,
                    `จากทั้งหมด ${summary.n_total_cells} เซลล์ตาราง`
                  )}
                  tone="bg-success/10 text-success"
                />
                <StatCard
                  icon={AlertTriangle}
                  label={t("High-Risk Cells", "เซลล์ความเสี่ยงสูง")}
                  value={`${summary.n_high_risk_cells}`}
                  caption={t("Wave/wind ≥ threshold", "คลื่น/ลม ≥ เกณฑ์ที่กำหนด")}
                  tone="bg-danger/10 text-danger"
                />
              </>
            ) : (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            )}
          </div>

          {/* LINE + RADAR */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
              <h3 className="font-heading text-sm font-semibold">
                {t(
                  "Real Historical SST (120 days, Gulf of Thailand center)",
                  "ประวัติ SST จริง (120 วัน จุดกึ่งกลางอ่าวไทย)"
                )}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "Daily sea surface temperature at the region's center point, pulled directly from NOAA CoastWatch ERDDAP — the real seasonal trend the model reads as an input, not a simulation.",
                  "อุณหภูมิผิวน้ำทะเลรายวันที่จุดกึ่งกลางของพื้นที่ ดึงข้อมูลโดยตรงจาก NOAA CoastWatch ERDDAP ซึ่งเป็นแนวโน้มตามฤดูกาลจริงที่โมเดลใช้เป็นข้อมูลนำเข้า ไม่ใช่การจำลอง"
                )}
              </p>
              <div className="mt-4 h-64">
                {ts ? (
                  <Line
                    data={{
                      labels: ts.series.map((d) => d.date.slice(5)),
                      datasets: [
                        {
                          label: "SST (°C)",
                          data: ts.series.map((d) => d.sst_c),
                          borderColor: "#00B4D8",
                          backgroundColor: "rgba(0,180,216,0.15)",
                          fill: true,
                          tension: 0.3,
                          pointRadius: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } },
                        y: { grid: { color: "rgba(128,128,128,0.1)" } },
                      },
                    }}
                  />
                ) : (
                  <Skeleton className="h-full rounded-xl" />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-heading text-sm font-semibold">
                {t("Suitability Profile", "โปรไฟล์ความเหมาะสม")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "Mean score across each environmental factor feeding the suitability formula — a wider shape means conditions are broadly favorable across more factors at once.",
                  "คะแนนเฉลี่ยของแต่ละปัจจัยสิ่งแวดล้อมที่ป้อนเข้าสูตรความเหมาะสม รูปทรงที่กว้างกว่าหมายถึงสภาพแวดล้อมเอื้ออำนวยในหลายปัจจัยพร้อมกัน"
                )}
              </p>
              <div className="mt-4 h-64">
                {profile ? (
                  <Radar
                    data={{
                      labels: profile.axes.map((a) => a.axis),
                      datasets: [
                        {
                          label: "Mean score",
                          data: profile.axes.map((a) => a.value),
                          borderColor: "#0077B6",
                          backgroundColor: "rgba(0,119,182,0.2)",
                          pointBackgroundColor: "#00B4D8",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        r: { min: 0, max: 1, ticks: { display: false } },
                      },
                    }}
                  />
                ) : (
                  <Skeleton className="h-full rounded-xl" />
                )}
              </div>
            </div>
          </div>

          {/* BAR + SCATTER */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-heading text-sm font-semibold">
                {t(
                  "Regional Comparison: Suitability vs Risk",
                  "เปรียบเทียบรายภูมิภาค: ความเหมาะสม เทียบกับ ความเสี่ยง"
                )}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "Mean suitability and operational risk compared across sub-regions of the study area — useful for spotting zones that are both promising and safe to fish.",
                  "เปรียบเทียบความเหมาะสมเฉลี่ยและความเสี่ยงในการปฏิบัติงานระหว่างพื้นที่ย่อยของพื้นที่ศึกษา ช่วยให้เห็นโซนที่มีศักยภาพและปลอดภัยสำหรับการทำประมง"
                )}
              </p>
              <div className="mt-4 h-64">
                {regional ? (
                  <Bar
                    data={{
                      labels: regional.regions.map((r) => r.region),
                      datasets: [
                        {
                          label: "Mean suitability",
                          data: regional.regions.map((r) => r.mean_suitability),
                          backgroundColor: "#00B4D8",
                          borderRadius: 6,
                        },
                        {
                          label: "Mean risk",
                          data: regional.regions.map((r) => r.mean_risk),
                          backgroundColor: "#E74C3C",
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { min: 0, max: 1, grid: { color: "rgba(128,128,128,0.1)" } },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                ) : (
                  <Skeleton className="h-full rounded-xl" />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-heading text-sm font-semibold">
                {t("SST vs Chlorophyll-a", "SST เทียบกับคลอโรฟิลล์-เอ")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "Every real grid cell plotted by temperature and chlorophyll-a, colored by its suitability score — shows how the model's two strongest environmental drivers relate to its output across the study area.",
                  "เซลล์ตารางจริงทุกเซลล์ถูกพล็อตตามอุณหภูมิและคลอโรฟิลล์-เอ ระบายสีตามคะแนนความเหมาะสม แสดงให้เห็นว่าปัจจัยสิ่งแวดล้อมสองตัวที่มีอิทธิพลมากที่สุดของโมเดลสัมพันธ์กับผลลัพธ์อย่างไรทั่วพื้นที่ศึกษา"
                )}
              </p>
              <div className="mt-4 h-64">
                {grid ? (
                  <Scatter
                    data={{
                      datasets: [
                        {
                          label: "Grid cells",
                          data: grid.points.map((p) => ({ x: p.sst_c, y: p.chl_mg_m3 })),
                          backgroundColor: grid.points.map((p) =>
                            colorForValue(p.suitability_pred, 0, 1, "viridis")
                          ),
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { title: { display: true, text: "SST (°C)" } },
                        y: { title: { display: true, text: "Chlorophyll-a (mg/m³)" }, type: "logarithmic" },
                      },
                    }}
                  />
                ) : (
                  <Skeleton className="h-full rounded-xl" />
                )}
              </div>
            </div>
          </div>

          {/* HEATMAP */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-heading text-sm font-semibold">
              {t(
                "Spatial Suitability Heatmap (real grid, lat × lon)",
                "ฮีทแมปความเหมาะสมเชิงพื้นที่ (ตารางจริง ละติจูด × ลองจิจูด)"
              )}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                "Every real grid cell's suitability score plotted by position — brighter cells mark more favorable estimated habitat conditions. Hover a cell for its exact coordinates and score.",
                "คะแนนความเหมาะสมของแต่ละเซลล์ตารางจริงถูกพล็อตตามตำแหน่ง เซลล์ที่สว่างกว่าหมายถึงสภาพที่อยู่อาศัยที่คาดว่าเอื้ออำนวยมากกว่า วางเมาส์เหนือเซลล์เพื่อดูพิกัดและคะแนนที่แน่นอน"
              )}
            </p>
            {grid ? (
              <HeatmapGrid points={grid.points} />
            ) : (
              <Skeleton className="mt-4 h-56 rounded-xl" />
            )}
          </div>
        </div>
      </section>

      <PageNav current="/analytics" />
    </div>
  );
}

function HeatmapGrid({ points }: { points: GridResponse["points"] }) {
  const lats = Array.from(new Set(points.map((p) => p.lat))).sort((a, b) => b - a);
  const lons = Array.from(new Set(points.map((p) => p.lon))).sort((a, b) => a - b);
  const lookup = new Map(points.map((p) => [`${p.lat}_${p.lon}`, p.suitability_pred]));

  return (
    <div className="mt-4 overflow-x-auto">
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${lons.length}, minmax(6px, 1fr))` }}
      >
        {lats.flatMap((lat) =>
          lons.map((lon) => {
            const v = lookup.get(`${lat}_${lon}`);
            return (
              <div
                key={`${lat}_${lon}`}
                title={v !== undefined ? `${lat.toFixed(2)}, ${lon.toFixed(2)}: ${v.toFixed(2)}` : undefined}
                className="aspect-square rounded-[1px]"
                style={{
                  background: v !== undefined ? colorForValue(v, 0, 1, "viridis") : "transparent",
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
