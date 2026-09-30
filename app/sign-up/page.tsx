import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { googleSignInEnabled } from "@/auth";
import { AuthForm, AuthLink } from "@/components/auth-form";
import { siteCopy } from "@/content/site-copy";
import { signInWithGoogle, signUp } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: `Sign up — ${siteCopy.brand.name}`,
  description: `Create a ${siteCopy.brand.name} account as a buyer or an AI provider.`,
};

/**
 * /sign-up is for buyers.
 *
 * Providers sign up through the listing form at /list-your-product, which
 * creates the account and the application together. The Buyer/Provider
 * choice stays on this page, but Provider only leads there
 * (components/auth-form.tsx). `?role=provider` — what /start-listing used to
 * send signed-out visitors here with, and what old links may still carry —
 * goes straight to the listing form.
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const role = (await searchParams).role;
  if ((Array.isArray(role) ? role[0] : role) === "provider") redirect("/list-your-product");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <AuthForm
        action={signUp}
        showRoleChoice
        heading="Create an account"
        intro="Buyers find and try AI products. Providers list them, through the listing form. Pick the side you're on."
        submitLabel="Create account"
        pendingLabel="Creating account…"
        googleAction={googleSignInEnabled ? signInWithGoogle : undefined}
        footer={
          <>
            Already have an account? <AuthLink href="/login">Log in</AuthLink>
          </>
        }
      />
    </section>
  );
}
