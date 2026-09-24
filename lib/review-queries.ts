import { and, asc, count, desc, eq, gte, isNotNull, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, providers, users } from "@/db/schema";

/**
 * Reads for the admin review queue.
 *
 * Deliberately not in a `"use server"` module: every async function exported
 * from one of those is a public endpoint, and these return applicants' names
 * and email addresses. They are called only from /dashboard/admin, after that
 * page has confirmed the visitor is an admin.
 *
 * Nothing here would bundle for the browser anyway — it imports `db`, and
 * postgres-js needs Node's `net` and `tls`.
 */

/**
 * The window the Approved / Declined cards and the "recently reviewed" lists
 * cover: the last 7 days by `reviewed_at`, rolling, on the database's clock.
 * `siteCopy.adminReview.windowNote` states it on the page — change both
 * together.
 */
export const REVIEW_WINDOW_DAYS = 7;

/** How many pending items a tab lists at once, oldest first. */
export const PENDING_LIMIT = 100;

/** How many reviewed items a tab lists, newest decision first. */
export const REVIEWED_LIMIT = 20;

const windowStart = sql`now() - make_interval(days => ${REVIEW_WINDOW_DAYS})`;

/*
  "Reviewed" means an admin decided it — not merely that `reviewed_at` is set.

  Providers: `reviewed_at` is only ever written by the review actions, so it is
  enough on its own. Products: db/seed.ts ALSO writes `reviewed_at` when it
  marks the first-party products approved, so a product only counts once
  `reviewed_by` names an admin. Without that, re-running the seed would show
  up as eight approvals this week.
*/
const providerReviewed = and(
  ne(providers.status, "pending"),
  gte(providers.reviewedAt, windowStart),
);
const productReviewed = and(
  ne(products.status, "pending"),
  isNotNull(products.reviewedBy),
  gte(products.reviewedAt, windowStart),
);

export type ReviewStats = {
  pendingProviders: number;
  pendingProducts: number;
  approved: number;
  declined: number;
};

/** The four stat cards, counted in two queries — one per table. */
export async function getReviewStats(): Promise<ReviewStats> {
  const [[p], [q]] = await Promise.all([
    db
      .select({
        pending: count(sql`case when ${providers.status} = 'pending' then 1 end`),
        approved: count(
          sql`case when ${providers.status} = 'approved' and ${providerReviewed} then 1 end`,
        ),
        declined: count(
          sql`case when ${providers.status} = 'rejected' and ${providerReviewed} then 1 end`,
        ),
      })
      .from(providers),
    db
      .select({
        pending: count(sql`case when ${products.status} = 'pending' then 1 end`),
        approved: count(
          sql`case when ${products.status} = 'approved' and ${productReviewed} then 1 end`,
        ),
        declined: count(
          sql`case when ${products.status} = 'rejected' and ${productReviewed} then 1 end`,
        ),
      })
      .from(products),
  ]);

  return {
    pendingProviders: p.pending,
    pendingProducts: q.pending,
    approved: p.approved + q.approved,
    declined: p.declined + q.declined,
  };
}

export type ProviderQueueItem = {
  id: string;
  status: "pending" | "approved" | "rejected";
  business: string;
  category: string | null;
  description: string | null;
  website: string | null;
  reason: string | null;
  applicantName: string | null;
  applicantEmail: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  rejectionReason: string | null;
};

const providerColumns = {
  id: providers.id,
  status: providers.status,
  business: providers.companyName,
  category: providers.category,
  description: providers.description,
  website: providers.website,
  reason: providers.reasonForListing,
  applicantName: users.name,
  applicantEmail: users.email,
  submittedAt: providers.submittedAt,
  reviewedAt: providers.reviewedAt,
  rejectionReason: providers.rejectionReason,
};

/**
 * Provider applications: pending oldest-first by `submitted_at` (so a
 * resubmission joins the back), then this window's decisions newest-first.
 */
export async function getProviderQueue(): Promise<{
  pending: ProviderQueueItem[];
  reviewed: ProviderQueueItem[];
}> {
  const [pending, reviewed] = await Promise.all([
    db
      .select(providerColumns)
      .from(providers)
      .leftJoin(users, eq(users.id, providers.userId))
      .where(eq(providers.status, "pending"))
      .orderBy(asc(providers.submittedAt))
      .limit(PENDING_LIMIT),
    db
      .select(providerColumns)
      .from(providers)
      .leftJoin(users, eq(users.id, providers.userId))
      .where(providerReviewed)
      .orderBy(desc(providers.reviewedAt))
      .limit(REVIEWED_LIMIT),
  ]);
  return { pending, reviewed };
}

export type ProductQueueItem = {
  id: string;
  status: "pending" | "approved" | "rejected";
  name: string;
  category: string;
  description: string;
  priceAmount: string;
  priceCurrency: string;
  provider: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  rejectionReason: string | null;
};

const productColumns = {
  id: products.id,
  status: products.status,
  name: products.name,
  category: products.category,
  description: products.description,
  priceAmount: products.priceAmount,
  priceCurrency: products.priceCurrency,
  provider: providers.companyName,
  submittedAt: products.submittedAt,
  reviewedAt: products.reviewedAt,
  rejectionReason: products.rejectionReason,
};

/**
 * Product submissions, same ordering. Products have no resubmission flow, so
 * `submitted_at` is set once, when the product form writes the row.
 */
export async function getProductQueue(): Promise<{
  pending: ProductQueueItem[];
  reviewed: ProductQueueItem[];
}> {
  const [pending, reviewed] = await Promise.all([
    db
      .select(productColumns)
      .from(products)
      .innerJoin(providers, eq(providers.id, products.providerId))
      .where(eq(products.status, "pending"))
      .orderBy(asc(products.submittedAt))
      .limit(PENDING_LIMIT),
    db
      .select(productColumns)
      .from(products)
      .innerJoin(providers, eq(providers.id, products.providerId))
      .where(productReviewed)
      .orderBy(desc(products.reviewedAt))
      .limit(REVIEWED_LIMIT),
  ]);
  return { pending, reviewed };
}
