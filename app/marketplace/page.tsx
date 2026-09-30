import type { Metadata } from "next";
import Link from "next/link";

import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { HoverLift } from "@/components/motion/hover-lift";
import { Reveal } from "@/components/motion/reveal";
import { SectionGlow } from "@/components/motion/section-glow";
import { siteCopy, type SortOption } from "@/content/site-copy";
import { getListings } from "@/lib/listings";

const { marketplace, worksWith, whyPakai, academyTeaser } = siteCopy;

export const metadata: Metadata = {
  title: marketplace.meta.title,
  description: marketplace.meta.description,
};

/** The site's section headline treatment. */
const sectionHeading =
  "text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-display";

type Param = string | string[] | undefined;
const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

/**
 * `?category=<id>` preselects a chip — the nav's category rows and the
 * homepage's Categories view link here that way. Anything unrecognised falls
 * back to "all" rather than rendering an empty grid.
 */
function resolveCategory(value: Param) {
  const requested = first(value);
  const known = marketplace.products.categories.some(
    (category) => category.id === requested,
  );
  return known && requested ? requested : "all";
}

/** `?q=` — the homepage search and the nav's Enter land here. Capped, trimmed. */
function resolveQuery(value: Param) {
  return (first(value) ?? "").trim().slice(0, 100);
}

/** `?sort=` — one of the four orders, or the default. */
function resolveSort(value: Param): SortOption["id"] {
  const requested = first(value);
  return marketplace.products.sort.find((option) => option.id === requested)?.id ?? "newest";
}

/**
 * AI Solutions (/marketplace): title, search, category chips, the result
 * count and sort, the cards, and a "Have an AI challenge?" card — then the
 * partners, the reasons to buy here and the Academy teaser.
 */
export default async function MarketplacePage({
  searchParams,
}: PageProps<"/marketplace">) {
  const { hero, products, partners } = marketplace;
  const params = await searchParams;
  const initialCategory = resolveCategory(params.category);
  const initialQuery = resolveQuery(params.q);
  const initialSort = resolveSort(params.sort);
  /*
    The approved products, from the database (lib/listings.ts). Null when the
    database could not be read — the grid then says so rather than claiming
    every category is empty.
  */
  const listings = await getListings();

  return (
    <>
      {/* 1. Title, search, filters and results — one block. */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-14 pb-20 sm:px-6 sm:pt-16 lg:px-8">
          <h1 className="text-[2.5rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-brand-navy sm:text-display-lg">
            {hero.headline}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
            {hero.subhead}
          </p>
          {/* Says, above the grid, that nothing here can be bought yet —
              the listings are real, the checkout is not. */}
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-navy/65">
            {products.intro}
          </p>
          {/*
            Keyed on what the address asked for, so arriving from the nav
            (a category row, or the search's Enter) while already on this
            page starts from the new values. Changes made on the page are
            written back to the address by the browser itself and do not
            remount it.
          */}
          <MarketplaceBrowser
            key={`${initialCategory}|${initialQuery}|${initialSort}`}
            listings={listings}
            initialQuery={initialQuery}
            initialCategory={initialCategory}
            initialSort={initialSort}
          />
        </div>
      </section>

      {/* 2. Marketplace partners — only confirmed partners get a name. */}
      <section className="relative isolate border-y border-black/5 bg-brand-navy/[0.02]">
        <SectionGlow placement="right" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className={sectionHeading}>{partners.heading}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
              {partners.intro}
            </p>
            <ul className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {worksWith.items.map((item, index) => (
                <HoverLift
                  key={item.name ?? `pending-${index}`}
                  as="li"
                  distance={3}
                  className="rounded-lg border-t border-black/10 px-3 pt-6 pb-4"
                >
                  {item.confirmed && item.name ? (
                    <>
                      <h3 className="text-lg font-bold tracking-tight text-brand-navy">
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
                          >
                            {item.name}
                          </a>
                        ) : (
                          item.name
                        )}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-brand-navy/70">
                        {item.description}
                      </p>
                    </>
                  ) : (
                    /* Unconfirmed partner slot — keep the descriptive label, do
                       not substitute a brand name until the partnership is
                       confirmed. */
                    <>
                      <h3 className="text-lg font-bold tracking-tight text-brand-navy/65">
                        {item.description}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-brand-navy/65">
                        {worksWith.pendingLabel}
                      </p>
                    </>
                  )}
                </HoverLift>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 3. Why PAK AI TechHub — moved here from the old long homepage. */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className={sectionHeading}>{whyPakai.heading}</h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyPakai.cards.map((card) => (
              <HoverLift
                key={card.headline}
                as="li"
                className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm"
              >
                <h3 className="text-xl font-bold tracking-tight text-brand-navy">
                  {card.headline}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-brand-navy/70">{card.body}</p>
              </HoverLift>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* 4. Academy teaser — moved here from the old long homepage. */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                {academyTeaser.heading}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-brand-navy/70">
                {academyTeaser.body}
              </p>
            </div>
            <Link
              href={academyTeaser.cta.href}
              className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 lg:self-center"
            >
              {academyTeaser.cta.label}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
