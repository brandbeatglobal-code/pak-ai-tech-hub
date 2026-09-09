"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type HoverLiftProps = {
  children: ReactNode;
  className?: string;
  /** Render as a list item when the parent is a `ul`/`ol`. */
  as?: "div" | "li";
  /** How far the card rises, in pixels. */
  distance?: number;
};

/**
 * Lifts a card slightly and deepens its shadow on hover and keyboard focus.
 *
 * Both `y` and `boxShadow` animate; neither affects layout, so hovering a card
 * never nudges its neighbours. Reduced motion drops the lift and keeps only
 * the shadow change, so the affordance survives without movement.
 */
export function HoverLift({
  children,
  className,
  as = "div",
  distance = 4,
}: HoverLiftProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = as === "li" ? motion.li : motion.div;

  const raised = {
    y: prefersReducedMotion ? 0 : -distance,
    boxShadow: "0 18px 40px -18px rgba(10, 20, 51, 0.28)",
  };

  return (
    <Component
      className={className}
      initial={false}
      whileHover={raised}
      whileFocus={raised}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </Component>
  );
}

export default HoverLift;
