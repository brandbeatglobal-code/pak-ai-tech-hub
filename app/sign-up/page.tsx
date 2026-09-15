import type { Metadata } from "next";

import { AuthForm, AuthLink } from "@/components/auth-form";
import { signUp } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Sign up — PAKAI TechHub",
  description: "Create a PAKAI TechHub account as a buyer or an AI provider.",
};

/**
 * `?role=provider` preselects the Provider option.
 *
 * The nav's "List your product" button and the homepage's provider band both
 * link here with it. Without this the links would land on the buyer form and
 * quietly sign providers up as buyers, so do not drop the parameter from those
 * links or this handling from here — they are one feature.
 *
 * Anything other than "provider" falls back to the buyer default rather than
 * erroring, since the value comes off a URL anyone can edit.
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
        footer={
          <>
            Already have an account? <AuthLink href="/login">Log in</AuthLink>
          </>
        }
      />
    </section>
  );
}
