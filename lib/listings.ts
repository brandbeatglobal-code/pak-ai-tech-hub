import { asc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import {
  siteCopy,
  type Listing,
  type ProductCategory,
} from "@/content/site-copy";
import { db } from "@/db";
import { products, providers } from "@/db/schema";

/**
 * The marketplace's listings: every APPROVED product, with the name of the
 * provider that lists it, in the `Product` shape the cards and the search
 * already take.
 *
 * THE ONE READ. /marketplace, the homepage grid, the nav (its counts and its
 * search) and the contact form's product dropdown — and the contact form's
 * server-side check of that dropdown — all call `getListings()`. A nav that
 * says "8 products" is counting the same rows the grid shows.
 *
 * Server only: it imports the database client. Client components receive the
 * result as props; they never import this file.
 *
 * FRESHNESS. The query result is cached (`unstable_cache`) under
 * `LISTINGS_TAG`, and the pages that use it are prerendered with it. Two
 * things refresh it:
 *
 *   1. On demand — the main path. `approveProduct` in lib/review-actions.ts
 *      calls `updateTag(LISTINGS_TAG)` once the approval is committed. That
 *      expires the cached rows and every page built from them, and the next
 *      request for any of those pages waits for a fresh read — so the product
 *      is on /marketplace the next time anyone loads it. No redeploy.
 *   2. Hourly — a backstop, for changes that never pass through
 *      `approveProduct`: a row edited directly in the database (renaming the
 *      eight first-party products would be one), `npm run db:seed`, or a page
 *      built while the database could not be reached. After REVALIDATE_SECONDS
 *      the next request serves the cached page and refreshes it behind the
 *      scenes, so the one after sees the change.
 *
 * Nothing else changes which products are listed today: a pending
 * submission is not listed, a decline only ever applies to a pending one, and
 * there is no unlist or edit flow. Whatever adds one must call
 * `updateTag(LISTINGS_TAG)` after its write, the way `approveProduct` does.
 *
 * A FAILED READ IS NOT AN EMPTY MARKETPLACE. If the database cannot be
 * reached, `getListings()` returns `null` and logs why. Every surface shows
 * something that says so — `marketplace.products.unavailableMessage`, no counts
 * in the nav — rather than "No products in this category yet", which would be
 * a false statement. It never throws, so a database outage cannot take down a
 * page, or `next build`, that only needed the listings for a count.
 */

export const LISTINGS_TAG = "listings";

/**
 * The backstop interval, in seconds.
 *
 * The approval email promises "up to about an hour" on the strength of this
 * number (`reviewEmails.productApproved` in content/site-copy.ts). Change
 * both together.
 */
const REVALIDATE_SECONDS = 3600;

const { marketplace } = siteCopy;

/**
 * Label -> filter ID, for `products.category`.
 *
 * THE CATEGORY TRAP. The column holds the LABEL a provider picked
 * ("Cross-Industry"); `Product.category` and every filter on the site hold
 * the ID ("cross-industry"). Passing the label through unchanged would type-
 * check nowhere and match nothing — every category filter would silently
 * show an empty grid. `marketplace.products.categories` is the one list that
 * pairs the two, and the submission form draws its allowed labels from the
 * same list, so every row written through the app has an entry here.
 *
 * Matched case-insensitively and trimmed, so a hand-edited row reading
 * "cross-industry" or "Healthcare " still lands in its filter.
 */
const CATEGORY_ID_BY_LABEL = new Map<string, ProductCategory>(
  marketplace.products.categories.flatMap((category) =>
    category.id === "all"
      ? []
      : [[category.label.trim().toLowerCase(), category.id] as const],
  ),
);

/**
 * "55.00" + "USD" -> "$55/mo"; "49.50" -> "$49.50/mo".
 *
 * Whole amounts drop the ".00", which is how every price on the site has
 * always been written. The "/mo" is `marketplace.products.pricePeriod` — a
 * convention, since the table has no billing period.
 *
 * USD is the only currency anything writes today: the submission form fixes
 * it, and every hosted row was USD when this was written. A row in any other
 * currency is shown with its ISO code ("55 EUR/mo") — never with a "$" it
 * does not have, and never dropped.
 */
function formatPrice(amount: string, currency: string): string | null {
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;
  const figure = value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const code = currency.trim().toUpperCase();
  const priced = code === "USD" ? `$${figure}` : `${figure} ${code}`;
  return `${priced}${marketplace.products.pricePeriod}`;
}

type Row = {
  id: string;
  name: string;
  description: string;
  category: string;
  priceAmount: string;
  priceCurrency: string;
  provider: string;
};

/** A row the site can show, or null (logged) when it cannot be shown honestly. */
function toListing(row: Row): Listing | null {
  const category = CATEGORY_ID_BY_LABEL.get(row.category.trim().toLowerCase());
  if (!category) {
    /*
      Only a hand-edited row can get here. Listing it anyway would put it in
      "All" but in no category — the one filter it belongs to would not show
      it. Leaving it out, loudly, is the version someone will notice and fix.
    */
    console.warn(
      `[listings] Product ${row.id} ("${row.name}") has category "${row.category}", ` +
        "which is not a marketplace category — it is not listed.",
    );
    return null;
  }

  const price = formatPrice(row.priceAmount, row.priceCurrency);
  if (!price) {
    console.warn(
      `[listings] Product ${row.id} ("${row.name}") has an unreadable price ` +
        `"${row.priceAmount}" — it is not listed.`,
    );
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    category,
    description: row.description,
    price,
    /* Individual product pages do not exist yet; every card links nowhere. */
    href: "#",
    provider: row.provider,
  };
}

const readListings = unstable_cache(
  async (): Promise<Listing[]> => {
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        category: products.category,
        priceAmount: products.priceAmount,
        priceCurrency: products.priceCurrency,
        provider: providers.companyName,
      })
      .from(products)
      .innerJoin(providers, eq(providers.id, products.providerId))
      .where(eq(products.status, "approved"))
      /*
        Most recently approved first, so a new listing leads the grid rather
        than landing at the end of it. The eight seeded rows share one
        `reviewed_at`, so they fall back to name order among themselves.
      */
      .orderBy(sql`${products.reviewedAt} desc nulls last`, asc(products.name));

    return rows.flatMap((row) => {
      const listing = toListing(row);
      return listing ? [listing] : [];
    });
  },
  ["marketplace-listings"],
  { tags: [LISTINGS_TAG], revalidate: REVALIDATE_SECONDS },
);

/**
 * The product names the contact form offers, in listing order, each once.
 *
 * Shared by the form's dropdown (app/contact/page.tsx) and the server-side
 * check of what was posted (lib/contact-actions.ts), so the two cannot
 * disagree about which names are real. Two providers may list products with
 * the same name; the dropdown offers that name once. Empty when the listings
 * could not be read, which leaves "Not sure yet" as the only choice.
 */
export function productOptionNames(listings: Listing[] | null): string[] {
  return [...new Set((listings ?? []).map((listing) => listing.name))];
}

/**
 * The approved listings, or `null` if they could not be read.
 *
 * Catches OUTSIDE the cache on purpose. A failure caught inside would be
 * cached as an answer and served for an hour; caught here, nothing is
 * cached, and the next call tries the database again.
 */
export async function getListings(): Promise<Listing[] | null> {
  try {
    return await readListings();
  } catch (cause) {
    console.error("[listings] Could not read the listings:", cause);
    return null;
  }
}
