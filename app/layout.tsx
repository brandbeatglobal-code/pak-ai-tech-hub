import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteFrame } from "@/components/site-frame";
import { SiteNav } from "@/components/site-nav";
import { siteCopy } from "@/content/site-copy";
import { getListings } from "@/lib/listings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteCopy.meta.title,
  description: siteCopy.meta.description,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  /*
    The nav's Marketplace panel counts these and its search field filters
    them, so they are read here, once, for every page. Same read as the grid
    on /marketplace (lib/listings.ts): the count in the nav is the number of
    listings the marketplace actually shows. Cached — this is not a database
    query per page view.
  */
  const listings = await getListings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Two things that need JavaScript, and their fallbacks.

          1. Scroll-reveal blocks start at opacity 0 and are animated in by
             Motion. With JavaScript disabled that never happens, so force
             them to their final state.
          2. The desktop nav's dropdown triggers are buttons, which do nothing
             without JavaScript. Fall back to the plain link row — normally
             the narrow-screen nav — at every width, so Marketplace and
             Academy stay reachable.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-nav-menus]{display:none!important}[data-nav-plain]{display:flex!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {/* The marketing nav, <main> and footer — except on routes with an
            application shell of their own. See components/site-frame.tsx. */}
        <SiteFrame nav={<SiteNav listings={listings} />} footer={<SiteFooter />}>
          {children}
        </SiteFrame>
      </body>
    </html>
  );
}
