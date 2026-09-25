@AGENTS.md

# PAKAI TechHub — project conventions

Written for a Claude Code session starting cold. Every fact below was read out
of this repository, the live Neon database, the Vercel project record or the
Resend account on 2026-09-16, at commit `adab9f8`. Where something could not be
verified from the sandbox it says so rather than guessing.

Keep the `@AGENTS.md` import on line 1. `next dev` regenerates `AGENTS.md`, and
dropping the import silently loses the Next.js version warning it carries.

---

## 1. What this is

A **two-sided AI product marketplace**. Buyers browse, try and buy AI products;
providers list products for sale; PAKAI TechHub takes a commission on sales.

The positioning language, verbatim from `content/site-copy.ts` — use these
strings rather than paraphrases:

| Field | Value |
|---|---|
| `brand.name` | PAKAI TechHub |
| `brand.tagline` | AI for every business, everywhere. |
| `hero.headline` (the `<h1>` on `/`) | Find AI. Try it free. Put it to work. |
| `hero.subhead` | One marketplace, every product reviewed before it lists — browse, test, and buy with confidence. |
| `hero.reassurance` | 7-day free trial, no card required. |
| `meta.description` | Browse AI products from providers worldwide, try them free, and put them to work — all in one place. |

`meta.description` **deliberately differs** from `hero.subhead`. They are
separate fields read by different files (`app/layout.tsx` and `app/page.tsx`);
one is a search-result snippet, the other is hero copy. There is a comment at
`content/site-copy.ts` saying so. Do not "fix" them back into agreement.

### The commission split

This is the one true economic fact the marketplace has. It lives in exactly one
place, the `commissionTerms` constant:

> We take a 20% commission only when you make a sale — nothing upfront.

Provider keeps 80%. The provider column of "How it works" titles its last step
"Get paid, keep 80%", and `providerCta.body` is `` `Free to list. ${commissionTerms}` ``.
Both read the constant. Do not retype the sentence, and do not add payout
timings, fee tiers or minimums — none of those are settled.

---

## 2. Infrastructure

| Thing | Value |
|---|---|
| GitHub | `brandbeatglobal-code/pak-ai-tech-hub`, default branch `main` |
| Vercel project | `pak-ai-tech-hub` — `prj_RM4LJEUWTn1efHByziguVXZrKLqx` |
| Vercel team | `brandbeatglobal-codes-projects` — `team_J3MUNAkilCMYOmClgcjy6yzw` (Pro) |
| Vercel runtime | Node 24.x, framework preset `nextjs` |
| Neon project | `neon-pakai-techhub` — `billowing-dew-98399114` |
| Neon org / region / version | `org-wandering-waterfall-07764780` / `aws-us-east-1` / Postgres 18 |
| Resend sending domain | `pakaitechub.com` — **verified**, sending enabled, added 2026-09-15 |
| Contact inbox | `hello@pakaitechub.com` (`contactEmail` in `content/site-copy.ts`) |

Resend has **receiving disabled** on the domain — it sends only. Whatever
serves the `hello@` mailbox is elsewhere. A live test send on 2026-09-16 came
back `delivered`, so the mailbox does accept mail.

### Environment variables

Six, all documented in `.env.example`. Every read in tracked source:

| Variable | Read by | Needed for |
|---|---|---|
| `DATABASE_URL` | `db/index.ts`, `drizzle.config.ts` | auth, seeding, drizzle-kit |
| `AUTH_SECRET` | Auth.js (implicit) | session JWT signing |
| `RESEND_API_KEY` | `lib/contact-actions.ts` | contact form delivery |
| `CONTACT_FROM_EMAIL` | `lib/contact-actions.ts` | must be on the verified domain |
| `GOOGLE_CLIENT_ID` | `auth.ts` | Google sign-in — optional; off unless both Google vars are set |
| `GOOGLE_CLIENT_SECRET` | `auth.ts` | as above |

The Google redirect URI to register is `{origin}/api/auth/callback/google`, once
per origin that serves the app. (Added after the 2026-09-16 snapshot this file
was written from.)

`RESEND_BASE_URL` is honoured by the Resend SDK but is **not** application
config. It is useful for pointing a local build at a mock endpoint to inspect
the outgoing payload without touching app code.

**Which Vercel environments each variable is scoped to could not be verified.**
No tool available in this sandbox reads Vercel environment variables — the
Vercel MCP surface exposes projects, deployments, logs and protection settings,
but not env vars. Ask a human with dashboard access; do not infer scoping from
a successful deployment, because `db/index.ts` connects lazily and the whole
marketing site builds and serves with no database configured at all.

### Known sandbox limitations

These have blocked verification repeatedly. Recognise them rather than
rediscovering them:

- `*.vercel.app` and `pakaitechub.com` return **403 on CONNECT** — the live site
  is not reachable from here by ordinary HTTP tooling.
- **TCP 5432 to Neon is blocked.** Port 443 is open but serves HTTP, not the
  Postgres wire protocol. Use the Neon MCP `run_sql` tool, which goes over
  HTTPS, to read or write the hosted database.
- Stock-photo hosts are blocked.

---

## 3. Tech stack

- **Next.js 16.3.4**, App Router, Turbopack. **Read `node_modules/next/dist/docs/`
  before writing Next-specific code** — this version differs from training data.
  See `AGENTS.md`.
- **React 19.2.8**
- **Tailwind CSS v4** — CSS-first. There is **no `tailwind.config.js`**. Brand
  tokens live in an `@theme` block in `app/globals.css`; anything declared there
  becomes a utility class.
- **Motion 13.2.0** (`motion/react`) — primitives in `components/motion/`:
  `Reveal` (scroll trigger), `HoverScale`, `HoverLift`, `SectionGlow`,
  `HeroBackdrop`. Reuse these; do not build a second scroll-trigger mechanism.
  Every one honours `useReducedMotion`.
- **Drizzle ORM 0.45.2** + **drizzle-kit 0.31.10** + **postgres-js 3.4.9**.
  One driver for local Postgres and Neon alike, no environment branching. The
  client in `db/index.ts` is a lazy `Proxy` — `DATABASE_URL` is read on the
  first query, not at module scope, so a missing variable breaks only the routes
  that need a database instead of failing the whole build.
- **Auth.js v5 beta** (`next-auth ^5.0.0-beta.32`) — **Credentials provider
  plus Google, JWT session strategy, and the Drizzle adapter
  (`@auth/drizzle-adapter`)**, added with Google — the second, OAuth provider
  it was held back for. Sessions stay JWT (Credentials requires it), so there
  are no `sessions`/`verificationTokens` tables; the adapter finds, creates and
  links users through `users` and `accounts`. It is wrapped in `auth.ts`: a
  Google sign-up creates a **buyer only**, Google's tokens are not stored, and a
  Google sign-in whose email already has a password account is **refused, not
  linked** — the reasoning is in `auth.ts`; do not switch on
  `allowDangerousEmailAccountLinking`. `trustHost: true` is set
  because Vercel validates the Host; set `AUTH_URL` instead if this ever sits
  behind a proxy forwarding arbitrary Host headers.
- **bcryptjs 3.0.3, cost 12** (`lib/passwords.ts`). Passwords are hashed, never
  stored or logged in plaintext. `equalizeTiming()` pays the bcrypt cost on a
  missing user so response time does not reveal whether an email has an account.
- **Resend 6.27.0**, TypeScript 5, ESLint 9 + `eslint-config-next`.

Module augmentation for `session.user.role` targets **`@auth/core/jwt`**, not
`next-auth/jwt` — the latter is a re-export barrel and TypeScript cannot augment
through one. See `types/next-auth.d.ts`.

---

## 4. Workflow rules — hard rules

1. **Always work on a feature branch and open a PR against `main`.**
2. **NEVER merge a PR without an explicit instruction to do so in that session.**
   Opening a PR is not permission to merge it. This has held for all 21 PRs in
   this project's history, without exception.
3. **Merge commits only, never squash.** Every merge on `main` is a true
   two-parent merge commit; keep it that way.
4. **Before merging**, confirm the PR's actual state — open, correct base,
   `mergeable_state`, and that `main` has not moved unexpectedly since the
   branch point. Check the merge-base rather than assuming.
5. **Before every commit**, `npm run build`, `npx tsc --noEmit` and `eslint`
   must all pass clean **on a fresh build**. Run `rm -rf .next` first — a stale
   `.next/types/validator.ts` has masked a real type error in this repo before.
   Do not chain `&& echo PASS`, which hides a non-zero exit.
6. **Verify at 390 / 768 / 1440px**: zero axe-core violations, CLS ≤ 0.001, zero
   console errors, zero horizontal overflow. Chromium ships with the sandbox at
   `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`;
   never run `playwright install`). `playwright-core` and `axe-core` are **not**
   repo dependencies and must not be added as any — install them into a scratch
   directory outside the project and drive the bundled Chromium from there.
7. **When something cannot be verified from this sandbox, say so explicitly and
   explain the gap.** Never assume it works, never quietly route around the
   limitation, never report a check as passed that was not run. An honest
   "could not verify, here is why" is the expected answer.

### Copy and duplication discipline

`content/site-copy.ts` is the single source of truth for all user-facing copy.
Any string appearing on more than one surface gets hoisted to a module-scope
constant with a comment saying it is the only place to write it. Existing ones:
`founder`, `commissionTerms`, `browseProductsCta`, `startListingCta`,
`contactEmail`. Follow the pattern rather than retyping a literal.

Comments in this file are load-bearing guard-rails. When you change something,
update the comments that describe it — several have gone stale mid-refactor and
one was left materially false.

---

## 5. Content integrity — hard rules

1. **Never invent** statistics, customer testimonials, company logos, review
   counts or ratings, or "trusted by" claims.
2. **If real data does not exist yet, use an honest empty or "coming soon"
   state** — never placeholder content dressed up as real. The homepage has no
   stats row for exactly this reason; the comment at `app/page.tsx` records that
   every number available today would be placeholder data.
3. **When given a competitor site or reference design, take structural and UX
   patterns only.** Never copy real content, names or claims from it.
4. Example listings must carry a visible "Example" badge and a disabled "Coming
   soon" action. No star ratings, no review counts, no cart or notification
   badges, no language or currency selectors.
5. **Never use "vendor"** anywhere in copy or code. The term is "provider".
   `git grep -i vendor -- . ':!CLAUDE.md'` must return nothing. (This file is
   excluded because the rule itself spells the word; nothing else may.)

---

## 6. Current state

### Roles and status enums (`db/schema.ts`)

- `user_role`: `buyer` | `provider` | `admin` — default `buyer`
- `product_status`: `pending` | `approved` | `rejected` — default `pending`
- Tables: `users`, `providers`, `products` (+ Drizzle relations)
- `providers.user_id` is **nullable on purpose**: PAKAI TechHub is itself a
  provider with no person to sign in as. Null means first-party.

### Built

- All marketing pages: `/`, `/marketplace`, `/about`, `/academy`, `/contact`
- Nav with working search and category typeahead; homepage browse experience
- Auth end to end: `/sign-up`, `/login`, logout, role-gated `/dashboard`
- Contact form delivering real email through Resend
- `/pricing` **removed**; a 308 redirect to `/marketplace` lives in
  `next.config.ts`. Do not re-add the page without removing the redirect first —
  browsers cache a 308 hard.

### Stubbed — not built

`app/dashboard/page.tsx` is a **role-gated stub** that exists to prove the role
system works end to end. Each role gets a "coming soon" panel. Do not grow the
real features inside it; each is a separate pass:

- **Admin product review queue** — not built
- **Provider product-submission form** — not built
- **Buyer purchase / subscription flow** — not built

### The marketing site does not read the database

`/marketplace` and every other page render from `content/site-copy.ts`. The only
code that touches the database is `auth.ts`, `lib/auth-actions.ts` and
`db/seed.ts`. Changing a product on the site means editing `site-copy.ts`.

### Hosted database — stale, verified 2026-09-16

> **Migration 0003 (`db/migrations/0003_google_sign_in.sql`) is NOT applied to
> Neon** — checked read-only on 2026-09-25: three migrations, no `accounts`
> table, `users.password_hash` still NOT NULL. Apply it **before** deploying any
> code that includes Google sign-in: that code names the new columns in its
> user queries, so sign-up and login fail against an unmigrated database. The
> other order is safe — the code on `main` at `a752dfb` was run against a
> migrated local database and its sign-up, login, application and review
> suites all passed.

Queried live via Neon MCP:

- `users`: **0 rows** (no admin account exists anywhere)
- `providers`: 1 row — the first-party provider, `user_id` NULL
- `products`: 8 rows, all `approved`, prices correct

**The product names are stale.** The hosted rows still carry the old
`TechHub …` names that were replaced site-wide during the marketplace redesign:

| Hosted DB (stale) | `site-copy.ts` (current) |
|---|---|
| TechHub Chatbot | AI Customer Support Chatbot |
| TechHub Analytics | AI Predictive Analytics Dashboard |
| TechHub Content | AI Content Generator |
| TechHub CRM | AI Sales CRM |
| TechHub Health | AI Patient Triage & Diagnostics |
| TechHub Agri | AI Crop Monitoring |
| TechHub Edu | AI Adaptive Learning Platform |
| TechHub Retail | AI Demand Forecasting |

> **Re-seeding will duplicate, not update.** `db/seed.ts` decides insert-vs-update
> by matching `products.name` against the name in `site-copy.ts`. None of the
> eight stale names match any current name, so a plain `npm run db:seed` would
> **insert 8 new rows and leave the 8 old ones**, giving 16. Delete the stale
> rows first, or match on something stable. Nothing reads these rows yet, so
> this is not urgent — but do not run the seed expecting it to fix the names.

---

## 7. Open items

Flagged in the codebase and still unresolved. Each is a real note in a real
file, not a wish-list.

1. **Social profile URLs are all `#`.** `footer.connect` in `content/site-copy.ts`
   carries a `NEEDS REAL PROFILE URLS — do not invent them` note over LinkedIn,
   X and Instagram, all with `href: "#"`. The handle `@pakaitechub` is shown.
   `components/site-footer.tsx` and `app/contact/page.tsx` both repeat the
   warning; the contact page reuses `footer.connect`, so fixing it once fixes
   both. **Do not guess a URL from the handle.**
2. **`README.md` is stale.** It still lists a `pricing/` route (removed) and
   describes `marketplace/`, `academy/`, `about/` and `contact/` as "Placeholder
   route", which they have not been for many merges.
3. **One stale comment survives the pricing removal.** `content/site-copy.ts`,
   on `hero.reassurance`: *"Same trial terms the pricing page states"* — that
   page no longer exists.
4. **`products` has no billing-period column.** The site quotes "$55/mo" but the
   schema stores only an amount and a currency; `db/seed.ts` drops the "/mo".
   Add a period column before anything bills off this table. Noted on
   `products.priceAmount`.
5. **`HoverScale` creates dead tab stops.** Motion adds `tabIndex={0}` to the
   wrapper `<span>` because of `whileTap`, so every wrapped link is two tab
   stops — the span, then the anchor. Measured 2026-09-16: **8 on `/`, 5 on
   `/contact`, 3 on `/marketplace`.** Not a new regression; it predates the
   recent work and the fix is site-wide, so it has been left alone deliberately
   rather than patched piecemeal.
6. **Production Resend config is unconfirmed.** Whether `RESEND_API_KEY` and
   `CONTACT_FROM_EMAIL` are actually set in Vercel has never been verified — see
   the env-var note in §2. A submission through the live form is the check that
   closes it.
7. ~~`pakaitechub.com` may not be attached to the Vercel project.~~ **Resolved —
   verified 2026-09-25 via the Vercel API:** `pakaitechub.com` is attached and
   verified, and `www.pakaitechub.com` and `pak-ai-tech-hub.vercel.app` both
   301 to it. It is therefore the one production origin to register with
   Google: `https://pakaitechub.com/api/auth/callback/google`.
