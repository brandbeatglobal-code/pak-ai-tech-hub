"use client";

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
 */
export function OfferingTabs({ tabs }: OfferingTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
              className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                selected
                  ? "border-brand-green text-brand-navy"
                  : "border-transparent text-brand-navy/50 hover:text-brand-navy"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
          className="rounded-b-2xl bg-white px-1 py-10 sm:px-2"
        >
          <h3 className="max-w-2xl text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
            {tab.headline}
          </h3>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
            {tab.body}
          </p>
          <Link
            href={tab.link.href}
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-navy underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
          >
            {tab.link.label}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default OfferingTabs;
