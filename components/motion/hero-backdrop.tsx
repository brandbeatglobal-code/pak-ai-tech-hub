"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Slow animated gradient mesh behind the hero.
 *
 * Three soft blobs in the brand blue/green drift and breathe on long, offset
 * loops. Only `transform` and `opacity` animate, so the whole thing stays on
 * the compositor and never triggers layout or paint.
 *
 * This is a stand-in for a produced video background. Opacity is kept low
 * enough that the navy headline over it stays fully legible.
 *
 * With `prefers-reduced-motion: reduce` the blobs render in their resting
 * position and nothing animates.
 */
export function HeroBackdrop() {
  const prefersReducedMotion = useReducedMotion();

  const blobs = [
    {
      className:
        "left-[-10%] top-[-30%] h-[36rem] w-[36rem] bg-[radial-gradient(circle_at_center,var(--color-brand-blue),transparent_70%)]",
      animate: { x: [0, 60, -20, 0], y: [0, 30, 60, 0], scale: [1, 1.08, 0.96, 1] },
      duration: 26,
    },
    {
      className:
        "right-[-15%] top-[-20%] h-[32rem] w-[32rem] bg-[radial-gradient(circle_at_center,var(--color-brand-green),transparent_70%)]",
      animate: { x: [0, -50, 20, 0], y: [0, 40, -20, 0], scale: [1, 0.94, 1.1, 1] },
      duration: 32,
    },
    {
      className:
        "left-[30%] top-[10%] h-[28rem] w-[28rem] bg-[radial-gradient(circle_at_center,var(--color-brand-blue),transparent_75%)]",
      animate: { x: [0, 40, -40, 0], y: [0, -30, 20, 0], scale: [1, 1.12, 0.98, 1] },
      duration: 38,
    },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          data-motion-loop
          className={`absolute rounded-full opacity-45 blur-3xl ${blob.className}`}
          animate={prefersReducedMotion ? undefined : blob.animate}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: blob.duration,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }
          }
          style={{ willChange: "transform" }}
        />
      ))}
      {/* Wash over the mesh so text contrast stays constant as the blobs move. */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/45 to-white" />
    </div>
  );
}

export default HeroBackdrop;
