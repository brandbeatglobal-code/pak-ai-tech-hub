import Link from "next/link";

import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { HoverLift } from "@/components/motion/hover-lift";
import { HoverScale } from "@/components/motion/hover-scale";
import { Reveal } from "@/components/motion/reveal";
import { SectionGlow } from "@/components/motion/section-glow";
import { OfferingTabs } from "@/components/offering-tabs";
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
    howItWorks,
    stats,
    offering,
    whyPakai,
    industries,
    worksWith,
    founder,
    resources,
    academy,
    finalCta,
  } = siteCopy;

  return (
    <>
      {/* 1. Hero */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-36">
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
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {audience.tiles.map((tile) => (
              <HoverLift
                key={tile.segment}
                as="li"
                className="flex flex-col rounded-3xl border border-black/5 bg-white p-8 shadow-sm"
              >
                <h3 className="text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
                  {tile.segment}
                </h3>
                {/* Sized so the longest count ("10,000+ businesses") stays on
                    one line in the four-column row — measured at 172px against
                    191px available. At text-xl it needed exactly the available
                    width and wrapped, leaving the row ragged. */}
                <p className="mt-4 bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
                  {tile.count}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-brand-navy/70">
                  {tile.body}
                </p>
              </HoverLift>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* 4. How it works */}
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

      {/* 5. Stats bar */}
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

      {/* 6. Tabbed offering */}
      <section className={container}>
        <Reveal>
          <h2 className={sectionHeading}>{offering.heading}</h2>
          <OfferingTabs tabs={offering.tabs} />
        </Reveal>
      </section>

      {/* 7. Why PAKAI TechHub */}
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

      {/* 8. Industries */}
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

      {/* 9. Works with */}
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

      {/* 10. Founder */}
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

      {/* 11. Resources */}
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
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resources.slots.map((slot) => (
                <li
                  key={slot.category}
                  className="flex flex-col rounded-3xl border border-dashed border-brand-navy/15 bg-white/60 p-8"
                >
                  {/* Decorative placeholder where a cover image will sit. */}
                  <span
                    aria-hidden
                    className="block h-28 rounded-2xl bg-gradient-to-br from-brand-blue/10 to-brand-green/10"
                  />
                  <h3 className="mt-6 text-sm font-bold tracking-wide text-brand-navy uppercase">
                    {slot.category}
                  </h3>
                  <p className="mt-2 text-sm text-brand-navy/65">
                    {resources.comingSoonLabel}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 12. Academy teaser */}
      <section className={container}>
        <Reveal>
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-14">
            <h2 className={`max-w-2xl ${sectionHeading}`}>{academy.heading}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
              {academy.body}
            </p>
            <HoverScale className="mt-9">
              <Link
                href={academy.cta.href}
                className="inline-flex items-center justify-center rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
              >
                {academy.cta.label}
              </Link>
            </HoverScale>
          </div>
        </Reveal>
      </section>

      {/* 13. Final CTA */}
      <section className="bg-gradient-to-r from-brand-blue to-brand-green">
        <Reveal>
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-9 px-4 py-24 text-center sm:px-6 lg:px-8">
            <h2 className={`max-w-2xl ${sectionHeading}`}>{finalCta.heading}</h2>
            <HoverScale>
              <Link
                href={finalCta.cta.href}
                className="inline-flex items-center justify-center rounded-full bg-brand-navy px-8 py-3 text-base font-semibold text-white shadow-lg shadow-brand-navy/20 transition-opacity hover:opacity-90"
              >
                {finalCta.cta.label}
              </Link>
            </HoverScale>
          </div>
        </Reveal>
      </section>
    </>
  );
}
