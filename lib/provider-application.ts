/**
 * Shared vocabulary for the provider application form.
 *
 * Deliberately NOT a `"use server"` module, for the same reason as
 * lib/product-submission.ts: a file with that directive may only export async
 * functions, and both sides of this form need these constants, types and pure
 * helpers. The server action (`lib/application-actions.ts`) and the form
 * (`components/application-form.tsx`) both import from here, so the limits the
 * browser enforces and the limits the server enforces cannot drift apart.
 *
 * Nothing here touches the database or the session — a client component
 * imports it, so it has to stay safe to bundle for the browser.
 */

export { CATEGORY_LABELS, isAllowedCategory } from "@/lib/product-submission";

/** Length bounds. The DB columns are `text`, so these are the only limits. */
export const BUSINESS_NAME_MIN = 2;
export const BUSINESS_NAME_MAX = 100;
export const DESCRIPTION_MIN = 40;
export const DESCRIPTION_MAX = 600;
export const REASON_MIN = 20;
export const REASON_MAX = 600;
/** Generous for a URL; exists so the column cannot be used as a text dump. */
export const WEBSITE_MAX = 200;

/** What the applicant typed, echoed back so a rejected form is not emptied. */
export type ApplicationDraft = {
  businessName: string;
  description: string;
  category: string;
  website: string;
  reason: string;
};

export const EMPTY_APPLICATION: ApplicationDraft = {
  businessName: "",
  description: "",
  category: "",
  website: "",
  reason: "",
};

export type ApplicationState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "invalid";
      attempt: number;
      errors: Record<string, string>;
      values: ApplicationDraft;
    }
  | {
      status: "error";
      attempt: number;
      message: string;
      values: ApplicationDraft;
    };

/**
 * How many times this form has come back with something to fix.
 *
 * Same mechanism as the product form: React resets an uncontrolled form once
 * a server action resolves, so the form is keyed on this number to remount it
 * and make the echoed `defaultValue`s actually take.
 */
export function applicationAttempt(state: ApplicationState): number {
  return "attempt" in state ? state.attempt : 0;
}

/**
 * The values to show in the controls.
 *
 * After a rejected submission, what the applicant just typed. Before any
 * submission, `initial` — which for a previously rejected applicant is their
 * stored answers, so reapplying starts from what they said last time.
 */
export function applicationDraft(
  state: ApplicationState,
  initial: ApplicationDraft,
): ApplicationDraft {
  return "values" in state ? state.values : initial;
}

/**
 * "example.com" -> "https://example.com/", "" -> null, junk -> "invalid".
 *
 * A missing scheme gets https:// rather than an error, because nobody types
 * one. Only http and https survive: this value will be rendered as a link on
 * a listing one day, and `javascript:` or `data:` in an href is a script
 * injection waiting for a page to render it. Embedded credentials are refused
 * for the same reason — there is no legitimate use for them in a listing.
 *
 * Returns the normalised string, which is what gets stored.
 */
export function parseWebsite(raw: string): string | null | "invalid" {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > WEBSITE_MAX) return "invalid";

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return "invalid";
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return "invalid";
  if (url.username || url.password) return "invalid";
  /* "localhost", "intranet" and other single-label hosts are not a website. */
  if (!url.hostname.includes(".")) return "invalid";

  return url.toString();
}
