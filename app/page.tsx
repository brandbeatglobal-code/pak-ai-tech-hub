import Link from "next/link";

import { OfferingTabs } from "@/components/offering-tabs";
import { siteCopy } from "@/content/site-copy";

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
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-x-0 -top-40 h-80 bg-gradient-to-r from-brand-blue to-brand-green opacity-20 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-brand-navy/70 sm:text-xl">
              {hero.subhead}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={hero.primaryCta.href}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green px-6 py-3 text-base font-semibold text-brand-navy transition-opacity hover:opacity-90"
              >
                {hero.primaryCta.label}
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="inline-flex items-center justify-center rounded-full border border-brand-navy/15 px-6 py-3 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy/40"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust strip */}
      <section aria-label="Why PAKAI TechHub" className="border-y border-black/5 bg-brand-navy/[0.02]">
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
      </section>

      {/* 4. How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          {howItWorks.heading}
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {howItWorks.steps.map((step) => (
            <li
              key={step.number}
              className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green text-sm font-bold text-brand-navy">
                {step.number}
              </span>
              <p className="mt-4 font-semibold text-brand-navy">{step.title}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. Stats bar */}
      <section aria-label="PAKAI TechHub at a glance" className="bg-brand-navy">
        <dl className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-14 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
          {stats.items.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 block text-sm font-medium tracking-wide text-white/70 uppercase">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 6. Tabbed offering */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          {offering.heading}
        </h2>
        <OfferingTabs tabs={offering.tabs} />
      </section>

      {/* 7. Why PAKAI TechHub */}
      <section className="border-y border-black/5 bg-brand-navy/[0.02]">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            {whyPakai.heading}
          </h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyPakai.cards.map((card) => (
              <li
                key={card.headline}
                className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-brand-navy">{card.headline}</h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-navy/70">
                  {card.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. Industries */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          {industries.heading}
        </h2>
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.items.map((industry) => (
            <li
              key={industry.name}
              className="rounded-xl border border-black/5 bg-white px-5 py-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-brand-navy">{industry.name}</h3>
              {/* Only industries with a shipped product carry a description. */}
              {industry.description ? (
                <p className="mt-2 text-sm leading-relaxed text-brand-navy/60">
                  {industry.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* 9. Works with */}
      <section className="border-y border-black/5 bg-brand-navy/[0.02]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold tracking-wide text-brand-gray uppercase">
            {worksWith.heading}
          </h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {worksWith.items.map((item, index) => (
              <li
                key={item.name ?? `pending-${index}`}
                className="border-t border-black/10 pt-6"
              >
                {item.confirmed && item.name ? (
                  <>
                    <h3 className="text-lg font-semibold text-brand-navy">
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
                    <h3 className="text-lg font-semibold text-brand-gray">
                      {item.description}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-gray">
                      {worksWith.pendingLabel}
                    </p>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 10. Founder credibility */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          {founder.heading}
        </h2>
        {/*
          NEEDS REAL FOUNDER BIO — do not invent one.

          Name, title and bio below are placeholders held in
          content/site-copy.ts. Replace them with the real founder's details
          before launch; do not generate a plausible-sounding substitute.
        */}
        <article className="mt-10 max-w-3xl rounded-2xl border border-dashed border-brand-gray/50 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold tracking-wide text-brand-gray uppercase">
            {founder.placeholderNotice}
          </p>
          <h3 className="mt-4 text-xl font-semibold text-brand-navy">{founder.name}</h3>
          <p className="mt-1 text-sm font-medium text-brand-gray">{founder.title}</p>
          <p className="mt-5 leading-relaxed text-brand-navy/70">{founder.bio}</p>
        </article>
      </section>

      {/* 11. Academy teaser */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-12">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            {academy.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-brand-navy/70">{academy.body}</p>
          <Link
            href={academy.cta.href}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          >
            {academy.cta.label}
          </Link>
        </div>
      </section>

      {/* 12. Final CTA */}
      <section className="bg-gradient-to-r from-brand-blue to-brand-green">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            {finalCta.heading}
          </h2>
          <Link
            href={finalCta.cta.href}
            className="inline-flex items-center justify-center rounded-full bg-brand-navy px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          >
            {finalCta.cta.label}
          </Link>
        </div>
      </section>
    </>
  );
}
