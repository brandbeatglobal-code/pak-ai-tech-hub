"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/auth";
import { siteCopy } from "@/content/site-copy";
import { db } from "@/db";
import { products, providers, users } from "@/db/schema";
import { LISTINGS_TAG } from "@/lib/listings";
import { sendReviewEmail, type EmailOutcome } from "@/lib/review-email";
import { REASON_MAX, REASON_MIN, type ReviewResult } from "@/lib/review-shared";

/**
 * The review queue's four decisions.
 *
 * Every function exported here is a PUBLIC endpoint: anyone who can reach the
 * app can call it with any arguments, whether or not they ever loaded
 * /dashboard/admin. So each one, before anything else:
 *
 *   1. re-checks the session and the admin role (read fresh from the database
 *      by the `jwt` callback in auth.ts — a demoted admin is refused at once);
 *   2. treats its arguments as untrusted input and validates their shape;
 *   3. only acts on a row that is still "pending", in the same statement that
 *      changes it. Two admins deciding the same item at once cannot both win:
 *      the second finds nothing pending and is told so, and sends no email.
 *
 * Email goes out AFTER the decision is committed, so nobody is ever told about
 * a decision that rolled back. A failed send does not undo the decision; the
 * admin is told in the result line.
 *
 * Approving a PRODUCT lists it: /marketplace, the homepage grid, the nav and
 * the contact form all read approved products (lib/listings.ts). So an
 * approval, once committed, expires the cached listings — see
 * `refreshListings` below.
 *
 * NOTHING AFTER THE COMMIT MAY THROW OUT OF AN ACTION. Once the decision is
 * saved, the admin must be told it is saved — even if looking up the
 * recipient or sending the mail fails. `afterCommit` below is the one place
 * that post-commit work runs, and it turns any failure into a "saved, email
 * not sent" line. An end-to-end run found the gap this closes: a lookup that
 * threw after a committed approval left the admin with no message at all.
 *
 * Only the four actions are exported. Helpers stay private to this module —
 * an exported helper would be one more public endpoint.
 */

const copy = siteCopy.adminReview;

const QUEUE_PATH = "/dashboard/admin";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Thrown inside a transaction to roll it back with a message for the admin. */
class Refused extends Error {}

function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

async function requireAdmin(): Promise<{ id: string } | null> {
  const session = await auth();
  return session?.user?.role === "admin" ? { id: session.user.id } : null;
}

function validId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

function cleanReason(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const reason = value.trim();
  return reason.length >= REASON_MIN && reason.length <= REASON_MAX ? reason : null;
}

/**
 * The address the admin is using the site on, for links in the email.
 *
 * There is no canonical site-URL setting, and pakaitechub.com is confirmed
 * only as a mail domain, not as the web address. A server action is always a
 * browser POST, which carries an Origin header, and Next refuses action calls
 * whose Origin does not match the host — so this is the real address of the
 * deployment the admin is on. Without one, the bare path is used: not
 * clickable, but not wrong either.
 */
async function link(path: string): Promise<string> {
  const origin = (await headers()).get("origin");
  return origin && /^https?:\/\/[^\s/]+$/.test(origin) ? `${origin}${path}` : path;
}

/**
 * Runs the post-commit work — recipient lookup and send — and never throws.
 * The decision is already saved by the time this runs.
 */
async function afterCommit(work: () => Promise<EmailOutcome>): Promise<EmailOutcome> {
  try {
    return await work();
  } catch (cause) {
    console.error("[review] Post-decision email step failed:", cause);
    return { kind: "failed", to: null };
  }
}

function emailLine(outcome: EmailOutcome): string {
  const { results } = copy;
  switch (outcome.kind) {
    case "sent":
      return fill(results.emailSent, { email: outcome.to });
    case "failed":
      return outcome.to
        ? fill(results.emailFailed, { email: outcome.to })
        : results.emailFailedUnknown;
    case "not-configured":
      return results.emailNotConfigured;
    case "no-recipient":
      return results.emailSkippedNoOwner;
  }
}

function done(decision: string, outcome: EmailOutcome): ReviewResult {
  revalidatePath(QUEUE_PATH);
  return { ok: true, message: `${decision} ${emailLine(outcome)}` };
}

const refused = (message: string): ReviewResult => ({ ok: false, message });

/**
 * Expire the cached listings, so the next page load of /marketplace, the
 * homepage, the contact page or any page's nav reads the table again.
 *
 * `updateTag`, not `revalidateTag`: the admin who approves a product and then
 * opens /marketplace should see it on that load, not on the one after.
 * `revalidateTag(tag, "max")` would serve that load the old page while it
 * refreshed in the background. `updateTag` makes the next request wait for
 * fresh data instead, and is only callable from a Server Action — which this
 * is.
 *
 * Called after the commit, so it must not throw (see NOTHING AFTER THE COMMIT
 * above). If it ever fails, the approval stands and the hourly refresh in
 * lib/listings.ts lists the product anyway, just later.
 */
function refreshListings(): void {
  try {
    updateTag(LISTINGS_TAG);
  } catch (cause) {
    console.error("[review] Could not expire the cached listings:", cause);
  }
}

/* Someone else got there first: the admin's list is out of date. */
const alreadyDecided = (): ReviewResult => ({
  ok: false,
  message: copy.errors.notPending,
  stale: true,
});

/* ------------------------------------------------------------------ */
/* Providers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Approve a provider application.
 *
 * TWO writes, ONE transaction: the application to "approved", and the
 * applicant's `users.role` to "provider". The session reads the role, so the
 * status alone grants nothing — and the role alone would leave a provider with
 * a "pending" application. Either both land or neither does.
 *
 * The role write refuses to touch an admin account: approving must never be a
 * way to demote someone. If it would, the whole approval rolls back.
 */
export async function approveProvider(providerId: unknown): Promise<ReviewResult> {
  if (!(await requireAdmin())) return refused(copy.errors.notAdmin);
  if (!validId(providerId)) return refused(copy.errors.notPending);

  let approved: { business: string; name: string; email: string } | null;
  try {
    approved = await db.transaction(async (tx) => {
      const [application] = await tx
        .update(providers)
        .set({
          status: "approved",
          reviewedAt: sql`now()`,
          /* The latest decision is an approval; an old decline reason from
             before a resubmission no longer describes it. */
          rejectionReason: null,
        })
        .where(and(eq(providers.id, providerId), eq(providers.status, "pending")))
        .returning({ userId: providers.userId, business: providers.companyName });

      if (!application) return null;

      /* A pending application always has an applicant — the first-party
         provider is the only row without one, and it is approved. */
      if (!application.userId) throw new Refused(copy.errors.write);

      const [person] = await tx
        .update(users)
        .set({ role: "provider" })
        .where(and(eq(users.id, application.userId), ne(users.role, "admin")))
        .returning({ name: users.name, email: users.email });

      if (!person) throw new Refused(copy.errors.adminApplicant);

      return { business: application.business, ...person };
    });
  } catch (cause) {
    if (cause instanceof Refused) return refused(cause.message);
    console.error("[review] approveProvider failed:", cause);
    return refused(copy.errors.write);
  }

  if (!approved) return alreadyDecided();

  const { name, email, business } = approved;
  const outcome = await afterCommit(async () =>
    sendReviewEmail(email, "providerApproved", {
      name,
      business,
      link: await link("/dashboard/products/new"),
    }),
  );
  return done(fill(copy.results.providerApproved, { name: approved.business }), outcome);
}

/**
 * Decline a provider application, with a reason.
 *
 * The applicant stays a buyer. What they can do next — see the decline on
 * their dashboard, reapply with their answers kept — is piece 1's resubmit
 * flow, unchanged by this.
 */
export async function declineProvider(
  providerId: unknown,
  reason: unknown,
): Promise<ReviewResult> {
  if (!(await requireAdmin())) return refused(copy.errors.notAdmin);
  if (!validId(providerId)) return refused(copy.errors.notPending);
  const why = cleanReason(reason);
  if (!why) return refused(copy.errors.reasonLength);

  let declined: { userId: string | null; business: string } | undefined;
  try {
    [declined] = await db
      .update(providers)
      .set({ status: "rejected", reviewedAt: sql`now()`, rejectionReason: why })
      .where(and(eq(providers.id, providerId), eq(providers.status, "pending")))
      .returning({ userId: providers.userId, business: providers.companyName });
  } catch (cause) {
    console.error("[review] declineProvider failed:", cause);
    return refused(copy.errors.write);
  }

  if (!declined) return alreadyDecided();

  const { userId, business } = declined;
  const outcome = await afterCommit(async () => {
    const [person] = userId
      ? await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
      : [];
    return sendReviewEmail(person?.email ?? null, "providerDeclined", {
      name: person?.name ?? "",
      business,
      reason: why,
      link: await link("/dashboard/apply"),
    });
  });
  return done(fill(copy.results.providerDeclined, { name: declined.business }), outcome);
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

/**
 * The account behind a product, for the email.
 *
 * Null for a product of the first-party provider, which has no account:
 * nobody to write to, so the email is skipped and the admin is told why.
 */
async function productOwner(providerId: string) {
  const [owner] = await db
    .select({ name: users.name, email: users.email })
    .from(providers)
    .leftJoin(users, eq(users.id, providers.userId))
    .where(eq(providers.id, providerId))
    .limit(1);
  return owner?.email ? { name: owner.name ?? "", email: owner.email } : null;
}

/**
 * The shared body of both product decisions. Private, and it does NOT check
 * the role: its two callers below each do that first and pass the admin in.
 * It must never be exported — it would be an unchecked public endpoint.
 */
async function decideProduct(
  admin: { id: string },
  productId: unknown,
  decision: "approved" | "rejected",
  reason: string | null,
): Promise<ReviewResult> {
  if (!validId(productId)) return refused(copy.errors.notPending);

  let decided: { name: string; providerId: string } | undefined;
  try {
    [decided] = await db
      .update(products)
      .set({
        status: decision,
        reviewedAt: sql`now()`,
        /* The column the schema has always had for this, and the one the
           queue uses to tell an admin's decision from a seeded row. */
        reviewedBy: admin.id,
        rejectionReason: reason,
      })
      .where(and(eq(products.id, productId), eq(products.status, "pending")))
      .returning({ name: products.name, providerId: products.providerId });
  } catch (cause) {
    console.error(`[review] ${decision} product failed:`, cause);
    return refused(copy.errors.write);
  }

  if (!decided) return alreadyDecided();

  const approved = decision === "approved";
  /* A decline changes nothing listed — only a pending product can be
     declined, and pending products are not listed. */
  if (approved) refreshListings();
  const { name: product, providerId } = decided;
  const outcome = await afterCommit(async () => {
    const owner = await productOwner(providerId);
    return sendReviewEmail(
      owner?.email ?? null,
      approved ? "productApproved" : "productDeclined",
      {
        name: owner?.name ?? "",
        product,
        reason: reason ?? "",
        link: await link("/dashboard/products/new"),
      },
    );
  });
  const line = approved ? copy.results.productApproved : copy.results.productDeclined;
  return done(fill(line, { name: product }), outcome);
}

export async function approveProduct(productId: unknown): Promise<ReviewResult> {
  const admin = await requireAdmin();
  if (!admin) return refused(copy.errors.notAdmin);
  return decideProduct(admin, productId, "approved", null);
}

export async function declineProduct(
  productId: unknown,
  reason: unknown,
): Promise<ReviewResult> {
  /* Role before reason, so a non-admin learns nothing about the rules. */
  const admin = await requireAdmin();
  if (!admin) return refused(copy.errors.notAdmin);
  const why = cleanReason(reason);
  if (!why) return refused(copy.errors.reasonLength);
  return decideProduct(admin, productId, "rejected", why);
}
