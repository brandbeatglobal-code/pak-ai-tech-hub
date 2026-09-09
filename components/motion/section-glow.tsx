"use client";

import { motion, useReducedMotion } from "motion/react";

type SectionGlowProps = {
  /** Which corner the pair of shapes leans toward. */
  placement?: "left" | "right";
};

/**
 * Two large, soft, low-opacity gradient shapes sitting behind a section.
 *
 * Purely decorative: gives a section visual depth beyond a flat background
 * colour without touching the content layout. Sits in an absolutely
 * positioned layer, so it never affects the flow of anything around it.
 */
export function SectionGlow({ placement = "left" }: SectionGlowProps) {
  const prefersReducedMotion = useReducedMotion();

  const shapes =
    placement === "left"
      ? [
          {
            className:
              "left-[-12%] top-[-25%] h-[30rem] w-[30rem] bg-[radial-gradient(circle_at_center,var(--color-brand-blue),transparent_70%)]",
            animate: { x: [0, 30, 0], y: [0, 24, 0] },
            duration: 34,
          },
          {
            className:
              "right-[-8%] bottom-[-30%] h-[26rem] w-[26rem] bg-[radial-gradient(circle_at_center,var(--color-brand-green),transparent_70%)]",
            animate: { x: [0, -24, 0], y: [0, -18, 0] },
            duration: 40,
          },
        ]
      : [
          {
            className:
              "right-[-12%] top-[-30%] h-[28rem] w-[28rem] bg-[radial-gradient(circle_at_center,var(--color-brand-green),transparent_70%)]",
            animate: { x: [0, -28, 0], y: [0, 20, 0] },
            duration: 36,
          },
          {
            className:
              "left-[-10%] bottom-[-25%] h-[24rem] w-[24rem] bg-[radial-gradient(circle_at_center,var(--color-brand-blue),transparent_72%)]",
            animate: { x: [0, 22, 0], y: [0, -16, 0] },
            duration: 44,
          },
        ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          data-motion-loop
          className={`absolute rounded-full opacity-[0.13] blur-3xl ${shape.className}`}
          animate={prefersReducedMotion ? undefined : shape.animate}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: shape.duration,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }
          }
          style={{ willChange: "transform" }}
        />
      ))}
    </div>
  );
}

export default SectionGlow;
