/**
 * Types and helpers shared by the contact form (components/contact-form.tsx)
 * and its server action (lib/contact-actions.ts).
 *
 * They live here, not in the action's module, because a `"use server"` file may
 * export async functions and nothing else. Same split as
 * lib/product-submission.ts, whose pattern this follows.
 */

/** What the visitor sent, echoed back so a rejected form is not emptied. */
export type ContactDraft = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  country: string;
  email: string;
  industry: string;
  reason: string;
  product: string;
  message: string;
  consent: boolean;
};

export const EMPTY_CONTACT_DRAFT: ContactDraft = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  country: "",
  email: "",
  industry: "",
  reason: "",
  product: "",
  message: "",
  consent: false,
};

/*
 * Every state that sends the form back carries `attempt` and `values`: a
 * rejected field ("invalid") and a failed delivery ("error") alike. React
 * resets an uncontrolled form once a server action resolves, whatever the
 * outcome, so without them either one would empty all ten controls.
 */
export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; attempt: number; message: string; values: ContactDraft }
  | {
      status: "invalid";
      attempt: number;
      errors: Record<string, string>;
      values: ContactDraft;
    };

/**
 * How many times this form has come back with something to fix.
 *
 * The client keys the `<form>` on it. `defaultValue` only applies when a control
 * mounts, so re-rendering with the echoed values is not enough on its own — the
 * form has to remount for them to take, and a changing key is what remounts it.
 */
export function attemptOf(state: ContactState): number {
  return "attempt" in state ? state.attempt : 0;
}

/** The values to put back in the controls after a rejected submission. */
export function draftOf(state: ContactState): ContactDraft {
  return "values" in state ? state.values : EMPTY_CONTACT_DRAFT;
}
