import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ApplicationForm } from "@/components/application-form";
import { siteCopy } from "@/content/site-copy";
import { getApplication, getFirstDraft } from "@/lib/application-queries";

const copy = siteCopy.providerApplication;

export const metadata: Metadata = {
  title: copy.meta.title,
};

/**
 * The provider application.
 *
 * Gated twice, like product submission: this page decides what is rendered,
 * and `submitApplication` re-checks the session and role before it writes,
 * because a server action is reachable without loading this page.
 *
 * What a visitor sees depends on who they are and where their application is:
 *
 *   signed out                   -> /login
 *   admin                        -> /dashboard
 *   provider                     -> "you are already a provider", linking to
 *                                   product submission
 *   buyer, application pending   -> "under review", no form
 *   buyer, application approved  -> "approved, not finished setting up" —
 *                                   only reachable if a review decision set
 *                                   the status without the role
 *   buyer, application rejected  -> the form, filled with their last answers
 *   buyer, never applied         -> the form, business name from sign-up
 *
 * `session.user.role` is read fresh from the database on every request (the
 * `jwt` callback in auth.ts), so a buyer approved a moment ago already sees
 * the provider state here.
 *
 * An admin decides the application in the review queue at /dashboard/admin,
 * which also emails the applicant. This page did not change with that: a
 * declined applicant gets the reapply form here and the decline reason by
 * email only.
 */
export default async function ApplyPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const { role, id } = session.user;
  if (role === "admin") redirect("/dashboard");

  if (role === "provider") {
    const { heading, body, cta } = copy.states.alreadyProvider;
    return (
      <StatePanel heading={heading} body={body}>
        <Link
          href={cta.href}
          className="mt-8 inline-block rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          {cta.label}
        </Link>
      </StatePanel>
    );
  }

  const application = await getApplication(id);

  if (application?.status === "pending") {
    return <StatePanel {...copy.states.pending} />;
  }

  if (application?.status === "approved") {
    const { heading, body, cta } = copy.states.approved;
    return (
      <StatePanel heading={heading} body={body}>
        <Link
          href={cta.href}
          className="mt-8 inline-block text-base font-semibold text-brand-navy underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
        >
          {cta.label}
        </Link>
      </StatePanel>
    );
  }

  const resubmitting = application?.status === "rejected";
  const initial = application ? application.draft : await getFirstDraft(id);

  return (
    <Shell>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
        {copy.heading}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-brand-navy/70">
        {copy.intro}
      </p>
      <p className="mt-3 text-base leading-relaxed text-brand-navy/70">
        {copy.commission}
      </p>

      {resubmitting ? (
        <p className="mt-6 rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.03] px-5 py-4 text-base leading-relaxed text-brand-navy">
          {copy.resubmitNote}
        </p>
      ) : null}

      <div className="mt-10">
        <ApplicationForm initial={initial} />
      </div>
    </Shell>
  );
}

/** Page chrome shared by the form and every state: width, padding, back link. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-brand-navy/70 underline decoration-brand-green decoration-2 underline-offset-4 transition-colors hover:text-brand-navy hover:decoration-brand-blue"
      >
        {copy.backToDashboard}
      </Link>
      {children}
    </section>
  );
}

/** A state shown instead of the form. */
function StatePanel({
  heading,
  body,
  children,
}: {
  heading: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <Shell>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
        {heading}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-navy/70">
        {body}
      </p>
      {children}
    </Shell>
  );
}
