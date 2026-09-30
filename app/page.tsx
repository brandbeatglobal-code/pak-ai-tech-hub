import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";

import { DocumentTitle } from "@/components/document-title";
import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { CategoryIcon, SearchGlyph } from "@/components/nav-icons";
import { browseCategories, siteCopy, type Step } from "@/content/site-copy";
import { resolveHomeTab } from "@/lib/home-tabs";
import { getListings } from "@/lib/listings";

const { hero, home, meta, nav } = siteCopy;

/**
 * The homepage: three views, one at a time, chosen by `?tab=` —
 * `/` (For Businesses), `/?tab=providers`, `/?tab=categories`.
 *
 * The tabs themselves are links in the nav's menu row
 * (components/site-nav.tsx), on every page. Each view is its own URL, so it
 * can be shared, reloaded and reached with Back and Forward, and each has its
 * own title — which is also what the route announcer reads out when the view
 * changes.
 *
 * ONE SCREEN EACH. From 1024×700 up, a view fits between the header and the
 * slim homepage footer with no page scroll (checked by measuring the
 * document height). If something here grows, cut content rather than
 * shrinking the type. On a phone a view runs to about two screens.
 *
 * Everything the old long-scroll homepage held beyond these three views was
 * moved or removed; the note at `home` in content/site-copy.ts lists where
 * each piece went.
 *
 * No `Reveal` on these views: switching tabs should show the view at once,
 * not fade it in each time.
 */

/** Each view's title. For Businesses keeps the site's own (app/layout.tsx). */
const TITLES = {
  businesses: meta.title,
  providers: home.providers.metaTitle,
  categories: home.categories.metaTitle,
} as const;

export async function generateMetadata({
  searchParams,
}: PageProps<"/">): Promise<Metadata> {
  const tab = resolveHomeTab((await searchParams).tab);
  return tab === "businesses" ? {} : { title: TITLES[tab] };
}

/** Section eyebrow over each view's steps. */
const stepsHeading =
  "text-xs font-bold tracking-[0.16em] text-brand-navy/65 uppercase";

const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-green px-6 py-3 text-base font-semibold whitespace-nowrap text-brand-navy shadow-lg shadow-brand-blue/20 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";

function StepNumber({ number }: { number: string }) {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white"
    >
      {number}
    </span>
  );
}

/**
 * A numbered step. The number is drawn, not read: the `<ol>` already gives
 * each step its position, so a screen reader would otherwise hear it twice.
 *
 * The detail runs the full width under the number, not indented beside it:
 * indented, the buyer steps wrapped to three lines at 1024px and pushed the
 * view past one screen.
 */
function StepItem({ step }: { step: Step }) {
  return (
    <li>
      <div className="flex items-center gap-3">
        <StepNumber number={step.number} />
        <h3 className="text-base font-bold tracking-tight text-brand-navy">{step.title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">{step.detail}</p>
    </li>
  );
}

/**
 * For Businesses — the default view: the hero, its search, the three buyer
 * steps and one way into AI Solutions.
 *
 * The search is a plain GET form to /marketplace?q=…, the AI Solutions
 * search. `next/form` makes the submit a client-side navigation when
 * JavaScript is available; without it, it is an ordinary form submit to the
 * same URL. The homepage no longer has a grid of its own to filter.
 */
function BusinessesView() {
  const view = home.businesses;
  return (
    <>
      <div className="text-center">
        <h1 className="mx-auto max-w-4xl text-[2.75rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-brand-navy sm:text-display-lg lg:text-display-xl">
          {hero.headline}
        </h1>
        {/* One line from lg up (no max width there): two lines of it were
            part of what pushed this view past one screen at 1024×700. */}
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-brand-navy/70 sm:text-xl lg:max-w-none">
          {hero.subhead}
        </p>
        <Form action="/marketplace" role="search" className="mx-auto mt-8 w-full max-w-2xl lg:mt-6">
          <label htmlFor="home-search" className="sr-only">
            {nav.search.label}
          </label>
          <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white py-2 pr-2 pl-5 shadow-lg shadow-brand-navy/5 transition-colors focus-within:border-brand-navy/40 focus-within:ring-2 focus-within:ring-brand-navy/15">
            <SearchGlyph className="h-5 w-5" />
            <input
              id="home-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder={nav.search.placeholder}
              className="w-full min-w-0 bg-transparent py-1.5 text-base text-brand-navy outline-none placeholder:text-brand-navy/45 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              {view.searchSubmit}
            </button>
          </div>
        </Form>
        <p className="mt-3 text-sm text-brand-navy/65">{hero.reassurance}</p>
      </div>

      <section aria-labelledby="home-steps" className="mt-10 lg:mt-6">
        <h2 id="home-steps" className={stepsHeading}>
          {view.stepsHeading}
        </h2>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
          <ol className="grid flex-1 gap-5 sm:grid-cols-3">
            {view.steps.map((step) => (
              <StepItem key={step.number} step={step} />
            ))}
          </ol>
          <Link href={view.cta.href} className={`${primaryButton} self-start lg:self-center`}>
            {view.cta.label}
          </Link>
        </div>
      </section>
    </>
  );
}

/**
 * For AI Providers — the four steps from form to buyers, and one way in.
 *
 * The payout line and the "Free to list" intro are the commission split,
 * read from `commissionTerms`; both are flagged in site-copy.ts as needing
 * the owner's confirmation and are left exactly as written.
 */
function ProvidersView() {
  const view = home.providers;
  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
      <div>
        <h1 className="text-3xl leading-[1.1] font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-display">
          {view.heading}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-navy/70">
          {view.intro}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href={view.cta.href} className={primaryButton}>
            {view.cta.label}
          </Link>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-brand-blue to-brand-green"
            />
            {view.payout}
          </p>
        </div>
      </div>

      <section
        aria-labelledby="home-steps"
        className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm sm:p-8"
      >
        <h2 id="home-steps" className={stepsHeading}>
          {view.stepsHeading}
        </h2>
        <ol className="mt-5 space-y-4">
          {view.steps.map((step) => (
            <StepItem key={step.number} step={step} />
          ))}
        </ol>
      </section>
    </div>
  );
}

/**
 * Categories — all eight, each a link to AI Solutions filtered to it.
 *
 * A count shows only when something is listed in the category; "0" would
 * read as a dead marketplace rather than a new one (the same rule as the
 * nav's panel). Counted from the one listings read, so it matches the grid
 * the link lands on.
 */
async function CategoriesView() {
  const view = home.categories;
  const listings = await getListings();
  const { countOne, countOther } = nav.menus.marketplace;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <h1 className="text-3xl leading-[1.1] font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-display">
            {view.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
            {view.intro}
          </p>
        </div>
        <Link
          href={view.viewAll.href}
          className="text-sm font-semibold text-brand-navy underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
        >
          {view.viewAll.label} <span aria-hidden>&rarr;</span>
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {browseCategories.map((category) => {
          const count =
            listings?.filter((listing) => listing.category === category.id).length ?? 0;
          return (
            <li key={category.id}>
              <Link
                href={`/marketplace?category=${category.id}`}
                className="flex h-full flex-col gap-3 rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-colors hover:border-brand-navy/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy sm:p-6"
              >
                <span aria-hidden className="text-brand-navy/55">
                  <CategoryIcon category={category.id} className="h-7 w-7" />
                </span>
                <span className="text-base font-bold text-brand-navy">{category.label}</span>
                {count > 0 ? (
                  <span className="-mt-2 text-xs text-brand-navy/65">
                    {count === 1 ? countOne : countOther.replace("{count}", String(count))}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const tab = resolveHomeTab((await searchParams).tab);

  return (
    <div className="relative isolate flex flex-1 flex-col overflow-hidden">
      {/* generateMetadata covers a full load; this covers switching views,
          where Next.js keeps the old title. See the component's note. */}
      <DocumentTitle title={TITLES[tab]} />
      <HeroBackdrop />
      {/* Vertically centred in the room between header and footer, so a
          taller screen spaces the view out and the padding here only has to
          be the minimum at 1024×700. */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-5">
        {tab === "providers" ? (
          <ProvidersView />
        ) : tab === "categories" ? (
          <CategoriesView />
        ) : (
          <BusinessesView />
        )}
      </div>
    </div>
  );
}
