"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { useT } from "@/lib/locale";

const ArchitectureFlow = dynamic(
  () => import("@/components/ai-architecture/architecture-flow").then((m) => m.ArchitectureFlow),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[900px] items-center justify-center rounded-3xl border border-border bg-muted/20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export default function AiArchitecturePage() {
  const t = useT();

  const LEGEND = [
    { tone: "bg-secondary/20 border-secondary/40", label: t("Real input data", "ข้อมูลนำเข้าจริง") },
    { tone: "bg-accent/20 border-accent/40", label: t("Feature extractor", "ตัวสกัดคุณลักษณะ") },
    { tone: "bg-primary/20 border-primary/40", label: t("Base model", "โมเดลฐาน") },
    { tone: "bg-warning/20 border-warning/40", label: t("Fusion / stacking", "การผสานผล / stacking") },
    { tone: "bg-success/20 border-success/40", label: t("Output / explanation", "ผลลัพธ์ / คำอธิบาย") },
  ];

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeading
            eyebrow={t("AI Architecture", "สถาปัตยกรรม AI")}
            title={t("A real, dual-branch stacking ensemble", "stacking ensemble สองสาขาที่ใช้งานจริง")}
            description={t(
              "Every box below is a component that actually runs in this platform's backend — a frozen EfficientNet-B0 for imagery, real oceanographic tabular features, a real per-station LSTM for temporal trend, two base learners, a stacking meta-learner, and real SHAP explanations.",
              "แต่ละกล่องด้านล่างคือส่วนประกอบที่ทำงานจริงในระบบหลังบ้านของแพลตฟอร์มนี้ — EfficientNet-B0 แบบ frozen สำหรับภาพถ่าย ข้อมูลตารางสมุทรศาสตร์จริง LSTM รายสถานีจริงสำหรับแนวโน้มเชิงเวลา โมเดลฐานสองตัว ตัวรวมผลระดับเมตาแบบ stacking และคำอธิบายผลด้วย SHAP จริง"
            )}
          />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {LEGEND.map((l) => (
              <span
                key={l.label}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${l.tone}`}
              >
                <span className="size-2 rounded-full bg-current opacity-60" />
                {l.label}
              </span>
            ))}
          </div>

          <ArchitectureFlow />

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
            {t(
              "Drag to pan, scroll to zoom. The final suitability output is trained against a literature-derived Habitat Suitability Index proxy, not real catch data — see the",
              "ลากเพื่อเลื่อนมุมมอง เลื่อนล้อเมาส์เพื่อซูม ผลลัพธ์ความเหมาะสมสุดท้ายถูกฝึกด้วยดัชนี Habitat Suitability Index ที่อ้างอิงจากวรรณกรรม ไม่ใช่ข้อมูลการจับปลาจริง — ดูหน้า"
            )}{" "}
            <a href="/research" className="underline">
              {t("Research", "งานวิจัย")}
            </a>{" "}
            {t(
              "page for evaluation methodology and honest metrics.",
              "สำหรับระเบียบวิธีการประเมินผลและตัวชี้วัดที่เปิดเผยตามจริง"
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
