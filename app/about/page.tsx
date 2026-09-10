import type { Metadata } from "next";
import Link from "next/link";

import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { HoverLift } from "@/components/motion/hover-lift";
import { HoverScale } from "@/components/motion/hover-scale";
import { Reveal } from "@/components/motion/reveal";
import { SectionGlow } from "@/components/motion/section-glow";
import { siteCopy } from "@/content/site-copy";

const { about } = siteCopy;

export const metadata: Metadata = {
  title: about.meta.title,
  description: about.meta.description,
};

/** Matches the homepage section headline treatment. */
const sectionHeading =
  "text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-display";

export default function AboutPage() {
  const {
    hero,
    story,
    different,
    facts,
    values,
    team,
    closingCta,
  } = about;

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

      {/* 2 + 3. Our story / What makes us different */}
      <section className="relative isolate border-t border-black/5">
        <SectionGlow placement="left" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className={sectionHeading}>{story.heading}</h2>
                <p className="mt-6 text-lg leading-relaxed text-brand-navy/70">
                  {story.body}
                </p>
              </div>
              <div>
                <h2 className={sectionHeading}>{different.heading}</h2>
                <p className="mt-6 text-lg leading-relaxed text-brand-navy/70">
                  {different.body}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. Company facts — same strip treatment as the homepage trust strip. */}
      <section
        aria-label={facts.label}
        className="border-y border-black/5 bg-brand-navy/[0.02]"
      >
        <Reveal>
          <ul className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-y-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
            {facts.items.map((item) => (
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

      {/* 5. Our values — compact badge row, lighter than the homepage cards. */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className={sectionHeading}>{values.heading}</h2>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {values.items.map((value) => (
              <li
                key={value.label}
                className="flex items-baseline gap-3 rounded-xl border border-black/5 bg-white px-5 py-4"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full bg-gradient-to-r from-brand-blue to-brand-green"
                />
                <span>
                  <span className="block text-sm font-bold text-brand-navy">
                    {value.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-brand-navy/65">
                    {value.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/*
        REMOVED: section 6, the "Pakistan by the numbers" stat strip.

        It rendered six Pakistan market figures in the homepage's dark
        stats-bar treatment. The global rebrand dropped it — those numbers
        described a single country's market, which is no longer what the site
        claims to serve.

        It was deliberately NOT replaced with worldwide equivalents: nobody
        has supplied those, and estimating them would be inventing data. If
        real global market figures are sourced later, the section can come
        back with its `marketNumbers` copy block. Do not reconstruct either
        from memory.
      */}

      {/* 6. Our team */}
      <section className="relative isolate border-b border-black/5">
        <SectionGlow placement="right" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className={sectionHeading}>{team.heading}</h2>

            {/* Founder carries more visual weight than the open roles: wider
                card, gradient initials mark, larger type. */}
            <article className="mt-10 rounded-2xl border border-black/5 bg-white p-8 shadow-md sm:p-10">
              {/* Mark sits beside the name rather than above it. The founder's
                  name is itself initials, so stacking the two would read as
                  the same word twice instead of as an avatar. */}
              <div className="flex items-center gap-4 sm:gap-5">
                <span
                  aria-hidden
                  className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-green text-lg font-extrabold tracking-tight text-brand-navy sm:h-16 sm:w-16 sm:text-xl"
                >
                  {team.founder.name}
                </span>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-brand-navy">
                    {team.founder.name}
                  </h3>
                  <p className="mt-1 text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
                    {team.founder.title}
                  </p>
                </div>
              </div>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
                {team.founder.bio}
              </p>
            </article>

            {/*
              Open roles. No names — a role stays name-less until the hire is
              confirmed, the same rule the marketplace partner slots follow.
            */}
            <ul className="mt-6 grid gap-5 md:grid-cols-3">
              {team.roles.map((member) => (
                <HoverLift
                  key={member.role}
                  as="li"
                  distance={3}
                  className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
                >
                  <p className="text-xs font-semibold tracking-wide text-brand-navy/65 uppercase">
                    {team.openRolesLabel}
                  </p>
                  <h3 className="mt-3 text-lg font-bold tracking-tight text-brand-navy">
                    {member.role}
                  </h3>
                  {member.roleDetail ? (
                    <p className="mt-1 text-sm font-medium text-brand-navy/65">
                      {member.roleDetail}
                    </p>
                  ) : null}
                  <p className="mt-4 text-sm leading-relaxed text-brand-navy/70">
                    {member.bio}
                  </p>
                </HoverLift>
              ))}
            </ul>

            {/* Lighter than the cards above on purpose: these are plans, not
                filled seats. */}
            <div className="mt-12 grid gap-10 border-t border-black/5 pt-10 sm:grid-cols-2 sm:gap-16">
              {[team.keyHires, team.advisory].map((list) => (
                <div key={list.heading}>
                  <h3 className="text-sm font-bold tracking-wide text-brand-navy uppercase">
                    {list.heading}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {list.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-sm text-brand-navy/70"
                      >
                        <span
                          aria-hidden
                          className="h-1 w-1 shrink-0 rounded-full bg-brand-navy/30"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. Closing CTA */}
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
