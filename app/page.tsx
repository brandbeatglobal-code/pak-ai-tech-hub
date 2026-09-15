import Link from "next/link";

import {
  BrowseProvider,
  CategoryBar,
  CategoryGrid,
  ExampleListings,
  HeroSearch,
} from "@/components/home-browse";
import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { HoverLift } from "@/components/motion/hover-lift";
import { HoverScale } from "@/components/motion/hover-scale";
import { Reveal } from "@/components/motion/reveal";
import { SectionGlow } from "@/components/motion/section-glow";
import { OfferingTabs } from "@/components/offering-tabs";
import { FlagshipArt } from "@/components/visuals/flagship-art";
import { SkylineArt } from "@/components/visuals/skyline-art";
import { siteCopy } from "@/content/site-copy";

/** Shared heading treatment, so every section headline carries the same weight. */
const sectionHeading =
  "text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-display";

/**
 * Section rhythm.
 *
 * Wider than the previous py-20 so each block sits in its own space rather
 * than running into the next — the main thing the reference layout gets from
 * generous vertical air. Scales down on small screens so the page does not
 * become a long scroll of padding on a phone.
 */
const sectionPad = "px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32";
const container = `mx-auto w-full max-w-6xl ${sectionPad}`;

export default function Home() {
  const {
    nav,
    hero,
    trustStrip,
    marketplace,
    flagship,
    howItWorks,
    providerCta,
    categoryBrowse,
    offering,
    whyPakai,
    worksWith,
    founder,
    resources,
    academyTeaser,
    finalCta,
  } = siteCopy;

  return (
    /*
      Search, the category bar and the listings grid are three sections apart
      on the page but one selection, so they share a context rather than being
      three separate widgets that each remember their own filter. Everything
      inside that is not one of those three still renders on the server.
    */
    <BrowseProvider>
      {/* 1. Hero — headline, subhead, and the search field that leads the page */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop />
        {/* Shorter than it was: the category bar and the first row of listings
            are meant to be reachable without scrolling far, which is the whole
            point of leading with search. */}
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <Reveal className="mx-auto max-w-4xl text-center">
            <h1 className="text-[2.75rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-brand-navy sm:text-display-lg lg:text-display-xl">
              {hero.headline}
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-brand-navy/70 sm:text-xl">
              {hero.subhead}
            </p>
            <HeroSearch />
            {/* Restates the trial terms already on /pricing — not a new claim. */}
            <p className="mt-5 text-sm text-brand-navy/65">{hero.reassurance}</p>
          </Reveal>
        </div>
      </section>

      {/* 2. Category bar and the example listings it filters */}
      {/*
        One section, not two. The bar is the grid's control — separating them
        with the page's usual section padding would put a band of white space
        between a filter and the thing it filters.
      */}
      <section
        id="example-listings"
        className="scroll-mt-40 border-t border-black/5 bg-brand-navy/[0.02]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <CategoryBar />
          <div className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                {marketplace.products.heading}
              </h2>
              <Link
                href="/marketplace"
                className="text-sm font-semibold text-brand-navy underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
              >
                {nav.menus.marketplace.viewAll} &rarr;
              </Link>
            </div>
            <p className="mt-3 max-w-2xl leading-relaxed text-brand-navy/70">
              {marketplace.products.intro}
            </p>
            <div className="mt-8">
              <ExampleListings />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust strip */}
      <section
        aria-label="Why PAKAI TechHub"
        className="border-y border-black/5 bg-brand-navy/[0.02]"
      >
        <Reveal>
          <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-4 px-4 py-7 sm:px-6 lg:grid-cols-4 lg:px-8">
            {trustStrip.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-brand-navy/80"
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-brand-blue to-brand-green"
                />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* 4. How it works, split by which side of the marketplace you are on */}
      {/*
        /marketplace links here as /#how-it-works, and so does the flagship
        banner below. scroll-mt clears the two-row sticky nav so the heading is
        not hidden behind it on arrival.

        Two columns, because a marketplace has two journeys and the page used
        to describe only the buyer's. The provider column ends on the
        commission split, which is the one settled economic term the
        marketplace has — see the note on `howItWorks` for what not to add.
      */}
      <section
        id="how-it-works"
        className="relative isolate scroll-mt-40 border-y border-black/5 bg-brand-navy/[0.02]"
      >
        <SectionGlow placement="left" />
        <div className={`relative ${container}`}>
          <Reveal>
            <h2 className={sectionHeading}>{howItWorks.heading}</h2>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {howItWorks.sides.map((side) => (
                <div
                  key={side.id}
                  className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10"
                >
                  <h3 className="text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
                    {side.title}
                  </h3>
                  <ol className="mt-7 space-y-5">
                    {side.steps.map((step) => (
                      <li key={step.number} className="flex items-center gap-4">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green text-sm font-bold text-brand-navy">
                          {step.number}
                        </span>
                        <span className="text-lg font-semibold text-brand-navy">
                          {step.title}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. Provider recruitment */}
      {/*
        The supply side's own band. The commission sentence is the same 80/20
        split the provider column above ends on — if one changes, both change.
      */}
      <section className={container}>
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
              <h2 className={sectionHeading}>{providerCta.heading}</h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-navy/70">
                {providerCta.body}
              </p>
              <HoverScale className="mt-9 inline-block">
                <Link
                  href={providerCta.cta.href}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green px-6 py-3 text-base font-semibold text-brand-navy shadow-lg shadow-brand-blue/20 transition-opacity hover:opacity-90"
                >
                  {providerCta.cta.label}
                </Link>
              </HoverScale>
            </div>

            {/*
              Illustration, not a photograph — see the note in
              components/visuals/skyline-art.tsx for why, and for what to do
              when a licensed stock photo is available. The caption stays
              generic either way.
            */}
            <figure className="flex flex-col">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-black/5 sm:aspect-[16/9] lg:aspect-auto lg:min-h-56 lg:flex-1">
                <SkylineArt className="h-full w-full" />
              </div>
              <figcaption className="mt-3 text-sm text-brand-navy/65">
                {providerCta.figureCaption}
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </section>

      {/* 6. Browse by category — the same nine categories as the bar above */}
      <section className="border-y border-black/5 bg-brand-navy/[0.02]">
        <div className={container}>
          <Reveal>
            <h2 className={sectionHeading}>{categoryBrowse.heading}</h2>
            <CategoryGrid />
          </Reveal>
        </div>
      </section>

      {/* 7. Flagship platform banner */}
      {/*
        Full-width dark band introducing the platform as a whole. The three-up
        row underneath is rendered from `offering.tabs` and links down to that
        section, so the banner previews what is on the platform without
        restating it.
      */}
      <section className="relative isolate overflow-hidden bg-brand-navy">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <Reveal>
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-brand-green uppercase">
                  {flagship.eyebrow}
                </p>
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-display">
                  {flagship.headline}
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                  {flagship.body}
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <HoverScale>
                    <Link
                      href={flagship.primaryCta.href}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green px-6 py-3 text-base font-semibold text-brand-navy transition-opacity hover:opacity-90"
                    >
                      {flagship.primaryCta.label}
                    </Link>
                  </HoverScale>
                  <HoverScale>
                    <Link
                      href={flagship.secondaryCta.href}
                      className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white/60"
                    >
                      {flagship.secondaryCta.label}
                    </Link>
                  </HoverScale>
                </div>
              </div>

              {/* Generated artwork, extending the hero's gradient mesh into a
                  single form. Decorative — see visuals/flagship-art.tsx.
                  Capped below lg: stacked under the text it would otherwise
                  run to the full column width and swamp the banner. */}
              <FlagshipArt className="mx-auto h-auto w-full max-w-sm lg:max-w-none" />
            </div>

            <div className="mt-16 border-t border-white/10 pt-10">
              <h3 className="sr-only">{flagship.linksLabel}</h3>
              <ul className="grid gap-8 sm:grid-cols-3 sm:gap-10">
                {offering.tabs.map((tab) => (
                  <li key={tab.id}>
                    <Link href="#what-you-get" className="group block">
                      <span className="flex items-center gap-2 text-base font-bold text-white">
                        {tab.label}
                        <span
                          aria-hidden
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        >
                          &rarr;
                        </span>
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-white/70">
                        {tab.headline}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/*
        REMOVED: the dark stat bar ("8 products", "8 industries", "24/7
        support"). See the note where `stats` used to be in site-copy.ts —
        every number available today counts placeholder data, so the section
        went rather than being restated with different figures. Do not
        reinstate it with invented metrics.
      */}

      {/* 8. Tabbed offering */}
      {/* The flagship banner's three-up row links here. scroll-mt clears the
          two-row sticky nav so the heading is not hidden behind it. */}
      <section id="what-you-get" className={`scroll-mt-40 ${container}`}>
        <Reveal>
          <h2 className={sectionHeading}>{offering.heading}</h2>
          <OfferingTabs tabs={offering.tabs} />
        </Reveal>
      </section>

      {/* 9. Why PAKAI TechHub */}
      <section className="relative isolate border-y border-black/5 bg-brand-navy/[0.02]">
        <SectionGlow placement="left" />
        <div className={`relative ${container}`}>
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
                  <p className="mt-4 text-sm leading-relaxed text-brand-navy/70">
                    {card.body}
                  </p>
                </HoverLift>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/*
        REMOVED: the "Industries we cover" grid.

        It listed the same eight industries the category browse grid above now
        shows, four of them with a description and four bare, which read as an
        unfinished list. The browse grid shows all nine consistently and, being
        a control rather than a display, takes you to the listings in that
        category. The industry descriptions are still in site-copy.ts — see the
        note on `industries` for what they are kept for.
      */}

      {/* 10. Works with */}
      <section className="relative isolate border-y border-black/5 bg-brand-navy/[0.02]">
        <SectionGlow placement="right" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-sm font-semibold tracking-wide text-brand-navy/65 uppercase">
              {worksWith.heading}
            </h2>
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

      {/* 11. Founder */}
      <section className={container}>
        <Reveal>
          <h2 className={sectionHeading}>{founder.heading}</h2>
          {/*
            Deliberately lighter than the founder card on /about: no initials
            mark, smaller type, plain shadow. The about page is where the team
            is introduced properly — this is a summary that points there.
          */}
          <article className="mt-12 max-w-3xl rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
            <h3 className="text-xl font-bold tracking-tight text-brand-navy">
              {founder.name}
            </h3>
            <p className="mt-1 text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
              {founder.title}
            </p>
            <p className="mt-5 leading-relaxed text-brand-navy/70">{founder.bio}</p>
          </article>
        </Reveal>
      </section>

      {/* 12. Resources */}
      {/*
        Honest empty state. Each card shows only the kind of resource the slot
        will hold — no headline, author, date or thumbnail, because no article
        exists yet. Do not dress these up as real posts.
      */}
      <section className="border-y border-black/5 bg-brand-navy/[0.02]">
        <div className={container}>
          <Reveal>
            <h2 className={sectionHeading}>{resources.heading}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
              {resources.intro}
            </p>
            {/* One featured slot beside two smaller ones, matching the
                reference's insights band. Still an empty state — the shape
                changed, the honesty did not. */}
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
              {resources.slots.map((slot, index) => {
                const featured = index === 0;
                return (
                  <li
                    key={slot.category}
                    className={`flex flex-col rounded-3xl border border-dashed border-brand-navy/15 bg-white/60 p-8 ${
                      featured ? "sm:col-span-2 lg:row-span-2" : ""
                    }`}
                  >
                    {/* Decorative placeholder where a cover image will sit. */}
                    <span
                      aria-hidden
                      className={`block rounded-2xl bg-gradient-to-br from-brand-blue/10 to-brand-green/10 ${
                        featured ? "min-h-44 flex-1" : "h-28"
                      }`}
                    />
                    <h3 className="mt-6 text-sm font-bold tracking-wide text-brand-navy uppercase">
                      {slot.category}
                    </h3>
                    <p className="mt-2 text-sm text-brand-navy/65">
                      {resources.comingSoonLabel}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 13. Closing pair — academy teaser and final CTA, side by side */}
      {/* The reference closes on two cards rather than one full-bleed band;
          the gradient moves onto the right-hand card so the page still ends
          on the brand colours. */}
      <section className={container}>
        <Reveal>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-12">
              <h2 className="text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                {academyTeaser.heading}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-brand-navy/70">
                {academyTeaser.body}
              </p>
              <HoverScale className="mt-auto self-start pt-9">
                <Link
                  href={academyTeaser.cta.href}
                  className="inline-flex items-center justify-center rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {academyTeaser.cta.label}
                </Link>
              </HoverScale>
            </div>

            <div className="flex flex-col rounded-3xl bg-gradient-to-br from-brand-blue to-brand-green p-8 shadow-sm sm:p-12">
              <h2 className="max-w-sm text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                {finalCta.heading}
              </h2>
              <HoverScale className="mt-auto self-start pt-9">
                <Link
                  href={finalCta.cta.href}
                  className="inline-flex items-center justify-center rounded-full bg-brand-navy px-8 py-3 text-base font-semibold text-white shadow-lg shadow-brand-navy/20 transition-opacity hover:opacity-90"
                >
                  {finalCta.cta.label}
                </Link>
              </HoverScale>
            </div>
          </div>
        </Reveal>
      </section>
    </BrowseProvider>
  );
}
