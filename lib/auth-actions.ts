"use server";

import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { googleSignInEnabled, signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/passwords";

/**
 * Server actions for the auth slice.
 *
 * Every one of these runs on the server only. A raw password reaches
 * `signUp` and `logIn` as a local variable and goes no further: it is hashed
 * or handed to Auth.js and then dropped. Nothing here logs a form value, and
 * the error strings returned to the client never echo one back.
 */

export type FormState = { error?: string } | undefined;

const SIGNUP_ROLES = ["buyer", "provider"] as const;
type SignUpRole = (typeof SIGNUP_ROLES)[number];

function isSignUpRole(value: string): value is SignUpRole {
  return (SIGNUP_ROLES as readonly string[]).includes(value);
}

export async function signUp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const companyName = String(formData.get("companyName") ?? "").trim();
  const roleInput = String(formData.get("role") ?? "");

  if (!name) return { error: "Enter your name." };
  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  /*
    The account-type choice is INTENT, not the role granted.

    Every sign-up creates a buyer. Choosing "Provider" only changes where the
    new account lands: on the provider application rather than the dashboard.
    It used to create a provider on the spot, with a `providers` row and no
    review — which would make the application flow decorative, since anyone
    could skip it by picking the other radio button. A provider is now what an
    approved application makes you, and nothing else.

    "admin" is not selectable either way; admins are promoted directly in the
    database until there is an admin UI to do it properly.
  */
  if (!isSignUpRole(roleInput)) return { error: "Choose an account type." };
  const wantsToList = roleInput === "provider";
  const role: UserRole = "buyer";

  /* Kept so the application's business-name field starts filled in. */
  if (wantsToList && !companyName) {
    return { error: "Providers need a company name." };
  }

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (taken) return { error: "That email already has an account." };

  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    name,
    email,
    passwordHash,
    role,
    companyName: companyName || null,
  });

  /*
    No `providers` row here any more. One is written by the application,
    when there are answers to review — an empty row created at sign-up would
    sit in the review queue as a "pending application" with nothing in it.
  */

  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  redirect(wantsToList ? "/dashboard/apply" : "/dashboard");
}

export async function logIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    /*
      One message for "no such user" and "wrong password" alike — telling them
      apart would confirm which emails have accounts.
    */
    if (error instanceof AuthError) return { error: "Email or password is incorrect." };
    throw error;
  }

  redirect("/dashboard");
}

/**
 * Starts a Google sign-in, from /login or /sign-up. Auth.js takes it from
 * here: off to Google, back to /api/auth/callback/google, then to the path
 * below — or to /login with a message if the sign-in is refused.
 *
 * Same rule as `signUp`: the sign-up page's "Provider" choice is intent, not
 * a role. It only decides where a Google sign-up lands — the provider
 * application instead of the dashboard. The account is a buyer either way
 * (`createUser` in auth.ts). Only these two fixed paths can come out of here,
 * so the posted value cannot send anyone anywhere else.
 *
 * /login posts no intent, so it always lands on the dashboard.
 */
export async function signInWithGoogle(formData: FormData) {
  if (!googleSignInEnabled) redirect("/login");

  const wantsToList = formData.get("intent") === "provider";
  await signIn("google", {
    redirectTo: wantsToList ? "/dashboard/apply" : "/dashboard",
  });
}

export async function logOut() {
  await signOut({ redirectTo: "/login" });
}
