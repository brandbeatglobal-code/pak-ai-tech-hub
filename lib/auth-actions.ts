"use server";

import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { providers, users, type UserRole } from "@/db/schema";
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
    "admin" is not selectable. The only roles a sign-up form can create are
    buyer and provider; admins are promoted directly in the database until
    there is an admin UI to do it properly.
  */
  if (!isSignUpRole(roleInput)) return { error: "Choose an account type." };
  const role: UserRole = roleInput;

  if (role === "provider" && !companyName) {
    return { error: "Providers need a company name." };
  }

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (taken) return { error: "That email already has an account." };

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role,
      companyName: companyName || null,
    })
    .returning();

  /* A provider account gets its provider record in the same flow. */
  if (role === "provider") {
    await db.insert(providers).values({
      userId: user.id,
      companyName,
    });
  }

  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  redirect("/dashboard");
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

export async function logOut() {
  await signOut({ redirectTo: "/login" });
}
