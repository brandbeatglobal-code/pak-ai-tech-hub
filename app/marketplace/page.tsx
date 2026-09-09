import type { Metadata } from "next";
import Link from "next/link";

import { MarketplaceProducts } from "@/components/marketplace-products";
import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { HoverLift } from "@/components/motion/hover-lift";
import { HoverScale } from "@/components/motion/hover-scale";
import { Reveal } from "@/components/motion/reveal";
import { SectionGlow } from "@/components/motion/section-glow";
import { siteCopy } from "@/content/site-copy";

const { marketplace, worksWith } = siteCopy;

export const metadata: Metadata = {
  title: marketplace.meta.title,
  description: marketplace.meta.description,
};

/** Matches the homepage section headline treatment. */
const sectionHeading =
  "text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-display";

export default function MarketplacePage() {
  const { hero, products, partners } = marketplace;

  return (
    <>
      {/* 1. Hero — same backdrop treatment as the homepage hero. */}
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

      {/* 2. Our products — filter sidebar and card grid. */}
      <section className="border-t border-black/5">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className={sectionHeading}>{products.heading}</h2>
            <MarketplaceProducts
              products={products.items}
              categories={products.categories}
              labels={{
                filterLegend: products.filterLegend,
                trainingBadge: products.trainingBadge,
                emptyMessage: products.emptyMessage,
                resultCountOne: products.resultCountOne,
                resultCountOther: products.resultCountOther,
                pricePrefix: products.pricePrefix,
              }}
            />
          </Reveal>
        </div>
      </section>

      {/* 3. Marketplace partners — same list and constraint as the homepage. */}
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
    </>
  );
}
