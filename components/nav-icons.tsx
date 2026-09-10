import type { ProductCategory } from "@/content/site-copy";

/**
 * Glyphs for the navigation dropdown rows.
 *
 * Stroke-only marks drawn on a shared 20×20 grid so they read as one set. All
 * decorative — each row's link text is its accessible name.
 */

/**
 * Keyed by `ProductCategory`, so adding a category to the marketplace forces a
 * glyph to be chosen for it here rather than silently rendering a blank row.
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
};

export function CategoryIcon({ category }: { category: ProductCategory }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className="h-5 w-5"
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
export function TierIcon({ step }: { step: number }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className="h-5 w-5"
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
