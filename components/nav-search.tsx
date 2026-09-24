"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { siteCopy, type Listing } from "@/content/site-copy";
import {
  ALL_CATEGORIES,
  categoryLabelFor,
  resultHref,
  searchCategoryOptions,
  searchProducts,
} from "@/lib/product-search";

const { nav, marketplace } = siteCopy;
const { search } = nav;

/** How many matches the dropdown shows before it stops listing them. */
const MAX_RESULTS = 6;

function SearchGlyph() {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0 text-brand-navy/45"
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

/**
 * The marketplace search in the nav bar.
 *
 * A real filter over the marketplace's approved listings, not a decorative
 * field. `listings` is the same read the grid on /marketplace renders
 * (lib/listings.ts), passed down by the root layout; the matching is shared
 * with the hero's search (see lib/product-search.ts) so the two controls
 * always agree.
 *
 * There is no search results page, so a result points at the marketplace
 * filtered to that listing's category — the nearest destination that actually
 * exists. The field is deliberately not wrapped in a submitting `<form>`:
 * there is nowhere for a submit to go, and a field that looks like it submits
 * but discards the query is worse than one that plainly filters as you type.
 *
 * The listbox follows the ARIA combobox pattern: the input owns
 * `aria-expanded`/`aria-controls`/`aria-activedescendant`, the results are
 * `role="option"` inside a `role="listbox"`, and Up/Down/Enter/Escape behave
 * the way they do in a native picker. Results are still real links, so they
 * can be clicked, middle-clicked and opened in a new tab as usual.
 *
 * Filtering needs JavaScript. The listings themselves are server-rendered on
 * the homepage and the marketplace, so nothing is hidden behind this — without
 * scripting the field simply does not narrow anything.
 */
export function NavSearch({
  listings,
  className = "",
}: {
  /** Null when the listings could not be read — the panel then says so. */
  listings: Listing[] | null;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>(ALL_CATEGORIES);
  const [open, setOpen] = useState(false);
  /** Index of the result the keyboard is on, or -1 for "still in the field". */
  const [activeIndex, setActiveIndex] = useState(-1);

  const uid = useId();
  const inputId = `${uid}-query`;
  const listboxId = `${uid}-results`;
  const optionId = (index: number) => `${uid}-result-${index}`;

  const rootRef = useRef<HTMLDivElement>(null);

  const results = searchProducts(listings ?? [], { query, categoryId }).slice(
    0,
    MAX_RESULTS,
  );
  /* "Could not check" is not "nothing matches": say which one it is. */
  const emptyMessage =
    listings === null
      ? marketplace.products.unavailableMessage
      : search.noResults.replace("{query}", query);
  const showPanel = open && query.trim().length > 0;

  /* A click outside the control dismisses the results, like any other popup. */
  useEffect(() => {
    if (!showPanel) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showPanel]);

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showPanel || results.length === 0) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        const next = current + step;
        if (next < 0) return results.length - 1;
        if (next >= results.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      /* Let the highlighted result's link handle the navigation itself. */
      event.preventDefault();
      document.getElementById(optionId(activeIndex))?.click();
    }
  }

  const countMessage =
    results.length === 1
      ? search.resultCountOne
      : search.resultCountOther.replace("{count}", String(results.length));

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="flex items-center rounded-full border border-black/10 bg-white shadow-sm transition-colors focus-within:border-brand-navy/40 focus-within:ring-2 focus-within:ring-brand-navy/15">
        {/*
          Category first, matching the order of the sentence the control reads
          as: "in <category>, find <query>". Hidden on the narrowest screens,
          where the field itself needs the whole width — the homepage's
          category bar is the full-width way to narrow by category there.
        */}
        <label htmlFor={`${uid}-category`} className="sr-only">
          {search.categoryLabel}
        </label>
        <select
          id={`${uid}-category`}
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="hidden max-w-36 shrink-0 cursor-pointer rounded-l-full border-r border-black/10 bg-transparent py-2 pr-2 pl-4 text-sm font-medium text-brand-navy/70 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-navy sm:block"
        >
          <option value={ALL_CATEGORIES}>{search.allCategories}</option>
          {searchCategoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>

        <span className="pl-3.5 sm:pl-3">
          <SearchGlyph />
        </span>

        <label htmlFor={inputId} className="sr-only">
          {search.label}
        </label>
        <input
          id={inputId}
          type="search"
          role="combobox"
          autoComplete="off"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          value={query}
          placeholder={search.placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full min-w-0 bg-transparent py-2 pr-4 pl-2 text-sm text-brand-navy outline-none placeholder:text-brand-navy/45 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      {showPanel ? (
        <div className="absolute top-full right-0 left-0 z-10 mt-2 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
          {/* Polite: typing should not interrupt whatever is being read. */}
          <p aria-live="polite" className="sr-only">
            {results.length === 0 ? emptyMessage : countMessage}
          </p>

          {results.length === 0 ? (
            <p className="px-4 py-3.5 text-sm text-brand-navy/65">{emptyMessage}</p>
          ) : (
            <ul id={listboxId} role="listbox" aria-label={search.resultsLabel}>
              {results.map((product, index) => (
                <li key={product.id} role="presentation">
                  <Link
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === activeIndex}
                    href={resultHref(product)}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex items-baseline justify-between gap-3 px-4 py-3 text-sm transition-colors ${
                      index === activeIndex ? "bg-brand-navy/[0.06]" : ""
                    }`}
                  >
                    {/*
                      The "Example" badge sits with the name, as it does on
                      the grid cards, and only on example listings (decided
                      once in lib/listings.ts). Beside the name rather than the
                      category so that, in the narrow panel on a phone, it
                      wraps under the name instead of squeezing it.
                    */}
                    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-brand-navy">{product.name}</span>
                      {product.example ? (
                        <span className="rounded-full border border-dashed border-brand-navy/30 px-2 py-0.5 text-xs font-semibold text-brand-navy/65">
                          {marketplace.products.exampleBadge}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-xs text-brand-navy/60">
                      {categoryLabelFor(product)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/*
            The listings are real but not purchasable — there is no checkout —
            so the panel says so rather than letting a tidy result list imply
            a working catalogue. Same sentence as the listings intro.
          */}
          <p className="border-t border-black/5 bg-brand-navy/[0.02] px-4 py-2.5 text-xs text-brand-navy/60">
            {marketplace.products.searchFootnote}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default NavSearch;
