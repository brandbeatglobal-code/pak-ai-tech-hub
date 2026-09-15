import type { BrowseCategoryId } from "@/content/site-copy";

/**
 * Glyphs for the navigation dropdown rows and the category browse grid.
 *
 * Stroke-only marks drawn on a shared 20×20 grid so they read as one set. All
 * decorative — each row's link text is its accessible name.
 */

/**
 * Keyed by `BrowseCategoryId`, which covers every `ProductCategory` plus the
 * industries that have no product yet.
 *
 * The exhaustive `Record` is the point: adding an industry to the taxonomy
 * fails the build here until a glyph is chosen for it, rather than silently
 * rendering a blank mark in the browse grid.
 */
const CATEGORY_PATHS: Record<BrowseCategoryId, React.ReactNode> = {
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
  /* Columned facade, for banking. */
  "banking-finance": (
    <>
      <path d="M2.5 7.5 10 3.5l7.5 4" />
      <path d="M4.5 7.5v7M8.2 7.5v7M11.8 7.5v7M15.5 7.5v7" />
      <path d="M2.5 16.5h15" />
    </>
  ),
  /* Plant and stack, for manufacturing. */
  manufacturing: (
    <>
      <path d="M2.5 16.5v-7l4.5 3v-3l4.5 3v-3l5 3v4Z" />
      <path d="M13.5 9.5v-6h3v6" />
    </>
  ),
  /* Box van, for logistics. */
  logistics: (
    <>
      <path d="M1.5 5.5h9v8h-9Z" />
      <path d="M10.5 8.5h3.6l2.9 3v2h-6.5Z" />
      <circle cx="5" cy="15" r="1.6" />
      <circle cx="13.5" cy="15" r="1.6" />
    </>
  ),
  /* House with a key line, for real estate. */
  "real-estate": (
    <>
      <path d="M2.5 9 10 3l7.5 6" />
      <path d="M4.5 10.5v6h11v-6" />
      <path d="M8.5 16.5v-4h3v4" />
    </>
  ),
};

export function CategoryIcon({
  category,
  className = "h-5 w-5",
}: {
  category: BrowseCategoryId;
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
