/**
 * Shared vocabulary for the admin review queue.
 *
 * Not a `"use server"` module, for the same reason as
 * lib/product-submission.ts and lib/provider-application.ts: both the server
 * actions (`lib/review-actions.ts`) and the browser-side controls
 * (`components/admin/review-controls.tsx`) need these, and a file with that
 * directive may only export async functions. Nothing here touches the database
 * or the session, so it is safe to bundle for the browser.
 */

/**
 * Bounds on a decline reason.
 *
 * The reason is emailed to the applicant verbatim, so it has to say
 * something ("no" is not a reason) and stay an email paragraph, not an essay.
 */
export const REASON_MIN = 10;
export const REASON_MAX = 600;

/**
 * What every review action returns: one line for the admin to read.
 *
 * `stale` is set only when the item was already decided by someone else —
 * the one refusal where the page's list is out of date and should be
 * refreshed. Other refusals (not an admin any more, a bad reason) keep the
 * page as it is so the message stays on screen: refreshing after a dropped
 * session would redirect to /login before the admin could read why.
 */
export type ReviewResult = { ok: boolean; message: string; stale?: boolean };

export type ReviewKind = "provider" | "product";
