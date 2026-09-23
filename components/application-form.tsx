"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef } from "react";

import { siteCopy } from "@/content/site-copy";
import { submitApplication } from "@/lib/application-actions";
import {
  applicationAttempt,
  applicationDraft,
  CATEGORY_LABELS,
  BUSINESS_NAME_MAX,
  BUSINESS_NAME_MIN,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  REASON_MAX,
  REASON_MIN,
  WEBSITE_MAX,
  type ApplicationDraft,
  type ApplicationState,
} from "@/lib/provider-application";

/**
 * The provider application form.
 *
 * Built the same way as the product form, on purpose: real native controls, a
 * real `<label for>` on each, browser validation for immediate feedback and the
 * server action for the checks that count.
 *
 * It also keeps the product form's answer to React resetting an uncontrolled
 * form after a server action: the action echoes what it received, the controls
 * read it through `defaultValue`, and the `<form>` is keyed on the attempt
 * number so it remounts and those values take. Focus then moves to the first
 * field with an error. See components/product-form.tsx for the longer note.
 *
 * `initial` is what the controls start with before any submission. For a
 * rejected applicant coming back to reapply, that is their stored answers, so
 * they edit what they said last time instead of retyping it.
 */

const copy = siteCopy.providerApplication;

const controlBase =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-base text-brand-navy outline-none transition-colors placeholder:text-brand-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
const controlOk = "border-black/10 focus-visible:border-brand-navy/40";
const controlBad = "border-red-600";
const labelClass = "block text-sm font-semibold text-brand-navy";
const noteClass = "mt-2 text-sm text-brand-navy/65";

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
    <span className="font-normal text-brand-navy/60"> ({copy.optionalLabel})</span>
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

export function ApplicationForm({ initial }: { initial: ApplicationDraft }) {
  const [state, formAction, pending] = useActionState<
    ApplicationState,
    FormData
  >(submitApplication, { status: "idle" });

  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const attempt = applicationAttempt(state);

  const errors = state.status === "invalid" ? state.errors : {};
  const values = applicationDraft(state, initial);

  const id = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;
  const noteId = (name: string) => `${uid}-${name}-note`;

  /* Keyed on the attempt, so a second rejection of the same field still
     moves focus back to it. */
  useEffect(() => {
    if (attempt === 0) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [attempt]);

  /** Error first, then the note, in one `aria-describedby`. */
  const described = (name: string, hasNote = false) => {
    const ids = [
      errors[name] ? errorId(name) : null,
      hasNote ? noteId(name) : null,
    ].filter(Boolean);

    return {
      ...(errors[name] ? { "aria-invalid": true as const } : {}),
      ...(ids.length > 0 ? { "aria-describedby": ids.join(" ") } : {}),
    };
  };

  const cls = (name: string) =>
    `${controlBase} ${errors[name] ? controlBad : controlOk}`;

  if (state.status === "success") {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
        {/* Announced on arrival — the form it replaced is gone from the DOM. */}
        <div role="status">
          <h2 className="text-2xl font-extrabold tracking-tight text-brand-navy">
            {copy.successHeading}
          </h2>
          <p className="mt-4 leading-relaxed text-brand-navy/70">
            {copy.successBody}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-full border border-brand-navy/15 px-6 py-3 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy/40"
        >
          {copy.backToDashboard}
        </Link>
      </div>
    );
  }

  return (
    <form
      /* Remounts after every rejection so the echoed defaultValues take. */
      key={attempt}
      ref={formRef}
      action={formAction}
      className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-10"
    >
      <div className="grid gap-5">
        <div>
          <label htmlFor={id("businessName")} className={labelClass}>
            {copy.fields.businessName} <Required />
          </label>
          <input
            id={id("businessName")}
            name="businessName"
            type="text"
            autoComplete="organization"
            required
            minLength={BUSINESS_NAME_MIN}
            maxLength={BUSINESS_NAME_MAX}
            defaultValue={values.businessName}
            className={`mt-2 ${cls("businessName")}`}
            {...described("businessName")}
          />
          <FieldError id={errorId("businessName")} message={errors.businessName} />
        </div>

        <div>
          <label htmlFor={id("description")} className={labelClass}>
            {copy.fields.description} <Required />
          </label>
          <textarea
            id={id("description")}
            name="description"
            rows={4}
            required
            minLength={DESCRIPTION_MIN}
            maxLength={DESCRIPTION_MAX}
            defaultValue={values.description}
            className={`mt-2 ${cls("description")} resize-y`}
            {...described("description", true)}
          />
          <FieldError id={errorId("description")} message={errors.description} />
          <p id={noteId("description")} className={noteClass}>
            {copy.notes.description}
          </p>
        </div>

        <div>
          <label htmlFor={id("category")} className={labelClass}>
            {copy.fields.category} <Required />
          </label>
          <select
            id={id("category")}
            name="category"
            required
            defaultValue={values.category}
            className={`mt-2 ${cls("category")}`}
            {...described("category")}
          >
            <option value="" disabled>
              {copy.selectPlaceholder}
            </option>
            {CATEGORY_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
          <FieldError id={errorId("category")} message={errors.category} />
        </div>

        <div>
          <label htmlFor={id("website")} className={labelClass}>
            {copy.fields.website}
            <Optional />
          </label>
          <input
            id={id("website")}
            name="website"
            /* Not type="url": the browser would refuse "example.com" for
               lacking a scheme, and nobody types one. The server adds https://
               and rejects anything that is not http or https. */
            type="text"
            inputMode="url"
            autoComplete="url"
            maxLength={WEBSITE_MAX}
            defaultValue={values.website}
            className={`mt-2 ${cls("website")}`}
            {...described("website", true)}
          />
          <FieldError id={errorId("website")} message={errors.website} />
          <p id={noteId("website")} className={noteClass}>
            {copy.notes.website}
          </p>
        </div>

        <div>
          <label htmlFor={id("reason")} className={labelClass}>
            {copy.fields.reason} <Required />
          </label>
          <textarea
            id={id("reason")}
            name="reason"
            rows={4}
            required
            minLength={REASON_MIN}
            maxLength={REASON_MAX}
            defaultValue={values.reason}
            className={`mt-2 ${cls("reason")} resize-y`}
            {...described("reason", true)}
          />
          <FieldError id={errorId("reason")} message={errors.reason} />
          <p id={noteId("reason")} className={noteClass}>
            {copy.notes.reason}
          </p>
        </div>
      </div>

      {/*
        Live region for a failure that is not a field problem — wrong role, an
        application already pending, a write that threw. Always in the DOM so a
        screen reader announces the message when it appears.
      */}
      <p
        role="alert"
        aria-live="assertive"
        className="mt-6 text-sm font-medium text-red-700"
      >
        {state.status === "error" ? state.message : ""}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {pending ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}

export default ApplicationForm;
