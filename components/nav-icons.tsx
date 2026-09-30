import type { ProductCategory } from "@/content/site-copy";

/**
 * Glyphs for the navigation dropdown rows and the category browse grid.
 *
 * Stroke-only marks drawn on a shared 20×20 grid so they read as one set. All
 * decorative — each row's link text is its accessible name.
 */

/**
 * Keyed by `ProductCategory` — the eight categories in
 * `marketplace.products.categories`.
 *
 * The exhaustive `Record` is the point: adding a category fails the build
 * here until a glyph is chosen for it, rather than silently rendering a blank
 * mark in the browse grid. A zero-length path (`h.01`) draws a dot, because
 * the round line cap gives it the stroke's width.
 */
const CATEGORY_PATHS: Record<ProductCategory, React.ReactNode> = {
  "cross-industry": (
    <>
      <path d="M10 2.5 17.5 6.5 10 10.5 2.5 6.5Z" />
      <path d="M2.5 10 10 14l7.5-4" />
      <path d="M2.5 13.5 10 17.5l7.5-4" />
    </>
  ),
  healthcare: <path d="M2 10.5h4L8 6l3.5 8.5 2-4H18" />,
  agriculture: (
    <>
      <path d="M4.5 15.5Q4.5 4.5 16 4.5 16 15.5 4.5 15.5Z" />
      <path d="M16 4.5 3 17.5" />
    </>
  ),
  education: (
    <>
      <path d="M10 3.5 18.5 7.5 10 11.5 1.5 7.5Z" />
      <path d="M5 9.6v4.2c0 1.3 2.2 2.4 5 2.4s5-1.1 5-2.4V9.6" />
    </>
  ),
  retail: (
    <>
      <path d="M9.4 2.5H3a.5.5 0 0 0-.5.5v6.4L11 17.9l6.9-6.9Z" />
      <circle cx="6.3" cy="6.3" r="1.2" />
    </>
  ),
  /* Speech bubble with a typing row, for chatbots. */
  chatbots: (
    <>
      <path d="M4 3.5h12A1.5 1.5 0 0 1 17.5 5v7a1.5 1.5 0 0 1-1.5 1.5H9.5L5.5 17v-3.5H4A1.5 1.5 0 0 1 2.5 12V5A1.5 1.5 0 0 1 4 3.5Z" />
      <path d="M6.5 8.5h.01M10 8.5h.01M13.5 8.5h.01" />
    </>
  ),
  /* Robot head with an antenna, for AI agents. */
  "ai-agents": (
    <>
      <path d="M5 7.5h10A1.5 1.5 0 0 1 16.5 9v6A1.5 1.5 0 0 1 15 16.5H5A1.5 1.5 0 0 1 3.5 15V9A1.5 1.5 0 0 1 5 7.5Z" />
      <path d="M10 7.5v-3M10 3h.01" />
      <path d="M7.5 11.5h.01M12.5 11.5h.01M8 14h4" />
    </>
  ),
  /* Microphone on a stand, for AI voice agents. */
  "ai-voice-agents": (
    <>
      <path d="M10 2.5A2.5 2.5 0 0 1 12.5 5v4.5a2.5 2.5 0 0 1-5 0V5A2.5 2.5 0 0 1 10 2.5Z" />
      <path d="M4.5 9.5a5.5 5.5 0 0 0 11 0" />
      <path d="M10 15v2.5M7.5 17.5h5" />
    </>
  ),
};

export function CategoryIcon({
  category,
  className = "h-5 w-5",
}: {
  category: ProductCategory;
  /** Sized up in the browse grid, where the glyph leads the card. */
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {CATEGORY_PATHS[category]}
    </svg>
  );
}

/**
 * Magnifier for the search fields — the nav's and the homepage's. Sized by
 * the caller; drawn on the same 20×20 grid as the category glyphs.
 */
export function SearchGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className={`shrink-0 text-brand-navy/45 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.2 13.2 3.3 3.3" />
    </svg>
  );
}

/** Bar count in the tier glyph — one per training tier. */
const BARS = 5;

/**
 * Five ascending bars with the first `step` filled, so the dropdown shows a
 * tier's position in the ladder at a glance. Reads the number straight off the
 * tier data rather than needing five hand-drawn icons.
 */
export function TierIcon({
  step,
  className = "h-5 w-5",
}: {
  step: number;
  /** Sized up when the glyph carries a featured card rather than a row. */
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className={className}
      fill="currentColor"
    >
      {Array.from({ length: BARS }, (_, index) => {
        const height = 4 + index * 2.6;
        return (
          <rect
            key={index}
            x={2 + index * 3.5}
            y={17.5 - height}
            width="2.4"
            height={height}
            rx="1.2"
            opacity={index < step ? 1 : 0.25}
          />
        );
      })}
    </svg>
  );
}
