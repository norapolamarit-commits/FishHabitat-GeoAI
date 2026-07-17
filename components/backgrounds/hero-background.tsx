"use client";

import { motion } from "framer-motion";
import { OceanParticles } from "./ocean-particles";
import { ScanningSatellite } from "./scanning-satellite";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#04101C]">
      {/* animated ocean gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,180,216,0.22), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 90%, rgba(0,119,182,0.25), transparent 60%), linear-gradient(180deg, #04101C 0%, #071B2C 55%, #0A2233 100%)",
        }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <ScanningSatellite />
      <OceanParticles />

      {/* animated ocean-surface waves at the base */}
      <div className="absolute inset-x-0 bottom-0 h-40 opacity-70">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,100 C 240,150 480,50 720,100 C 960,150 1200,50 1440,100 L1440,200 L0,200 Z"
            fill="rgba(0,180,216,0.12)"
            animate={{
              d: [
                "M0,100 C 240,150 480,50 720,100 C 960,150 1200,50 1440,100 L1440,200 L0,200 Z",
                "M0,110 C 240,60 480,150 720,110 C 960,60 1200,150 1440,110 L1440,200 L0,200 Z",
                "M0,100 C 240,150 480,50 720,100 C 960,150 1200,50 1440,100 L1440,200 L0,200 Z",
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,130 C 240,80 480,170 720,130 C 960,80 1200,170 1440,130 L1440,200 L0,200 Z"
            fill="rgba(10,61,98,0.5)"
            animate={{
              d: [
                "M0,130 C 240,80 480,170 720,130 C 960,80 1200,170 1440,130 L1440,200 L0,200 Z",
                "M0,120 C 240,170 480,80 720,120 C 960,170 1200,80 1440,120 L1440,200 L0,200 Z",
                "M0,130 C 240,80 480,170 720,130 C 960,80 1200,170 1440,130 L1440,200 L0,200 Z",
              ],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </div>
  );
}
