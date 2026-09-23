import Image from "next/image";
import Link from "next/link";

import { AdminIcon, type AdminIconName } from "@/components/admin/admin-icons";
import { siteCopy } from "@/content/site-copy";

/**
 * The admin application shell: sidebar, top bar, and the page's `<main>`.
 *
 * Rendered by admin pages themselves — not by a layout — because each admin
 * page runs its own admin check first (see app/dashboard/admin/page.tsx), and
 * the shell should never render for anyone who fails it. The marketing nav and
 * footer are left out by components/site-frame.tsx, so these are the page's
 * only landmarks.
 *
 * WHAT IS REAL AND WHAT IS NOT. "Review Queue" is the one section that exists;
 * its badge is the live pending count. The other four sidebar entries are the
 * shape of sections not built yet: plain text marked "Soon", never links (a
 * link would 404). The search field and the notification icon are likewise
 * disabled and labelled "not available yet" rather than looking like they
 * work. Below `lg` the sidebar collapses into the top bar and the four
 * placeholders are left out — on a phone they would be two rows of nothing.
 */

const { brand, adminReview } = siteCopy;
const { sidebar, topbar } = adminReview;

const PLACEHOLDER_ICONS: AdminIconName[] = ["providers", "products", "buyers", "settings"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return letters.toUpperCase() || "A";
}

/** The count badge. The number is visual; the sentence is for screen readers. */
function PendingBadge({ count }: { count: number }) {
  return (
    <span
      className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
        count > 0 ? "bg-brand-green text-brand-navy" : "bg-brand-navy/[0.06] text-brand-navy/70"
      }`}
    >
      <span aria-hidden>{count}</span>
      <span className="sr-only">{sidebar.pendingBadge.replace("{count}", String(count))}</span>
    </span>
  );
}

function QueueLink({ pendingTotal, compact = false }: { pendingTotal: number; compact?: boolean }) {
  return (
    <Link
      href="/dashboard/admin"
      aria-current="page"
      className={`flex items-center gap-3 rounded-xl bg-brand-navy/[0.06] font-semibold text-brand-navy outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
        compact ? "px-3 py-2 text-sm" : "px-3 py-2.5 text-sm"
      }`}
    >
      <AdminIcon name="queue" />
      <span className="whitespace-nowrap">{sidebar.queue}</span>
      <PendingBadge count={pendingTotal} />
    </Link>
  );
}

function BackLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={`flex items-center gap-2 rounded-xl py-2 text-sm font-medium text-brand-navy/70 transition-colors hover:bg-brand-navy/[0.04] hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
        compact ? "ml-auto px-2" : "px-3"
      }`}
    >
      <AdminIcon name="back" className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">{sidebar.exit}</span>
    </Link>
  );
}

export function AdminShell({
  admin,
  pendingTotal,
  children,
}: {
  admin: { name: string; email: string };
  pendingTotal: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-brand-navy/[0.035]">
      {/* ---------- sidebar, lg and up ---------- */}
      {/* The aside stretches to the full page height so its white background
          and border run the whole way down; only its contents stick. */}
      <aside className="hidden w-64 shrink-0 border-r border-black/5 bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex items-center gap-3 border-b border-black/5 px-5 py-5">
            <Image
              src="/brand/brandmark.png"
              alt=""
              width={488}
              height={504}
              className="h-8 w-auto"
            />
            <div className="leading-tight">
              <p className="text-sm font-extrabold text-brand-navy">{brand.name}</p>
              <p className="text-xs font-medium text-brand-navy/65">{topbar.role}</p>
            </div>
          </div>

          <nav aria-label={sidebar.navLabel} className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              <li>
                <QueueLink pendingTotal={pendingTotal} />
              </li>
              {sidebar.placeholders.map((label, index) => (
                <li key={label}>
                  {/* Not a link: the section does not exist. */}
                  <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-navy/65">
                    <AdminIcon name={PLACEHOLDER_ICONS[index]} />
                    <span>{label}</span>
                    <span className="ml-auto rounded-md bg-brand-navy/[0.05] px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-brand-navy/70 uppercase">
                      <span aria-hidden>{sidebar.soon}</span>
                      <span className="sr-only">{sidebar.soonLong}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-black/5 p-3">
            <BackLink />
          </div>
        </div>
      </aside>

      {/* ---------- top bar + content ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-black/5 bg-white">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
            <Image
              src="/brand/brandmark.png"
              alt={brand.brandmarkAlt}
              width={488}
              height={504}
              className="h-8 w-auto lg:hidden"
            />

            {/* Cosmetic this pass, so on a phone it does not earn the room. */}
            <div className="relative hidden min-w-0 flex-1 sm:block lg:max-w-md">
              <label htmlFor="admin-search" className="sr-only">
                {topbar.searchLabel}
              </label>
              <AdminIcon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-brand-navy/50"
              />
              <input
                id="admin-search"
                type="search"
                disabled
                placeholder={topbar.searchPlaceholder}
                className="w-full cursor-not-allowed rounded-full border border-black/10 bg-brand-navy/[0.02] py-2 pr-4 pl-10 text-sm text-brand-navy placeholder:text-brand-navy/50"
              />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
              <button
                type="button"
                disabled
                aria-label={topbar.notifications}
                className="grid h-10 w-10 cursor-not-allowed place-items-center rounded-full text-brand-navy/55"
              >
                <AdminIcon name="bell" />
              </button>

              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-9 w-9 place-items-center rounded-full bg-brand-navy text-sm font-bold text-white"
                >
                  {initials(admin.name)}
                </span>
                <p className="hidden leading-tight md:block">
                  <span className="block text-xs text-brand-navy/65">{topbar.signedInAs}</span>
                  <span className="block text-sm font-semibold text-brand-navy">{admin.name}</span>
                </p>
                {/* The name is hidden below md; keep it for screen readers. */}
                <span className="sr-only md:hidden">
                  {topbar.signedInAs} {admin.name}
                </span>
              </div>
            </div>
          </div>

          {/*
            Below lg the sidebar folds into a second row of the top bar. It
            wraps rather than scrolls: at 390px the two links fit with 7px to
            spare, and on anything narrower the back link drops to its own
            line instead of pushing the page sideways.
          */}
          <nav
            aria-label={sidebar.navLabel}
            className="flex flex-wrap items-center gap-2 border-t border-black/5 px-4 py-2 sm:px-6 lg:hidden"
          >
            <QueueLink pendingTotal={pendingTotal} compact />
            <BackLink compact />
          </nav>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
