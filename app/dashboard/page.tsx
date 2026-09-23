import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { siteCopy } from "@/content/site-copy";
import { getApplication } from "@/lib/application-queries";
import { logOut } from "@/lib/auth-actions";
import type { ProviderStatus, UserRole } from "@/db/schema";

export const metadata: Metadata = {
  title: "Dashboard — PAKAI TechHub",
};

/**
 * Role-gated stub.
 *
 * This page exists to prove the role system works end to end — sign up, log
 * in, get the right view, log out. It is NOT the real dashboard. The admin
 * review queue and the buyer's subscription view are each a separate, later
 * pass; do not start growing them in here.
 *
 * The provider entry now carries a link out to the one real feature that
 * exists, `/dashboard/products/new`. That is a way in, not the feature: the
 * form lives on its own route and nothing about it is built in this file.
 * Tracking a provider's submissions and their review status is still to come.
 *
 * A buyer additionally sees the provider-application panel below: where their
 * application is, and a way into /dashboard/apply when there is something to
 * do there. Same principle — a status line and a link, not the feature. The
 * form and its states live on their own route.
 */
const STUBS: Record<
  UserRole,
  { heading: string; body: string; action?: { label: string; href: string } }
> = {
  buyer: {
    heading: "Buyer dashboard — coming soon",
    body: "Your trials, subscriptions and Academy progress will live here.",
  },
  provider: {
    heading: "Provider dashboard — coming soon",
    body: "You can submit a product for review now. Tracking each listing's status here comes next.",
    action: {
      label: siteCopy.providerSubmit.navLabel,
      href: "/dashboard/products/new",
    },
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

  const { role, name, email, id } = session.user;
  const stub = STUBS[role];

  /* Only a buyer has an application to show. A provider's was approved, and
     the provider panel above already covers what they can do next. */
  const application = role === "buyer" ? await getApplication(id) : null;

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

      {stub.action ? (
        <Link
          href={stub.action.href}
          className="mt-8 inline-block rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          {stub.action.label}
        </Link>
      ) : null}

      {role === "buyer" ? (
        <ApplicationPanel status={application?.status ?? null} />
      ) : null}

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

/**
 * The provider-application panel on a buyer's dashboard.
 *
 * Four states, keyed on the buyer's `providers` row:
 *
 *   none      -> invitation, linking to the form
 *   pending   -> under review; nothing to click, because nothing to do
 *   rejected  -> not approved, linking to the form to update and reapply
 *   approved  -> only while `users.role` has not caught up with the status;
 *                see the note on `providers.status` in db/schema.ts
 *
 * The fifth state — an approved provider — is not a buyer, so it never
 * reaches here: it gets the provider panel and its product-submission link.
 */
function ApplicationPanel({ status }: { status: ProviderStatus | null }) {
  const { dashboard, states } = siteCopy.providerApplication;
  const headingId = "provider-application-heading";

  const link = (label: string, href: string) => (
    <Link
      href={href}
      className="mt-6 inline-block rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
    >
      {label}
    </Link>
  );

  let body: string;
  let action: React.ReactNode = null;

  switch (status) {
    case null:
      body = dashboard.none.body;
      action = link(dashboard.none.cta, "/dashboard/apply");
      break;
    case "pending":
      body = dashboard.pending.body;
      break;
    case "rejected":
      body = dashboard.rejected.body;
      action = link(dashboard.rejected.cta, "/dashboard/apply");
      break;
    case "approved":
      body = dashboard.approved.body;
      action = link(states.approved.cta.label, states.approved.cta.href);
      break;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="mt-10 max-w-2xl rounded-3xl border border-black/5 bg-white p-8 shadow-sm"
    >
      <h2
        id={headingId}
        className="text-xl font-extrabold tracking-tight text-brand-navy"
      >
        {dashboard.heading}
      </h2>
      <p className="mt-3 leading-relaxed text-brand-navy/70">{body}</p>
      {action}
    </section>
  );
}
