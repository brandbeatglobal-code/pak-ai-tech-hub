import { eq } from "drizzle-orm";

import { db } from "@/db";
import { providers, users, type ProviderStatus } from "@/db/schema";
import {
  EMPTY_APPLICATION,
  type ApplicationDraft,
} from "@/lib/provider-application";

/**
 * Server-side reads for the provider application.
 *
 * WHY THIS IS NOT IN lib/application-actions.ts.
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
  draft: ApplicationDraft;
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
      companyName: providers.companyName,
      description: providers.description,
      category: providers.category,
      website: providers.website,
      reasonForListing: providers.reasonForListing,
    })
    .from(providers)
    .where(eq(providers.userId, userId))
    .limit(1);

  if (!row) return null;

  return {
    status: row.status,
    draft: {
      businessName: row.companyName,
      description: row.description ?? "",
      category: row.category ?? "",
      website: row.website ?? "",
      reason: row.reasonForListing ?? "",
    },
  };
}

/**
 * The starting answers for someone who has never applied.
 *
 * Only the business name can be known in advance: sign-up asks for a company
 * when "Provider" is chosen, and keeps it on `users.company_name`. Everything
 * else starts empty — nothing is guessed.
 */
export async function getFirstDraft(userId: string): Promise<ApplicationDraft> {
  const [row] = await db
    .select({ companyName: users.companyName })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return { ...EMPTY_APPLICATION, businessName: row?.companyName ?? "" };
}
