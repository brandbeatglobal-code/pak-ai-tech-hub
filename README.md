# PAKAI TechHub

Marketing site for PAKAI TechHub — AI for every business, everywhere.

Built with [Next.js](https://nextjs.org) (App Router), TypeScript, Tailwind CSS v4,
and ESLint.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## Project layout

```
app/                 App Router routes
  page.tsx           Homepage
  layout.tsx         Root layout (nav + footer + metadata)
  globals.css        Tailwind entry point and brand theme tokens
  icon.png           App icon, generated from the brandmark
  apple-icon.png     Apple touch icon, generated from the brandmark
  marketplace/       Placeholder route
  academy/           Placeholder route
  pricing/           Placeholder route
  about/             Placeholder route
  contact/           Placeholder route
components/          Shared UI (nav, footer, placeholder shell, tabs)
  motion/            Animation primitives (see below)
content/site-copy.ts All user-facing copy
public/brand/        Final brand assets
```

## Motion

Animation uses [Motion](https://motion.dev) (the `motion` package). The
primitives in `components/motion/` are the only client components that exist
purely for animation; everything else stays a server component.

| Component | Does |
| --- | --- |
| `Reveal` | Fades and slides a block in the first time it enters the viewport |
| `HeroBackdrop` | Slow looping gradient mesh behind the hero |
| `SectionGlow` | Soft blurred gradient shapes behind a section |
| `HoverLift` | Card lift and shadow on hover/focus |
| `HoverScale` | Slight scale on buttons and links |

Two rules keep this safe:

- **No layout shift.** Reveals animate `opacity` and `transform` only, so every
  block occupies its final space from first paint. Measured CLS is 0.
- **Reduced motion is respected twice.** Each component checks
  `useReducedMotion()` so no animation is scheduled, and a `!important` block in
  `app/globals.css` forces `[data-reveal]` to its final state regardless — which
  also covers the window before hydration. A `<noscript>` rule in the root
  layout does the same when JavaScript is off.

## Platform (database + auth)

The marketing pages are static and need none of this. `/sign-up`, `/login` and
`/dashboard` need a Postgres database.

### Two setup steps that have to be done by hand

Neither could be automated: the Neon organisation attached to this account is
**managed by Vercel**, so the Neon API refuses project creation
(`action restricted; reason: organization is managed by Vercel`), and the
Vercel MCP tools expose no storage or environment-variable operations.

**1. Create the database.** In the Vercel dashboard → the `pak-ai-tech-hub`
project → Storage → Create Database → Neon (Postgres). Vercel provisions the
Neon project and injects `DATABASE_URL` into Development, Preview and
Production automatically.

**2. Add `AUTH_SECRET`.** Project Settings → Environment Variables, for all
three environments. Generate one with:

```bash
npx auth secret        # or: openssl rand -base64 32
```

Until both exist, `/sign-up`, `/login` and `/dashboard` return a 500 naming the
missing variable. The rest of the site builds and serves normally — the
database connection is deliberately lazy so a missing `DATABASE_URL` cannot
fail the build.

### Local development

```bash
cp .env.example .env.local     # then fill in both values
npm run db:migrate             # apply migrations
npm run db:seed                # first-party provider + its 8 products
```

Any Postgres 16+ will do locally; it does not have to be Neon.

### Database commands

| Command | What it does |
| --- | --- |
| `npm run db:generate` | Write a migration from changes to `db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Insert/update the first-party provider and its products |
| `npm run db:studio` | Open Drizzle Studio against the current database |

Migrations are committed under `db/migrations/`. Generate one for every schema
change rather than using `db:push` against a shared database.

### Passwords

`lib/passwords.ts` is the only module that touches a raw password. Every stored
value is a bcrypt hash at cost 12. A plaintext password is never written to the
database, never logged, and never returned from a server action.

## Copy

Every user-facing string lives in `content/site-copy.ts`. Components read from it
rather than hard-coding text. Translations are planned, so new copy should
be added there — not inline in JSX.

## Brand assets

| File                        | Use                                                        |
| --------------------------- | ---------------------------------------------------------- |
| `public/brand/logo.png`     | Full horizontal lockup — nav bar and footer                 |
| `public/brand/brandmark.png`| Square mark — narrow-screen nav, footer, source for icons   |

`app/icon.png` and `app/apple-icon.png` are resized copies of the brandmark,
picked up automatically by the Next.js metadata file conventions.

## Brand colours

Tailwind CSS v4 is configured in CSS, so the palette lives in the `@theme` block
in `app/globals.css` rather than a `tailwind.config.js`. Each token is available
as a normal Tailwind utility (`bg-brand-blue`, `text-brand-navy`, and so on).

| Token         | Hex       |
| ------------- | --------- |
| `brand-blue`  | `#09D5E3` |
| `brand-green` | `#0ADE8D` |
| `brand-navy`  | `#0A1433` |
| `brand-gray`  | `#9CA5AE` |
