"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import type { FormState } from "@/lib/auth-actions";

/**
 * Shared chrome for the sign-up and login forms.
 *
 * Plain server-action forms — no client-side validation library, no optimistic
 * state. `useActionState` carries the server's error message back into the
 * page, and the submit button disables while the action is in flight.
 *
 * A password value lives only in the uncontrolled input and in the FormData
 * the browser posts; nothing here reads it, stores it or logs it.
 */

const field =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-base text-brand-navy outline-none transition-colors placeholder:text-brand-navy/40 focus-visible:border-brand-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";

const label = "block text-sm font-semibold text-brand-navy";

export function AuthForm({
  action,
  heading,
  intro,
  submitLabel,
  pendingLabel,
  footer,
  showRoleChoice = false,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  heading: string;
  intro: string;
  submitLabel: string;
  pendingLabel: string;
  footer: React.ReactNode;
  showRoleChoice?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [role, setRole] = useState<"buyer" | "provider">("buyer");

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
        {heading}
      </h1>
      <p className="mt-4 leading-relaxed text-brand-navy/70">{intro}</p>

      <form action={formAction} className="mt-10 space-y-5">
        {showRoleChoice ? (
          <fieldset>
            <legend className={`${label} mb-3`}>Account type</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "buyer", title: "Buyer", detail: "Find and use AI tools" },
                  {
                    value: "provider",
                    title: "Provider",
                    detail: "List your AI product",
                  },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy ${
                    role === option.value
                      ? "border-brand-navy bg-brand-navy/[0.04]"
                      : "border-black/10 hover:border-brand-navy/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    className="sr-only"
                  />
                  <span className="block font-bold text-brand-navy">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-sm text-brand-navy/65">
                    {option.detail}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {showRoleChoice ? (
          <div>
            <label htmlFor="name" className={label}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className={`mt-2 ${field}`}
            />
          </div>
        ) : null}

        {showRoleChoice ? (
          <div>
            <label htmlFor="companyName" className={label}>
              Company{" "}
              <span className="font-normal text-brand-navy/60">
                {role === "provider" ? "(required)" : "(optional)"}
              </span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              required={role === "provider"}
              className={`mt-2 ${field}`}
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`mt-2 ${field}`}
          />
        </div>

        <div>
          <label htmlFor="password" className={label}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={showRoleChoice ? "new-password" : "current-password"}
            required
            minLength={showRoleChoice ? 8 : undefined}
            className={`mt-2 ${field}`}
          />
          {showRoleChoice ? (
            <p className="mt-2 text-sm text-brand-navy/65">
              At least 8 characters.
            </p>
          ) : null}
        </div>

        {/* Announced when it appears, so it is not missed by a screen reader. */}
        <p role="alert" aria-live="polite" className="text-sm font-medium text-red-700">
          {state?.error ?? ""}
        </p>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand-navy px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      </form>

      <p className="mt-8 text-sm text-brand-navy/70">{footer}</p>
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold text-brand-navy underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
    >
      {children}
    </Link>
  );
}
