# PAKAI TechHub

Marketing site for PAKAI TechHub — AI for every business in Pakistan.

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
components/          Shared UI (nav, footer, placeholder shell)
content/site-copy.ts All user-facing copy
public/brand/        Final brand assets
```

## Copy

Every user-facing string lives in `content/site-copy.ts`. Components read from it
rather than hard-coding text. Urdu translations are planned, so new copy should
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
