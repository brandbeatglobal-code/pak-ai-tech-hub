import type { Metadata } from "next";

import { googleSignInEnabled } from "@/auth";
import { AuthForm, AuthLink } from "@/components/auth-form";
import { signInWithGoogle, signUp } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Sign up — PAKAI TechHub",
  description: "Create a PAKAI TechHub account as a buyer or an AI provider.",
};

/**
 * `?role=provider` preselects the Provider option.
 *
 * Every "list your product" link on the site points at `/start-listing`,
 * which sends a signed-out visitor here with this parameter. Choosing
 * Provider does not make anyone a provider: it creates a buyer account and
 * lands it on the provider application instead of the dashboard (see
 * `signUp`). Without the parameter a would-be provider would land on the
 * dashboard and have to find the application themselves, so do not drop it
 * from the redirect in app/start-listing/route.ts.
 *
 * Anything other than "provider" falls back to the buyer default rather than
 * erroring, since the value comes off a URL anyone can edit.
 *
 * The same choice rides along with "Continue with Google": a Google sign-up
 * with Provider chosen also creates a buyer and lands on the application
 * (`signInWithGoogle`).
 */
function resolveRole(value: string | string[] | undefined) {
  const requested = Array.isArray(value) ? value[0] : value;
  return requested === "provider" ? "provider" : "buyer";
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const initialRole = resolveRole((await searchParams).role);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <AuthForm
        action={signUp}
        showRoleChoice
        initialRole={initialRole}
        heading="Create an account"
        intro="Buyers find and try AI products. Providers list them. Pick the side you're on — you can talk to us if you need both."
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
