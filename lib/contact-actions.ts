"use server";

import { Resend } from "resend";

import { countries } from "@/content/countries";
import { siteCopy } from "@/content/site-copy";

/**
 * Contact form submission.
 *
 * Sends one plain-text email via Resend and returns a real result. Nothing is
 * written to the database: this is an email-delivery form, not a reviewed
 * record. Do not add a table for it.
 *
 * The success state is only returned AFTER Resend confirms the send, so the
 * page never claims a message went out when it did not. Every failure path
 * returns the mailto address so the sender is never left with a dead end.
 */

const { contact, industries, marketplace } = siteCopy;

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string }
  | { status: "invalid"; errors: Record<string, string> };

/** Destination inbox — the same address the hero's mailto uses. */
const TO_ADDRESS = contact.details.email.value;

/**
 * Allow-lists for the four selects, derived from the same arrays the site
 * renders. Re-checked on the server because a client can post anything.
 */
const ALLOWED = {
  country: new Set(countries.map((c) => c.name)),
  industry: new Set(industries.items.map((i) => i.name)),
  reason: new Set<string>(contact.form.reasons),
  product: new Set<string>([
    ...marketplace.products.items.map((p) => p.name),
    contact.form.productUnsure,
  ]),
};

/** Deliberately permissive — real addresses are stranger than most patterns. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(data: FormData, name: string): string {
  return String(data.get(name) ?? "").trim();
}

export async function submitContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = {
    firstName: field(formData, "firstName"),
    lastName: field(formData, "lastName"),
    jobTitle: field(formData, "jobTitle"),
    country: field(formData, "country"),
    email: field(formData, "email"),
    industry: field(formData, "industry"),
    reason: field(formData, "reason"),
    product: field(formData, "product"),
    message: field(formData, "message"),
  };
  const consent = formData.get("consent") === "on";

  const { required, email: emailMessage, consent: consentMessage } =
    contact.form.validation;
  const errors: Record<string, string> = {};

  if (!values.firstName) errors.firstName = required;
  if (!values.lastName) errors.lastName = required;
  if (!values.jobTitle) errors.jobTitle = required;
  if (!ALLOWED.country.has(values.country)) errors.country = required;
  if (!values.email) errors.email = required;
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = emailMessage;
  if (!ALLOWED.industry.has(values.industry)) errors.industry = required;
  if (!ALLOWED.reason.has(values.reason)) errors.reason = required;
  /* Product is optional, but if something was chosen it has to be real. */
  if (values.product && !ALLOWED.product.has(values.product)) {
    errors.product = required;
  }
  if (!consent) errors.consent = consentMessage;

  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  /*
    Missing configuration is reported as a delivery failure rather than a
    crash, so the visitor still gets the mailto fallback instead of a 500.
  */
  if (!apiKey || !from) {
    console.error(
      "[contact] Not configured:" +
        (apiKey ? "" : " RESEND_API_KEY missing.") +
        (from ? "" : " CONTACT_FROM_EMAIL missing."),
    );
    return { status: "error", message: fallbackMessage() };
  }

  const subject = `${values.firstName} ${values.lastName} — ${values.reason}`;

  const body = [
    `Name:         ${values.firstName} ${values.lastName}`,
    `Job title:    ${values.jobTitle}`,
    `Email:        ${values.email}`,
    `Country:      ${values.country}`,
    `Industry:     ${values.industry}`,
    `Trying to reach: ${values.reason}`,
    `Product of interest: ${values.product || "—"}`,
    "",
    "Message:",
    values.message || "(none)",
    "",
    "—",
    "Sent from the PAKAI TechHub contact form.",
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [TO_ADDRESS],
      /* So a reply goes to the person who filled the form, not the sender
         domain. */
      replyTo: values.email,
      subject,
      text: body,
    });

    if (error) {
      /* Log the reason for us; show the visitor something they can act on. */
      console.error("[contact] Resend rejected the send:", error);
      return { status: "error", message: fallbackMessage() };
    }

    if (!data?.id) {
      console.error("[contact] Resend returned no message id.");
      return { status: "error", message: fallbackMessage() };
    }

    return { status: "success" };
  } catch (cause) {
    console.error("[contact] Send threw:", cause);
    return { status: "error", message: fallbackMessage() };
  }
}

function fallbackMessage(): string {
  return `${contact.form.errorPrefix} ${contact.form.errorFallback.replace(
    "{email}",
    TO_ADDRESS,
  )}`;
}
