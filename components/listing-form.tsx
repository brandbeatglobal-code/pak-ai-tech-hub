"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { siteCopy } from "@/content/site-copy";
import type { ProviderType } from "@/db/schema";
import { submitListing } from "@/lib/listing-actions";
import {
  BUSINESS_NAME_MAX,
  BUSINESS_NAME_MIN,
  CATEGORY_LABELS,
  checkAccount,
  checkCompany,
  checkPersonal,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  EMAIL_MAX,
  FULL_NAME_MAX,
  FULL_NAME_MIN,
  JOB_TITLE_MAX,
  listingAttempt,
  PASSWORD_MIN,
  PHONE_MAX,
  PROVIDER_TYPES,
  REASON_MAX,
  REASON_MIN,
  STEP_FIELDS,
  stepOf,
  WEBSITE_MAX,
  type ListingDraft,
  type ListingErrors,
  type ListingField,
  type ListingState,
} from "@/lib/provider-listing";

/**
 * The provider listing form: Account, Personal, Company (Business for an
 * individual) — three steps, ONE `<form>`.
 *
 * WHY ONE FORM. Every step's fields are mounted the whole time; the steps not
 * on show are `display: none` (the `hidden` class — not the `hidden`
 * attribute, which Tailwind's base layer hides with an `!important` that the
 * no-JavaScript rule below could not override). So everything typed survives
 * Back and
 * Continue with no state to copy between steps, and the password stays an
 * uncontrolled input that nothing in React ever reads — it goes from the
 * field into the FormData the server action receives, and nowhere else.
 *
 * NEVER RESET. React resets a form after an action passed as its `action`
 * prop. Here, with JavaScript, the submit handler cancels the browser's
 * submit and dispatches the action itself inside a transition, which React
 * does not follow with a reset. So after a server rejection every field —
 * both passwords included — is still as the person left it, and the form
 * goes to the step with the first problem.
 *
 * WITHOUT JAVASCRIPT the `action` prop still posts the form, and a
 * `<noscript>` rule shows all three steps at once with the one submit
 * button. A rejection then comes back with every field refilled from the
 * echoed values — except the passwords, which the server never echoes.
 *
 * Checks: each step's are run before Continue (lib/provider-listing.ts — the
 * same functions the server runs on everything). The browser's own
 * validation is off (`noValidate`): it cannot validate one step at a time,
 * and would stop Enter on step 1 because of empty fields on step 3.
 *
 * Step 1 is skipped for someone signed in — including through Google — and
 * the "I am registering as" choice then opens step 2 instead.
 */

const copy = siteCopy.providerListing;
type Step = 1 | 2 | 3;

const controlBase =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-base text-brand-navy outline-none transition-colors placeholder:text-brand-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
const controlOk = "border-black/10 focus-visible:border-brand-navy/40";
const controlBad = "border-red-600";
const labelClass = "block text-sm font-semibold text-brand-navy";
const noteClass = "mt-2 text-sm text-brand-navy/65";
const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
const secondaryButton =
  "inline-flex items-center justify-center rounded-full border border-brand-navy/15 bg-white px-6 py-3 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";

function Required() {
  return (
    <>
      <span aria-hidden className="text-red-700">
        {" *"}
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

function Optional() {
  return <span className="font-normal text-brand-navy/60"> ({copy.optionalLabel})</span>;
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

/** Reads a step's values straight out of the form — the one place they live. */
function read(form: HTMLFormElement) {
  const data = new FormData(form);
  const text = (name: string) => String(data.get(name) ?? "").trim();
  return {
    providerType: text("providerType"),
    email: text("email").toLowerCase(),
    password: String(data.get("password") ?? ""),
    confirmPassword: String(data.get("confirmPassword") ?? ""),
    fullName: text("fullName"),
    phone: text("phone"),
    jobTitle: text("jobTitle"),
    businessName: text("businessName"),
    website: text("website"),
    category: text("category"),
    description: text("description"),
    reason: text("reason"),
    consent: data.get("consent") === "on",
  };
}

function GoogleButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-brand-navy/15 bg-white px-6 py-[11px] text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy/40 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
    >
      <svg aria-hidden focusable="false" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      {siteCopy.googleSignIn.label}
    </button>
  );
}

export function ListingForm({
  initial,
  signedIn,
  googleAction,
}: {
  /** Before any submission: empty, or a signed-in buyer's name and past answers. */
  initial: ListingDraft;
  /** Signed in: step 1 is skipped and its fields are not rendered. */
  signedIn: boolean;
  /** `signInWithGoogle`, only for someone signed out, and only if configured. */
  googleAction?: (formData: FormData) => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState<ListingState, FormData>(submitListing, {
    status: "idle",
  });
  const values = "values" in state ? state.values : initial;
  const firstStep: Step = signedIn ? 2 : 1;

  const [step, setStep] = useState<Step>(firstStep);
  const [providerType, setProviderType] = useState<ProviderType>(values.providerType);
  const [errors, setErrors] = useState<ListingErrors>(state.status === "invalid" ? state.errors : {});

  /*
    A server answer has arrived: take its errors and go to the step with the
    first one. Done while rendering (React's pattern for state derived from
    a changed input), so the step and the errors change in the same commit.
  */
  const attempt = listingAttempt(state);
  const [seenAttempt, setSeenAttempt] = useState(attempt);
  if (attempt !== seenAttempt) {
    setSeenAttempt(attempt);
    const serverErrors = state.status === "invalid" ? state.errors : {};
    setErrors(serverErrors);
    const steps = Object.keys(serverErrors).map(stepOf);
    setStep(steps.length > 0 ? (Math.max(firstStep, Math.min(...steps)) as Step) : 3);
  }

  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<Partial<Record<Step, HTMLDivElement | null>>>({});
  const headingRefs = useRef<Partial<Record<Step, HTMLHeadingElement | null>>>({});
  const alertRef = useRef<HTMLParagraphElement>(null);
  /* Set by a handler, acted on once the new step or errors have rendered. */
  const pendingFocus = useRef<"heading" | "error" | null>(null);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    if (target === "heading") headingRefs.current[step]?.focus();
    else stepRefs.current[step]?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });

  /* After a server answer: the first bad field, or the message if none. */
  useEffect(() => {
    if (attempt === 0) return;
    const field = formRef.current?.querySelector<HTMLElement>(
      '[data-listing-step][data-active] [aria-invalid="true"]',
    );
    (field ?? alertRef.current)?.focus();
  }, [attempt]);

  const id = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;
  const noteId = (name: string) => `${uid}-${name}-note`;

  /** Error first, then the note, in one `aria-describedby`. */
  const described = (name: ListingField, hasNote = false) => {
    const ids = [errors[name] ? errorId(name) : null, hasNote ? noteId(name) : null].filter(Boolean);
    return {
      ...(errors[name] ? { "aria-invalid": true as const } : {}),
      ...(ids.length > 0 ? { "aria-describedby": ids.join(" ") } : {}),
    };
  };
  const cls = (name: ListingField) => `${controlBase} ${errors[name] ? controlBad : controlOk}`;

  const individual = providerType === "individual";
  const stepNames: Record<Step, string> = {
    1: copy.stepper.account,
    2: copy.stepper.personal,
    3: individual ? copy.stepper.business : copy.stepper.company,
  };

  /** This step's checks; true when it may be left forwards. */
  function checkStep(current: Step): boolean {
    const form = formRef.current;
    if (!form) return false;
    const input = read(form);
    const found =
      current === 1 ? checkAccount(input) : current === 2 ? checkPersonal(input) : checkCompany(input);
    /* Replace this step's errors, keep any others. */
    const next: ListingErrors = { ...errors };
    for (const field of STEP_FIELDS[current]) delete next[field];
    /* On step 2 for someone signed in, the type choice lives here too. */
    if (current === 2 && signedIn) {
      delete next.providerType;
      if (!PROVIDER_TYPES.includes(input.providerType as ProviderType)) {
        found.providerType = copy.validation.providerType;
      }
    }
    setErrors({ ...next, ...found });
    return Object.keys(found).length === 0;
  }

  function go(next: Step) {
    pendingFocus.current = "heading";
    setStep(next);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    /* JavaScript is running: this handler, not the browser, decides. */
    event.preventDefault();
    if (!checkStep(step)) {
      pendingFocus.current = "error";
      return;
    }
    if (step < 3) {
      go((step + 1) as Step);
      return;
    }
    const data = new FormData(event.currentTarget);
    /* Dispatched by hand, so React does not reset the form afterwards. */
    startTransition(() => formAction(data));
  }

  /** "I am registering as" — step 1, or step 2 when step 1 is skipped. */
  const typeChoice = (
    /* No aria-invalid on a fieldset (not every reader supports it on a
       group); its error is tied to it by aria-describedby instead. */
    <fieldset
      aria-describedby={errors.providerType ? errorId("providerType") : undefined}
    >
      <legend className={`${labelClass} mb-3`}>
        {copy.registeringAs.legend}
        <Required />
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROVIDER_TYPES.map((type) => (
          <label
            key={type}
            className={`cursor-pointer rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy ${
              providerType === type
                ? "border-brand-navy bg-brand-navy/[0.04]"
                : "border-black/10 hover:border-brand-navy/30"
            }`}
          >
            <input
              type="radio"
              name="providerType"
              value={type}
              checked={providerType === type}
              onChange={() => setProviderType(type)}
              className="sr-only"
            />
            <span className="block font-bold text-brand-navy">{copy.registeringAs[type].title}</span>
            <span className="mt-1 block text-sm text-brand-navy/65">{copy.registeringAs[type].detail}</span>
          </label>
        ))}
      </div>
      <FieldError id={errorId("providerType")} message={errors.providerType} />
    </fieldset>
  );

  const stepHeading = (n: Step) => (
    <h2
      ref={(node) => {
        headingRefs.current[n] = node;
      }}
      tabIndex={-1}
      className="text-xl font-extrabold tracking-tight text-brand-navy outline-none sm:text-2xl"
    >
      <span className="sr-only">{copy.stepper.stepOf.replace("{n}", String(n))}: </span>
      {stepNames[n]}
    </h2>
  );

  return (
    <div>
      {/* The stepper. Step 1 shows as done for someone already signed in. */}
      <ol data-listing-stepper aria-label={copy.stepper.label} className="mb-8 grid grid-cols-3 gap-2">
        {([1, 2, 3] as const).map((n) => {
          const done = n < step;
          const current = n === step;
          return (
            <li
              key={n}
              aria-current={current ? "step" : undefined}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <span
                aria-hidden
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  current
                    ? "bg-brand-navy text-white"
                    : done
                      ? "bg-gradient-to-br from-brand-blue to-brand-green text-brand-navy"
                      : "border border-black/15 bg-white text-brand-navy/60"
                }`}
              >
                {done ? "✓" : n}
              </span>
              <span className={`text-sm ${current ? "font-bold text-brand-navy" : "font-medium text-brand-navy/65"}`}>
                <span className="sr-only">{copy.stepper.stepOf.replace("{n}", String(n))}: </span>
                {stepNames[n]}
              </span>
            </li>
          );
        })}
      </ol>

      {/*
        Without JavaScript: every step at once, no Continue or Back, one
        submit — an ordinary single-page form posting to the same action.
      */}
      <noscript>
        <style>{`[data-listing-step]{display:block!important}[data-listing-nav]{display:none!important}[data-listing-submit]{display:contents!important}[data-listing-stepper]{display:none!important}`}</style>
      </noscript>

      <form
        ref={formRef}
        action={formAction}
        onSubmit={onSubmit}
        noValidate
        className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-10"
      >
        {/* Which form this is, so the server can tell if the session changed
            since it was rendered (lib/listing-actions.ts). */}
        <input type="hidden" name="formFor" value={signedIn ? "account" : "new"} />

        {/* ---------------- Step 1: Account (signed out only) ---------------- */}
        {signedIn ? null : (
          <div
            data-listing-step="1"
            data-active={step === 1 ? "" : undefined}
            ref={(node) => {
              stepRefs.current[1] = node;
            }}
            className={step === 1 ? "space-y-6" : "hidden"}
          >
            {stepHeading(1)}
            {typeChoice}
            <div>
              <label htmlFor={id("email")} className={labelClass}>
                {copy.fields.email}
                <Required />
              </label>
              <input
                id={id("email")}
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={EMAIL_MAX}
                defaultValue={values.email}
                className={`mt-2 ${cls("email")}`}
                {...described("email")}
              />
              <FieldError id={errorId("email")} message={errors.email} />
            </div>
            <div>
              <label htmlFor={id("password")} className={labelClass}>
                {copy.fields.password}
                <Required />
              </label>
              <input
                id={id("password")}
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN}
                className={`mt-2 ${cls("password")}`}
                {...described("password", true)}
              />
              <FieldError id={errorId("password")} message={errors.password} />
              <p id={noteId("password")} className={noteClass}>
                {copy.notes.password}
              </p>
            </div>
            <div>
              <label htmlFor={id("confirmPassword")} className={labelClass}>
                {copy.fields.confirmPassword}
                <Required />
              </label>
              <input
                id={id("confirmPassword")}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-2 ${cls("confirmPassword")}`}
                {...described("confirmPassword")}
              />
              <FieldError id={errorId("confirmPassword")} message={errors.confirmPassword} />
            </div>
          </div>
        )}

        {/* ---------------- Step 2: Personal ---------------- */}
        <div
          data-listing-step="2"
          data-active={step === 2 ? "" : undefined}
          ref={(node) => {
            stepRefs.current[2] = node;
          }}
          className={step === 2 ? "space-y-6" : "hidden"}
        >
          {stepHeading(2)}
          {signedIn ? (
            <>
              <p className="text-sm leading-relaxed text-brand-navy/70">{copy.signedInNote}</p>
              {typeChoice}
            </>
          ) : null}
          <div>
            <label htmlFor={id("fullName")} className={labelClass}>
              {copy.fields.fullName}
              <Required />
            </label>
            <input
              id={id("fullName")}
              name="fullName"
              type="text"
              autoComplete="name"
              required
              minLength={FULL_NAME_MIN}
              maxLength={FULL_NAME_MAX}
              defaultValue={values.fullName}
              className={`mt-2 ${cls("fullName")}`}
              {...described("fullName")}
            />
            <FieldError id={errorId("fullName")} message={errors.fullName} />
          </div>
          <div>
            <label htmlFor={id("phone")} className={labelClass}>
              {copy.fields.phone}
              <Required />
            </label>
            <input
              id={id("phone")}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              maxLength={PHONE_MAX}
              defaultValue={values.phone}
              className={`mt-2 ${cls("phone")}`}
              {...described("phone", true)}
            />
            <FieldError id={errorId("phone")} message={errors.phone} />
            <p id={noteId("phone")} className={noteClass}>
              {copy.notes.phone}
            </p>
          </div>
          <div>
            <label htmlFor={id("jobTitle")} className={labelClass}>
              {copy.fields.jobTitle}
              {individual ? <Optional /> : <Required />}
            </label>
            <input
              id={id("jobTitle")}
              name="jobTitle"
              type="text"
              autoComplete="organization-title"
              required={!individual}
              maxLength={JOB_TITLE_MAX}
              defaultValue={values.jobTitle}
              className={`mt-2 ${cls("jobTitle")}`}
              {...described("jobTitle")}
            />
            <FieldError id={errorId("jobTitle")} message={errors.jobTitle} />
          </div>
        </div>

        {/* ---------------- Step 3: Company / Business ---------------- */}
        <div
          data-listing-step="3"
          data-active={step === 3 ? "" : undefined}
          ref={(node) => {
            stepRefs.current[3] = node;
          }}
          className={step === 3 ? "space-y-6" : "hidden"}
        >
          {stepHeading(3)}
          <div>
            <label htmlFor={id("businessName")} className={labelClass}>
              {individual ? copy.fields.businessName : copy.fields.companyName}
              <Required />
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
            <label htmlFor={id("website")} className={labelClass}>
              {copy.fields.website}
              <Optional />
            </label>
            <input
              id={id("website")}
              name="website"
              /* Not type="url": the browser would refuse "example.com" for
                 lacking a scheme. The server adds https:// and rejects
                 anything that is not http or https. */
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
            <label htmlFor={id("category")} className={labelClass}>
              {copy.fields.category}
              <Required />
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
            <label htmlFor={id("description")} className={labelClass}>
              {copy.fields.description}
              <Required />
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
            <label htmlFor={id("reason")} className={labelClass}>
              {copy.fields.reason}
              <Required />
            </label>
            <textarea
              id={id("reason")}
              name="reason"
              rows={3}
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
          <div>
            <div className="flex items-start gap-3">
              <input
                id={id("consent")}
                name="consent"
                type="checkbox"
                required
                defaultChecked={values.consent}
                className="mt-1 h-5 w-5 shrink-0 accent-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                {...described("consent")}
              />
              <label htmlFor={id("consent")} className="text-sm leading-relaxed text-brand-navy">
                {copy.fields.consent}
                <Required />
              </label>
            </div>
            <FieldError id={errorId("consent")} message={errors.consent} />
          </div>
        </div>

        {/*
          A failure that is not one field's — an application already pending,
          a write that threw. Always in the DOM so it is announced when it
          appears; focusable so focus can be sent to it.
        */}
        <p
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 text-sm font-medium text-red-700 outline-none empty:mt-0"
        >
          {state.status === "error" ? state.message : ""}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {step > firstStep ? (
            <button
              type="button"
              data-listing-nav
              onClick={() => go((step - 1) as Step)}
              className={secondaryButton}
            >
              {copy.back}
            </button>
          ) : null}
          {step < 3 ? (
            <button type="submit" data-listing-nav className={primaryButton}>
              {copy.continue}
            </button>
          ) : null}
          {/*
            The one submit. Shown on step 3 — and, without JavaScript, always.
            Hidden by its wrapper, not by a class on the button: the button's
            own `inline-flex` would win over `hidden` on the same element.
          */}
          <span data-listing-submit className={step === 3 ? "contents" : "hidden"}>
            <button type="submit" disabled={pending} className={primaryButton}>
              {pending ? copy.submitting : copy.submit}
            </button>
          </span>
        </div>
      </form>

      {/* Step 1 only: the Google way in, and a way to log in instead. Outside
          the form — forms cannot nest — and it posts no field but the type. */}
      {!signedIn && step === 1 ? (
        <>
          {googleAction ? (
            <>
              <div className="mt-6 flex items-center gap-4">
                <span aria-hidden className="h-px flex-1 bg-black/10" />
                <span className="text-sm text-brand-navy/65">{siteCopy.googleSignIn.divider}</span>
                <span aria-hidden className="h-px flex-1 bg-black/10" />
              </div>
              <form action={googleAction} className="mt-6">
                <input type="hidden" name="intent" value="provider" />
                <input type="hidden" name="providerType" value={providerType} />
                <GoogleButton />
              </form>
            </>
          ) : null}
          <p className="mt-6 text-sm text-brand-navy/70">
            {copy.haveAccount}{" "}
            <Link
              href={copy.logIn.href}
              className="font-semibold text-brand-navy underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
            >
              {copy.logIn.label}
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}

export default ListingForm;
