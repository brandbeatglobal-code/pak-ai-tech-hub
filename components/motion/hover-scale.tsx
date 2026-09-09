"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type HoverScaleProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Wraps a button or link so it grows very slightly on hover, on top of
 * whatever colour or opacity hover the child already carries.
 *
 * Rendered as an inline-flex span so it hugs the child exactly and adds no
 * layout of its own. Scaling is skipped entirely under reduced motion.
 */
export function HoverScale({ children, className }: HoverScaleProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      className={`inline-flex ${className ?? ""}`}
      initial={false}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.span>
  );
}

export default HoverScale;
