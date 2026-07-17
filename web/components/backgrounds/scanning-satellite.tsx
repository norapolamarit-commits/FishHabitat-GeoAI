"use client";

import { motion } from "framer-motion";
import { Satellite } from "lucide-react";

export function ScanningSatellite() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Orbiting satellite along a wide arc */}
      <motion.div
        className="absolute left-0 top-[8%]"
        animate={{ left: ["-5%", "105%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute size-14 rounded-full bg-accent/20 blur-xl" />
          <Satellite className="relative size-6 rotate-45 text-accent drop-shadow-[0_0_8px_rgba(0,180,216,0.6)]" />
          {/* scanning beam sweeping down toward the "ocean" */}
          <motion.div
            className="absolute left-1/2 top-full h-[38vh] w-px origin-top -translate-x-1/2 bg-gradient-to-b from-accent/60 to-transparent"
            animate={{ opacity: [0.1, 0.5, 0.1], scaleY: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* Scientific grid overlay */}
      <div className="grid-overlay absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)]" />
    </div>
  );
}
