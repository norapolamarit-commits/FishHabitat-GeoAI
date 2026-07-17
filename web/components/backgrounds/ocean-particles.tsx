"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    duration: 14 + Math.random() * 18,
    delay: Math.random() * -20,
    driftX: (Math.random() - 0.5) * 60,
  }));
}

export function OceanParticles({ count = 46 }: { count?: number }) {
  // Math.random() must not run during SSR — the server-rendered positions
  // would differ from the client's on hydration and React would flag a
  // mismatch. Particles are generated client-side only, after mount.
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles(count));
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-accent/50 dark:bg-accent/60"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, p.driftX, 0],
            opacity: [0.15, 0.7, 0.15],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
