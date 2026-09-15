"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { HoverScale } from "@/components/motion/hover-scale";
import { CategoryIcon, TierIcon } from "@/components/nav-icons";
import { FlagshipArt } from "@/components/visuals/flagship-art";
import {
  siteCopy,
  type NavMenuSource,
  type CategoryFilter,
  type ProductCategory,
} from "@/content/site-copy";

const { brand, nav, marketplace, academy } = siteCopy;

type PanelRow = {
  key: string;
  href: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
};

/**
 * Highlight card filling the panel's left region.
 *
 * It is a real link, and it sits first in DOM order — so it is also the first
 * stop for Tab and for ArrowDown from the trigger. That is deliberate: a
 * "Featured" / "Start here" card is the one thing in the panel that should be
 * reachable without reading past anything else.
 */
type Featured = {
  eyebrow: string;
  headline: string;
  body: string;
  href: string;
  /** Optional emphasis line, e.g. a price. */
  meta?: string;
  art: React.ReactNode;
};

type Panel = {
  heading: string;
  featured: Featured;
  rows: PanelRow[];
  viewAll: { label: string; href: string };
};

/** Narrows the filter list to real categories — "all" is the reset control. */
function isCategory(
  category: CategoryFilter,
): category is { id: ProductCategory; label: string } {
  return category.id !== "all";
}

/**
 * Panel rows are derived from the marketplace and academy source lists, never
 * retyped. A new product category or training tier appears in the nav from
 * that one edit, and the product counts below cannot disagree with the grid on
 * /marketplace because they are counted from the same array.
 */
/** The tier the Academy panel features. First in the ladder, and the free one. */
const entryTier = academy.tiers.items[0];

const PANELS: Record<NavMenuSource, Panel> = {
  marketplace: {
    heading: nav.menus.marketplace.heading,
    viewAll: { label: nav.menus.marketplace.viewAll, href: "/marketplace" },
    featured: {
      eyebrow: nav.menus.marketplace.featured.eyebrow,
      /* Counted from the product list, so the headline cannot overstate it. */
      headline: nav.menus.marketplace.featured.headline.replace(
        "{count}",
        String(marketplace.products.items.length),
      ),
      body: nav.menus.marketplace.featured.body,
      href: "/marketplace",
      art: <FlagshipArt className="h-full w-auto" />,
    },
    rows: marketplace.products.categories.filter(isCategory).map((category) => {
      const count = marketplace.products.items.filter(
        (product) => product.category === category.id,
      ).length;
      return {
        key: category.id,
        href: `/marketplace?category=${category.id}`,
        label: category.label,
        detail:
          count === 1
            ? nav.menus.marketplace.countOne
            : nav.menus.marketplace.countOther.replace("{count}", String(count)),
        icon: <CategoryIcon category={category.id} />,
      };
    }),
  },
  academy: {
    heading: nav.menus.academy.heading,
    viewAll: { label: nav.menus.academy.viewAll, href: "/academy" },
    /* Name, price, duration and format all come off the tier itself. */
    featured: {
      eyebrow: nav.menus.academy.featured.eyebrow,
      headline: entryTier.name,
      meta: entryTier.price,
      body: `${entryTier.duration}, ${entryTier.format} — ${nav.menus.academy.featured.body}`,
      href: `/academy#tier-${entryTier.id}`,
      art: <TierIcon step={Number(entryTier.step)} className="h-14 w-14" />,
    },
    rows: academy.tiers.items.map((tier) => ({
      key: tier.id,
      href: `/academy#tier-${tier.id}`,
      label: tier.name,
      detail: `${tier.audience} · ${tier.duration}`,
      icon: <TierIcon step={Number(tier.step)} />,
    })),
  },
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 12 12"
      className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
    </svg>
  );
}

/**
 * Top navigation.
 *
 * Marketplace and Academy open a dropdown; Pricing and About are plain links
 * because no sub-content exists for them. The dropdowns follow the disclosure
 * pattern rather than `role="menu"`: the trigger is a real button carrying
 * `aria-expanded`/`aria-controls` and the panel is an ordinary list of links,
 * so Tab, Shift+Tab and screen-reader link navigation keep working as they
 * normally would. Arrow keys, Home/End and Escape are layered on top.
 *
 * A pointer opens a panel on hover; keyboard and touch use click, Enter, Space
 * or ArrowDown. Below `md` the panels are not rendered at all — the narrow
 * screen keeps the flat, JavaScript-free link row it already had, so nothing
 * about the mobile nav depends on this component's state.
 *
 * The brand mark follows the same breakpoint: the full horizontal lockup from
 * `md` upwards, the compact square mark below it, where the lockup would
 * shrink past legibility.
 */
export function SiteNav() {
  const [openMenu, setOpenMenu] = useState<NavMenuSource | null>(null);
  const prefersReducedMotion = useReducedMotion();

  /* Set when ArrowDown opens a panel, so the effect below knows to move focus
     into it once it has mounted. A ref rather than state — it is a one-shot
     instruction to the next commit, not something the UI renders from. */
  const focusFirstRow = useRef(false);

  const headerRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<Partial<Record<NavMenuSource, HTMLButtonElement | null>>>({});
  const panelRefs = useRef<Partial<Record<NavMenuSource, HTMLDivElement | null>>>({});

  function panelLinks(source: NavMenuSource) {
    const panel = panelRefs.current[source];
    return panel ? Array.from(panel.querySelectorAll<HTMLAnchorElement>("a[href]")) : [];
  }

  /** Escape's contract: dismiss the panel and put focus back on its trigger. */
  function closeAndRefocus() {
    if (openMenu) triggerRefs.current[openMenu]?.focus();
    setOpenMenu(null);
  }

  /* A click anywhere outside the header dismisses an open panel. */
  useEffect(() => {
    if (!openMenu) return;
    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openMenu]);

  /* ArrowDown on a closed trigger opens the panel and lands on its first row;
     the panel has to be mounted before it can be focused, hence the effect. */
  useEffect(() => {
    if (!openMenu || !focusFirstRow.current) return;
    focusFirstRow.current = false;
    panelLinks(openMenu)[0]?.focus();
  }, [openMenu]);

  function onItemKeyDown(event: React.KeyboardEvent<HTMLLIElement>, source: NavMenuSource) {
    if (event.key === "Escape") {
      if (openMenu === source) {
        event.preventDefault();
        closeAndRefocus();
      }
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    if (openMenu !== source) {
      /* Opening from the trigger. ArrowUp is ignored here so it keeps its
         usual meaning of "nothing above this". */
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      focusFirstRow.current = true;
      setOpenMenu(source);
      return;
    }

    const links = panelLinks(source);
    if (links.length === 0) return;
    event.preventDefault();

    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? links.length - 1
          : current === -1
            ? 0
            : (current + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;

    links[next]?.focus();
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur"
    >
      {/*
        `relative` here rather than on each <li>: the dropdown panels are wide
        enough that they need to be centred in the nav container, not under
        their own trigger.

        Spacing tightens between `md` and `lg` and returns to its normal values
        at `lg`. That band is the tightest the bar ever gets — the full wordmark
        and all four menu triggers are in play, with much less room for them
        than a desktop screen has. Without the tighter gaps and padding, adding
        Sign in beside the CTA pushes the row past the viewport at 768px.
        Measured, not guessed — see the comment on the Sign in link.
      */}
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8"
      >
        <Link href="/" className="flex shrink-0 items-center" aria-label={brand.name}>
          <Image
            src="/brand/logo.png"
            alt={brand.logoAlt}
            width={1138}
            height={264}
            priority
            className="hidden h-10 w-auto md:block"
          />
          <Image
            src="/brand/brandmark.png"
            alt={brand.brandmarkAlt}
            width={488}
            height={504}
            priority
            className="h-9 w-auto md:hidden"
          />
        </Link>

        <ul
          data-nav-menus
          className="hidden flex-1 items-center justify-center gap-1 md:flex lg:gap-2"
        >
          {nav.items.map((item) => {
            const source = item.menu;

            if (!source) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-lg px-2 py-2 text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy lg:px-3"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }

            const panel = PANELS[source];
            const open = openMenu === source;

            return (
              <li
                key={item.href}
                onKeyDown={(event) => onItemKeyDown(event, source)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setOpenMenu(null);
                  }
                }}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setOpenMenu(source);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") setOpenMenu(null);
                }}
              >
                <button
                  type="button"
                  ref={(node) => {
                    triggerRefs.current[source] = node;
                  }}
                  aria-expanded={open}
                  aria-controls={`nav-panel-${source}`}
                  onClick={() => setOpenMenu(open ? null : source)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors lg:px-3 ${
                    open ? "text-brand-navy" : "text-brand-navy/70 hover:text-brand-navy"
                  }`}
                >
                  {item.label}
                  <Chevron open={open} />
                </button>

                {open ? (
                  /*
                    Positioned against the <nav>, not this <li> — the li is no
                    longer `relative`. The panel stays a DOM child of the li,
                    which is what keeps pointer-leave and focus-out working,
                    but it is laid out and centred inside the nav container, so
                    a panel this wide cannot hang off the edge of a narrow
                    window the way a trigger-anchored one would.
                  */
                  <motion.div
                    id={`nav-panel-${source}`}
                    ref={(node) => {
                      panelRefs.current[source] = node;
                    }}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: "easeOut" }}
                    className="absolute top-full left-1/2 w-[min(44rem,calc(100vw_-_3rem))] -translate-x-1/2 pt-3"
                  >
                    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl shadow-brand-navy/10">
                      <div className="grid grid-cols-[minmax(0,35fr)_minmax(0,65fr)]">
                        {/* Region 1 — featured. A real link, first in DOM
                            order, so Tab and ArrowDown reach it first. */}
                        <div className="border-r border-black/5 p-3">
                          <Link
                            href={panel.featured.href}
                            onClick={() => setOpenMenu(null)}
                            className="flex h-full flex-col rounded-xl bg-brand-navy p-5 transition-opacity hover:opacity-95"
                          >
                            <span className="text-[0.6875rem] font-bold tracking-[0.16em] text-brand-green uppercase">
                              {panel.featured.eyebrow}
                            </span>
                            {/* Explicit colour: the glyphs draw with
                                `currentColor`, which would otherwise inherit
                                the page's navy and vanish against this card. */}
                            <span
                              aria-hidden
                              className="mt-4 flex h-24 items-center justify-center text-brand-green"
                            >
                              {panel.featured.art}
                            </span>
                            <span className="mt-5 text-base leading-snug font-bold text-white">
                              {panel.featured.headline}
                            </span>
                            {panel.featured.meta ? (
                              <span className="mt-1 bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-sm font-bold text-transparent">
                                {panel.featured.meta}
                              </span>
                            ) : null}
                            <span className="mt-2 text-xs leading-relaxed text-white/70">
                              {panel.featured.body}
                            </span>
                          </Link>
                        </div>

                        {/* Region 2 — the existing list, reflowed into two
                            columns now that there is room for them. */}
                        <div className="flex flex-col p-3">
                          <p className="px-3 pt-2 pb-2 text-xs font-bold tracking-wide text-brand-navy/65 uppercase">
                            {panel.heading}
                          </p>
                          <ul className="grid grid-cols-2">
                            {panel.rows.map((row) => (
                              <li key={row.key}>
                                <Link
                                  href={row.href}
                                  onClick={() => setOpenMenu(null)}
                                  className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-navy/[0.04]"
                                >
                                  <span
                                    aria-hidden
                                    className="mt-0.5 shrink-0 text-brand-navy/50"
                                  >
                                    {row.icon}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-brand-navy">
                                      {row.label}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-brand-navy/65">
                                      {row.detail}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-auto border-t border-black/5 pt-2">
                            <Link
                              href={panel.viewAll.href}
                              onClick={() => setOpenMenu(null)}
                              className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy/[0.04]"
                            >
                              {panel.viewAll.label}
                              <span aria-hidden>&rarr;</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-2 md:ml-0 lg:gap-4">
          {/*
            Plain text link, so the CTA stays the only button on this side.

            Hidden below `md`: the flat row underneath already carries a Sign
            in link at those widths, and without this it renders twice.

            This link is what made the `md`–`lg` band tight. Measured at 768px:
            it adds 77px to a row that had no room to spare, so the gaps and
            padding above give that back. Anything else added here needs the
            same measurement — the bar is at its limit at 768px.
          */}
          <Link
            href={nav.signIn.href}
            className="hidden rounded-lg px-2 py-2 text-sm font-medium whitespace-nowrap text-brand-navy/70 transition-colors hover:text-brand-navy md:inline-flex"
          >
            {nav.signIn.label}
          </Link>
          <HoverScale>
            <Link
              href={nav.cta.href}
              /* nowrap: at the md breakpoint the row is tight enough that the
                 label otherwise breaks across two lines. */
              className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-opacity hover:opacity-90"
            >
              {nav.cta.label}
            </Link>
          </HoverScale>
        </div>
      </nav>

      {/* Compact link row for narrow screens. Plain links, no panels — the
          dropdowns above are desktop-only and this row is untouched by their
          state. A `<noscript>` rule in the root layout also shows this row at
          every width, so the nav still works with JavaScript disabled. */}
      <ul
        data-nav-plain
        className="flex items-center gap-5 overflow-x-auto border-t border-black/5 px-4 py-2 md:hidden"
      >
        {nav.items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-brand-navy/70"
            >
              {item.label}
            </Link>
          </li>
        ))}
        {/* Appended rather than added to `nav.items`, which would also put it
            in the centred desktop list where it does not belong. */}
        <li>
          <Link
            href={nav.signIn.href}
            className="whitespace-nowrap text-sm font-medium text-brand-navy/70"
          >
            {nav.signIn.label}
          </Link>
        </li>
      </ul>
    </header>
  );
}

export default SiteNav;
