"use client";

import { usePathname } from "next/navigation";

/**
 * Which frame a page sits in: the marketing site's, or none.
 *
 * Every page used to get the marketing nav and footer from the root layout.
 * The admin area is an application, not a page of the site — it has its own
 * sidebar, top bar and `<main>` (components/admin/admin-shell.tsx) and the
 * marketing chrome around that would be two navigations at once.
 *
 * WHY THIS AND NOT ROUTE GROUPS. The idiomatic fix is to move every marketing
 * page into an `app/(site)` group with its own layout. That moves every page
 * file in the app for the sake of one admin route, and several guard-rail
 * comments and CLAUDE.md point at those files by path. If the admin area grows
 * into several sections, that restructure becomes worth doing and this
 * component goes away.
 *
 * THE HOMEPAGE is framed too, but with the slim footer: its three views are
 * one screen each from 1024×700 up (see app/page.tsx), and the full footer
 * alone is taller than the room left under a view. `<main>` becomes a flex
 * column there so a view can fill the height between header and footer.
 *
 * `usePathname` is available during server rendering, so the server HTML and
 * the first client render agree — no flash of the marketing nav, no hydration
 * mismatch.
 */

/** Routes that bring their own application shell. */
function hasOwnShell(pathname: string): boolean {
  return pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/");
}

export function SiteFrame({
  nav,
  footer,
  slimFooter,
  children,
}: {
  nav: React.ReactNode;
  footer: React.ReactNode;
  /** The homepage's one-line footer. */
  slimFooter: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (hasOwnShell(pathname)) return <>{children}</>;

  const isHome = pathname === "/";

  return (
    <>
      {nav}
      <main className={isHome ? "flex flex-1 flex-col" : "flex-1"}>{children}</main>
      {isHome ? slimFooter : footer}
    </>
  );
}
