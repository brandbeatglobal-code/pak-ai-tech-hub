import type { Metadata } from "next";

import { AuthForm, AuthLink } from "@/components/auth-form";
import { logIn } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Log in — PAKAI TechHub",
  description: "Log in to your PAKAI TechHub account.",
};

export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <AuthForm
        action={logIn}
        heading="Log in"
        intro="Welcome back."
        submitLabel="Log in"
        pendingLabel="Logging in…"
        footer={
          <>
            No account yet? <AuthLink href="/sign-up">Sign up</AuthLink>
          </>
        }
      />
    </section>
  );
}
