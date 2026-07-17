"use client";

import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
} from "chart.js";
import {
  Database,
  FlaskConical,
  Cpu,
  MapPinned,
  Lightbulb,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type FullMetrics } from "@/lib/api";
import { useT } from "@/lib/locale";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip);

const REFERENCES = [
  {
    citation: "Nurdin, S., Mustapha, M.A., Lihan, T., Abd Ghaffar, M.A.Z.L.A. (2015). \"Determination of Potential Fishing Grounds of Rastrelliger kanagurta.\" Sains Malaysiana 44(2):225-232.",
    note: "Source of the Indian mackerel SST (29-30°C) and chlorophyll-a (0.20-0.30 mg/m³) optimal ranges used in this project's HSI formula.",
  },
  {
    citation: "Yu, W., Chen, X., Yi, Q., Chen, Y., Zhang, Y. (2015). \"Habitat suitability modelling for chub mackerel (Scomber japonicus) in the Northwest Pacific Ocean.\" PLOS ONE 10(4):e0122997.",
    note: "Basis for combining per-variable suitability indices via an arithmetic mean rather than geometric mean.",
  },
  {
    citation: "Zainuddin, M. et al. (2017). \"Detection of pelagic habitat hotspots for skipjack tuna in the Gulf of Bone-Flores Sea, southwestern Coral Triangle, Indonesia.\" PLOS ONE 12(10):e0185601.",
    note: "Indo-Pacific skipjack tuna pelagic habitat hotspot methodology, part of the literature basis for this project's species framing.",
  },
  {
    citation: "Mugo, R., Saitoh, S. et al. (2020). \"Identification of skipjack tuna pelagic hotspots applying ecological niche factor analysis.\" PLOS ONE 15(8):e0237742.",
    note: "Precedent for geometric/statistical combination of environmental suitability layers for skipjack tuna.",
  },
];

function ConfusionMatrix({ matrix, labels }: { matrix: number[][]; labels: string[] }) {
  const t = useT();
  const max = Math.max(...matrix.flat());
  return (
    <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-center text-xs">
      <div />
      {labels.map((l) => (
        <div key={l} className="pb-1 font-medium text-muted-foreground">
          {t("Pred", "ทำนาย")}: {l}
        </div>
      ))}
      {matrix.map((row, i) => (
        <Fragment key={`row-${i}`}>
          <div className="flex items-center pr-2 font-medium text-muted-foreground">
            {t("True", "จริง")}: {labels[i]}
          </div>
          {row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className="flex aspect-square items-center justify-center rounded-lg font-heading text-lg font-bold"
              style={{
                backgroundColor: `rgba(0, 180, 216, ${max > 0 ? (cell / max) * 0.6 + 0.05 : 0.05})`,
              }}
            >
              {cell}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}

export default function ResearchPage() {
  const t = useT();
  const [metrics, setMetrics] = useState<FullMetrics | null>(null);

  useEffect(() => {
    api.fullMetrics().then(setMetrics).catch(() => {});
  }, []);

  const METHODOLOGY_STEPS = [
    {
      icon: Database,
      title: t("Real data collection", "การเก็บข้อมูลจริง"),
      detail: t(
        "SST, chlorophyll-a, salinity, bathymetry, wind, current, and satellite imagery from public no-auth sources.",
        "อุณหภูมิผิวน้ำทะเล (SST) คลอโรฟิลล์-เอ ความเค็ม ความลึกท้องทะเล ลม กระแสน้ำ และภาพถ่ายดาวเทียม จากแหล่งข้อมูลสาธารณะที่ไม่ต้องยืนยันตัวตน"
      ),
    },
    {
      icon: FlaskConical,
      title: t("HSI proxy formulation", "การสร้างดัชนี HSI ทดแทน"),
      detail: t(
        "Literature-derived suitability index (Gaussian SI curves, arithmetic-mean combination) since no open CPUE dataset exists.",
        "ดัชนีความเหมาะสมที่อ้างอิงจากงานวิจัย (เส้นโค้ง SI แบบเกาส์เซียน รวมค่าด้วยค่าเฉลี่ยเลขคณิต) เนื่องจากไม่มีชุดข้อมูล CPUE แบบเปิดให้ใช้งาน"
      ),
    },
    {
      icon: Cpu,
      title: t("Multi-modal model training", "การฝึกโมเดลแบบหลายรูปแบบข้อมูล (multi-modal)"),
      detail: t(
        "Frozen EfficientNet-B0 + XGBoost, and LSTM + Ridge, fused via a stacking meta-learner.",
        "ใช้ EfficientNet-B0 (แบบ frozen) ร่วมกับ XGBoost และ LSTM ร่วมกับ Ridge แล้วผสานผลด้วย stacking meta-learner"
      ),
    },
    {
      icon: MapPinned,
      title: t("Spatial-block validation", "การตรวจสอบแบบแบ่งบล็อกเชิงพื้นที่ (spatial-block)"),
      detail: t(
        "Whole 1.5° blocks held out (not random points) to avoid spatial-autocorrelation leakage.",
        "กันบล็อกพื้นที่ขนาด 1.5 องศาทั้งบล็อกไว้เป็นชุดทดสอบ (ไม่ใช่สุ่มจุด) เพื่อป้องกันการรั่วไหลจาก spatial autocorrelation"
      ),
    },
    {
      icon: Lightbulb,
      title: t("Explainability", "ความสามารถในการอธิบายผล (Explainability)"),
      detail: t(
        "Real SHAP TreeExplainer values surfaced per-prediction and in aggregate.",
        "แสดงค่า SHAP TreeExplainer จริง ทั้งรายการทำนายแต่ละครั้งและภาพรวม"
      ),
    },
  ];

  const modelRows = metrics
    ? [
        { name: "XGBoost (env + image)", m: metrics.models.base_a_xgboost_env_image },
        { name: "Ridge (env + temporal)", m: metrics.models.base_b_ridge_env_temporal },
        { name: "Stacked Ensemble", m: metrics.models.stacked_ensemble, highlight: true },
      ]
    : [];

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeading
            eyebrow={t("Research", "งานวิจัย")}
            title={t("Methodology and honest evaluation", "ระเบียบวิธีวิจัยและการประเมินผลอย่างตรงไปตรงมา")}
            description={t(
              "Real metrics from the actual trained ensemble — including a genuinely underperforming baseline, reported as-is.",
              "ตัวชี้วัดจริงจากโมเดล ensemble ที่ฝึกขึ้นจริง รวมถึงโมเดลพื้นฐาน (baseline) ที่ให้ผลด้อยกว่าจริง ซึ่งรายงานไว้ตามความเป็นจริงโดยไม่ปิดบัง"
            )}
          />
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center font-heading text-xl font-semibold">
            {t("Methodology", "ระเบียบวิธีวิจัย")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-5">
            {METHODOLOGY_STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-4 text-center"
              >
                <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-accent">
                  <s.icon className="size-4.5" />
                </div>
                <p className="mt-3 text-xs font-semibold">{s.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MODEL COMPARISON */}
      <section className="bg-muted/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-center font-heading text-xl font-semibold">
            {t("Model Comparison", "การเปรียบเทียบโมเดล")}
          </h2>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {t(
              "Regression metrics against the HSI proxy label, held-out spatial-block test set.",
              "ตัวชี้วัดการถดถอย (regression) เทียบกับป้ายกำกับ HSI ทดแทน บนชุดทดสอบแบบแบ่งบล็อกเชิงพื้นที่ที่กันไว้"
            )}
          </p>
          {metrics ? (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-3">{t("Model", "โมเดล")}</th>
                    <th className="px-4 py-3">RMSE</th>
                    <th className="px-4 py-3">MAE</th>
                    <th className="px-4 py-3">R²</th>
                  </tr>
                </thead>
                <tbody>
                  {modelRows.map((row) => (
                    <tr
                      key={row.name}
                      className={`border-b border-border last:border-0 ${row.highlight ? "bg-accent/5 font-semibold" : ""}`}
                    >
                      <td className="px-4 py-3">{row.name}</td>
                      <td className="px-4 py-3">{row.m.rmse.toFixed(4)}</td>
                      <td className="px-4 py-3">{row.m.mae.toFixed(4)}</td>
                      <td className={`px-4 py-3 ${row.m.r2 < 0 ? "text-danger" : ""}`}>
                        {row.m.r2.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Skeleton className="h-40 rounded-2xl" />
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t(
              "The Ridge (env + temporal) baseline genuinely underperforms a mean-prediction baseline (negative R²) — reported honestly rather than hidden.",
              "โมเดลพื้นฐาน Ridge (env + temporal) ให้ผลด้อยกว่าการทำนายด้วยค่าเฉลี่ย (mean-prediction baseline) จริง ๆ (R² ติดลบ) ซึ่งรายงานไว้ตรงไปตรงมาแทนที่จะปิดบัง"
            )}
          </p>
        </div>
      </section>

      {/* EVALUATION METRICS */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center font-heading text-xl font-semibold">
            {t("Classification-Derived Evaluation", "การประเมินผลที่แปลงมาจากการจำแนกประเภท (Classification-Derived)")}
          </h2>
          {metrics ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-sm font-semibold">{t("Confusion Matrix", "เมทริกซ์ความสับสน")}</h3>
                <ConfusionMatrix
                  matrix={metrics.classification_derived.confusion_matrix}
                  labels={metrics.classification_derived.confusion_matrix_labels}
                />
                <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <p className="font-heading text-lg font-bold">
                      {metrics.classification_derived.precision.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">Precision</p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold">
                      {metrics.classification_derived.recall.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">Recall</p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold">
                      {metrics.classification_derived.f1.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">F1-score</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-sm font-semibold">
                  {t("ROC Curve", "กราฟ ROC")} (AUC = {metrics.classification_derived.roc_auc.toFixed(3)})
                </h3>
                <div className="h-56">
                  <Line
                    data={{
                      labels: metrics.classification_derived.roc_curve.fpr.map((f) => f.toFixed(2)),
                      datasets: [
                        {
                          label: "ROC",
                          data: metrics.classification_derived.roc_curve.tpr,
                          borderColor: "#00B4D8",
                          backgroundColor: "rgba(0,180,216,0.1)",
                          fill: true,
                          pointRadius: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { title: { display: true, text: t("False Positive Rate", "อัตราผลบวกลวง") } },
                        y: {
                          title: { display: true, text: t("True Positive Rate", "อัตราผลบวกจริง") },
                          min: 0,
                          max: 1,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Skeleton className="h-72 rounded-2xl" />
          )}

          <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/5 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" />
              <div className="text-xs leading-relaxed text-muted-foreground">
                {metrics?.data_caveats.map((c, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>
                    {c}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE IMPORTANCE */}
      <section className="bg-muted/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center font-heading text-xl font-semibold">
            {t("Feature Importance (real SHAP)", "ความสำคัญของฟีเจอร์ (SHAP จริง)")}
          </h2>
          {metrics ? (
            <div className="h-72 rounded-2xl border border-border bg-card p-6">
              <Bar
                data={{
                  labels: metrics.shap_feature_importance.slice(0, 8).map((f) => f.feature),
                  datasets: [
                    {
                      label: t("Mean |SHAP|", "ค่าเฉลี่ย |SHAP|"),
                      data: metrics.shap_feature_importance.slice(0, 8).map((f) => f.mean_abs_shap),
                      backgroundColor: "#0077B6",
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y" as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          ) : (
            <Skeleton className="h-72 rounded-2xl" />
          )}
        </div>
      </section>

      {/* LITERATURE REVIEW */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 flex items-center justify-center gap-2 text-center font-heading text-xl font-semibold">
            <BookOpen className="size-5 text-accent" />
            {t("Literature Review", "การทบทวนวรรณกรรม")}
          </h2>
          <div className="space-y-4">
            {REFERENCES.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="text-sm font-medium leading-relaxed">{r.citation}</p>
                <p className="mt-2 text-xs text-muted-foreground">{r.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
