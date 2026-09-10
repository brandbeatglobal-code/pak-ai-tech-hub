import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { HoverLift } from "@/components/motion/hover-lift";
import { HoverScale } from "@/components/motion/hover-scale";
import { Reveal } from "@/components/motion/reveal";
import { SectionGlow } from "@/components/motion/section-glow";
import { SocialIcon } from "@/components/social-icons";
import { siteCopy } from "@/content/site-copy";

const { contact, footer } = siteCopy;

export const metadata: Metadata = {
  title: contact.meta.title,
  description: contact.meta.description,
};

/** Same heading treatment and section rhythm as the rest of the site. */
const sectionHeading =
  "text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-display";
const sectionPad = "px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32";
const container = `mx-auto w-full max-w-6xl ${sectionPad}`;

export default function ContactPage() {
  const { hero, details, reachUs, closingCta } = contact;
  const { connect } = footer;

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
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
              {hero.reach}
            </p>
            {/*
              The mailto fallback, kept even though the form below works.

              It costs nothing, needs no JavaScript and no third-party service,
              and it is the same address the form's error state points at. Do
              not remove it just because the form exists.
            */}
            <HoverScale className="mt-10">
              <a
                href={hero.primaryCta.href}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green px-6 py-3 text-base font-semibold text-brand-navy shadow-lg shadow-brand-blue/20 transition-opacity hover:opacity-90"
              >
                {hero.primaryCta.label}
              </a>
            </HoverScale>
          </Reveal>
        </div>
      </section>

      {/* 2. The form */}
      {/*
        Backed by Resend — see lib/contact-actions.ts. The success state only
        appears once Resend confirms the send; a failure surfaces the mailto
        address so nobody is left stuck.
      */}
      <section className="border-t border-black/5">
        <div className={container}>
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <h2 className={sectionHeading}>{contact.form.heading}</h2>
              <p className="mt-5 text-lg leading-relaxed text-brand-navy/70">
                {contact.form.intro}
              </p>
              <div className="mt-10">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. Ways to reach us — two routes that actually exist */}
      <section className="border-t border-black/5">
        <div className={container}>
          <Reveal>
            <h2 className={sectionHeading}>{reachUs.heading}</h2>
            <ul className="mt-12 grid gap-5 lg:grid-cols-2">
              {reachUs.cards.map((card) => (
                <HoverLift
                  key={card.heading}
                  as="li"
                  className="flex flex-col rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10"
                >
                  <h3 className="text-xl font-bold tracking-tight text-brand-navy">
                    {card.heading}
                  </h3>
                  <p className="mt-4 leading-relaxed text-brand-navy/70">
                    {card.body}
                  </p>
                  <HoverScale className="mt-auto self-start pt-8">
                    <Link
                      href={card.cta.href}
                      className="inline-flex items-center justify-center rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      {card.cta.label}
                    </Link>
                  </HoverScale>
                </HoverLift>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 4. Contact details */}
      <section className="relative isolate border-y border-black/5 bg-brand-navy/[0.02]">
        <SectionGlow placement="left" />
        <div className={`relative ${container}`}>
          <Reveal>
            <h2 className={sectionHeading}>{details.heading}</h2>

            <dl className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <dt className="text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
                  {details.email.label}
                </dt>
                <dd className="mt-4">
                  <a
                    href={`mailto:${details.email.value}`}
                    className="text-lg font-bold tracking-tight text-brand-navy underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
                  >
                    {details.email.value}
                  </a>
                </dd>
              </div>

              <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <dt className="text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
                  {details.location.label}
                </dt>
                <dd className="mt-4 text-lg font-bold tracking-tight text-brand-navy">
                  {details.location.value}
                </dd>
              </div>

              {/*
                NEEDS REAL PROFILE URLS — do not invent them.

                The same handle, networks and icons the footer shows, read
                from `footer.connect` rather than restated. Every href there
                is still "#"; replacing them in that one block fixes the
                footer and this page together.
              */}
              <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <dt className="text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
                  {details.connectLabel}
                </dt>
                <dd className="mt-4">
                  <p className="text-lg font-bold tracking-tight text-brand-navy">
                    {connect.handle}
                  </p>
                  <ul className="mt-4 flex items-center gap-3">
                    {connect.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          aria-label={link.label}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/5 text-brand-navy/65 transition-colors hover:border-brand-navy/25 hover:text-brand-navy"
                        >
                          <SocialIcon icon={link.icon} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
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
