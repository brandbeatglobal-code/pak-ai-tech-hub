"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";

import type { OfferingTab } from "@/content/site-copy";

type OfferingTabsProps = {
  tabs: OfferingTab[];
};

/**
 * Tabbed offering section. Client component because it holds selection state.
 *
 * Follows the WAI-ARIA tabs pattern: one tab stop for the whole tablist, with
 * left/right/home/end moving between tabs.
 *
 * Only the visible panel is mounted, and it keeps its `role="tabpanel"` and
 * `aria-labelledby` throughout the crossfade, so what a screen reader sees is
 * exactly what it saw before the animation was added. The panels are stacked
 * in a grid cell rather than positioned absolutely, so the outgoing and
 * incoming panels overlap during the crossfade without the section collapsing
 * to zero height mid-transition.
 */
export function OfferingTabs({ tabs }: OfferingTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const prefersReducedMotion = useReducedMotion();

  function focusTab(index: number) {
    const next = (index + tabs.length) % tabs.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;
      default:
        break;
    }
  }

  const activeTab = tabs[activeIndex];

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label="What you get with PAKAI TechHub"
        className="flex flex-wrap gap-x-2 border-b border-black/10 pb-px"
      >
        {tabs.map((tab, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`relative -mb-px shrink-0 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                selected ? "text-brand-navy" : "text-brand-navy/65 hover:text-brand-navy"
              }`}
            >
              {tab.label}
              {/* The underline slides between tabs instead of cutting. */}
              {selected ? (
                <motion.span
                  layoutId="offering-tab-underline"
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-green"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                  }
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/*
        A single grid cell holds every panel state. During the crossfade the
        outgoing and incoming panels sit in the same cell, so the container
        height is driven by the taller of the two rather than collapsing.
      */}
      <div className="grid grid-cols-1 grid-rows-1">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeTab.id}
            role="tabpanel"
            id={`panel-${activeTab.id}`}
            aria-labelledby={`tab-${activeTab.id}`}
            tabIndex={0}
            className="col-start-1 row-start-1 rounded-b-2xl bg-white px-1 py-10 sm:px-2"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.26, ease: "easeOut" }}
          >
            <h3 className="max-w-2xl text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
              {activeTab.headline}
            </h3>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
              {activeTab.body}
            </p>
            <motion.span initial={false} whileHover="hover" className="mt-6 inline-flex">
              <Link
                href={activeTab.link.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
              >
                {activeTab.link.label}
                <motion.span
                  aria-hidden
                  variants={{ hover: { x: prefersReducedMotion ? 0 : 4 } }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  &rarr;
                </motion.span>
              </Link>
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OfferingTabs;
