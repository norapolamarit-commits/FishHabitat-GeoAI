"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Satellite,
  Waves,
  History,
  Layers,
  TrendingUp,
  GitMerge,
  Target,
  Lightbulb,
  MonitorSmartphone,
} from "lucide-react";
import { ArchNode, type ArchNodeData } from "./arch-node";
import { useT } from "@/lib/locale";

const nodeTypes = { archNode: ArchNode };

const edgeDefaults = {
  animated: true,
  type: "smoothstep" as const,
  markerEnd: { type: MarkerType.ArrowClosed, color: "#00B4D8" },
  style: { stroke: "#00B4D8", strokeWidth: 1.75 },
};

const edges: Edge[] = [
  { id: "e1", source: "satellite", target: "effnet", ...edgeDefaults },
  { id: "e2", source: "timeseries", target: "lstm", ...edgeDefaults },
  { id: "e3", source: "effnet", target: "modelA", ...edgeDefaults },
  { id: "e4", source: "ocean", target: "modelA", ...edgeDefaults },
  { id: "e5", source: "ocean", target: "modelB", ...edgeDefaults },
  { id: "e6", source: "lstm", target: "modelB", ...edgeDefaults },
  { id: "e7", source: "modelA", target: "meta", ...edgeDefaults },
  { id: "e8", source: "modelB", target: "meta", ...edgeDefaults },
  { id: "e9", source: "meta", target: "output", ...edgeDefaults },
  { id: "e10", source: "output", target: "shap", ...edgeDefaults },
  { id: "e11", source: "shap", target: "dashboard", ...edgeDefaults },
];

export function ArchitectureFlow() {
  const t = useT();
  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  const nodes: Node[] = useMemo(
    () => [
      {
        id: "satellite",
        type: "archNode",
        position: { x: 20, y: 0 },
        data: {
          icon: Satellite,
          title: t("Satellite Imagery", "ภาพถ่ายดาวเทียม"),
          subtitle: t(
            "Real NASA MODIS/VIIRS true-colour crops",
            "ภาพสีธรรมชาติ (true-colour) ตัดจากข้อมูลดาวเทียม NASA MODIS/VIIRS จริง"
          ),
          tone: "input",
        } satisfies ArchNodeData,
      },
      {
        id: "ocean",
        type: "archNode",
        position: { x: 340, y: 0 },
        data: {
          icon: Waves,
          title: t("Oceanographic Data", "ข้อมูลสมุทรศาสตร์"),
          subtitle: t(
            "SST, chlorophyll, salinity, bathymetry, wind, current",
            "SST คลอโรฟิลล์ ความเค็ม ความลึกท้องทะเล ลม กระแสน้ำ"
          ),
          tone: "input",
        } satisfies ArchNodeData,
      },
      {
        id: "timeseries",
        type: "archNode",
        position: { x: 660, y: 0 },
        data: {
          icon: History,
          title: t("Historical Time Series", "อนุกรมเวลาย้อนหลัง"),
          subtitle: t("Real daily SST history per station", "ประวัติ SST รายวันจริงต่อสถานี"),
          tone: "input",
        } satisfies ArchNodeData,
      },
      {
        id: "effnet",
        type: "archNode",
        position: { x: 20, y: 150 },
        data: {
          icon: Layers,
          title: t("EfficientNet-B0", "EfficientNet-B0"),
          subtitle: t("Frozen ImageNet feature extractor", "ตัวสกัดคุณลักษณะแบบ frozen ที่ฝึกจาก ImageNet"),
          tone: "extractor",
        } satisfies ArchNodeData,
      },
      {
        id: "lstm",
        type: "archNode",
        position: { x: 660, y: 150 },
        data: {
          icon: TrendingUp,
          title: t("LSTM", "LSTM"),
          subtitle: t(
            "Per-station temporal trend embedding",
            "embedding แนวโน้มเชิงเวลารายสถานี"
          ),
          tone: "extractor",
        } satisfies ArchNodeData,
      },
      {
        id: "modelA",
        type: "archNode",
        position: { x: 170, y: 320 },
        data: {
          icon: GitMerge,
          title: t("XGBoost — Model A", "XGBoost — โมเดล A"),
          subtitle: t("Env features + image embedding", "คุณลักษณะสิ่งแวดล้อม + embedding ภาพ"),
          tone: "model",
        } satisfies ArchNodeData,
      },
      {
        id: "modelB",
        type: "archNode",
        position: { x: 510, y: 320 },
        data: {
          icon: GitMerge,
          title: t("Ridge — Model B", "Ridge — โมเดล B"),
          subtitle: t("Env features + temporal embedding", "คุณลักษณะสิ่งแวดล้อม + embedding เชิงเวลา"),
          tone: "model",
        } satisfies ArchNodeData,
      },
      {
        id: "meta",
        type: "archNode",
        position: { x: 340, y: 480 },
        data: {
          icon: GitMerge,
          title: t("Stacking Meta-Learner", "ตัวรวมผลระดับเมตาแบบ Stacking"),
          subtitle: t(
            "Linear regression over both base models",
            "การถดถอยเชิงเส้นจากโมเดลฐานทั้งสอง"
          ),
          tone: "fusion",
        } satisfies ArchNodeData,
      },
      {
        id: "output",
        type: "archNode",
        position: { x: 340, y: 630 },
        data: {
          icon: Target,
          title: t("Suitability + Risk", "ความเหมาะสม + ความเสี่ยง"),
          subtitle: t(
            "Literature-proxy HSI + real wave/wind risk",
            "ดัชนี HSI อ้างอิงวรรณกรรม + ความเสี่ยงคลื่น/ลมจริง"
          ),
          tone: "output",
        } satisfies ArchNodeData,
      },
      {
        id: "shap",
        type: "archNode",
        position: { x: 340, y: 780 },
        data: {
          icon: Lightbulb,
          title: t("SHAP Explainability", "การอธิบายผลด้วย SHAP"),
          subtitle: t("Real per-feature attributions", "ค่าการมีส่วนร่วมรายฟีเจอร์ (attribution) ที่แท้จริง"),
          tone: "output",
        } satisfies ArchNodeData,
      },
      {
        id: "dashboard",
        type: "archNode",
        position: { x: 340, y: 930 },
        data: {
          icon: MonitorSmartphone,
          title: t("Interactive Dashboard", "แดชบอร์ดเชิงโต้ตอบ"),
          subtitle: t("Map, prediction, and analytics UI", "อินเทอร์เฟซแผนที่ การทำนาย และการวิเคราะห์ข้อมูล"),
          tone: "output",
        } satisfies ArchNodeData,
      },
    ],
    [t]
  );

  return (
    <div className="h-[900px] w-full rounded-3xl border border-border bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.4}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background gap={24} color="var(--border)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
