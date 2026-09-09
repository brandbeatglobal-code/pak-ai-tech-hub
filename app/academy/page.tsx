import type { Metadata } from "next";
import Link from "next/link";

import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { HoverLift } from "@/components/motion/hover-lift";
import { HoverScale } from "@/components/motion/hover-scale";
import { Reveal } from "@/components/motion/reveal";
import { SectionGlow } from "@/components/motion/section-glow";
import { siteCopy } from "@/content/site-copy";

const { academy } = siteCopy;

export const metadata: Metadata = {
  title: academy.meta.title,
  description: academy.meta.description,
};

/** Same heading treatment and section rhythm as the rest of the site. */
const sectionHeading =
  "text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-display";
const sectionPad = "px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32";
const container = `mx-auto w-full max-w-6xl ${sectionPad}`;

/** Small check mark, matching the one on /pricing. */
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

export default function AcademyPage() {
  const { hero, tiers, curricula, delivery, closingCta } = academy;

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
          </Reveal>
        </div>
      </section>

      {/* 2. Training tiers */}
      {/*
        A progression, like the homepage "how it works" steps, but with its own
        identity: a vertical ladder where each rung carries a step marker, a
        rule, and the tier's detail in a row. The homepage version is a flat
        five-column grid of equal peers — these are levels that build on each
        other, so they read top to bottom.
      */}
      <section className={container}>
        <Reveal>
          <h2 className={sectionHeading}>{tiers.heading}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
            {tiers.intro}
          </p>
          <ol className="mt-12 space-y-4">
            {tiers.items.map((tier) => {
              const isFree = tier.price === tiers.freeLabel;
              return (
                <HoverLift
                  key={tier.step}
                  as="li"
                  distance={3}
                  className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                    <span
                      aria-hidden
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-green text-base font-extrabold text-brand-navy"
                    >
                      {tier.step}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold tracking-tight text-brand-navy">
                        {tier.name}
                      </h3>
                      <p className="mt-1 text-sm text-brand-navy/65">{tier.audience}</p>
                    </div>

                    <p className="shrink-0 text-sm font-medium text-brand-navy/70 sm:w-44">
                      {tier.duration} · {tier.format}
                    </p>

                    <p
                      className={`shrink-0 text-base font-bold sm:w-48 sm:text-right ${
                        isFree
                          ? "bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent"
                          : "text-brand-navy"
                      }`}
                    >
                      {tier.price}
                    </p>
                  </div>
                </HoverLift>
              );
            })}
          </ol>
        </Reveal>
      </section>

      {/* 3. Industry curricula */}
      <section className="relative isolate border-y border-black/5 bg-brand-navy/[0.02]">
        <SectionGlow placement="left" />
        <div className={`relative ${container}`}>
          <Reveal>
            <h2 className={sectionHeading}>{curricula.heading}</h2>
            {/*
              This list intentionally does not mirror the industries on
              /marketplace. Training coverage and product coverage are
              different things — Banking & Finance has curriculum here without
              a shipped product. Do not reconcile the two lists.
            */}
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {curricula.items.map((item) => (
                <HoverLift
                  key={item.industry}
                  as="li"
                  className="flex flex-col rounded-3xl border border-black/5 bg-white p-8 shadow-sm"
                >
                  <h3 className="text-xl font-bold tracking-tight text-brand-navy">
                    {item.industry}
                  </h3>
                  {/* Same pill treatment as the marketplace category tags. */}
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {item.topics.map((topic) => (
                      <li
                        key={topic}
                        className="inline-flex rounded-full bg-brand-navy/[0.06] px-3 py-1 text-xs font-semibold text-brand-navy/65"
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                </HoverLift>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 4. Delivery methods */}
      <section className={container}>
        <Reveal>
          <h2 className={sectionHeading}>{delivery.heading}</h2>
          <ul className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {delivery.items.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckMark />
                <span className="font-medium text-brand-navy">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* 5. Closing CTA */}
      <section className="bg-gradient-to-r from-brand-blue to-brand-green">
        <Reveal>
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-9 px-4 py-24 text-center sm:px-6 lg:px-8">
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
