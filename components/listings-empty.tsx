import Link from "next/link";

import { siteCopy } from "@/content/site-copy";

const { emptyState } = siteCopy.marketplace.products;

/**
 * What a listing surface shows when it has nothing to list.
 *
 * One component for every surface — the /marketplace grid and the nav search
 * panel — so the launch message and its two actions are the
 * same wherever a visitor meets them. Copy: `marketplace.products.emptyState`.
 *
 *   "launch"   — nothing is listed anywhere yet.
 *   "category" — listings exist, none in the chosen category.
 *   "search"   — listings exist, none match what was typed.
 *
 * NOT for a failed read. When lib/listings.ts could not reach the database,
 * surfaces show `unavailableMessage` instead: "could not check" is not
 * "nothing listed", and this component would say the second.
 *
 * Both actions are plain links, deliberately not wrapped in `HoverScale`:
 * Motion gives that wrapper a tab stop of its own (CLAUDE.md §7 item 5), and
 * this would add two more.
 */
type EmptyVariant = {
  variant: "launch" | "category" | "search";
  /** The category's label, for the "category" variant. */
  category?: string;
  /** What was typed, for the "search" variant. */
  query?: string;
};

/**
 * The empty state's heading on its own — for the surfaces' polite live
 * regions, which would otherwise announce "0 products shown".
 */
export function listingsEmptyHeading({ variant, category, query }: EmptyVariant) {
  return variant === "category"
    ? emptyState.categoryHeading.replace("{category}", category ?? "")
    : variant === "search"
      ? emptyState.searchHeading.replace("{query}", query ?? "")
      : emptyState.heading;
}

export function ListingsEmpty({
  variant,
  category,
  query,
  compact = false,
}: EmptyVariant & {
  /** The nav search panel: smaller type, no card, a paragraph not a heading. */
  compact?: boolean;
}) {
  const heading = listingsEmptyHeading({ variant, category, query });
  const body =
    variant === "category"
      ? emptyState.categoryBody
      : variant === "search"
        ? emptyState.searchBody
        : emptyState.body;

  /* A heading on a page, where it stands in for the cards' own h3s; a
     paragraph inside the nav's popup, which has no heading structure. */
  const Heading = compact ? "p" : "h3";

  return (
    <div
      className={
        compact
          ? "px-4 py-4"
          : "rounded-3xl border border-dashed border-brand-navy/15 bg-white/70 px-6 py-12 text-center sm:px-10"
      }
    >
      {compact ? null : (
        <span
          aria-hidden
          className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue/20 to-brand-green/25"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-green" />
        </span>
      )}
      <Heading
        className={
          compact
            ? "text-sm font-bold text-brand-navy"
            : "text-xl font-bold tracking-tight text-brand-navy sm:text-2xl"
        }
      >
        {heading}
      </Heading>
      <p
        className={
          compact
            ? "mt-1 text-sm leading-relaxed text-brand-navy/70"
            : "mx-auto mt-3 max-w-xl leading-relaxed text-brand-navy/70"
        }
      >
        {body}
      </p>
      <div
        className={
          compact
            ? "mt-3 flex flex-wrap gap-2"
            : "mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
        }
      >
        <Link
          href={emptyState.listProduct.href}
          className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green font-semibold text-brand-navy transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
            compact ? "px-3.5 py-1.5 text-xs" : "px-6 py-3 text-base shadow-lg shadow-brand-blue/20"
          }`}
        >
          {emptyState.listProduct.label}
        </Link>
        <Link
          href={emptyState.tellUs.href}
          className={`inline-flex items-center justify-center rounded-full border border-brand-navy/15 bg-white font-semibold text-brand-navy transition-colors hover:border-brand-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
            compact ? "px-3.5 py-1.5 text-xs" : "px-6 py-3 text-base"
          }`}
        >
          {emptyState.tellUs.label}
        </Link>
      </div>
    </div>
  );
}

export default ListingsEmpty;
