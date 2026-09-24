"use client";

import { createContext, useContext, useId, useMemo, useRef, useState } from "react";

import { HoverLift } from "@/components/motion/hover-lift";
import { CategoryIcon } from "@/components/nav-icons";
import { browseCategories, siteCopy, type Listing } from "@/content/site-copy";
import {
  ALL_CATEGORIES,
  categoryLabelFor,
  searchProducts,
} from "@/lib/product-search";

const { nav, marketplace, categoryBrowse } = siteCopy;
const { search } = nav;
const { products } = marketplace;

/**
 * The homepage's browse experience: the hero search field, the category bar
 * under it, and the listings grid.
 *
 * They are three separate sections on the page but one piece of state, so they
 * live behind a small context rather than being lifted into `app/page.tsx`.
 * That keeps the page a server component — the headline, the subhead and every
 * other section still render on the server, and only these three controls ship
 * as client code.
 *
 * The filtering itself is shared with the nav's search field (see
 * lib/product-search.ts), so the two can never disagree about what matches.
 */

type BrowseState = {
  /**
   * The approved listings, read on the server by lib/listings.ts and passed
   * in by app/page.tsx; null when they could not be read.
   */
  listings: Listing[] | null;
  query: string;
  setQuery: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  /** Scrolls the listings into view, for the browse grid's category links. */
  focusListings: () => void;
  listingsRef: React.RefObject<HTMLDivElement | null>;
};

const BrowseContext = createContext<BrowseState | null>(null);

function useBrowse(): BrowseState {
  const value = useContext(BrowseContext);
  if (!value) {
    throw new Error("Browse components must be rendered inside <BrowseProvider>");
  }
  return value;
}

export function BrowseProvider({
  listings,
  children,
}: {
  listings: Listing[] | null;
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>(ALL_CATEGORIES);
  const listingsRef = useRef<HTMLDivElement | null>(null);

  const value = useMemo<BrowseState>(
    () => ({
      listings,
      query,
      setQuery,
      categoryId,
      setCategoryId,
      listingsRef,
      focusListings: () =>
        listingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    }),
    [listings, query, categoryId],
  );

  return <BrowseContext.Provider value={value}>{children}</BrowseContext.Provider>;
}

function SearchGlyph() {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className="h-5 w-5 shrink-0 text-brand-navy/45"
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
 * The hero's search field — the same control as the nav's, at hero size.
 *
 * It filters the listings on this page rather than opening a results dropdown:
 * the results are already on screen a scroll below, so a popup listing them
 * again would be a second, smaller copy of the grid.
 */
export function HeroSearch() {
  const { query, setQuery } = useBrowse();
  const uid = useId();
  const inputId = `${uid}-hero-search`;

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl">
      <label htmlFor={inputId} className="sr-only">
        {search.label}
      </label>
      {/*
        Not a submitting <form>. There is no search results page to submit to,
        and the filtering happens as you type — a submit button here would
        either do nothing or pretend to navigate somewhere that does not exist.
      */}
      <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3.5 shadow-lg shadow-brand-navy/5 transition-colors focus-within:border-brand-navy/40 focus-within:ring-2 focus-within:ring-brand-navy/15 sm:px-6 sm:py-4">
        <SearchGlyph />
        <input
          id={inputId}
          type="search"
          autoComplete="off"
          value={query}
          placeholder={search.placeholder}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full min-w-0 bg-transparent text-base text-brand-navy outline-none placeholder:text-brand-navy/45 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-brand-navy/65 transition-colors hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            {search.clear}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The horizontally scrolling category bar.
 *
 * All nine categories, including those with nothing listed yet. Selecting an
 * empty one shows the grid's empty message, which is the honest answer — the
 * category is real, no approved product is in it yet.
 *
 * A radio group rather than buttons: arrow keys move between options and the
 * group is one Tab stop, which is the behaviour a row of mutually exclusive
 * filters should have, and it is the same control the marketplace page's
 * filter already uses.
 */
export function CategoryBar() {
  const { categoryId, setCategoryId } = useBrowse();
  const groupName = useId();

  const options = [
    { id: ALL_CATEGORIES, label: search.allCategories },
    ...browseCategories,
  ];

  return (
    /*
      `relative` on this scroll container is load-bearing — without it the
      whole page scrolls sideways, by 732px at 390px wide.

      Each chip hides its radio with `sr-only`, which is `position: absolute`.
      An absolutely positioned box is only clipped by an ancestor's `overflow`
      if that ancestor is its containing block, and without a positioned
      ancestor these ten inputs resolved against something outside the scroll
      container — at their static position, which is as far right as the last
      chip, around x=1200. So they sat in the document's scrollable area and
      dragged the page out with them, invisibly: nothing painted in the
      overflow strip, the page just scrolled.

      That is also why no amount of `overflow: hidden` or `overflow-x: clip`
      helped, on this element or on any ancestor up to `body` — all of it was
      measured. Making this element their containing block is the fix.

      The <fieldset> sits inside the scroll container rather than around it so
      that it sizes to its content, which is what a scrolling row wants.
    */
    <div className="relative -mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <fieldset className="flex gap-2">
        <legend className="sr-only">{categoryBrowse.barLabel}</legend>
        {options.map((option) => {
          const isSelected = categoryId === option.id;
          return (
            <label
              key={option.id}
              className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy ${
                isSelected
                  ? "bg-brand-navy text-white"
                  : "bg-white text-brand-navy/65 ring-1 ring-black/5 ring-inset hover:text-brand-navy"
              }`}
            >
              <input
                type="radio"
                name={groupName}
                value={option.id}
                checked={isSelected}
                onChange={() => setCategoryId(option.id)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}

/**
 * The listings grid: the marketplace's approved products, filtered by the
 * hero search and the category bar.
 *
 * Every card carries a disabled "Coming soon" button. It is not decoration:
 * the listings are real, but there is no checkout, so nothing here can be
 * bought. Do not enable the button, and do not add a rating, a review count or
 * an add-to-cart control — there is no data behind any of them.
 */
export function ProductListings() {
  const { listings, query, categoryId, listingsRef } = useBrowse();

  const visible = useMemo(
    () => searchProducts(listings ?? [], { query, categoryId }),
    [listings, query, categoryId],
  );

  const countMessage =
    listings === null
      ? products.unavailableMessage
      : visible.length === 1
        ? products.resultCountOne
        : products.resultCountOther.replace("{count}", String(visible.length));

  return (
    <div ref={listingsRef} className="scroll-mt-40">
      {/* Polite, so filtering does not interrupt whatever is being read. */}
      <p aria-live="polite" className="sr-only">
        {countMessage}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brand-navy/15 bg-white/60 px-6 py-12 text-center text-brand-navy/65">
          {/* "Could not check" is not "nothing listed": say which one. */}
          {listings === null ? products.unavailableMessage : products.emptyMessage}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((product) => (
            <HoverLift
              key={product.id}
              as="li"
              distance={3}
              className="flex flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex w-fit rounded-full bg-brand-navy/[0.06] px-3 py-1 text-xs font-semibold text-brand-navy/65">
                {categoryLabelFor(product)}
              </span>

              {/* Not a link. Product pages do not exist, and the card's own
                  button already says it cannot be bought yet. */}
              <h3 className="mt-4 text-base leading-snug font-bold tracking-tight text-brand-navy">
                {product.name}
              </h3>

              {/* Who lists it — same line as the /marketplace card. */}
              <p className="mt-1 text-sm text-brand-navy/65">
                {products.byProvider.replace("{provider}", product.provider)}
              </p>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-navy/70">
                {product.description}
              </p>

              <p className="mt-5 text-sm font-bold text-brand-navy">
                {products.pricePrefix} {product.price}
              </p>

              <button
                type="button"
                disabled
                className="mt-4 w-full cursor-not-allowed rounded-full border border-black/10 bg-brand-navy/[0.04] px-4 py-2.5 text-sm font-semibold text-brand-navy/50"
              >
                {products.buyLabel}
              </button>
            </HoverLift>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * The category browse grid — the same nine categories as the bar, as icon and
 * name only.
 *
 * No product counts. Five of the nine would read "0" and three of the rest
 * "1", which says the marketplace is empty rather than that it is new.
 *
 * Each card selects that category in the bar above and scrolls the listings
 * back into view, so the grid is a way into the listings rather than a static
 * illustration of the taxonomy.
 */
export function CategoryGrid() {
  const { setCategoryId, focusListings } = useBrowse();

  return (
    <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {browseCategories.map((category) => (
        <HoverLift
          key={category.id}
          as="li"
          distance={3}
          className="rounded-2xl border border-black/5 bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => {
              setCategoryId(category.id);
              focusListings();
            }}
            className="flex w-full flex-col items-start gap-3 rounded-2xl p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            <span aria-hidden className="text-brand-navy/50">
              <CategoryIcon category={category.id} className="h-7 w-7" />
            </span>
            <span className="text-sm font-bold text-brand-navy">{category.label}</span>
          </button>
        </HoverLift>
      ))}
    </ul>
  );
}
