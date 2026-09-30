import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, googleSignInEnabled } from "@/auth";
import { ListingForm } from "@/components/listing-form";
import { siteCopy } from "@/content/site-copy";
import { getApplication, getFirstDraft } from "@/lib/application-queries";
import { signInWithGoogle } from "@/lib/auth-actions";
import { EMPTY_LISTING, isProviderType, type ListingDraft } from "@/lib/provider-listing";

const copy = siteCopy.providerListing;

/**
 * The provider listing page — what /list-your-product and /dashboard/apply
 * both render, so there is one form and one set of states behind the two
 * addresses.
 *
 * Gated here for what is RENDERED; `submitListing` re-checks the session and
 * role for what is STORED, because a server action is reachable without
 * loading this page.
 *
 *   signed out                  -> the form from step 1 (Account)
 *   admin                       -> /dashboard
 *   provider                    -> "you are already a provider"
 *   buyer, application pending -> "submitted" right after a submit, else
 *                                  "under review" — no form
 *   buyer, approved (not role)  -> "approved, not finished setting up" — only
 *                                  reachable if a decision set the status
 *                                  without the role
 *   buyer, declined             -> the form from step 2, with their answers
 *   buyer, never applied        -> the form from step 2, name filled in
 *
 * `?type=organisation|individual` preselects "I am registering as" — the
 * Google button carries the choice through Google's sign-in this way. It is a
 * starting point only; the radio stays editable, and a declined applicant's
 * stored choice wins over it.
 *
 * `session.user.role` is read fresh from the database on every request (the
 * `jwt` callback in auth.ts), so someone approved a moment ago is already a
 * provider here.
 */
export async function ListingPage({
  type,
  submitted,
}: {
  type?: string;
  submitted?: boolean;
}) {
  const session = await auth();
  const account = session?.user ?? null;

  if (account?.role === "admin") redirect("/dashboard");

  if (account?.role === "provider") {
    const { heading, body, cta } = copy.states.alreadyProvider;
    return (
      <StatePanel heading={heading} body={body}>
        <Link href={cta.href} className={primaryLink}>
          {cta.label}
        </Link>
      </StatePanel>
    );
  }

  let initial: ListingDraft = { ...EMPTY_LISTING };
  let resubmitting = false;

  if (account) {
    const application = await getApplication(account.id);

    if (application?.status === "pending") {
      if (submitted) {
        const { heading, body, cta } = copy.submitted;
        return (
          <StatePanel heading={heading} body={body} announce>
            <Link href={cta.href} className={primaryLink}>
              {cta.label}
            </Link>
          </StatePanel>
        );
      }
      return <StatePanel {...copy.states.pending} />;
    }

    if (application?.status === "approved") {
      const { heading, body, cta } = copy.states.approved;
      return (
        <StatePanel heading={heading} body={body}>
          <Link href={cta.href} className={primaryLink}>
            {cta.label}
          </Link>
        </StatePanel>
      );
    }

    resubmitting = application?.status === "rejected";
    initial = application ? application.draft : await getFirstDraft(account.id);
  }

  if (!resubmitting && type && isProviderType(type)) initial.providerType = type;

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
        {copy.heading}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-brand-navy/70">{copy.intro}</p>
      <p className="mt-2 text-base leading-relaxed text-brand-navy/70">{copy.terms}</p>

      {resubmitting ? (
        <p className="mt-6 rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.03] px-5 py-4 text-base leading-relaxed text-brand-navy">
          {copy.resubmitNote}
        </p>
      ) : null}

      <div className="mt-10">
        <ListingForm
          initial={initial}
          signedIn={account !== null}
          googleAction={!account && googleSignInEnabled ? signInWithGoogle : undefined}
        />
      </div>
    </Shell>
  );
}

const primaryLink =
  "mt-8 inline-block rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      {children}
    </section>
  );
}

/** A state shown instead of the form. `announce` for one reached by a submit. */
function StatePanel({
  heading,
  body,
  announce = false,
  children,
}: {
  heading: string;
  body: string;
  announce?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Shell>
      <div role={announce ? "status" : undefined}>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-navy/70">{body}</p>
      </div>
      {children}
    </Shell>
  );
}

export default ListingPage;
