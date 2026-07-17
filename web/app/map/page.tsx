"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const FishingMap = dynamic(
  () => import("@/components/map/fishing-map").then((m) => m.FishingMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[#04101C] text-white/60">
        <Loader2 className="size-6 animate-spin" />
      </div>
    ),
  }
);

export default function MapPage() {
  return <FishingMap />;
}
