import { eq } from "drizzle-orm";

import { db } from "@/db";
import { providers, users, type ProviderStatus } from "@/db/schema";
import { EMPTY_LISTING, type ListingDraft } from "@/lib/provider-listing";

/**
 * Server-side reads for the provider application (the listing form).
 *
 * WHY THIS IS NOT IN lib/listing-actions.ts.
 *
 * Every async function exported from a `"use server"` module is a public
 * endpoint, callable by anyone with any arguments. A `getApplication(userId)`
 * exported from there would let any visitor read any person's application by
 * guessing an id. These functions take a user id and trust it, so they may
 * only be called from server code that got that id from `auth()` — a page or
 * a server action — never exposed as an action themselves.
 *
 * Nothing stops a client component importing this file except that it would
 * fail to build: it imports `db`, and postgres-js needs Node's `net` and
 * `tls`, which do not exist in a browser bundle. The project does not depend
 * on the `server-only` package, so that failure is the guard.
 */

export type Application = {
  status: ProviderStatus;
  /* Steps 2 and 3 of the listing form, as last submitted. No email: step 1
     is skipped for someone signed in. */
  draft: ListingDraft;
};

/**
 * This user's provider record, as an application, or null if they have none.
 *
 * Every user has at most one — `providers.user_id` is unique. Legacy provider
 * rows from before the application flow come back with empty answers, which
 * is the truth: they never filled in an application.
 */
export async function getApplication(userId: string): Promise<Application | null> {
  const [row] = await db
    .select({
      status: providers.status,
      providerType: providers.providerType,
      contactPhone: providers.contactPhone,
      contactTitle: providers.contactTitle,
      name: users.name,
      companyName: providers.companyName,
      description: providers.description,
      category: providers.category,
      website: providers.website,
      reasonForListing: providers.reasonForListing,
    })
    .from(providers)
    .innerJoin(users, eq(users.id, providers.userId))
    .where(eq(providers.userId, userId))
    .limit(1);

  if (!row) return null;

  return {
    status: row.status,
    draft: {
      ...EMPTY_LISTING,
      providerType: row.providerType,
      fullName: row.name,
      phone: row.contactPhone ?? "",
      jobTitle: row.contactTitle ?? "",
      businessName: row.companyName,
      description: row.description ?? "",
      category: row.category ?? "",
      website: row.website ?? "",
      reason: row.reasonForListing ?? "",
      /* Consent is given afresh on every submit, never carried over. */
      consent: false,
    },
  };
}

/**
 * The starting answers for a signed-in buyer who has never applied: their
 * name, and the company they gave at sign-up if they gave one. Everything
 * else starts empty — nothing is guessed.
 */
export async function getFirstDraft(userId: string): Promise<ListingDraft> {
  const [row] = await db
    .select({ name: users.name, companyName: users.companyName })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    ...EMPTY_LISTING,
    fullName: row?.name ?? "",
    businessName: row?.companyName ?? "",
  };
}
