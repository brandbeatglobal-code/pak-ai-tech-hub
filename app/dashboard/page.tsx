import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { logOut } from "@/lib/auth-actions";
import type { UserRole } from "@/db/schema";

export const metadata: Metadata = {
  title: "Dashboard — PAKAI TechHub",
};

/**
 * Role-gated stub.
 *
 * This page exists to prove the role system works end to end — sign up, log
 * in, get the right view, log out. It is NOT the real dashboard. The provider
 * product-submission form, the admin review queue and the buyer's subscription
 * view are each a separate, later pass; do not start growing them in here.
 */
const STUBS: Record<UserRole, { heading: string; body: string }> = {
  buyer: {
    heading: "Buyer dashboard — coming soon",
    body: "Your trials, subscriptions and Academy progress will live here.",
  },
  provider: {
    heading: "Provider dashboard — coming soon",
    body: "Submit products for review and track their listing status here.",
  },
  admin: {
    heading: "Admin — coming soon",
    body: "The product review queue will live here.",
  },
};

export default async function DashboardPage() {
  const session = await auth();

  /* Server-side gate. No session, no page — checked here rather than in
     middleware, which runs on the edge where bcrypt cannot. */
  if (!session?.user) redirect("/login");

  const { role, name, email } = session.user;
  const stub = STUBS[role];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <p className="text-sm font-bold tracking-wide text-brand-navy/65 uppercase">
        Signed in as {role}
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
        {stub.heading}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
        {stub.body}
      </p>

      <dl className="mt-10 max-w-md space-y-3 rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <div className="flex justify-between gap-6">
          <dt className="text-sm font-semibold text-brand-navy/65">Name</dt>
          <dd className="text-sm font-medium text-brand-navy">{name}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-sm font-semibold text-brand-navy/65">Email</dt>
          <dd className="text-sm font-medium text-brand-navy">{email}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-sm font-semibold text-brand-navy/65">Role</dt>
          <dd className="text-sm font-medium text-brand-navy">{role}</dd>
        </div>
      </dl>

      <form action={logOut} className="mt-8">
        <button
          type="submit"
          className="rounded-full border border-brand-navy/15 px-6 py-3 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy/40"
        >
          Log out
        </button>
      </form>
    </section>
  );
}
