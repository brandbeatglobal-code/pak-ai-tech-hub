@AGENTS.md

# PAK AI TechHub — project conventions

Written for a Claude Code session starting cold. Every fact below was read out
of this repository, the live Neon database, the Vercel project record or the
Resend account on 2026-09-16, at commit `adab9f8`. Where something could not be
verified from the sandbox it says so rather than guessing.

Keep the `@AGENTS.md` import on line 1. `next dev` regenerates `AGENTS.md`, and
dropping the import silently loses the Next.js version warning it carries.

---

## 1. What this is

A **two-sided AI product marketplace**. Buyers browse, try and buy AI products;
providers list products for sale; PAK AI TechHub takes a commission on sales.

The positioning language, verbatim from `content/site-copy.ts` — use these
strings rather than paraphrases:

| Field | Value |
|---|---|
| `brand.name` | PAK AI TechHub |
| `brand.tagline` | AI for every business, everywhere. |
| `hero.headline` (the `<h1>` on `/`) | Find AI. Try before you buy. Put it to work. |
| `hero.subhead` | One marketplace, every product reviewed before it lists — browse, test, and buy with confidence. |
| `hero.reassurance` | A trial is available where the provider offers one. (`trialTerms`) |
| `meta.description` | Browse AI products from providers worldwide, try before you buy, and put them to work — all in one place. |

**The display name is "PAK AI TechHub"** (renamed 2026-09-30). It is written
once, as `brandName` in `content/site-copy.ts`. Identifiers keep the old
spelling and must not be "fixed": the domain `pakaitechub.com`, every email
address, the `@pakaitechub` handle, the repo, package, Vercel and Neon names,
the logo artwork (`public/brand/logo.png`, which still reads "PAKAI"), and the
house provider's stored `company_name` "PAKAI TechHub", which `db/seed.ts`
looks up by that exact string.

`meta.description` **deliberately differs** from `hero.subhead`. They are
separate fields read by different files (`app/layout.tsx` and `app/page.tsx`);
one is a search-result snippet, the other is hero copy. There is a comment at
`content/site-copy.ts` saying so. Do not "fix" them back into agreement.

### The commission split

This is the one true economic fact the marketplace has. It lives in exactly one
place, the `commissionTerms` constant:

> We take a 20% commission only when you make a sale — nothing upfront.

Provider keeps 80%. The homepage's For AI Providers view shows
`home.providers.payout` ("Get paid, keep 80%") and `home.providers.intro`, which
is `` `Free to list. ${commissionTerms}` ``.
The intro reads the constant. Do not retype the sentence, and do not add payout
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

**Which Vercel environments each variable is scoped to CAN be read here.** The
Vercel MCP tool `filter_project_envs` (project `prj_RM4LJEUWTn1efHByziguVXZrKLqx`,
team `team_J3MUNAkilCMYOmClgcjy6yzw`) returns each variable's name, type and
target environments. Always pass `decrypt: "false"`: a `sensitive` variable's
value then comes back empty. (A `plain` variable's value is returned as-is —
`GOOGLE_CLIENT_ID` and `CONTACT_FROM_EMAIL` are plain.) Still do not infer
scoping from a successful deployment, because `db/index.ts` connects lazily and
the whole marketing site builds and serves with no database configured at all.

Read on 2026-09-25 — presence and environments only, no values:

| Variable | Production | Preview |
|---|---|---|
| `DATABASE_URL` (Neon integration, plus its `DATABASE_*` siblings) | yes | yes |
| `AUTH_SECRET` | yes | yes |
| `RESEND_API_KEY` | yes | yes |
| `CONTACT_FROM_EMAIL` | yes | yes |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | yes | **no** — deliberate; Google accepts no wildcard redirect URIs, so preview hosts cannot sign in with Google |

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
- **Fonts: Geist and Geist Mono via `next/font/google`, `display: "optional"`**
  (`app/layout.tsx`). Do not switch back to the default `swap`: a late font
  swap re-wrapped lines on every page, CLS up to 0.58 with the fonts held back
  800ms (measured 2026-09-30); with `optional` it is 0. `--font-sans` in
  `app/globals.css` ends on `sans-serif` — without it, a machine with no Arial
  rendered the fallback in the default serif face. (next/font's own `fallback`
  option is not used: under Turbopack it drops the size-adjusted fallback.)
- **First paint waits for the whole page's HTML**: `<link rel="expect"
  href="#page-end" blocking="render">` in the root layout's `<head>`, and
  `<div id="page-end" hidden>` last in `<body>`. Keep the marker last. Without
  it a slow phone painted half a page and it moved as the rest arrived (6x CPU
  throttle: 17/150 cold loads over CLS 0.001, up to 0.26; with it 0/150). Cost:
  first paint 8–48ms later at normal speed, 72–212ms at 6x (medians).

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
`brandName`, `leadership`, `commissionTerms`, `browseProductsCta`,
`startListingCta`, `listProductCta`, `tellUsCta`, `tryBeforeYouBuy` /
`trialTerms` / `tryBeforeYouBuyCta`, `contactEmail`. Follow the
pattern rather than retyping a literal.

The eight product categories are written once, in
`marketplace.products.categories`; every category surface derives from it.

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
4. **The marketplace lists third-party providers only.** `lib/listings.ts`
   leaves out, in its one query, every product whose provider has no linked
   user (`providers.user_id` null — the house provider and its eight seeded
   rows), so no surface can show them; the rows stay in the database. Every
   listing carries a disabled "Coming soon" action — there is no checkout.
   With nothing to list, surfaces show the shared empty state
   (`components/listings-empty.tsx`), never stand-in products. No star
   ratings, no review counts, no cart or notification badges, no language or
   currency selectors. If house listings are ever shown again, they must carry
   a visible "Example" badge.
5. **Never use "vendor"** anywhere in copy or code. The term is "provider".
   `git grep -i vendor -- . ':!CLAUDE.md'` must return nothing. (This file is
   excluded because the rule itself spells the word; nothing else may.)

---

## 6. Current state

### Roles and status enums (`db/schema.ts`)

- `user_role`: `buyer` | `provider` | `admin` — default `buyer`
- `product_status`: `pending` | `approved` | `rejected` — default `pending`
- `provider_status`: `pending` | `approved` | `rejected` — default `pending`
- `provider_type`: `organisation` | `individual` — default `organisation`
  (migration 0004, with `providers.contact_phone` / `contact_title`)
- Tables: `users`, `accounts`, `providers`, `products` (+ Drizzle relations)
- `providers.user_id` is **nullable on purpose**: PAK AI TechHub is itself a
  provider with no person to sign in as. Null means first-party, and
  first-party products are not listed (§5.4).

### Built

- All marketing pages: `/`, `/marketplace`, `/about`, `/academy`, `/contact`
- Nav with working search and category typeahead. Row 2 opens with the
  homepage's three views — For Businesses (`/`), For AI Providers
  (`/?tab=providers`), Categories (`/?tab=categories`) — as links with
  `aria-current`, then AI Solutions (`/marketplace`), Academy and About
- Homepage: one view at a time, each one screen from 1024×700 up (measured
  document height; the homepage uses a one-line footer for this). Cut content
  rather than shrinking type if a view grows
- Auth end to end: `/sign-up` (buyers), `/login`, logout, role-gated `/dashboard`,
  Google sign-in
- **Provider listing form** at `/list-your-product` (also rendered at
  `/dashboard/apply`): Account, Personal, Company/Business in ONE form, steps
  hidden but mounted. `submitListing` (lib/listing-actions.ts) checks
  everything, then in one transaction creates the buyer (if signed out) and the
  pending application. The role stays `buyer` until an admin approves.
  `/start-listing` routes every "List your product" / "Start listing" button;
  `/sign-up`'s Provider choice only links here
- Admin review queue at `/dashboard/admin` (approve / decline, emails);
  provider product submission at `/dashboard/products/new`
- Contact form delivering real email through Resend
- `/pricing` **removed**; a 308 redirect to `/marketplace` lives in
  `next.config.ts`. Do not re-add the page without removing the redirect first —
  browsers cache a 308 hard.

### Stubbed — not built

`app/dashboard/page.tsx` is a role-gated landing page with a panel per role
linking out to the real features. Do not grow features inside it.

- **Buyer purchase / subscription flow** — not built (no checkout; every card's
  "Coming soon" button is disabled)
- **Provider agreement signing** — not in the app; the admin queue says
  "Approve only after the provider agreement is signed"

### What reads the database

Listings come from ONE cached read, `getListings()` in `lib/listings.ts`
(approved products of providers with a user account only — §5.4): /marketplace,
the homepage Categories view counts, the nav and the contact form use it. Copy
still lives in `content/site-copy.ts`; products do not.

### Hosted database — stale, verified 2026-09-16

> **All four migrations, 0003 (Google sign-in) included, are applied to Neon**
> — checked read-only on 2026-09-25, before PR #28 merged: four rows in
> `drizzle.__drizzle_migrations`, the `accounts` table with all 12 columns and
> its primary and foreign keys, `users.password_hash` nullable, and
> `users.email_verified` / `users.image` present.
>
> **Migration 0004 (`0004_provider_listing_form.sql`) is NOT applied to Neon**
> as of 2026-09-30 — generated and applied to local databases only. The
> listing form, `/dashboard/apply` and the admin queue read its columns, so
> apply it to Neon **before** this work merges.
>
> The order that made it safe is the rule for the next one: apply a migration
> to Neon **before** merging code that reads its columns. Drizzle names every
> column in its queries, so new code against an unmigrated database fails;
> old code against a migrated one kept working (checked for 0003, against a
> migrated local database).

Queried live via Neon MCP (read-only, 2026-09-30): 4 rows in
`drizzle.__drizzle_migrations` (0004's columns absent), `users`: 3 rows, one
third-party provider row, and **no approved third-party product** — so the
live marketplace shows the launch empty state. Earlier (2026-09-16): the
first-party provider (`user_id` NULL) and its 8 `approved` products.

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
2. ~~`README.md` is stale.~~ **Resolved 2026-09-30:** its route list and
   database note were brought up to date.
3. ~~One stale comment survives the pricing removal.~~ **Resolved 2026-09-30:**
   the owner settled the trial wording. "Try free" / "7-day free trial, no card
   required" became "Try before you buy" / "A trial is available where the
   provider offers one." everywhere (`tryBeforeYouBuy`, `trialTerms`). Do not
   bring back a trial length, "free" or "no card required" unless the owner
   settles those terms.
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
6. **Production Resend values are unconfirmed.** Both variables EXIST: on
   2026-09-25 the Vercel API showed `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`
   set for Production (and for Preview) — see the env-var table in §2. Only
   their presence was confirmed, not their values: nothing here has checked
   that the key is valid or that Resend accepts the sender. A submission
   through the live form is the check that closes it.
7. ~~`pakaitechub.com` may not be attached to the Vercel project.~~ **Resolved —
   verified 2026-09-25 via the Vercel API:** `pakaitechub.com` is attached and
   verified, and `www.pakaitechub.com` and `pak-ai-tech-hub.vercel.app` both
   301 to it. It is therefore the one production origin to register with
   Google: `https://pakaitechub.com/api/auth/callback/google`.
8. **The production sender name still says "PAKAI".** Read on 2026-09-30
   (plain variable, no decryption): `CONTACT_FROM_EMAIL` is
   `PAKAI TechHub <noreply@pakaitechub.com>` for Production and Preview, so
   every contact-form and review email shows that sender name. The display
   name is not a code string; changing it to `PAK AI TechHub <…>` (same
   address) is a Vercel setting for the owner. `.env.example` already shows
   the new form.
