import { Resend } from "resend";

import { siteCopy } from "@/content/site-copy";

/**
 * The emails the review queue sends — one per decision, to the person the
 * decision is about.
 *
 * NOT a `"use server"` module. Anything exported from one of those is a public
 * endpoint, and "send this text to this address from our verified domain" is
 * the last thing that should be callable by anyone on the internet. Only
 * lib/review-actions.ts calls this, after it has checked the caller is an
 * admin and after the decision has been written.
 *
 * Sending uses the same two variables as the contact form: `RESEND_API_KEY`,
 * and `CONTACT_FROM_EMAIL` as the sender. That name is historical — it is the
 * site's one verified no-reply address, and there is no reason to verify a
 * second. Replies go to the contact inbox, so a person reads them.
 *
 * A failed or unconfigured send never undoes a decision. It is reported back
 * to the admin as its own line, so they know to follow up by hand.
 */

const { reviewEmails } = siteCopy;
const REPLY_TO = siteCopy.contact.details.email.value;

export type Template = keyof Omit<typeof reviewEmails, "signOff">;

export type EmailOutcome =
  | { kind: "sent"; to: string }
  /* `to` is null when the recipient could not be looked up at all. */
  | { kind: "failed"; to: string | null }
  | { kind: "not-configured" }
  | { kind: "no-recipient" };

/** Replaces every `{key}` in `text`; unknown keys are left visible, not blanked. */
function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/**
 * Renders one template to a subject and plain-text body.
 *
 * Exported so the shape of what gets sent can be checked without sending it.
 */
export function renderReviewEmail(
  template: Template,
  values: Record<string, string>,
): { subject: string; text: string } {
  const { subject, body } = reviewEmails[template];
  return {
    subject: fill(subject, values),
    text: [...body.map((line) => fill(line, values)), "", "—", reviewEmails.signOff].join(
      "\n",
    ),
  };
}

export async function sendReviewEmail(
  to: string | null,
  template: Template,
  values: Record<string, string>,
): Promise<EmailOutcome> {
  if (!to) return { kind: "no-recipient" };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error(
      "[review-email] Not configured:" +
        (apiKey ? "" : " RESEND_API_KEY missing.") +
        (from ? "" : " CONTACT_FROM_EMAIL missing."),
    );
    return { kind: "not-configured" };
  }

  const { subject, text } = renderReviewEmail(template, values);

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to: [to],
      replyTo: REPLY_TO,
      subject,
      text,
    });
    /* The reason for us; never the body, which carries the admin's words. */
    if (error || !data?.id) {
      console.error("[review-email] Send rejected:", error ?? "no message id");
      return { kind: "failed", to };
    }
    return { kind: "sent", to };
  } catch (cause) {
    console.error("[review-email] Send threw:", cause);
    return { kind: "failed", to };
  }
}
