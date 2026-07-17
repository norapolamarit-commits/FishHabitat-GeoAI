"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { OceanParticles } from "./ocean-particles";

/**
 * Hero background using the real reference illustration (not an animated
 * recreation) on the left, matching the exact visual the user provided.
 */
export function HeroImageBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#04101C]">
      {/* real illustration, left panel only, desktop */}
      <div className="absolute inset-y-0 left-0 hidden w-[40%] lg:block">
        <Image
          src="/hero-illustration.jpg"
          alt="Satellite and oceanographic data network over a coastal fishing region"
          fill
          priority
          sizes="40vw"
          className="object-cover"
        />
      </div>

      {/* ambient gradient, strongest on the right where the text sits */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 85% 10%, rgba(0,180,216,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 90%, rgba(0,119,182,0.2), transparent 60%), linear-gradient(90deg, transparent 38%, #04101C 42%)",
        }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* particles confined to the right (text) side so they don't clutter the real photo */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
        <OceanParticles count={28} />
      </div>
    </div>
  );
}
