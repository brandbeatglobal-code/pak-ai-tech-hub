import type { Metadata } from "next";

import { AuthForm, AuthLink } from "@/components/auth-form";
import { signUp } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Sign up — PAKAI TechHub",
  description: "Create a PAKAI TechHub account as a buyer or an AI provider.",
};

export default function SignUpPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <AuthForm
        action={signUp}
        showRoleChoice
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
