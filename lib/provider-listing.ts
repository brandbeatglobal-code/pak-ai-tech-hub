import { siteCopy } from "@/content/site-copy";
import type { ProviderType } from "@/db/schema";

/**
 * Shared rules for the provider listing form (/list-your-product).
 *
 * Deliberately NOT a `"use server"` module: a file with that directive may
 * only export async functions, and both sides of the form need these limits,
 * types and checks. The form (components/listing-form.tsx) runs a step's
 * checks before Continue; the server action (lib/listing-actions.ts) runs all
 * of them again before it writes anything. One set of rules, so the browser
 * and the server cannot disagree.
 *
 * Nothing here touches the database, the session or bcrypt — a client
 * component imports it, so it must stay safe to bundle for the browser. (The
 * `ProviderType` import is a type only and disappears at build.)
 */

export { CATEGORY_LABELS, isAllowedCategory } from "@/lib/product-submission";
import { isAllowedCategory } from "@/lib/product-submission";

const v = siteCopy.providerListing.validation;

/** Length bounds. The DB columns are `text`, so these are the only limits. */
export const EMAIL_MAX = 254;
/**
 * Same number as `MIN_PASSWORD_LENGTH` in lib/passwords.ts, which the server
 * action checks. That module imports bcrypt, so it is not bundled for the
 * browser; the form reads this one. Change both together.
 */
export const PASSWORD_MIN = 8;
export const FULL_NAME_MIN = 2;
export const FULL_NAME_MAX = 100;
export const PHONE_MAX = 30;
export const JOB_TITLE_MAX = 100;
export const BUSINESS_NAME_MIN = 2;
export const BUSINESS_NAME_MAX = 100;
export const DESCRIPTION_MIN = 40;
export const DESCRIPTION_MAX = 600;
export const REASON_MIN = 20;
export const REASON_MAX = 600;
/** Generous for a URL; exists so the column cannot be used as a text dump. */
export const WEBSITE_MAX = 200;

export const PROVIDER_TYPES = ["organisation", "individual"] as const satisfies readonly ProviderType[];

export function isProviderType(value: string): value is ProviderType {
  return (PROVIDER_TYPES as readonly string[]).includes(value);
}

/**
 * Everything the form sends back after a rejection, so nothing is retyped —
 * except the two password fields, which never leave the server. With
 * JavaScript the browser keeps them anyway (the form is never reset, see
 * components/listing-form.tsx); without it they have to be entered again.
 */
export type ListingDraft = {
  providerType: ProviderType;
  email: string;
  fullName: string;
  phone: string;
  jobTitle: string;
  businessName: string;
  website: string;
  category: string;
  description: string;
  reason: string;
  consent: boolean;
};

export const EMPTY_LISTING: ListingDraft = {
  providerType: "organisation",
  email: "",
  fullName: "",
  phone: "",
  jobTitle: "",
  businessName: "",
  website: "",
  category: "",
  description: "",
  reason: "",
  consent: false,
};

/** Every field the form has, by step. The two passwords are step 1's too. */
export type ListingField = keyof ListingDraft | "password" | "confirmPassword";

export const STEP_FIELDS: Record<1 | 2 | 3, ListingField[]> = {
  1: ["providerType", "email", "password", "confirmPassword"],
  2: ["fullName", "phone", "jobTitle"],
  3: ["businessName", "website", "category", "description", "reason", "consent"],
};

/** Which step a field is on — where the form goes back to when it is wrong. */
export function stepOf(field: string): 1 | 2 | 3 {
  if (STEP_FIELDS[1].includes(field as ListingField)) return 1;
  if (STEP_FIELDS[2].includes(field as ListingField)) return 2;
  return 3;
}

export type ListingErrors = Partial<Record<ListingField, string>>;

export type ListingState =
  | { status: "idle" }
  | { status: "invalid"; attempt: number; errors: ListingErrors; values: ListingDraft }
  | { status: "error"; attempt: number; message: string; values: ListingDraft };

export function listingAttempt(state: ListingState): number {
  return "attempt" in state ? state.attempt : 0;
}

const outOfRange = (value: string, min: number, max: number) =>
  value.length < min || value.length > max;

/** Deliberately plain: something@something.something, no spaces. */
function looksLikeEmail(value: string): boolean {
  return value.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Digits, spaces, "+", "-", ".", brackets; 7 to 15 digits (the most any
 * number has, country code included). Not checked further — a reviewer calls
 * it, and a wrong number is found out then.
 */
function looksLikePhone(value: string): boolean {
  if (value.length > PHONE_MAX || !/^\+?[0-9 ().-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
}

/**
 * "example.com" -> "https://example.com/", "" -> null, junk -> "invalid".
 *
 * A missing scheme gets https:// rather than an error, because nobody types
 * one. Only http and https survive: this value is rendered as a link in the
 * review queue, and `javascript:` or `data:` in an href is a script injection
 * waiting for a page to render it. Embedded credentials are refused for the
 * same reason. Returns the normalised string, which is what gets stored.
 */
export function parseWebsite(raw: string): string | null | "invalid" {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > WEBSITE_MAX) return "invalid";

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

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

/** Step 1, for someone without an account. */
export function checkAccount(input: {
  providerType: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ListingErrors {
  const errors: ListingErrors = {};
  if (!isProviderType(input.providerType)) errors.providerType = v.providerType;
  if (!looksLikeEmail(input.email)) errors.email = v.email;
  if (input.password.length < PASSWORD_MIN) errors.password = v.password;
  else if (input.confirmPassword !== input.password) errors.confirmPassword = v.confirmPassword;
  return errors;
}

/** Step 2. The job title is optional for an individual. */
export function checkPersonal(input: {
  providerType: string;
  fullName: string;
  phone: string;
  jobTitle: string;
}): ListingErrors {
  const errors: ListingErrors = {};
  if (outOfRange(input.fullName, FULL_NAME_MIN, FULL_NAME_MAX)) errors.fullName = v.fullName;
  if (!looksLikePhone(input.phone)) errors.phone = v.phone;
  const titleRequired = input.providerType !== "individual";
  if ((titleRequired && !input.jobTitle) || input.jobTitle.length > JOB_TITLE_MAX) {
    errors.jobTitle = v.jobTitle;
  }
  return errors;
}

/** Step 3. */
export function checkCompany(input: {
  businessName: string;
  website: string;
  category: string;
  description: string;
  reason: string;
  consent: boolean;
}): ListingErrors {
  const errors: ListingErrors = {};
  if (outOfRange(input.businessName, BUSINESS_NAME_MIN, BUSINESS_NAME_MAX)) {
    errors.businessName = v.businessNameLength;
  }
  if (parseWebsite(input.website) === "invalid") errors.website = v.website;
  if (!isAllowedCategory(input.category)) errors.category = v.category;
  if (outOfRange(input.description, DESCRIPTION_MIN, DESCRIPTION_MAX)) {
    errors.description = v.descriptionLength;
  }
  if (outOfRange(input.reason, REASON_MIN, REASON_MAX)) errors.reason = v.reasonLength;
  if (!input.consent) errors.consent = v.consent;
  return errors;
}
