import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface ArchNodeData {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tone: "input" | "extractor" | "model" | "fusion" | "output";
  [key: string]: unknown;
}

const TONE_STYLES: Record<ArchNodeData["tone"], string> = {
  input: "border-secondary/40 bg-secondary/10 text-secondary dark:text-accent",
  extractor: "border-accent/40 bg-accent/10 text-accent",
  model: "border-primary/40 bg-primary/10 text-primary dark:text-accent",
  fusion: "border-warning/40 bg-warning/10 text-warning",
  output: "border-success/40 bg-success/10 text-success",
};

export function ArchNode({ data }: NodeProps & { data: ArchNodeData }) {
  const Icon = data.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`w-56 rounded-2xl border-2 bg-card px-4 py-3 shadow-sm ${TONE_STYLES[data.tone]}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background/60">
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold text-foreground">
            {data.title}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{data.subtitle}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
    </motion.div>
  );
}
