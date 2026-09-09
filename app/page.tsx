import Link from "next/link";

import { siteCopy } from "@/content/site-copy";

export default function Home() {
  const {
    hero,
    trustStrip,
    howItWorks,
    stats,
    featuredProducts,
    industries,
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

      {/* 6. Featured products */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          {featuredProducts.heading}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featuredProducts.products.map((product) => (
            <article
              key={product.name}
              className="flex flex-col rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-brand-navy">{product.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-navy/70">
                {product.description}
              </p>
              <p className="mt-6 text-sm font-semibold text-brand-navy">{product.price}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 7. Industries */}
      <section className="border-y border-black/5 bg-brand-navy/[0.02]">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            {industries.heading}
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {industries.items.map((industry) => (
              <li
                key={industry}
                className="rounded-xl border border-black/5 bg-white px-5 py-6 text-center text-sm font-medium text-brand-navy"
              >
                {industry}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. Academy teaser */}
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

      {/* 9. Final CTA */}
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
