import type { Metadata } from "next";
import Link from "next/link";

import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { HoverScale } from "@/components/motion/hover-scale";
import { Reveal } from "@/components/motion/reveal";
import { SectionGlow } from "@/components/motion/section-glow";
import { siteCopy } from "@/content/site-copy";

const { pricing, marketplace } = siteCopy;

export const metadata: Metadata = {
  title: pricing.meta.title,
  description: pricing.meta.description,
};

/** Matches the homepage section headline treatment. */
const sectionHeading =
  "text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-display";

/** Small check mark. Decorative — every row is labelled in text for AT. */
function CheckMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="h-5 w-5 shrink-0 text-brand-green"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export default function PricingPage() {
  const { hero, included, table, biggerNeeds, closingCta } = pricing;

  /*
   * Rows come from the marketplace product list — the same array the
   * marketplace page renders. Nothing about a product is restated here, so the
   * two pages cannot quote different names, categories or prices.
   */
  const categoryLabels = new Map(
    marketplace.products.categories.map((category) => [category.id, category.label]),
  );
  const rows = marketplace.products.items.map((product) => ({
    id: product.id,
    name: product.name,
    category: categoryLabels.get(product.category) ?? product.category,
    price: product.price,
  }));

  return (
    <>
      {/* 1. Hero */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal className="max-w-3xl">
            <h1 className="text-[2.75rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-brand-navy sm:text-display-lg lg:text-display-xl">
              {hero.headline}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-brand-navy/70 sm:text-xl">
              {hero.subhead}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <HoverScale>
                <Link
                  href={hero.primaryCta.href}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green px-6 py-3 text-base font-semibold text-brand-navy shadow-lg shadow-brand-blue/20 transition-opacity hover:opacity-90"
                >
                  {hero.primaryCta.label}
                </Link>
              </HoverScale>
              <HoverScale>
                <Link
                  href={hero.secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-full border border-brand-navy/15 bg-white/70 px-6 py-3 text-base font-semibold text-brand-navy backdrop-blur transition-colors hover:border-brand-navy/40"
                >
                  {hero.secondaryCta.label}
                </Link>
              </HoverScale>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. What's included */}
      <section className="border-y border-black/5 bg-brand-navy/[0.02]">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-sm font-semibold tracking-wide text-brand-navy/65 uppercase">
              {included.heading}
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3 md:gap-10">
              {included.items.map((item) => (
                <li key={item.label} className="flex gap-3">
                  <CheckMark />
                  <span>
                    <span className="block font-bold text-brand-navy">{item.label}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-brand-navy/70">
                      {item.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 3. Pricing table */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className={sectionHeading}>{table.heading}</h2>

          {/*
            Two renderings of the same `rows` array. Only one is ever in the
            layout — and because the other is display:none, only one is in the
            accessibility tree too. A real <table> from md up; stacked labelled
            blocks below that, so a 4-column table never has to scroll
            sideways on a phone.
          */}
          <table className="mt-10 hidden w-full border-collapse text-left md:table">
            <caption className="caption-bottom pt-6 text-left text-sm text-brand-navy/65">
              {table.caption}
            </caption>
            <thead>
              <tr className="border-b border-black/10">
                <th scope="col" className="py-3 pr-4 text-sm font-bold text-brand-navy">
                  {table.columns.product}
                </th>
                <th scope="col" className="py-3 pr-4 text-sm font-bold text-brand-navy">
                  {table.columns.category}
                </th>
                <th scope="col" className="py-3 pr-4 text-sm font-bold text-brand-navy">
                  {table.columns.price}
                </th>
                <th scope="col" className="py-3 text-sm font-bold text-brand-navy">
                  {table.columns.training}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-black/5">
                  <th
                    scope="row"
                    className="py-4 pr-4 text-base font-bold text-brand-navy"
                  >
                    {row.name}
                  </th>
                  <td className="py-4 pr-4">
                    <span className="inline-flex rounded-full bg-brand-navy/[0.06] px-3 py-1 text-xs font-semibold text-brand-navy/65">
                      {row.category}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-base font-bold text-brand-navy">
                    {row.price}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-2">
                      <CheckMark />
                      <span className="sr-only">{table.trainingIncludedLabel}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile: one labelled block per product, no sideways scroll. */}
          <ul className="mt-10 space-y-4 md:hidden">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
              >
                <h3 className="text-base font-bold text-brand-navy">{row.name}</h3>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-brand-navy/65">{table.columns.category}</dt>
                    <dd>
                      <span className="inline-flex rounded-full bg-brand-navy/[0.06] px-3 py-1 text-xs font-semibold text-brand-navy/65">
                        {row.category}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-brand-navy/65">{table.columns.price}</dt>
                    <dd className="font-bold text-brand-navy">{row.price}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-brand-navy/65">{table.columns.training}</dt>
                    <dd className="flex items-center gap-1.5 font-semibold text-brand-navy">
                      <CheckMark />
                      {table.trainingIncludedLabel}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-brand-navy/65 md:hidden">{table.caption}</p>
        </Reveal>
      </section>

      {/* 4. Bigger needs — a routing statement, not a quote. */}
      <section className="relative isolate border-y border-black/5 bg-brand-navy/[0.02]">
        <SectionGlow placement="right" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-lg leading-relaxed text-brand-navy">
                {biggerNeeds.body}
              </p>
              <HoverScale>
                <Link
                  href={biggerNeeds.cta.href}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-brand-navy/15 bg-white px-6 py-3 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy/40"
                >
                  {biggerNeeds.cta.label}
                </Link>
              </HoverScale>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. Closing CTA */}
      <section className="bg-gradient-to-r from-brand-blue to-brand-green">
        <Reveal>
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:px-8">
            <h2 className={`max-w-2xl ${sectionHeading}`}>{closingCta.heading}</h2>
            <HoverScale>
              <Link
                href={closingCta.cta.href}
                className="inline-flex items-center justify-center rounded-full bg-brand-navy px-8 py-3 text-base font-semibold text-white shadow-lg shadow-brand-navy/20 transition-opacity hover:opacity-90"
              >
                {closingCta.cta.label}
              </Link>
            </HoverScale>
          </div>
        </Reveal>
      </section>
    </>
  );
}
