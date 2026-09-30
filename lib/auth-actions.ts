"use server";

import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { googleSignInEnabled, signIn, signOut } from "@/auth";
import { siteCopy } from "@/content/site-copy";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/passwords";
import { isProviderType } from "@/lib/provider-listing";

/**
 * Server actions for the auth slice.
 *
 * Every one of these runs on the server only. A raw password reaches
 * `signUp` and `logIn` as a local variable and goes no further: it is hashed
 * or handed to Auth.js and then dropped. Nothing here logs a form value, and
 * the error strings returned to the client never echo one back.
 */

/**
 * What a rejected sign-up or login sends back: the message, a counter the
 * form remounts on, and what was typed — never the password — so the form
 * comes back filled in rather than empty.
 */
export type FormState =
  | {
      error?: string;
      attempt?: number;
      values?: { name?: string; email?: string; companyName?: string };
    }
  | undefined;

export async function signUp(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const companyName = String(formData.get("companyName") ?? "").trim();
  const roleInput = String(formData.get("role") ?? "");
  const reject = (error: string): FormState => ({
    error,
    attempt: (prev?.attempt ?? 0) + 1,
    values: { name, email, companyName },
  });

  if (!name) return reject("Enter your name.");
  if (!email.includes("@")) return reject("Enter a valid email address.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return reject(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  /*
    /sign-up makes BUYERS, and only buyers.

    Its "Provider" choice no longer submits here at all: it leads to the
    listing form at /list-your-product, which creates the account and the
    application together (`submitListing`, lib/listing-actions.ts). A post
    with "provider" can only come from outside the page, and is refused with
    the same pointer. A provider is what an approved application makes you,
    and nothing else; "admin" is not selectable either — admins are promoted
    directly in the database until there is an admin UI to do it properly.
  */
  if (roleInput !== "buyer") return reject(siteCopy.signUp.providerRoute.body);
  const role: UserRole = "buyer";

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (taken) return reject(siteCopy.account.emailTaken);

  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    name,
    email,
    passwordHash,
    role,
    companyName: companyName || null,
  });

  /* No `providers` row: a buyer has no application. The listing form writes
     one, with answers to review. */

  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  redirect("/dashboard");
}

export async function logIn(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const reject = (error: string): FormState => ({
    error,
    attempt: (prev?.attempt ?? 0) + 1,
    values: { email },
  });

  if (!email || !password) return reject("Enter your email and password.");

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    /*
      One message for "no such user" and "wrong password" alike — telling them
      apart would confirm which emails have accounts.
    */
    if (error instanceof AuthError) return reject("Email or password is incorrect.");
    throw error;
  }

  redirect("/dashboard");
}

/**
 * Starts a Google sign-in, from /login, /sign-up or step 1 of the listing
 * form. Auth.js takes it from here: off to Google, back to
 * /api/auth/callback/google, then to the path below — or to /login with a
 * message if the sign-in is refused.
 *
 * The account is a buyer either way (`createUser` in auth.ts). The listing
 * form posts `intent=provider` and its "I am registering as" choice, and
 * lands back on the form — at step 2, since the person is now signed in —
 * with that choice still made. Only fixed paths come out of here, and the
 * type is checked against its two values, so the posted fields cannot send
 * anyone anywhere else.
 *
 * /login and /sign-up post no intent, so they land on the dashboard.
 */
export async function signInWithGoogle(formData: FormData) {
  if (!googleSignInEnabled) redirect("/login");

  const wantsToList = formData.get("intent") === "provider";
  const type = String(formData.get("providerType") ?? "");
  const listing = isProviderType(type) ? `/list-your-product?type=${type}` : "/list-your-product";
  await signIn("google", {
    redirectTo: wantsToList ? listing : "/dashboard",
  });
}

export async function logOut() {
  await signOut({ redirectTo: "/login" });
}
