import { siteCopy } from "@/content/site-copy";

/**
 * Shared vocabulary for the provider product-submission form.
 *
 * Deliberately NOT a `"use server"` module: a file with that directive may only
 * export async functions, and both sides of this form need these constants and
 * types. The server action (`lib/product-actions.ts`) and the form component
 * (`components/product-form.tsx`) both import from here, so the limits the
 * browser enforces and the limits the server enforces cannot drift apart.
 *
 * Nothing here touches the database or the session — importing it into a client
 * component has to stay safe.
 */

/** Length bounds. The DB columns are `text`, so these are the only limits. */
export const NAME_MIN = 3;
export const NAME_MAX = 80;
export const DESCRIPTION_MIN = 40;
export const DESCRIPTION_MAX = 600;

/**
 * Ceiling on a submitted price.
 *
 * Not a business rule — a sanity bound, so a typo cannot write a number that
 * overflows `numeric(12, 2)` or renders as nonsense on a card.
 */
export const PRICE_MAX = 1_000_000;

/**
 * Categories a provider may choose, as the labels the marketplace shows.
 *
 * Derived from the marketplace filter list rather than retyped, minus the "all"
 * reset — that is a filter control, not a category anything can belong to. The
 * labels (not the ids) are what goes in the column, because that is what
 * `db/seed.ts` writes for the eight first-party rows; storing ids here would
 * give one column two vocabularies.
 *
 * This is deliberately narrower than the nine browse categories. Only these
 * five have a marketplace filter, so a product filed under any other one could
 * never be found once the marketplace reads this table. Widening the list means
 * adding a `ProductCategory` and a filter for it first.
 *
 * TWO forms read this list: the product form, for `products.category`, and
 * the provider application (lib/provider-application.ts), for
 * `providers.category`. A provider and their products are filed under one
 * vocabulary; changing it here changes both.
 */
export const CATEGORY_LABELS: string[] =
  siteCopy.marketplace.products.categories
    .filter((category) => category.id !== "all")
    .map((category) => category.label);

const ALLOWED_CATEGORIES = new Set(CATEGORY_LABELS);

export function isAllowedCategory(value: string): boolean {
  return ALLOWED_CATEGORIES.has(value);
}

/** What the provider typed, echoed back so a rejected form is not emptied. */
export type ProductDraft = {
  name: string;
  description: string;
  category: string;
  price: string;
};

export const EMPTY_DRAFT: ProductDraft = {
  name: "",
  description: "",
  category: "",
  price: "",
};

export type ProductSubmissionState =
  | { status: "idle" }
  | { status: "success"; name: string }
  | {
      status: "invalid";
      attempt: number;
      errors: Record<string, string>;
      values: ProductDraft;
    }
  | { status: "error"; attempt: number; message: string; values: ProductDraft };

/**
 * How many times this form has come back with something to fix.
 *
 * The client keys the `<form>` on it. React resets an uncontrolled form once a
 * server action completes, so re-rendering with new `defaultValue`s is not
 * enough on its own — the element has to remount for them to take, and a
 * changing key is what remounts it.
 */
export function attemptOf(state: ProductSubmissionState): number {
  return "attempt" in state ? state.attempt : 0;
}

/** The values to put back in the controls after a rejected submission. */
export function draftOf(state: ProductSubmissionState): ProductDraft {
  return "values" in state ? state.values : EMPTY_DRAFT;
}

/**
 * "$1,200.50" -> "1200.50", and null for anything that is not a plain amount.
 *
 * Returns a string, not a number: `numeric(12, 2)` is exact decimal and
 * postgres-js hands it to the driver as text. Rounding through a float on the
 * way in would be the one place this could silently lose a cent.
 */
export function parsePrice(raw: string): string | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  /* Up to seven digits before the point keeps it inside numeric(12, 2). */
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(cleaned)) return null;

  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0 || amount > PRICE_MAX) return null;

  return amount.toFixed(2);
}
