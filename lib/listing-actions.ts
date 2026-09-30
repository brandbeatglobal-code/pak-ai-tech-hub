"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import { siteCopy } from "@/content/site-copy";
import { db } from "@/db";
import { providers, users } from "@/db/schema";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/passwords";
import {
  checkAccount,
  checkCompany,
  checkPersonal,
  isProviderType,
  listingAttempt,
  parseWebsite,
  type ListingDraft,
  type ListingErrors,
  type ListingState,
} from "@/lib/provider-listing";

/**
 * The provider listing form's one server action.
 *
 * It replaced two: `signUp` with "Provider" chosen, then `submitApplication`
 * on /dashboard/apply. Now one submit does both, in this order:
 *
 *   1. Read the session. Signed in, it must be a buyer (a provider or an
 *      admin has nothing to apply for); step 1's account fields are then
 *      ignored — an existing account is never replaced or duplicated.
 *   2. Check EVERY field, all three steps, with the same rules the form ran
 *      before each Continue (lib/provider-listing.ts). Nothing is written
 *      unless all of it passes.
 *   3. In ONE transaction: create the buyer account if there is none, and
 *      write the pending application. If either part fails, neither exists.
 *   4. Sign a new account in, and go to the "submitted" page.
 *
 * WHAT IT NEVER DOES. It never makes anyone a provider: `users.role` is
 * written only as "buyer", and only an admin's approval in the review queue
 * changes it (`approveProvider`, lib/review-actions.ts). It never overwrites
 * an application that is pending or approved — only a declined one, which is
 * a resubmission. And one account has at most one application: the unique
 * `providers.user_id` settles that in the database, not in a read-then-write.
 *
 * A raw password is a local variable here and goes no further: it is hashed,
 * or handed to Auth.js to sign in, and never logged, stored or echoed back.
 *
 * AUTHORISATION IS DECIDED HERE, not on the page. A server action is a public
 * endpoint, reachable without loading the form.
 */

const copy = siteCopy.providerListing;

/** Thrown inside the transaction to undo it and say why. */
class Refused extends Error {
  constructor(readonly reason: "emailTaken" | "pending" | "approved") {
    super(reason);
  }
}

export async function submitListing(
  previous: ListingState,
  formData: FormData,
): Promise<ListingState> {
  const attempt = listingAttempt(previous) + 1;
  const text = (name: string) => String(formData.get(name) ?? "").trim();

  const providerTypeInput = text("providerType");
  const values: ListingDraft = {
    providerType: isProviderType(providerTypeInput) ? providerTypeInput : "organisation",
    email: text("email").toLowerCase(),
    fullName: text("fullName"),
    /* Runs of spaces collapsed; otherwise stored as typed. */
    phone: text("phone").replace(/\s+/g, " "),
    jobTitle: text("jobTitle"),
    businessName: text("businessName"),
    website: text("website"),
    category: text("category"),
    description: text("description"),
    reason: text("reason"),
    consent: formData.get("consent") === "on",
  };
  /* Not trimmed: a space is a character of a password. */
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const session = await auth();
  const account = session?.user ?? null;

  /*
    Which form was filled in — with step 1 (for a new account) or without it
    (for the signed-in account). If the session changed since the page was
    rendered, say so instead of acting on a form that no longer fits: a
    signed-out submit of a step-2 form has no account fields to use, and a
    new-account form must not be attached to whoever signed in meanwhile.
  */
  const formFor = text("formFor");
  if (formFor === "account" && !account) {
    return { status: "error", attempt, message: copy.errors.signedOut, values };
  }
  if (formFor === "new" && account) {
    return { status: "error", attempt, message: copy.errors.signedInMeanwhile, values };
  }

  if (account && account.role !== "buyer") {
    return { status: "error", attempt, message: copy.errors.notBuyer, values };
  }

  const errors: ListingErrors = {
    ...(account
      ? isProviderType(providerTypeInput)
        ? {}
        : { providerType: copy.validation.providerType }
      : checkAccount({ providerType: providerTypeInput, email: values.email, password, confirmPassword })),
    ...checkPersonal({ ...values, providerType: providerTypeInput }),
    ...checkCompany(values),
  };
  /* The auth rule itself, in case the shared number and it ever differ. */
  if (!account && password.length < MIN_PASSWORD_LENGTH) {
    errors.password = copy.validation.password;
  }

  const website = parseWebsite(values.website);
  if (Object.keys(errors).length > 0 || website === "invalid") {
    return { status: "invalid", attempt, errors, values };
  }

  /* Slow on purpose (bcrypt, cost 12), so done before the transaction opens. */
  const passwordHash = account ? null : await hashPassword(password);

  const answers = {
    providerType: values.providerType,
    contactPhone: values.phone,
    contactTitle: values.jobTitle || null,
    companyName: values.businessName,
    description: values.description,
    category: values.category,
    website,
    reasonForListing: values.reason,
    /* Explicit: a later change to the column default must not start
       auto-approving applications. */
    status: "pending" as const,
    /*
      Stamped on the first application and on every resubmission — `answers`
      feeds both the insert and the conflict update below — so a resubmitted
      application joins the back of the review queue. The database's clock.
    */
    submittedAt: sql`now()`,
  };

  try {
    await db.transaction(async (tx) => {
      let userId: string;

      if (account) {
        userId = account.id;
        /*
          The name on the account becomes the full name given here, so the
          review queue shows the applicant as they asked to be addressed. It
          is their own account; if the application is refused below, this
          is rolled back with it.
        */
        await tx.update(users).set({ name: values.fullName }).where(eq(users.id, userId));
      } else {
        /*
          `users.email` is unique, so a second account for an address cannot
          be made — two forms submitted at once included. The loser gets the
          same message /sign-up gives.
        */
        const [created] = await tx
          .insert(users)
          .values({
            email: values.email,
            passwordHash,
            role: "buyer",
            name: values.fullName,
            companyName: values.providerType === "organisation" ? values.businessName : null,
          })
          .onConflictDoNothing({ target: users.email })
          .returning({ id: users.id });
        if (!created) throw new Refused("emailTaken");
        userId = created.id;
      }

      /*
        One statement for a first application and a resubmission alike: no
        row yet, insert one; a row there already, the unique `user_id` turns
        this into an update — but only of a "rejected" row. A pending or
        approved application is never overwritten.
      */
      const [written] = await tx
        .insert(providers)
        .values({ userId, ...answers })
        .onConflictDoUpdate({
          target: providers.userId,
          set: answers,
          setWhere: eq(providers.status, "rejected"),
        })
        .returning({ id: providers.id });

      if (!written) {
        const [existing] = await tx
          .select({ status: providers.status })
          .from(providers)
          .where(eq(providers.userId, userId))
          .limit(1);
        throw new Refused(existing?.status === "approved" ? "approved" : "pending");
      }
    });
  } catch (cause) {
    if (cause instanceof Refused) {
      if (cause.reason === "emailTaken") {
        return { status: "invalid", attempt, errors: { email: copy.errors.emailTaken }, values };
      }
      const message =
        cause.reason === "approved" ? copy.errors.alreadyApproved : copy.errors.alreadyPending;
      return { status: "error", attempt, message, values };
    }
    /* The error only. No session, no answers, nothing identifying. */
    console.error("[provider-listing] Write failed:", cause);
    return { status: "error", attempt, message: copy.errors.write, values };
  }

  if (!account) {
    try {
      await signIn("credentials", { email: values.email, password, redirect: false });
    } catch (cause) {
      /* The account and the application are saved; only the sign-in failed.
         Logging in by hand gets them to the same place. */
      console.error("[provider-listing] Sign-in after sign-up failed:", cause);
      redirect("/login");
    }
  }

  redirect("/list-your-product?submitted=1");
}
