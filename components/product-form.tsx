"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef } from "react";

import { siteCopy } from "@/content/site-copy";
import { submitProduct } from "@/lib/product-actions";
import {
  attemptOf,
  draftOf,
  CATEGORY_LABELS,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  NAME_MAX,
  NAME_MIN,
  type ProductSubmissionState,
} from "@/lib/product-submission";

/**
 * The provider product-submission form.
 *
 * Same shape as the contact form: real native controls, a real `<label for>` on
 * each, `required` where the field is required, and no custom dropdown widget.
 * Validation runs in the browser for immediate feedback and again in the server
 * action, which is the one that counts.
 *
 * ONE THING IT DOES THAT THE CONTACT FORM DOES NOT: it puts the values back.
 *
 * React resets an uncontrolled form once a server action resolves, so a
 * rejected submission would otherwise wipe a 600-character description and make
 * the provider retype it. The action echoes what it received, the controls read
 * it through `defaultValue`, and the `<form>` is keyed on the attempt number so
 * it remounts and actually picks those values up — re-rendering alone would
 * not, since `defaultValue` only applies at mount.
 *
 * Remounting drops focus, so the effect below moves it to the first field with
 * an error, which is where it should go after a rejection anyway.
 */

const copy = siteCopy.providerSubmit;

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

/** Rendered under a control and referenced by its `aria-describedby`. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

export function ProductForm() {
  const [state, formAction, pending] = useActionState<
    ProductSubmissionState,
    FormData
  >(submitProduct, { status: "idle" });

  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const attempt = attemptOf(state);

  const errors = state.status === "invalid" ? state.errors : {};
  const values = draftOf(state);

  const id = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;
  const noteId = (name: string) => `${uid}-${name}-note`;

  /*
    Moves focus to the first rejected control after a failed submission. Runs on
    the attempt number rather than on `errors`, so a second rejection of the
    same field still moves focus back to it.
  */
  useEffect(() => {
    if (attempt === 0) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    firstInvalid?.focus();
  }, [attempt]);

  /**
   * Wires a control to its error message and its note for assistive tech.
   *
   * Both ids go in one `aria-describedby` when both exist — a screen reader
   * reads them in order, so the note's "40 to 600 characters" follows the
   * error rather than replacing it.
   */
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
            {copy.successBody.replace("{name}", state.name)}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-brand-navy/15 px-6 py-3 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy/40"
          >
            {copy.successAgain}
          </button>
          <Link
            href="/dashboard"
            className="rounded-full px-6 py-3 text-base font-semibold text-brand-navy underline decoration-brand-green decoration-2 underline-offset-4 transition-colors hover:decoration-brand-blue"
          >
            {copy.backToDashboard}
          </Link>
        </div>
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
          <label htmlFor={id("name")} className={labelClass}>
            {copy.fields.name} <Required />
          </label>
          <input
            id={id("name")}
            name="name"
            type="text"
            required
            minLength={NAME_MIN}
            maxLength={NAME_MAX}
            defaultValue={values.name}
            className={`mt-2 ${cls("name")}`}
            {...described("name")}
          />
          <FieldError id={errorId("name")} message={errors.name} />
        </div>

        <div>
          <label htmlFor={id("description")} className={labelClass}>
            {copy.fields.description} <Required />
          </label>
          <textarea
            id={id("description")}
            name="description"
            rows={5}
            required
            minLength={DESCRIPTION_MIN}
            maxLength={DESCRIPTION_MAX}
            defaultValue={values.description}
            className={`mt-2 ${cls("description")} resize-y`}
            {...described("description", true)}
          />
          <FieldError
            id={errorId("description")}
            message={errors.description}
          />
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
          <label htmlFor={id("price")} className={labelClass}>
            {copy.fields.price} <Required />
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id={id("price")}
              name="price"
              type="text"
              /* Not type="number": the server accepts "$1,200.50", and a
                 number input would reject the symbol and the separator, and
                 add a spinner nobody needs on a price. */
              inputMode="decimal"
              autoComplete="off"
              required
              defaultValue={values.price}
              className={cls("price")}
              {...described("price", true)}
            />
            {/* The currency is fixed, so it is a label, not a control. */}
            <span className="text-base font-semibold text-brand-navy/70">
              {copy.notes.currency}
            </span>
          </div>
          <FieldError id={errorId("price")} message={errors.price} />
          <p id={noteId("price")} className={noteClass}>
            {copy.notes.price}
          </p>
        </div>
      </div>

      {/*
        Live region for a failure that is not a field problem — wrong role, no
        provider record, a write that threw. Kept in the DOM at all times so a
        screen reader announces the message when it appears rather than
        discovering a new node.
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

export default ProductForm;
