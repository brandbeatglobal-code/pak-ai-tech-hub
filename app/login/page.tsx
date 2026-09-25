import type { Metadata } from "next";

import { GOOGLE_EMAIL_UNVERIFIED, googleSignInEnabled } from "@/auth";
import { AuthForm, AuthLink } from "@/components/auth-form";
import { siteCopy } from "@/content/site-copy";
import { logIn, signInWithGoogle } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Log in — PAKAI TechHub",
  description: "Log in to your PAKAI TechHub account.",
};

/**
 * What to say when a sign-in comes back here with `?error=`.
 *
 * Auth.js sends every refused or failed Google sign-in to this page (`pages`
 * in auth.ts). "OAuthAccountNotLinked" is the account-linking decision: the
 * email already has a password account, and the two are not merged. Every
 * other code — a cancelled Google screen, a configuration fault — gets the
 * general message, which never repeats what Auth.js reported.
 */
function signInNotice(value: string | string[] | undefined): string | undefined {
  const code = Array.isArray(value) ? value[0] : value;
  if (!code) return undefined;

  const { errors } = siteCopy.googleSignIn;
  if (code === "OAuthAccountNotLinked") return errors.accountExists;
  if (code === GOOGLE_EMAIL_UNVERIFIED) return errors.emailUnverified;
  return errors.failed;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const notice = signInNotice((await searchParams).error);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <AuthForm
        action={logIn}
        heading="Log in"
        intro="Welcome back."
        submitLabel="Log in"
        pendingLabel="Logging in…"
        googleAction={googleSignInEnabled ? signInWithGoogle : undefined}
        notice={notice}
        footer={
          <>
            No account yet? <AuthLink href="/sign-up">Sign up</AuthLink>
          </>
        }
      />
    </section>
  );
}
