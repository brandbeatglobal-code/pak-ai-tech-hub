"use client";

import { useActionState, useId } from "react";

import { countries } from "@/content/countries";
import { siteCopy } from "@/content/site-copy";
import { submitContact, type ContactState } from "@/lib/contact-actions";

/**
 * The contact form.
 *
 * Real native controls throughout — `<select>`, `<input>`, `<textarea>`, a real
 * `<label for>` on each, and `required` where the field is required. No custom
 * dropdown widget: a native select already gives keyboard operation, typeahead,
 * the platform's own mobile picker and correct screen-reader semantics, none of
 * which a div-based replacement gets for free.
 *
 * The industry and product options are derived from the same arrays
 * /marketplace and /pricing render, so the dropdowns cannot drift from what the
 * site actually offers.
 *
 * Validation runs in two places on purpose: the browser's own constraint
 * validation for immediate feedback, and again in the server action, which is
 * the one that counts.
 */

const { contact, industries, marketplace } = siteCopy;
const { form } = contact;

const PRODUCT_OPTIONS = [
  ...marketplace.products.items.map((p) => p.name),
  form.productUnsure,
];
const INDUSTRY_OPTIONS = industries.items.map((i) => i.name);

const controlBase =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-base text-brand-navy outline-none transition-colors placeholder:text-brand-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
const controlOk = "border-black/10 focus-visible:border-brand-navy/40";
const controlBad = "border-red-600";
const labelClass = "block text-sm font-semibold text-brand-navy";

function Required() {
  return (
    <>
      <span aria-hidden className="text-red-700">
        *
      </span>
      <span className="sr-only">(required)</span>
    </>
  );
}

function Optional() {
  return (
    <span className="font-normal text-brand-navy/60"> ({form.optionalLabel})</span>
  );
}

/** Rendered under a control and referenced by its `aria-describedby`. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitContact,
    { status: "idle" },
  );
  const uid = useId();

  const errors = state.status === "invalid" ? state.errors : {};
  const id = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;

  /** Wires a control to its error message for assistive tech. */
  const invalid = (name: string) =>
    errors[name]
      ? { "aria-invalid": true as const, "aria-describedby": errorId(name) }
      : {};

  const cls = (name: string) =>
    `${controlBase} ${errors[name] ? controlBad : controlOk}`;

  if (state.status === "success") {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
        {/* Announced on arrival — the form it replaced is gone from the DOM. */}
        <div role="status">
          <h3 className="text-2xl font-extrabold tracking-tight text-brand-navy">
            {form.successHeading}
          </h3>
          <p className="mt-4 leading-relaxed text-brand-navy/70">
            {form.successBody}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full border border-brand-navy/15 px-6 py-3 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy/40"
        >
          {form.successAgain}
        </button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate={false}
      className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id("firstName")} className={labelClass}>
            {form.fields.firstName} <Required />
          </label>
          <input
            id={id("firstName")}
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            className={`mt-2 ${cls("firstName")}`}
            {...invalid("firstName")}
          />
          <FieldError id={errorId("firstName")} message={errors.firstName} />
        </div>

        <div>
          <label htmlFor={id("lastName")} className={labelClass}>
            {form.fields.lastName} <Required />
          </label>
          <input
            id={id("lastName")}
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            className={`mt-2 ${cls("lastName")}`}
            {...invalid("lastName")}
          />
          <FieldError id={errorId("lastName")} message={errors.lastName} />
        </div>

        <div>
          <label htmlFor={id("jobTitle")} className={labelClass}>
            {form.fields.jobTitle} <Required />
          </label>
          <input
            id={id("jobTitle")}
            name="jobTitle"
            type="text"
            autoComplete="organization-title"
            required
            className={`mt-2 ${cls("jobTitle")}`}
            {...invalid("jobTitle")}
          />
          <FieldError id={errorId("jobTitle")} message={errors.jobTitle} />
        </div>

        <div>
          <label htmlFor={id("country")} className={labelClass}>
            {form.fields.country} <Required />
          </label>
          <select
            id={id("country")}
            name="country"
            autoComplete="country-name"
            required
            defaultValue=""
            className={`mt-2 ${cls("country")}`}
            {...invalid("country")}
          >
            <option value="" disabled>
              {form.selectPlaceholder}
            </option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          <FieldError id={errorId("country")} message={errors.country} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={id("email")} className={labelClass}>
            {form.fields.email} <Required />
          </label>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`mt-2 ${cls("email")}`}
            {...invalid("email")}
          />
          <FieldError id={errorId("email")} message={errors.email} />
        </div>

        <div>
          <label htmlFor={id("industry")} className={labelClass}>
            {form.fields.industry} <Required />
          </label>
          <select
            id={id("industry")}
            name="industry"
            required
            defaultValue=""
            className={`mt-2 ${cls("industry")}`}
            {...invalid("industry")}
          >
            <option value="" disabled>
              {form.selectPlaceholder}
            </option>
            {INDUSTRY_OPTIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <FieldError id={errorId("industry")} message={errors.industry} />
        </div>

        <div>
          <label htmlFor={id("reason")} className={labelClass}>
            {form.fields.reason} <Required />
          </label>
          <select
            id={id("reason")}
            name="reason"
            required
            defaultValue=""
            className={`mt-2 ${cls("reason")}`}
            {...invalid("reason")}
          >
            <option value="" disabled>
              {form.selectPlaceholder}
            </option>
            {form.reasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          <FieldError id={errorId("reason")} message={errors.reason} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={id("product")} className={labelClass}>
            {form.fields.product}
            <Optional />
          </label>
          <select
            id={id("product")}
            name="product"
            defaultValue=""
            className={`mt-2 ${cls("product")}`}
            {...invalid("product")}
          >
            <option value="">{form.selectPlaceholder}</option>
            {PRODUCT_OPTIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <FieldError id={errorId("product")} message={errors.product} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={id("message")} className={labelClass}>
            {form.fields.message}
            <Optional />
          </label>
          <textarea
            id={id("message")}
            name="message"
            rows={5}
            className={`mt-2 ${cls("message")} resize-y`}
          />
        </div>

        <div className="sm:col-span-2">
          {/*
            No Privacy Policy link: that page does not exist, and a link that
            404s is worse than none. Add it when the page does.
          */}
          <div className="flex items-start gap-3">
            <input
              id={id("consent")}
              name="consent"
              type="checkbox"
              required
              className="mt-1 h-5 w-5 shrink-0 rounded border-black/20 accent-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              {...invalid("consent")}
            />
            <label htmlFor={id("consent")} className="text-sm text-brand-navy">
              {form.consent} <Required />
            </label>
          </div>
          <FieldError id={errorId("consent")} message={errors.consent} />
        </div>
      </div>

      {/*
        Live region for the delivery failure. Kept in the DOM at all times so a
        screen reader announces the message when it appears rather than
        discovering a new node.
      */}
      <p role="alert" aria-live="assertive" className="mt-6 text-sm font-medium text-red-700">
        {state.status === "error" ? state.message : ""}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {pending ? form.submitting : form.submit}
      </button>
    </form>
  );
}

export default ContactForm;
