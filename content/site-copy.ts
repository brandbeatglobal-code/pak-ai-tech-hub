/**
 * Single source of truth for every string rendered on the site.
 *
 * Keep all user-facing copy here rather than inline in JSX. Urdu translations
 * are planned, so the shape of this file is intended to be duplicated per
 * locale later (e.g. `site-copy.ur.ts`) without touching any component.
 *
 * English only for now.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type Step = {
  number: string;
  title: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type OfferingTab = {
  /** Stable key used for tab/panel ids and as the React key. */
  id: string;
  /** Short label shown on the tab itself. */
  label: string;
  headline: string;
  body: string;
  link: NavLink;
};

export type ValueCard = {
  headline: string;
  body: string;
};

export type Industry = {
  name: string;
  /**
   * Only set where a real product exists for that industry. The remaining
   * industries stay name-only on purpose — see the note in `industries`.
   */
  description?: string;
};

export type WorksWithItem = {
  /** Confirmed partners have a name; unconfirmed slots stay descriptive. */
  name?: string;
  description: string;
  href?: string;
  confirmed: boolean;
};

export type FooterColumn = {
  heading: string;
  links: NavLink[];
};

export const siteCopy = {
  brand: {
    name: "PAKAI TechHub",
    tagline: "AI for Every Business in Pakistan",
    logoAlt: "PAKAI TechHub — AI for Every Business in Pakistan",
    brandmarkAlt: "PAKAI TechHub",
  },

  meta: {
    title: "PAKAI TechHub — AI for every business in Pakistan",
    description:
      "Browse, buy, and deploy AI tools built for Pakistani businesses — with training and support included.",
  },

  nav: {
    links: [
      { label: "Marketplace", href: "/marketplace" },
      { label: "Academy", href: "/academy" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
    ] satisfies NavLink[],
    cta: { label: "Start free trial", href: "/pricing" },
    openMenuLabel: "Open navigation",
  },

  hero: {
    headline: "AI for every business in Pakistan",
    subhead:
      "Browse, buy, and deploy AI tools built for Pakistani businesses — with training and support included.",
    primaryCta: { label: "Browse AI products", href: "/marketplace" },
    secondaryCta: { label: "Start free trial", href: "/pricing" },
  },

  trustStrip: {
    items: ["Lahore HQ", "PKR pricing", "Urdu support", "Data kept in Pakistan"],
  },

  howItWorks: {
    heading: "How it works",
    steps: [
      { number: "1", title: "Browse AI products" },
      { number: "2", title: "Free 7-day trial" },
      { number: "3", title: "Get trained via AI Academy" },
      { number: "4", title: "Subscribe to a monthly plan" },
      { number: "5", title: "We handle support and updates" },
    ] satisfies Step[],
  },

  stats: {
    items: [
      { value: "14+", label: "Products" },
      { value: "8", label: "Industries" },
      { value: "24/7", label: "Support" },
    ] satisfies Stat[],
  },

  offering: {
    heading: "What you get with PAKAI TechHub",
    /**
     * Tab 2 deliberately avoids naming any marketplace partner. Do not add
     * CustomGPT, BotPenguin, TruBot or any other vendor here until that
     * partnership is confirmed the same way KladAI's was — see `worksWith`.
     */
    tabs: [
      {
        id: "own-products",
        label: "Own AI Products",
        headline: "Ready to deploy, built in-house",
        body: "TechHub Chatbot, Analytics, Content, and CRM — built by our team, priced in PKR, with training included from day one.",
        link: { label: "Learn more", href: "#" },
      },
      {
        id: "marketplace",
        label: "Marketplace",
        headline: "Browse trusted AI tools from our partners",
        body: "Access vetted third-party AI products alongside our own — one marketplace, one bill, one place to manage them all.",
        link: { label: "Learn more", href: "#" },
      },
      {
        id: "industry-solutions",
        label: "Industry Solutions",
        headline: "Built for how Pakistani industries actually work",
        body: "Healthcare, agriculture, education, and retail solutions shaped around local workflows, language, and pricing — not generic global tools retrofitted for Pakistan.",
        link: { label: "Learn more", href: "#" },
      },
    ] satisfies OfferingTab[],
  },

  whyPakai: {
    heading: "Why PAKAI TechHub",
    cards: [
      {
        headline: "Affordable by design",
        body: "Custom AI in Pakistan can cost PKR 5-50M. We built a marketplace instead, so most businesses pay a fraction of that.",
      },
      {
        headline: "No-code, no confusion",
        body: "Every product is built to be used by a business owner, not an engineer.",
      },
      {
        headline: "Built here, not imported",
        body: "Urdu and regional language support, Lahore infrastructure, PKR pricing from the start.",
      },
      {
        headline: "Training comes standard",
        body: "Every subscription includes AI Academy access, so your team learns to use it, not just switch it on.",
      },
      {
        headline: "Transparent pricing, always",
        body: "One price, shown upfront. No custom quotes, no hidden fees.",
      },
    ] satisfies ValueCard[],
  },

  industries: {
    heading: "Built for Pakistani industries",
    /**
     * Descriptions come straight from the existing product portfolio. The last
     * four industries are name-only because no product exists for them yet —
     * do not write a description for them until one does.
     */
    items: [
      {
        name: "Healthcare",
        description: "Patient triage, diagnostics, and EHR analysis for hospitals.",
      },
      {
        name: "Agriculture",
        description: "Crop monitoring, yield prediction, and soil analysis.",
      },
      {
        name: "Education",
        description: "Adaptive learning, grading, and engagement prediction.",
      },
      {
        name: "Retail",
        description: "Customer behavior, demand forecasting, and dynamic pricing.",
      },
      { name: "Banking & Finance" },
      { name: "Manufacturing" },
      { name: "Logistics" },
      { name: "Real Estate" },
    ] satisfies Industry[],
  },

  worksWith: {
    heading: "Works with",
    /**
     * Only confirmed partners get a name and a link. Unconfirmed slots stay as
     * descriptive labels — do not invent a brand name for them.
     */
    items: [
      {
        name: "KladAI",
        description:
          "An autonomous AI agent that handles documents, data, research, and presentations — available now through the PAKAI TechHub marketplace.",
        href: "https://kladai.com",
        confirmed: true,
      },
      {
        description: "AI chat assistant",
        confirmed: false,
      },
      {
        description: "AI content generator",
        confirmed: false,
      },
    ] satisfies WorksWithItem[],
    pendingLabel: "Partner to be announced",
  },

  founder: {
    heading: "Who is behind PAKAI TechHub",
    /*
     * NEEDS REAL FOUNDER BIO — do not invent one.
     *
     * Every value below is a placeholder. Replace `name`, `title` and `bio`
     * with the real founder's details before this page goes live. Do not
     * generate a plausible-sounding name, title or biography to fill the gap.
     */
    name: "[Founder name]",
    title: "[Founder title]",
    bio: "[Founder bio — 2-3 sentences covering background, why PAKAI TechHub was started, and relevant experience. To be supplied by the team.]",
    placeholderNotice: "Founder details to be added.",
  },

  academy: {
    heading: "Every product comes with training.",
    body:
      "Get certified through TechHub Academy — workshops, courses, and certifications included with your subscription.",
    cta: { label: "Explore the academy", href: "/academy" },
  },

  finalCta: {
    heading: "Ready to bring AI into your business?",
    cta: { label: "Get started", href: "/pricing" },
  },

  footer: {
    columns: [
      {
        heading: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        heading: "Product",
        links: [
          { label: "Marketplace", href: "/marketplace" },
          { label: "Academy", href: "/academy" },
          { label: "Pricing", href: "/pricing" },
        ],
      },
      {
        heading: "Get started",
          links: [{ label: "Start free trial", href: "/pricing" }],
      },
    ] satisfies FooterColumn[],
    copyright: `© ${new Date().getFullYear()} PAKAI TechHub. All rights reserved.`,
  },

  /** Placeholder routes so nav links resolve while the real pages are built. */
  placeholders: {
    comingSoon: "Coming soon.",
    pages: {
      marketplace: { title: "Marketplace" },
      academy: { title: "Academy" },
      pricing: { title: "Pricing" },
      about: { title: "About" },
      contact: { title: "Contact" },
    },
  },
};

export default siteCopy;
