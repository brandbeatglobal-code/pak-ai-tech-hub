"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before this block starts revealing. Keep small. */
  delay?: number;
};

/**
 * Fades and slides a block into view the first time it enters the viewport.
 *
 * Only `opacity` and `transform` animate, so the element occupies its final
 * space from first paint and the reveal contributes nothing to CLS.
 *
 * Reduced motion is handled twice over:
 *  - `useReducedMotion` skips the transform and the animation entirely, so no
 *    work is scheduled for people who asked for less movement.
 *  - a `!important` rule on `[data-reveal]` in globals.css forces the final
 *    state regardless, which also covers the window before hydration.
 *
 * The same `data-reveal` hook is used by a `<noscript>` rule in the root
 * layout so the content is visible with JavaScript disabled.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div data-reveal className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
