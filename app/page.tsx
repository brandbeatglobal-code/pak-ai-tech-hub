import Link from "next/link";

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
    hero,
    trustStrip,
    audience,
    flagship,
    howItWorks,
    stats,
    offering,
    whyPakai,
    industries,
    worksWith,
    founder,
    resources,
    academyTeaser,
    finalCta,
  } = siteCopy;

  return (
    <>
      {/* 1. Hero */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop />
        {/* Centred, matching the reference layout: the homepage headline is
            the one place on the site that gets the full width of the column. */}
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-36">
          <Reveal className="mx-auto max-w-4xl text-center">
            <h1 className="text-[2.75rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-brand-navy sm:text-display-lg lg:text-display-xl">
              {hero.headline}
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-brand-navy/70 sm:text-xl">
              {hero.subhead}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
            {/* Restates the trial terms already on /pricing — not a new claim. */}
            <p className="mt-5 text-sm text-brand-navy/65">{hero.reassurance}</p>
          </Reveal>
        </div>
      </section>

      {/* 2. Trust strip */}
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

      {/* 3. Who it's built for */}
      {/*
        Stands in for the customer-logo band a mature site would show here. We
        have no named customers to display, so this uses real segment reach
        instead — do not swap in logos or "trusted by" names until real ones
        are confirmed.
      */}
      <section className={container}>
        <Reveal>
          <h2 className={sectionHeading}>{audience.heading}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
            {audience.intro}
          </p>

          {/* Tiles left, illustration right — the reference's text-and-image
              band, with segment reach standing in for customer logos. */}
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
            <ul className="grid gap-5 sm:grid-cols-2">
              {audience.tiles.map((tile) => (
                <HoverLift
                  key={tile.segment}
                  as="li"
                  className="flex flex-col rounded-3xl border border-black/5 bg-white p-8 shadow-sm"
                >
                  <h3 className="text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
                    {tile.segment}
                  </h3>
                  <p className="mt-4 bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                    {tile.count}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-brand-navy/70">
                    {tile.body}
                  </p>
                </HoverLift>
              ))}
            </ul>

            {/*
              Illustration, not a photograph — see the note in
              components/visuals/skyline-art.tsx for why, and for what to do
              when a licensed stock photo is available. The caption stays
              generic either way.
            */}
            <figure className="flex flex-col">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-black/5 sm:aspect-[16/9] lg:aspect-auto lg:min-h-64 lg:flex-1">
                <SkylineArt className="h-full w-full" />
              </div>
              <figcaption className="mt-3 text-sm text-brand-navy/65">
                {audience.figureCaption}
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </section>

      {/* 4. Flagship platform banner */}
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

      {/* 5. How it works */}
      {/* The marketplace hero links here as /#how-it-works. scroll-mt clears
          the sticky nav so the heading is not hidden behind it on arrival. */}
      <section
        id="how-it-works"
        className={`relative isolate scroll-mt-28 border-y border-black/5 bg-brand-navy/[0.02]`}
      >
        <SectionGlow placement="left" />
        <div className={`relative ${container}`}>
          <Reveal>
            <h2 className={sectionHeading}>{howItWorks.heading}</h2>
            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {howItWorks.steps.map((step) => (
                <HoverLift
                  key={step.number}
                  as="li"
                  className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green text-sm font-bold text-brand-navy">
                    {step.number}
                  </span>
                  <p className="mt-5 font-semibold text-brand-navy">{step.title}</p>
                </HoverLift>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* 6. Stats bar */}
      <section aria-label="PAKAI TechHub at a glance" className="bg-brand-navy">
        <Reveal>
          <dl className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-16 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
            {stats.items.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                    {stat.value}
                  </span>
                  <span className="mt-3 block text-sm font-medium tracking-wide text-white/70 uppercase">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* 7. Tabbed offering */}
      {/* The flagship banner's three-up row links here. scroll-mt clears the
          sticky nav so the heading is not hidden behind it on arrival. */}
      <section id="what-you-get" className={`scroll-mt-28 ${container}`}>
        <Reveal>
          <h2 className={sectionHeading}>{offering.heading}</h2>
          <OfferingTabs tabs={offering.tabs} />
        </Reveal>
      </section>

      {/* 8. Why PAKAI TechHub */}
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

      {/* 9. Industries */}
      <section className={container}>
        <Reveal>
          <h2 className={sectionHeading}>{industries.heading}</h2>
          <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industries.items.map((industry) => (
              <HoverLift
                key={industry.name}
                as="li"
                distance={3}
                className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
              >
                <h3 className="text-sm font-bold text-brand-navy">{industry.name}</h3>
                {/* Only industries with a shipped product carry a description. */}
                {industry.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-brand-navy/60">
                    {industry.description}
                  </p>
                ) : null}
              </HoverLift>
            ))}
          </ul>
        </Reveal>
      </section>

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
    </>
  );
}
