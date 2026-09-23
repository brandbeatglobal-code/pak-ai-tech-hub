"use server";

import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { siteCopy } from "@/content/site-copy";
import { db } from "@/db";
import { providers } from "@/db/schema";
import {
  applicationAttempt,
  isAllowedCategory,
  parseWebsite,
  BUSINESS_NAME_MAX,
  BUSINESS_NAME_MIN,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  REASON_MAX,
  REASON_MIN,
  type ApplicationDraft,
  type ApplicationState,
} from "@/lib/provider-application";

/**
 * Provider application submission.
 *
 * Writes the applicant's `providers` row with status "pending". Approving it is
 * not this module's job and has no UI yet — see the note on `providers.status`
 * in db/schema.ts for what approving has to do.
 *
 * AUTHORISATION IS RE-CHECKED HERE, not just on the page, for the same reason
 * as `submitProduct`: a server action is a public endpoint, reachable without
 * ever loading /dashboard/apply. The page gate decides what is rendered; the
 * check below decides what is stored.
 *
 * Only `submitApplication` is exported. A `"use server"` module may export
 * async functions and nothing else — and every one it does export is callable
 * by anybody, which is why the read helpers live in lib/application-queries.ts.
 */

const copy = siteCopy.providerApplication;

function field(data: FormData, name: string): string {
  return String(data.get(name) ?? "").trim();
}

function outOfRange(value: string, min: number, max: number): boolean {
  return value.length < min || value.length > max;
}

export async function submitApplication(
  previous: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  const attempt = applicationAttempt(previous) + 1;

  const values: ApplicationDraft = {
    businessName: field(formData, "businessName"),
    description: field(formData, "description"),
    category: field(formData, "category"),
    website: field(formData, "website"),
    reason: field(formData, "reason"),
  };

  const session = await auth();

  /*
    Role first, before a single field is looked at. `session.user.role` is
    re-read from the database on every call (the `jwt` callback in auth.ts),
    so a buyer approved a moment ago is already a provider here and is
    refused, rather than applying twice.
  */
  if (!session?.user || session.user.role !== "buyer") {
    return { status: "error", attempt, message: copy.errors.notBuyer, values };
  }

  const { validation } = copy;
  const errors: Record<string, string> = {};

  if (outOfRange(values.businessName, BUSINESS_NAME_MIN, BUSINESS_NAME_MAX)) {
    errors.businessName = validation.businessNameLength;
  }
  if (outOfRange(values.description, DESCRIPTION_MIN, DESCRIPTION_MAX)) {
    errors.description = validation.descriptionLength;
  }
  if (!isAllowedCategory(values.category)) errors.category = validation.category;

  const website = parseWebsite(values.website);
  if (website === "invalid") errors.website = validation.website;

  if (outOfRange(values.reason, REASON_MIN, REASON_MAX)) {
    errors.reason = validation.reasonLength;
  }

  /*
    `website === "invalid"` is redundant at runtime — it has already put a
    message in `errors` — but it narrows the value to `string | null` for the
    write below instead of asserting it later.
  */
  if (Object.keys(errors).length > 0 || website === "invalid") {
    return { status: "invalid", attempt, errors, values };
  }

  const answers = {
    companyName: values.businessName,
    description: values.description,
    category: values.category,
    website,
    reasonForListing: values.reason,
    /* Explicit, for the same reason `submitProduct` is: a later change to the
       column default must not start auto-approving applications. */
    status: "pending" as const,
  };

  try {
    /*
      ONE statement for first applications and resubmissions alike.

      No row yet: insert one. A row already there: the unique constraint on
      `providers.user_id` turns the insert into an update — but only where
      the existing row is "rejected". A pending application is not
      overwritten by a second submit, and an approved provider record is
      never reset to pending by anyone.

      Doing it in one upsert rather than read-then-write is what keeps a
      double-click or two open tabs from creating two rows or from both
      passing a "not yet pending" check. The database settles it.
    */
    const [written] = await db
      .insert(providers)
      .values({ userId: session.user.id, ...answers })
      .onConflictDoUpdate({
        target: providers.userId,
        set: answers,
        setWhere: eq(providers.status, "rejected"),
      })
      .returning({ id: providers.id });

    if (written) return { status: "success" };

    /*
      Nothing written: a row exists and it is not "rejected". Read which it
      is, so the applicant is told the truth rather than a generic failure.
    */
    const [existing] = await db
      .select({ status: providers.status })
      .from(providers)
      .where(eq(providers.userId, session.user.id))
      .limit(1);

    const message =
      existing?.status === "approved"
        ? copy.errors.alreadyApproved
        : copy.errors.alreadyPending;

    return { status: "error", attempt, message, values };
  } catch (cause) {
    /* The error only. No session, no answers, nothing identifying. */
    console.error("[provider-application] Write failed:", cause);
    return { status: "error", attempt, message: copy.errors.write, values };
  }
}
