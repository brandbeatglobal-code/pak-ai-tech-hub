"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { HoverScale } from "@/components/motion/hover-scale";
import { CategoryIcon, TierIcon } from "@/components/nav-icons";
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

type Panel = {
  heading: string;
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
const PANELS: Record<NavMenuSource, Panel> = {
  marketplace: {
    heading: nav.menus.marketplace.heading,
    viewAll: { label: nav.menus.marketplace.viewAll, href: "/marketplace" },
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
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8"
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
          className="hidden flex-1 items-center justify-center gap-2 md:flex"
        >
          {nav.items.map((item) => {
            const source = item.menu;

            if (!source) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy"
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
                className="relative"
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
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    open ? "text-brand-navy" : "text-brand-navy/70 hover:text-brand-navy"
                  }`}
                >
                  {item.label}
                  <Chevron open={open} />
                </button>

                {open ? (
                  <motion.div
                    id={`nav-panel-${source}`}
                    ref={(node) => {
                      panelRefs.current[source] = node;
                    }}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: "easeOut" }}
                    className="absolute top-full left-1/2 w-80 -translate-x-1/2 pt-3"
                  >
                    <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-xl shadow-brand-navy/10">
                      <p className="px-3 pt-2 pb-3 text-xs font-bold tracking-wide text-brand-navy/65 uppercase">
                        {panel.heading}
                      </p>
                      <ul>
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
                      <div className="mt-2 border-t border-black/5 pt-2">
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
                  </motion.div>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center md:ml-0">
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
      </ul>
    </header>
  );
}

export default SiteNav;
