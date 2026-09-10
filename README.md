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
