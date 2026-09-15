"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useId, useState } from "react";

import { HoverScale } from "@/components/motion/hover-scale";
import { Reveal } from "@/components/motion/reveal";
import type { HowItWorksSide } from "@/content/site-copy";

/**
 * "How it works", as two columns of expandable steps.
 *
 * Each step is a real `<button>` carrying `aria-expanded` and `aria-controls`,
 * so it opens on click, on Enter and on Space, and a screen reader announces
 * its state. Deliberately NOT hover-driven: hover excludes touch entirely and
 * gives keyboard users nothing, and a detail line that only some people can
 * reach is worse than one nobody can.
 *
 * Not an accordion either. Opening one step never closes another — there is no
 * reason these should compete, and "click this, lose that" is the usual
 * complaint about accordions. The first step of each column starts open so the
 * section says something before anyone touches it.
 *
 * The connecting line between the circles is drawn per step rather than as one
 * full-height rule, so it stretches with a step as that step expands instead of
 * being measured once and going wrong.
 */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 12 12"
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
    </svg>
  );
}

export function HowItWorks({ sides }: { sides: HowItWorksSide[] }) {
  const prefersReducedMotion = useReducedMotion();
  const uid = useId();

  /*
    Open steps, keyed "<side>-<number>". A set rather than one "active" value
    because any number of steps may be open at once.

    Seeded with the first step of every column, which is also what the server
    renders — so the default-open panel is at its full height in the first
    paint and expanding it contributes nothing to CLS.
  */
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(sides.map((side) => `${side.id}-${side.steps[0]?.number}`)),
  );

  function toggle(key: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }

  return (
    <div className="mt-12 grid gap-5 lg:grid-cols-2">
      {sides.map((side) => (
        <div
          key={side.id}
          className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10"
        >
          <h3 className="text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
            {side.title}
          </h3>

          <ol className="mt-7">
            {side.steps.map((step, index) => {
              const key = `${side.id}-${step.number}`;
              const panelId = `${uid}-${key}`;
              const isOpen = open.has(key);
              const isLast = index === side.steps.length - 1;

              return (
                /*
                  `pb-5` rather than a gap on the <ol>: the connector below is
                  positioned against this <li>, so the space between steps has
                  to be inside it for the line to reach the next circle.
                */
                <li key={key} className="relative pb-5 last:pb-0">
                  {/*
                    The connecting line, from just under this circle to the top
                    of the next one. Every step but the last gets one.

                    It animates in with `Reveal`, the same scroll trigger the
                    rest of the page uses — the positioning lives on the Reveal
                    wrapper so no second element is needed. A draw-on-scroll
                    effect would have meant a second scroll-trigger mechanism
                    alongside this one, which is exactly what this reuses
                    instead of adding.
                  */}
                  {isLast ? null : (
                    <Reveal
                      delay={index * 0.06}
                      /*
                        `top-9` is the circle's own height, so the line starts
                        exactly at its bottom edge and bridges the whole gap to
                        the next one. Starting lower left a dead space that made
                        two collapsed steps in a row look unconnected.
                      */
                      className="pointer-events-none absolute top-9 bottom-0 left-[1.125rem] w-px -translate-x-1/2"
                    >
                      {/*
                        Even weight top to bottom. A gradient that faded out
                        vanished on the short segments between two collapsed
                        steps while staying visible on expanded ones, so the
                        line looked inconsistent down the column.
                      */}
                      <span
                        aria-hidden
                        className="block h-full w-full bg-gradient-to-b from-brand-blue/40 to-brand-green/40"
                      />
                    </Reveal>
                  )}

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(key)}
                    className="group flex w-full items-center gap-4 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
                  >
                    {/*
                      Decorative: the <ol> already conveys the ordering, so the
                      digit would only repeat it into the button's name. The
                      accessible name is the step title alone.
                    */}
                    <span
                      aria-hidden
                      className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green text-sm font-bold text-brand-navy"
                    >
                      {step.number}
                    </span>
                    <span className="flex-1 text-lg font-semibold text-brand-navy">
                      {step.title}
                    </span>
                    <span className="text-brand-navy/50 transition-colors group-hover:text-brand-navy">
                      <Chevron open={isOpen} />
                    </span>
                  </button>

                  {/*
                    `initial={false}` on AnimatePresence: the step that starts
                    open must not animate its height on first paint, or the
                    section would shift as the page loads.
                  */}
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="panel"
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.24,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        {/* Indented to clear the circle, so the detail reads as
                            belonging to its step rather than to the column. */}
                        <p className="pt-2 pl-13 text-sm leading-relaxed text-brand-navy/70">
                          {step.detail}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>

          {/*
            The action each column ends on.

            Outside the <ol> — it is not a step, and putting it inside would
            number it as one. `mt-8` sits it clear of the last step whether
            that step is open or closed; because it follows the list in normal
            flow rather than being positioned against it, a step expanding just
            pushes it down, which costs no layout shift of its own.

            The provider button is the gradient primary, identical to the one
            in the provider band further down the page — the same action
            should not look like two different offers. The buyer button is the
            outline secondary used for "Talk to us" elsewhere, minus that
            style's `bg-white/70 backdrop-blur`, which exists to sit on the
            gradient hero backdrop and buys nothing on an opaque white card.
          */}
          <HoverScale className="mt-8 inline-block">
            <Link
              href={side.cta.href}
              className={
                side.id === "providers"
                  ? "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green px-6 py-3 text-base font-semibold text-brand-navy shadow-lg shadow-brand-blue/20 transition-opacity hover:opacity-90"
                  : "inline-flex items-center justify-center rounded-full border border-brand-navy/15 px-6 py-3 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy/40"
              }
            >
              {side.cta.label}
            </Link>
          </HoverScale>
        </div>
      ))}
    </div>
  );
}

export default HowItWorks;
