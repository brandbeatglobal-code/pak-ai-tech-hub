"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { HoverLift } from "@/components/motion/hover-lift";
import type { CategoryFilter, Product } from "@/content/site-copy";

type MarketplaceProductsProps = {
  products: Product[];
  categories: CategoryFilter[];
  labels: {
    filterLegend: string;
    trainingBadge: string;
    emptyMessage: string;
    resultCountOne: string;
    resultCountOther: string;
  };
};

/**
 * Category filter plus the product grid.
 *
 * Client component only because the selected category is local state — all
 * eight products are known at build time, so nothing is fetched.
 *
 * The filter is a native radio group in a `fieldset`. That buys the full
 * keyboard contract for free — arrow keys move between options, Tab enters and
 * leaves the group as one stop — and screen readers announce each option as a
 * radio with its checked state. Custom ARIA would have to reimplement all of
 * that, so it is deliberately avoided here.
 */
export function MarketplaceProducts({
  products,
  categories,
  labels,
}: MarketplaceProductsProps) {
  const [selected, setSelected] = useState<string>("all");
  const groupName = useId();

  const visible = useMemo(
    () =>
      selected === "all"
        ? products
        : products.filter((product) => product.category === selected),
    [products, selected],
  );

  const categoryLabels = useMemo(
    () => new Map(categories.map((category) => [category.id, category.label])),
    [categories],
  );

  const countMessage =
    visible.length === 1
      ? labels.resultCountOne
      : labels.resultCountOther.replace("{count}", String(visible.length));

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[13rem_1fr] lg:gap-12">
      {/*
        Sidebar on large screens; above the grid as a wrapping pill row on
        narrow ones. One control either way — the layout changes, the markup
        does not, so there is no duplicated state to keep in sync.
      */}
      <fieldset className="lg:sticky lg:top-24 lg:self-start">
        <legend className="mb-4 text-sm font-bold tracking-tight text-brand-navy">
          {labels.filterLegend}
        </legend>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
          {categories.map((category) => {
            const isSelected = selected === category.id;
            return (
              <label
                key={category.id}
                /*
                  The radio itself is visually hidden, so the focus ring has to
                  live on the label. It is drawn as a navy outline sitting
                  outside the pill: navy on the page background clears the 3:1
                  that WCAG 2.2 asks of a focus indicator, and the offset keeps
                  it legible over the filled navy pill of the selected option
                  too. `has-[:focus-visible]` keeps it to keyboard focus, so
                  clicking a pill with a mouse does not leave a ring behind.
                */
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy lg:rounded-lg ${
                  isSelected
                    ? "bg-brand-navy text-white"
                    : "bg-white text-brand-navy/65 ring-1 ring-black/5 ring-inset hover:text-brand-navy"
                }`}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={category.id}
                  checked={isSelected}
                  onChange={() => setSelected(category.id)}
                  className="sr-only"
                />
                {category.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        {/* Polite, so filtering does not interrupt whatever is being read. */}
        <p aria-live="polite" className="sr-only">
          {countMessage}
        </p>

        {visible.length === 0 ? (
          <p className="text-brand-navy/65">{labels.emptyMessage}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((product) => (
              <HoverLift
                key={product.id}
                as="li"
                distance={3}
                className="relative flex flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
              >
                <span className="inline-flex w-fit rounded-full bg-brand-navy/[0.06] px-3 py-1 text-xs font-semibold text-brand-navy/65">
                  {categoryLabels.get(product.category) ?? product.category}
                </span>

                <h3 className="mt-4 text-lg font-bold tracking-tight text-brand-navy">
                  {/*
                    Stretched link: the whole card is clickable, but there is
                    still exactly one link per card and its accessible name is
                    the product name. Individual product pages do not exist
                    yet, so this points at "#".
                  */}
                  <Link
                    href={product.href}
                    className="after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                  >
                    {product.name}
                  </Link>
                </h3>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-navy/70">
                  {product.description}
                </p>

                <p className="mt-5 text-sm font-bold text-brand-navy">{product.price}</p>

                <p className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-navy/65">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-brand-blue to-brand-green"
                  />
                  {labels.trainingBadge}
                </p>
              </HoverLift>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MarketplaceProducts;
