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

export default function Home() {
  const {
    hero,
    trustStrip,
    howItWorks,
    stats,
    offering,
    whyPakai,
    industries,
    worksWith,
    founder,
    academy,
    finalCta,
  } = siteCopy;

  return (
    <>
      {/* 2. Hero */}
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

      {/* 3. Trust strip */}
      <section
        aria-label="Why PAKAI TechHub"
        className="border-y border-black/5 bg-brand-navy/[0.02]"
      >
        <Reveal>
          <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-4 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
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

      {/* 4. How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className={sectionHeading}>{howItWorks.heading}</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {howItWorks.steps.map((step) => (
              <HoverLift
                key={step.number}
                as="li"
                className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green text-sm font-bold text-brand-navy">
                  {step.number}
                </span>
                <p className="mt-4 font-semibold text-brand-navy">{step.title}</p>
              </HoverLift>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* 5. Stats bar */}
      <section aria-label="PAKAI TechHub at a glance" className="bg-brand-navy">
        <Reveal>
          <dl className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-14 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
            {stats.items.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-sm font-medium tracking-wide text-white/70 uppercase">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* 6. Tabbed offering */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className={sectionHeading}>{offering.heading}</h2>
          <OfferingTabs tabs={offering.tabs} />
        </Reveal>
      </section>

      {/* 7. Why PAKAI TechHub */}
      <section className="relative isolate border-y border-black/5 bg-brand-navy/[0.02]">
        <SectionGlow placement="left" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className={sectionHeading}>{whyPakai.heading}</h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whyPakai.cards.map((card) => (
                <HoverLift
                  key={card.headline}
                  as="li"
                  className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm"
                >
                  <h3 className="text-lg font-bold tracking-tight text-brand-navy">
                    {card.headline}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-navy/70">
                    {card.body}
                  </p>
                </HoverLift>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 8. Industries */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className={sectionHeading}>{industries.heading}</h2>
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industries.items.map((industry) => (
              <HoverLift
                key={industry.name}
                as="li"
                distance={3}
                className="rounded-xl border border-black/5 bg-white px-5 py-6 shadow-sm"
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
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-sm font-semibold tracking-wide text-brand-navy/65 uppercase">
              {worksWith.heading}
            </h2>
            <ul className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
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

      {/* 10. Founder credibility */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className={sectionHeading}>{founder.heading}</h2>
          {/*
            NEEDS REAL FOUNDER BIO — do not invent one.

            Name, title and bio below are placeholders held in
            content/site-copy.ts. Replace them with the real founder's details
            before launch; do not generate a plausible-sounding substitute.
          */}
          <article className="mt-10 max-w-3xl rounded-2xl border border-dashed border-brand-gray/50 bg-white p-8 shadow-sm sm:p-10">
            <p className="text-xs font-semibold tracking-wide text-brand-navy/65 uppercase">
              {founder.placeholderNotice}
            </p>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-brand-navy">
              {founder.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-brand-navy/65">{founder.title}</p>
            <p className="mt-5 leading-relaxed text-brand-navy/70">{founder.bio}</p>
          </article>
        </Reveal>
      </section>

      {/* 11. Academy teaser */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-12">
            <h2 className={`max-w-2xl ${sectionHeading}`}>{academy.heading}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
              {academy.body}
            </p>
            <HoverScale className="mt-8">
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

      {/* 12. Final CTA */}
      <section className="bg-gradient-to-r from-brand-blue to-brand-green">
        <Reveal>
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:px-8">
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
