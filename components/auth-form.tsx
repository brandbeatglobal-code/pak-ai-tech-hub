"use client";

import Link from "next/link";
import { useActionState, useLayoutEffect, useRef, useState } from "react";

import type { FormState } from "@/lib/auth-actions";

/**
 * Shared chrome for the sign-up and login forms.
 *
 * Plain server-action forms — no client-side validation library, no optimistic
 * state. `useActionState` carries the server's error message back into the
 * page, and the submit button disables while the action is in flight.
 *
 * A password value lives only in the uncontrolled input and in the FormData
 * the browser posts; nothing here reads it, stores it or logs it. The
 * show/hide toggle changes only the input's `type` — it never touches the
 * value.
 */

const fieldBase =
  "w-full rounded-xl border border-black/10 bg-white py-2.5 text-base text-brand-navy outline-none transition-colors placeholder:text-brand-navy/40 focus-visible:border-brand-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";

const field = `${fieldBase} px-4`;

/*
  The password input's 48px right padding is the reveal button's lane. The
  36px button sits 6px in from the input's outer edge, which leaves 7px
  between it and the end of the text once the 1px border is counted. Typed
  characters stop before the button at every width instead of running under
  it.

  `::-ms-reveal` is Edge's own built-in eye on password inputs. Hidden so Edge
  does not show two. Browsers that do not know the pseudo-element ignore the
  rule.
*/
const passwordField = `${fieldBase} pl-4 pr-12 [&::-ms-reveal]:hidden`;

const label = "block text-sm font-semibold text-brand-navy";

/**
 * Eye / eye-off, drawn the same way as the glyphs in components/nav-icons.tsx:
 * a 20×20 stroked outline in `currentColor`, hidden from assistive tech — the
 * button's label says what it does.
 */
function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.75 10S4.75 4 10 4s8.25 6 8.25 6-3 6-8.25 6-8.25-6-8.25-6Z" />
      <circle cx="10" cy="10" r="2.5" />
      {crossed ? <path d="m3 3 14 14" /> : null}
    </svg>
  );
}

export function AuthForm({
  action,
  heading,
  intro,
  submitLabel,
  pendingLabel,
  footer,
  showRoleChoice = false,
  initialRole = "buyer",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  heading: string;
  intro: string;
  submitLabel: string;
  pendingLabel: string;
  footer: React.ReactNode;
  showRoleChoice?: boolean;
  /**
   * Which option starts selected, from `?role=` on the sign-up page.
   *
   * It is only ever a starting point — the radio group stays editable, so
   * arriving from a provider link and deciding to sign up as a buyer takes one
   * click. The value the server acts on is the one posted in the form, not
   * this one.
   */
  initialRole?: "buyer" | "provider";
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [role, setRole] = useState<"buyer" | "provider">(initialRole);
  /* Whether the password is shown as text. Only the input's `type` follows
     this; the value stays in the uncontrolled input. */
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  /*
    Where the caret was when the toggle was clicked.

    When a focused input's `type` changes straight after a mouse click,
    Chromium puts the caret back at the start — asynchronously, after the
    click has been handled. (Reproduced with a bare input and button, no
    React; a type change made from script alone does not do it.) Without a
    fix, revealing the password mid-typing and carrying on would insert the
    next characters at the FRONT of the password.

    So the selection is read just before the toggle and, once React has
    applied the new type, the field is blurred, focused again and the
    selection put back. Re-focusing is what makes the restore stick: a plain
    `setSelectionRange` was measured to lose to the reset every time, and a
    second restore in the next animation frame still let a keystroke typed
    before that frame land at the start. With the blur and focus, the caret
    was measured correct straight after the click, with no wait. It all runs
    inside the click, before paint, so the caret never visibly jumps.

    `focus()` deliberately keeps its default scrolling: that is what scrolls
    a long password back to where the caret is. With `preventScroll` the
    field was measured showing the start of the text while the caret sat at
    the end.
  */
  const caret = useRef<[number, number] | null>(null);

  useLayoutEffect(() => {
    const input = passwordRef.current;
    const saved = caret.current;
    if (!input || !saved) return;
    caret.current = null;

    input.blur();
    input.focus();
    input.setSelectionRange(saved[0], saved[1]);
  }, [passwordVisible]);

  function togglePassword() {
    const input = passwordRef.current;
    /* Only when the field has focus — i.e. a mouse click, which leaves focus
       there. After keyboard activation focus is on the button instead, and
       there is no caret to keep. */
    caret.current =
      input && document.activeElement === input
        ? [input.selectionStart ?? 0, input.selectionEnd ?? 0]
        : null;
    setPasswordVisible((visible) => !visible);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
        {heading}
      </h1>
      <p className="mt-4 leading-relaxed text-brand-navy/70">{intro}</p>

      <form
        action={formAction}
        /*
          Back to hidden on every submit. A rejected login comes back with the
          field emptied (React resets an uncontrolled form after an action), and
          without this the next attempt would be typed in the clear because the
          toggle was left on.
        */
        onSubmit={() => setPasswordVisible(false)}
        className="mt-10 space-y-5"
      >
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
          <div className="relative mt-2">
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type={passwordVisible ? "text" : "password"}
              autoComplete={showRoleChoice ? "new-password" : "current-password"}
              required
              minLength={showRoleChoice ? 8 : undefined}
              className={passwordField}
            />
            {/*
              A real button, after the input in the DOM so Tab reaches it
              straight after the field, and Enter / Space toggle it.

              `onMouseDown` preventDefault keeps a click or a tap from moving
              focus: someone typing their password can check it and carry on
              typing without going back into the field. (Checked with mouse
              and with touch emulation in Chromium; not on a real phone.)
              Keyboard activation never fires mousedown, so a keyboard user's
              focus stays on the button, where they left it.

              The label names the action and `aria-pressed` reports the state,
              as the brief asked. The WAI-ARIA Authoring Practices advise
              against a label that changes together with `aria-pressed`,
              since a screen reader can then read out "Hide password,
              pressed". The alternative is a fixed "Show password" label with
              `aria-pressed` alone.
            */}
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={togglePassword}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
              aria-controls="password"
              className="absolute top-1/2 right-1.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-brand-navy/65 transition-colors hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-navy"
            >
              <EyeIcon crossed={passwordVisible} />
            </button>
          </div>
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
