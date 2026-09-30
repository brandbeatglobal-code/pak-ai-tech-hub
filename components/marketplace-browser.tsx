"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";

import { ListingsEmpty, listingsEmptyHeading } from "@/components/listings-empty";
import { SearchGlyph } from "@/components/nav-icons";
import { siteCopy, type Listing, type SortOption } from "@/content/site-copy";
import { ALL_CATEGORIES, categoryLabelFor, searchProducts } from "@/lib/product-search";

const { products } = siteCopy.marketplace;

type SortId = SortOption["id"];

/**
 * The AI Solutions page's browser: search box, category chips, the result
 * heading with its count and the sort, the cards, and the "Have an AI
 * challenge?" card.
 *
 * One piece of client state — query, category, sort — over the listings the
 * page read on the server (lib/listings.ts). Matching is lib/product-search.ts,
 * the same function the nav's search runs, so the two agree about what
 * matches.
 *
 * THE URL CARRIES THE STATE. It starts from `?q=`, `?category=` and `?sort=`
 * (resolved and checked by the page), and every change is written back with
 * `history.replaceState` — replace, not push, so typing a word does not leave
 * a Back step per letter. A filtered view can be shared or reloaded. Next.js
 * syncs native history calls with its router, so nothing else is disturbed.
 *
 * Filters are only for what the table stores: category, name, description,
 * provider and price. Deployment type, maturity and capabilities are not
 * stored, so there are no filters for them.
 */
export function MarketplaceBrowser({
  listings,
  initialQuery,
  initialCategory,
  initialSort,
}: {
  /** Null when the listings could not be read — shown as that, not as empty. */
  listings: Listing[] | null;
  initialQuery: string;
  initialCategory: string;
  initialSort: SortId;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [sort, setSort] = useState<SortId>(initialSort);
  const uid = useId();

  /* Write the state back to the address bar, leaving defaults out. */
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (categoryId !== ALL_CATEGORIES) params.set("category", categoryId);
    if (sort !== "newest") params.set("sort", sort);
    const search = params.toString();
    const next = `${window.location.pathname}${search ? `?${search}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [query, categoryId, sort]);

  const visible = useMemo(() => {
    const matched = searchProducts(listings ?? [], { query, categoryId });
    /* Source order is newest first (lib/listings.ts); the rest re-sort a copy. */
    if (sort === "price-asc") return [...matched].sort((a, b) => a.priceValue - b.priceValue);
    if (sort === "price-desc") return [...matched].sort((a, b) => b.priceValue - a.priceValue);
    if (sort === "name") return [...matched].sort((a, b) => a.name.localeCompare(b.name));
    return matched;
  }, [listings, query, categoryId, sort]);

  const chips = products.categories;
  const categoryLabel =
    chips.find((category) => category.id === categoryId)?.label ?? products.allLabel;
  const resultLabel = categoryId === ALL_CATEGORIES ? products.allLabel : categoryLabel;

  /* Which empty state applies, when one does — shown below and announced. */
  const empty =
    listings === null || visible.length > 0
      ? null
      : listings.length === 0
        ? ({ variant: "launch" } as const)
        : query.trim()
          ? ({ variant: "search", query: query.trim() } as const)
          : ({ variant: "category", category: categoryLabel } as const);

  const found = products.foundCount.replace("{count}", String(visible.length));
  const announcement =
    listings === null
      ? products.unavailableMessage
      : empty
        ? listingsEmptyHeading(empty)
        : `${resultLabel} – ${found}`;

  return (
    <div>
      {/* Search. Filters as you type; Enter does nothing more, so it is not a
          submitting form (the homepage's search is the one that submits
          here). */}
      <div className="mt-8 max-w-2xl">
        <label htmlFor={`${uid}-q`} className="sr-only">
          {products.searchLabel}
        </label>
        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 shadow-lg shadow-brand-navy/5 transition-colors focus-within:border-brand-navy/40 focus-within:ring-2 focus-within:ring-brand-navy/15">
          <SearchGlyph className="h-5 w-5" />
          <input
            id={`${uid}-q`}
            type="search"
            autoComplete="off"
            value={query}
            placeholder={products.searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full min-w-0 bg-transparent text-base text-brand-navy outline-none placeholder:text-brand-navy/45 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-full px-2 py-1 text-sm font-semibold text-brand-navy/65 transition-colors hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              {siteCopy.nav.search.clear}
            </button>
          ) : null}
        </div>
      </div>

      {/*
        Category chips: a native radio group, so arrow keys move between
        options and the group is one Tab stop. The radios are visually hidden
        and the label is the chip, so the focus ring lives on the label.

        `relative` on the wrapper is load-bearing: it is the containing block
        for the `sr-only` radios (position: absolute). Without one, they
        resolve against something outside and drag the page sideways on a
        phone — the bug the homepage's old category bar had.
      */}
      <fieldset className="relative mt-6">
        <legend className="sr-only">{products.filterLegend}</legend>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const selected = categoryId === chip.id;
            return (
              <label
                key={chip.id}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy ${
                  selected
                    ? "bg-brand-navy text-white"
                    : "bg-white text-brand-navy/70 ring-1 ring-black/10 ring-inset hover:text-brand-navy"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-category`}
                  value={chip.id}
                  checked={selected}
                  onChange={() => setCategoryId(chip.id)}
                  className="sr-only"
                />
                {chip.id === ALL_CATEGORIES ? products.allLabel : chip.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Result heading, count and sort. */}
      <div className="mt-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-black/5 pb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
          {resultLabel}
          {/* No "0 found": an empty result says so in the empty state below. */}
          {listings !== null && visible.length > 0 ? (
            <span className="font-semibold text-brand-navy/60"> – {found}</span>
          ) : null}
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor={`${uid}-sort`} className="text-sm font-medium text-brand-navy/70">
            {products.sortLabel}
          </label>
          <select
            id={`${uid}-sort`}
            value={sort}
            onChange={(event) => setSort(event.target.value as SortId)}
            className="cursor-pointer rounded-full border border-black/10 bg-white py-2 pr-3 pl-4 text-sm font-semibold text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            {products.sort.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Polite, so filtering does not interrupt whatever is being read. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="mt-6">
        {listings === null ? (
          /* "Could not check" is not "nothing listed": say which one. */
          <p className="rounded-3xl border border-dashed border-brand-navy/15 bg-white/60 px-6 py-12 text-center text-brand-navy/65">
            {products.unavailableMessage}
          </p>
        ) : empty ? (
          <ListingsEmpty {...empty} />
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <li
                key={product.id}
                className="relative flex flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="inline-flex w-fit rounded-full bg-brand-navy/[0.06] px-3 py-1 text-xs font-semibold text-brand-navy/70">
                  {categoryLabelFor(product)}
                </span>

                <h3 className="mt-4 text-lg leading-snug font-bold tracking-tight text-brand-navy">
                  {/*
                    Stretched link: the whole card is clickable, with one link
                    per card named by the product. Product pages do not exist
                    yet, so it points at "#".
                  */}
                  <Link
                    href={product.href}
                    className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                  >
                    {product.name}
                  </Link>
                </h3>

                <p className="mt-1 text-sm font-medium text-brand-navy/65">
                  {products.byProvider.replace("{provider}", product.provider)}
                </p>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-navy/70">
                  {product.description}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-4">
                  <p className="text-sm font-bold text-brand-navy">
                    {products.pricePrefix} {product.price}
                  </p>
                  {/*
                    Disabled on every card: there is no checkout, so no listing
                    can be bought yet. `relative z-10` lifts it above the
                    stretched link, so pressing it does nothing rather than
                    following the card's "#" link.
                  */}
                  <button
                    type="button"
                    disabled
                    className="relative z-10 cursor-not-allowed rounded-full border border-black/10 bg-brand-navy/[0.04] px-4 py-2 text-sm font-semibold text-brand-navy/60"
                  >
                    {products.buyLabel}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* The static card: always here, after whatever the results are. */}
      <div className="mt-8 flex flex-col gap-5 rounded-3xl bg-brand-navy p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {products.challenge.heading}
          </h2>
          <p className="mt-2 leading-relaxed text-white/75">{products.challenge.body}</p>
        </div>
        <Link
          href={products.challenge.cta.href}
          className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-gradient-to-r from-brand-blue to-brand-green px-6 py-3 text-base font-semibold text-brand-navy transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:self-center"
        >
          {products.challenge.cta.label}
        </Link>
      </div>
    </div>
  );
}

export default MarketplaceBrowser;
