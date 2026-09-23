"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { useAnnounce } from "@/components/admin/review-announcer";
import { siteCopy } from "@/content/site-copy";
import {
  approveProduct,
  approveProvider,
  declineProduct,
  declineProvider,
} from "@/lib/review-actions";
import {
  REASON_MAX,
  REASON_MIN,
  type ReviewKind,
  type ReviewResult,
} from "@/lib/review-shared";

/**
 * Approve / Decline for one pending item.
 *
 * Approve is one click. Decline opens a required reason field first, because
 * the reason is what the applicant is emailed — a decline with no reason would
 * leave them nothing to act on. The browser enforces the length for immediate
 * feedback; the server action enforces it again, and that is the check that
 * counts.
 *
 * A successful decision is reported by the announcer above the list, not
 * here: this row leaves the pending list as soon as the page refreshes.
 * "Someone else already decided this" goes to the announcer too, and
 * refreshes the page so the row moves to where it belongs. Every other
 * refusal (a bad reason, a dropped session, a lost role) stays inline and does
 * NOT refresh — after a dropped session the page gate would redirect to
 * /login before the message could be read.
 *
 * Every button carries the item's name for screen readers — a page of rows all
 * reading "Approve" would be useless to navigate by. It is set with
 * `aria-label` rather than visually hidden text: browsers disagree about the
 * spacing they put around a hidden span when computing a name ("Approve :
 * Name" in Chromium), and an explicit label reads the same everywhere. Each
 * label starts with the button's visible word, so speech-input users can
 * still say what they see (WCAG 2.5.3).
 */

const { actions } = siteCopy.adminReview;

export function ReviewControls({
  kind,
  id,
  name,
}: {
  kind: ReviewKind;
  id: string;
  name: string;
}) {
  const announce = useAnnounce();
  const router = useRouter();
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const uid = useId();
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const declineButtonRef = useRef<HTMLButtonElement>(null);
  const openedOnce = useRef(false);

  /* Opening the reason field puts the cursor in it; cancelling puts focus back
     on the button that opened it. */
  useEffect(() => {
    if (declining) {
      openedOnce.current = true;
      reasonRef.current?.focus();
    } else if (openedOnce.current) {
      declineButtonRef.current?.focus();
    }
  }, [declining]);

  function run(action: () => Promise<ReviewResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        announce(result.message, true);
      } else if (result.stale) {
        /* The refresh moves this row to the reviewed list, where it has no
           controls — an inline message would vanish with it. The announcer
           survives the refresh. */
        announce(result.message, false);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  const approve = () =>
    run(() => (kind === "provider" ? approveProvider(id) : approveProduct(id)));

  const decline = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reason = reasonRef.current?.value ?? "";
    run(() =>
      kind === "provider" ? declineProvider(id, reason) : declineProduct(id, reason),
    );
  };

  /* "Approve: Lahore Vision Labs". Only while idle — during a save the visible
     "Saving…" is the name, so the state change is announced. */
  const named = (label: string) => (pending ? undefined : `${label}: ${name}`);

  const errorId = `${uid}-error`;
  const noteId = `${uid}-note`;

  return (
    <div>
      {declining ? (
        <form onSubmit={decline} className="space-y-3">
          <div>
            <label htmlFor={`${uid}-reason`} className="block text-sm font-semibold text-brand-navy">
              {actions.reasonLabel}
            </label>
            <textarea
              ref={reasonRef}
              id={`${uid}-reason`}
              name="reason"
              rows={4}
              required
              minLength={REASON_MIN}
              maxLength={REASON_MAX}
              disabled={pending}
              aria-label={`${actions.reasonLabel}: ${name}`}
              aria-describedby={error ? `${errorId} ${noteId}` : noteId}
              aria-invalid={error ? true : undefined}
              className="mt-2 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-brand-navy outline-none focus-visible:border-brand-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            />
            <p id={noteId} className="mt-1.5 text-xs text-brand-navy/65">
              {actions.reasonNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              aria-label={named(actions.confirmDecline)}
              className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? actions.working : actions.confirmDecline}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setError(null);
                setDeclining(false);
              }}
              className="rounded-full border border-brand-navy/15 px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-navy/40 disabled:opacity-60"
            >
              {actions.cancel}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2 lg:flex-col">
          <button
            type="button"
            onClick={approve}
            disabled={pending}
            aria-label={named(actions.approve)}
            className="rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? actions.working : actions.approve}
          </button>
          <button
            ref={declineButtonRef}
            type="button"
            onClick={() => setDeclining(true)}
            disabled={pending}
            aria-label={named(actions.decline)}
            className="rounded-full border border-red-700/30 px-5 py-2.5 text-sm font-semibold text-red-800 transition-colors hover:border-red-700/60 hover:bg-red-50 disabled:opacity-60"
          >
            {actions.decline}
          </button>
        </div>
      )}

      {/* Always present, so a refusal is announced when it appears. */}
      <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-red-700 empty:hidden">
        {error ?? ""}
      </p>
    </div>
  );
}
