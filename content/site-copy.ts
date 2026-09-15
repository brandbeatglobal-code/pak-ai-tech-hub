/**
 * Single source of truth for every string rendered on the site.
 *
 * Keep all user-facing copy here rather than inline in JSX. Translations are
 * planned, so the shape of this file is intended to be duplicated per locale
 * later (e.g. `site-copy.ur.ts`) without touching any component.
 *
 * English only for now.
 */

export type NavLink = {
  label: string;
  href: string;
};

/**
 * Which existing list a top-level nav item's dropdown is built from.
 *
 * The panel rows are *derived* — marketplace categories come from
 * `marketplace.products.categories`, academy rows from `academy.tiers.items`.
 * Nothing about a category or a tier is restated here, so adding one in its
 * own list puts it in the nav with no second edit and no chance of the two
 * drifting apart.
 *
 * Items with no `menu` are plain links. Pricing and About have no sub-content
 * to show, so they stay that way — do not invent panel rows for them.
 */
export type NavMenuSource = "marketplace" | "academy";

export type NavItem = NavLink & {
  menu?: NavMenuSource;
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

/**
 * Compact label + one-liner, lighter than a ValueCard. Used by the pricing
 * page's "what's included" strip and the About page's value badges.
 */
export type ValueBadge = {
  label: string;
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

export type TeamMember = {
  /**
   * Only set where a real person has been confirmed. Roles that are still
   * open stay name-less — do not invent a name to fill a card.
   */
  name?: string;
  role: string;
  roleDetail?: string;
  bio: string;
};

/**
 * Category ids used by the marketplace filter.
 *
 * Only industries that actually have a product appear here. Banking & Finance,
 * Manufacturing, Logistics and Real Estate are deliberately absent — adding a
 * filter for them would show an empty grid. Add one when a product ships.
 */
export type ProductCategory =
  | "cross-industry"
  | "healthcare"
  | "agriculture"
  | "education"
  | "retail";

export type CategoryFilter = {
  /** "all" is the reset option; every other id must match a ProductCategory. */
  id: ProductCategory | "all";
  label: string;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  /**
   * The bare amount, e.g. "$55/mo" — no "from" prefix baked in.
   *
   * The marketplace cards prepend `marketplace.products.pricePrefix`; the
   * pricing table shows the amount on its own. Keeping the number in one
   * place means the two pages cannot quote different prices.
   *
   * INTERIM DISPLAY PRICING. These figures were converted from the original
   * PKR amounts at roughly 277 PKR/USD and rounded to clean numbers. They are
   * a placeholder for a marketplace where providers set their own prices, and
   * they will be replaced wholesale once provider-set pricing exists. Do not
   * treat them as negotiated or quoted amounts, and do not add a currency
   * switcher on top of them — this is one hard-coded currency, not a rate.
   */
  price: string;
  /** Individual product pages do not exist yet. */
  href: string;
};

export type TrainingTier = {
  /**
   * Stable slug. Used as the anchor on /academy and as the nav dropdown's
   * link target, so it must not change once published.
   */
  id: string;
  /** Position in the progression, rendered as the step marker. */
  step: string;
  name: string;
  audience: string;
  duration: string;
  format: string;
  /**
   * Per-person amount.
   *
   * INTERIM DISPLAY PRICING. These figures were converted from the original
   * PKR amounts at roughly 277 PKR/USD and rounded to clean numbers. They are
   * a placeholder for a marketplace where providers set their own prices, and
   * they will be replaced wholesale once provider-set pricing exists. Do not
   * treat them as negotiated or quoted amounts, and do not add a currency
   * switcher on top of them — this is one hard-coded currency, not a rate.
   */
  price: string;
};

export type Curriculum = {
  industry: string;
  topics: string[];
};

export type AudienceTile = {
  segment: string;
  body: string;
};

/** Placeholder card for a resource that does not exist yet. */
export type ResourceSlot = {
  /** Kind of resource this slot will hold, e.g. "Guide". */
  category: string;
};

export type SocialLink = {
  label: string;
  /** One of the ids handled by components/social-icons.tsx. */
  icon: "linkedin" | "x" | "instagram";
  href: string;
};

export type FooterColumn = {
  heading: string;
  links: NavLink[];
};

/**
 * Founder details, supplied by the team.
 *
 * THIS IS THE ONLY PLACE FOUNDER CONTENT SHOULD BE WRITTEN.
 *
 * Both pages that show the founder read from this object — the homepage (`/`)
 * as a compact summary card, the About page (`/about`) as the fuller team
 * card with an initials mark. The two differ in presentation only. To change
 * the name, title or bio, change it here; do not restate any of it in
 * `siteCopy.founder`, `siteCopy.about.team.founder`, or a component, or the
 * pages will drift apart the way they previously did.
 */
const founder = {
  name: "NK",
  title: "Founder & CEO",
  bio: "Visionary leader driving AI adoption worldwide. Customer care operations expert.",
};

export const siteCopy = {
  brand: {
    name: "PAKAI TechHub",
    tagline: "AI for every business, everywhere.",
    logoAlt: "PAKAI TechHub — AI for every business, everywhere.",
    brandmarkAlt: "PAKAI TechHub",
  },

  meta: {
    title: "PAKAI TechHub — AI for every business, everywhere.",
    description:
      "Browse AI products from providers worldwide, try them free, and put them to work — all in one place.",
  },

  nav: {
    items: [
      { label: "Marketplace", href: "/marketplace", menu: "marketplace" },
      { label: "Academy", href: "/academy", menu: "academy" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
    ] satisfies NavItem[],
    /**
     * Chrome for the two dropdown panels. The rows themselves are derived from
     * the marketplace and academy source lists — only the wrapper copy lives
     * here.
     */
    menus: {
      marketplace: {
        heading: "Browse by category",
        viewAll: "All products",
        /** {count} is substituted with the real number of products. */
        countOne: "1 product",
        countOther: "{count} products",
        /**
         * Highlight card in the panel's left region.
         *
         * {count} is substituted with `marketplace.products.items.length`, so
         * the headline cannot claim a product count the marketplace does not
         * have. Do not hard-code a number here.
         */
        featured: {
          eyebrow: "Featured",
          headline: "Browse all {count} AI products",
          body: "Built in-house or vetted from trusted partners, managed in one place.",
        },
      },
      academy: {
        heading: "Training tiers",
        viewAll: "All tiers",
        /**
         * Highlight card in the panel's left region. It points at the first
         * tier in `academy.tiers.items` and reads its name, price, duration
         * and format straight off that object — nothing about the tier is
         * restated here, so it cannot drift from /academy.
         */
        featured: {
          eyebrow: "Start here",
          body: "The free entry point to the training ladder.",
        },
      },
    },
    /*
     * Logged-out entry point to the auth pages, shown beside the CTA.
     *
     * There is deliberately no logged-in variant yet. Swapping this for
     * "Dashboard" means reading the session server-side in the nav, which
     * turns a static shared component into a dynamic one across every page —
     * a bigger change than this one, and not something to improvise here.
     */
    signIn: { label: "Sign in", href: "/login" },
    cta: { label: "Start free trial", href: "/pricing" },
  },

  hero: {
    headline: "One place to find, try, and run AI",
    subhead:
      "Browse AI products from providers worldwide, try them free, and put them to work — all in one place.",
    primaryCta: { label: "Browse AI products", href: "/marketplace" },
    secondaryCta: { label: "Start free trial", href: "/pricing" },
    /** Same trial terms the pricing page states — not a new claim. */
    reassurance: "7-day free trial, no card required.",
  },

  trustStrip: {
    items: [
      "Every product reviewed",
      "Free trials included",
      "Providers worldwide",
      "New products added regularly",
    ],
  },

  audience: {
    heading: "Who PAKAI TechHub is built for",
    intro:
      "A marketplace has two sides. PAKAI TechHub is built for both of them.",
    /*
     * Caption for the illustration beside the tiles.
     *
     * Deliberately generic. It describes the subject of an illustrative
     * graphic, not a place PAKAI operates from or a customer it serves — do
     * not change it to name a city, an office or a client, and keep it
     * generic if the artwork is ever swapped for a licensed stock photo.
     */
    figureCaption: "AI for modern business",
    /*
     * The two sides of the marketplace, not market segments.
     *
     * This previously held four reach figures for Pakistani market segments
     * (SMEs, Mid-Market, Enterprise, Government). Those were removed with the
     * global rebrand: they described one country's market, and there is no
     * worldwide equivalent the team has supplied. Do not substitute invented
     * global figures, and do not add logos, names or "trusted by" claims here
     * until real ones are confirmed.
     */
    tiles: [
      {
        segment: "For businesses",
        body: "Find AI tools, try them free, and put them to work — no procurement headaches.",
      },
      {
        segment: "For AI providers",
        body: "List your product, reach customers worldwide, and pay commission only when you make a sale.",
      },
    ] satisfies AudienceTile[],
  },

  /**
   * Full-width banner introducing the platform as a whole.
   *
   * Every claim in `body` is one the site already makes elsewhere — own
   * products plus vetted partner tools (`offering`), review before listing
   * and a free trial on every listing (`about.different`), training with
   * every subscription (`pricing.included`). Do not add a new claim here;
   * add it to the section that owns it first.
   *
   * The headline must NOT repeat the hero's. The hero owns "One place to
   * find, try, and run AI"; this banner sits on the same page.
   */
  flagship: {
    eyebrow: "The PAKAI TechHub platform",
    headline: "A marketplace built on trust",
    body: "Our own products and vetted partner tools in a single marketplace — every listing reviewed before it goes live, every one with a free trial and AI Academy training included.",
    primaryCta: { label: "Browse AI products", href: "/marketplace" },
    secondaryCta: { label: "See how it works", href: "#how-it-works" },
    /**
     * The three-up row under the banner is rendered from `offering.tabs` —
     * same labels, same one-liners, linking down to that section. Do not
     * retype them here.
     */
    linksLabel: "What's on the platform",
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
    /*
     * The product count must match what /marketplace and /pricing actually
     * list — currently 8. If a product ships, change it in all three places
     * (the two pages read from `marketplace.products`, so in practice that
     * means adding the product there and updating this number).
     */
    items: [
      { value: "8", label: "Products" },
      { value: "8", label: "Industries" },
      { value: "24/7", label: "Support" },
    ] satisfies Stat[],
  },

  resources: {
    heading: "Resources",
    intro: "Guides and updates on putting AI to work — coming soon.",
    /*
     * Deliberately empty slots. Each card shows only the kind of resource it
     * will hold. Do not add headlines, authors, dates or thumbnails until
     * real articles exist — an empty state is honest, a fabricated one is not.
     */
    comingSoonLabel: "Coming soon",
    slots: [
      { category: "Guide" },
      { category: "Case study" },
      { category: "Webinar" },
    ] satisfies ResourceSlot[],
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
        body: "TechHub Chatbot, Analytics, Content, and CRM — built by our team, with training included from day one.",
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
        headline: "Built for how your industry actually works",
        body: "Healthcare, agriculture, education, and retail solutions shaped around the way those industries actually run — not generic tools bent to fit.",
        link: { label: "Learn more", href: "#" },
      },
    ] satisfies OfferingTab[],
  },

  whyPakai: {
    heading: "Why PAKAI TechHub",
    cards: [
      {
        headline: "Affordable by design",
        body: "Custom-built AI puts it out of reach for most businesses. We built a marketplace instead — subscribe to what you need, at a published price.",
      },
      {
        headline: "No-code, no confusion",
        body: "Every product is built to be used by a business owner, not an engineer.",
      },
      {
        headline: "Reviewed before it lists",
        body: "Every product is evaluated by our team before it goes live, so the marketplace is a shortlist rather than a directory.",
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
    heading: "Industries we cover",
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

  marketplace: {
    meta: {
      title: "Marketplace — PAKAI TechHub",
      description:
        "Built in-house or vetted from trusted partners — browse, compare, and start a free trial in minutes.",
    },
    hero: {
      headline: "Every AI product your business needs, in one place",
      subhead:
        "Built in-house or vetted from trusted partners — browse, compare, and start a free trial in minutes.",
      primaryCta: { label: "Start free trial", href: "/pricing" },
      secondaryCta: { label: "How it works", href: "/#how-it-works" },
    },
    products: {
      heading: "Our products",
      filterLegend: "Filter products by category",
      /**
       * Announced to screen readers when the filter changes the grid. Kept as
       * strings with a {count} placeholder rather than a function so the whole
       * block stays serializable across the server/client boundary — and so a
       * translator can reorder the sentence.
       */
      resultCountOne: "1 product shown",
      resultCountOther: "{count} products shown",
      emptyMessage: "No products in this category yet.",
      trainingBadge: "Training included",
      /** Prepended to `Product.price` on the marketplace cards only. */
      pricePrefix: "from",
      categories: [
        { id: "all", label: "All" },
        { id: "healthcare", label: "Healthcare" },
        { id: "agriculture", label: "Agriculture" },
        { id: "education", label: "Education" },
        { id: "retail", label: "Retail" },
        { id: "cross-industry", label: "Cross-Industry" },
      ] satisfies CategoryFilter[],
      items: [
        {
          id: "chatbot",
          name: "TechHub Chatbot",
          category: "cross-industry",
          description:
            "Multi-channel AI customer service for web, WhatsApp, and SMS. Available around the clock.",
          price: "$55/mo",
          href: "#",
        },
        {
          id: "analytics",
          name: "TechHub Analytics",
          category: "cross-industry",
          description:
            "Predictive analytics dashboard with real-time insights and AI recommendations.",
          price: "$90/mo",
          href: "#",
        },
        {
          id: "content",
          name: "TechHub Content",
          category: "cross-industry",
          description:
            "Blog posts, social media, email campaigns, and product descriptions, generated with AI.",
          price: "$35/mo",
          href: "#",
        },
        {
          id: "crm",
          name: "TechHub CRM",
          category: "cross-industry",
          description:
            "Lead scoring, automated follow-ups, and customer segmentation powered by AI.",
          price: "$70/mo",
          href: "#",
        },
        {
          id: "health",
          name: "TechHub Health",
          category: "healthcare",
          description:
            "Patient triage bots, diagnostic imaging support, and EHR analysis for hospitals.",
          price: "$180/mo",
          href: "#",
        },
        {
          id: "agri",
          name: "TechHub Agri",
          category: "agriculture",
          description:
            "Crop monitoring, yield prediction, and soil analysis for farmers.",
          price: "$70/mo",
          href: "#",
        },
        {
          id: "edu",
          name: "TechHub Edu",
          category: "education",
          description:
            "Adaptive learning, automated grading, and student engagement prediction.",
          price: "$55/mo",
          href: "#",
        },
        {
          id: "retail",
          name: "TechHub Retail",
          category: "retail",
          description:
            "Customer behavior analysis, demand forecasting, and dynamic pricing for stores.",
          price: "$90/mo",
          href: "#",
        },
      ] satisfies Product[],
    },
    partners: {
      heading: "Marketplace partners",
      /*
       * The partner list itself is shared with the homepage `worksWith`
       * section, so both stay in step. The same constraint applies here: only
       * confirmed partners get a name and a link. Do not add a named partner
       * until that partnership is confirmed the way KladAI's was.
       */
      intro:
        "Third-party AI products available alongside our own, billed and managed in one place.",
    },
  },

  pricing: {
    meta: {
      title: "Pricing — PAKAI TechHub",
      description:
        "One price per product, shown upfront. No custom quotes, no setup fees, no surprises.",
    },
    hero: {
      headline: "Simple, transparent pricing",
      subhead:
        "One price per product, shown upfront. No custom quotes, no setup fees, no surprises.",
      primaryCta: { label: "Browse AI products", href: "/marketplace" },
      secondaryCta: { label: "Talk to us", href: "/contact" },
    },
    included: {
      heading: "What's included, with every product",
      items: [
        {
          label: "7-day free trial",
          body: "Try before you subscribe, no card required to start.",
        },
        {
          label: "Training included",
          body: "Every product comes with AI Academy access.",
        },
        { label: "Real support", body: "24/7 support, not a chatbot loop." },
      ] satisfies ValueBadge[],
    },
    table: {
      heading: "Product pricing",
      /*
       * The rows are rendered from `marketplace.products` — the same array the
       * marketplace page uses. Do not restate product names, categories or
       * prices here; change them at the source and both pages follow.
       */
      columns: {
        product: "Product",
        category: "Category",
        price: "Price",
        training: "Training",
      },
      /** Training ships with every product, so every row reads the same. */
      trainingIncludedLabel: "Included",
      caption:
        "Monthly price per product. Every product includes a 7-day free trial and AI Academy training.",
    },
    biggerNeeds: {
      /*
       * A routing statement, not a quote. Do not add enterprise or government
       * price points or contract terms here — those are handled directly.
       */
      body: "Need something custom? Enterprise and government pricing is handled directly.",
      cta: { label: "Contact us", href: "/contact" },
    },
    closingCta: {
      heading: "Ready to start?",
      cta: { label: "Browse AI products", href: "/marketplace" },
    },
  },

  /** Homepage founder section. Values come from the shared `founder` source. */
  founder: {
    heading: "Who is behind PAKAI TechHub",
    ...founder,
  },

  /** Homepage teaser that points at the Academy page. */
  academyTeaser: {
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
    connect: {
      heading: "Connect",
      handle: "@pakaitechub",
      /*
       * NEEDS REAL PROFILE URLS — do not invent them.
       *
       * Every href below is "#". Replace each with the real profile URL once
       * the accounts are confirmed; do not guess a URL from the handle, and do
       * not add a network we do not actually have an account on.
       */
      links: [
        { label: "LinkedIn", icon: "linkedin", href: "#" },
        { label: "X", icon: "x", href: "#" },
        { label: "Instagram", icon: "instagram", href: "#" },
      ] satisfies SocialLink[],
    },
    copyright: `© ${new Date().getFullYear()} PAKAI TechHub. All rights reserved.`,
  },

  about: {
    meta: {
      title: "About — PAKAI TechHub",
      description:
        "Founded in 2026 to close the gap between what AI can do and what most businesses can actually access.",
    },
    hero: {
      headline: "Making AI something every business can use",
      subhead:
        "Founded in 2026 to close the gap between what AI can do and what most businesses can actually access.",
      primaryCta: { label: "Browse AI products", href: "/marketplace" },
      secondaryCta: { label: "Get in touch", href: "/contact" },
    },
    story: {
      heading: "Our story",
      body: "PAKAI TechHub was born from a simple observation: businesses everywhere want to use AI, but finding the right tool, trusting it actually works, and getting it running is still too hard. We built PAKAI TechHub to fix that — a single marketplace where any business can discover AI products, try them before committing, and any AI provider can reach customers worldwide.",
    },
    different: {
      heading: "What makes us different",
      body: "We're not just another software directory. PAKAI TechHub is a marketplace built on trust — every product is evaluated by our team before it goes live, every listing includes a free trial, and providers only pay when they make a sale.",
    },
    facts: {
      label: "Company facts",
      items: [
        "Lahore HQ, Punjab",
        "Remote teams in Karachi & Islamabad",
        "Founded 2026",
        "SECP-registered (Pvt.) Ltd.",
        "AI / SaaS / B2B",
        "Worldwide marketplace",
      ],
    },
    values: {
      heading: "Our values",
      /**
       * Deliberately terser than the homepage `whyPakai` cards — this is a
       * quick-glance badge row, not a second telling of the same argument.
       */
      items: [
        { label: "Accessibility", body: "AI for every budget" },
        { label: "Simplicity", body: "No-code, easy to use" },
        { label: "Trust & Safety", body: "Every product reviewed before listing" },
        { label: "Training First", body: "Every product + training" },
        { label: "Transparency", body: "Clear pricing, no tricks" },
        { label: "Innovation", body: "First to market, always" },
      ] satisfies ValueBadge[],
    },
    /*
     * REMOVED: the "Pakistan by the numbers" stat strip.
     *
     * It held six Pakistan market figures (telecom subscribers, internet
     * users, SMEs, AI market size, IT exports, AI-skilled workforce) and was
     * dropped in the global rebrand — the numbers described a single country's
     * market, which is no longer what the site claims to serve.
     *
     * It was deliberately NOT replaced with worldwide equivalents. Nobody has
     * supplied those, and inventing them would be exactly the kind of made-up
     * figure the rest of this file is careful to avoid. If real global market
     * data is sourced later, add it back with a citation — do not restore this
     * section from memory or estimate it.
     */
    team: {
      heading: "Our team",
      /**
       * The same object the homepage renders — see the shared `founder` source
       * at the top of this file. Do not re-declare the values here.
       */
      founder,
      /**
       * Open roles. These are intentionally name-less until a hire is
       * confirmed — do not invent a name, the way partner names are not
       * invented in `worksWith`.
       */
      openRolesLabel: "Role open",
      roles: [
        {
          role: "CTO",
          roleDetail: "Chief Technology Officer",
          bio: "Full-stack engineer & AI specialist. Building scalable AI platforms.",
        },
        {
          role: "Head of Sales",
          roleDetail: "Sales & Partnerships",
          bio: "B2B sales expert driving enterprise and SME customer acquisition.",
        },
        {
          role: "Head of Academy",
          roleDetail: "Training & Education",
          bio: "AI educator building the PAKAI TechHub training curriculum.",
        },
      ] satisfies TeamMember[],
      keyHires: {
        heading: "Key hires (Phase 1)",
        items: [
          "2 Full-Stack Developers",
          "1 AI/ML Engineer",
          "1 UI/UX Designer",
          "2 Marketing Specialists",
        ],
      },
      advisory: {
        heading: "Advisory board",
        items: [
          "Industry Advisor (Banking)",
          "Industry Advisor (Healthcare)",
          "Tech Advisor (AI/ML)",
          "Business Advisor (Growth)",
        ],
      },
    },
    closingCta: {
      heading: "Questions about PAKAI TechHub?",
      cta: { label: "Contact us", href: "/contact" },
    },
  },

  academy: {
    meta: {
      title: "Academy — PAKAI TechHub",
      description:
        "From a free one-day intro to a 30-day certification for trainers — structured learning that turns AI adoption into real capability.",
    },
    hero: {
      headline: "AI training for every level of your team",
      subhead:
        "From a free one-day intro to a 30-day certification for trainers — structured learning that turns AI adoption into real capability.",
      primaryCta: { label: "Start free trial", href: "/pricing" },
      secondaryCta: { label: "Talk to us", href: "/contact" },
    },
    tiers: {
      heading: "Training tiers",
      intro:
        "Five levels, each building on the one before it. Start where your team is.",
      freeLabel: "Free",
      items: [
        {
          id: "awareness",
          step: "1",
          name: "AI Awareness",
          audience: "Business Owners",
          duration: "1 Day",
          format: "Online",
          price: "Free",
        },
        {
          id: "basics",
          step: "2",
          name: "AI Basics",
          audience: "Managers",
          duration: "2 Days",
          format: "Workshop",
          price: "$35/person",
        },
        {
          id: "practitioner",
          step: "3",
          name: "AI Practitioner",
          audience: "IT Staff",
          duration: "5 Days",
          format: "Bootcamp",
          price: "$110/person",
        },
        {
          id: "champion",
          step: "4",
          name: "AI Champion",
          audience: "Tech Leads",
          duration: "10 Days",
          format: "Certification",
          price: "$270/person",
        },
        {
          id: "master-trainer",
          step: "5",
          name: "AI Master Trainer",
          audience: "Instructors",
          duration: "30 Days",
          format: "Intensive",
          price: "$540/person",
        },
      ] satisfies TrainingTier[],
    },
    curricula: {
      heading: "Industry curricula",
      /*
       * Training coverage and product coverage are different things, so this
       * list deliberately does not match the industries on /marketplace.
       * Banking & Finance has curriculum here without a marketplace product
       * yet — that is accurate to the source material. Do not "correct" it to
       * mirror the product list.
       */
      items: [
        {
          industry: "Banking & Finance",
          topics: ["Fraud Detection", "Credit Risk AI", "Loan Bots", "Compliance"],
        },
        {
          industry: "Healthcare",
          topics: ["Diagnostics", "Patient Triage", "EHR Analysis", "Drug AI"],
        },
        {
          industry: "Retail & E-commerce",
          topics: ["Demand Forecasting", "Dynamic Pricing", "Recommendations"],
        },
        {
          industry: "Agriculture",
          topics: ["Crop Health", "Yield Prediction", "Soil Analysis"],
        },
        {
          industry: "Education",
          topics: ["Adaptive Learning", "Auto Grading", "Engagement AI"],
        },
      ] satisfies Curriculum[],
    },
    delivery: {
      heading: "How training is delivered",
      items: [
        "Online Platform (Self-paced)",
        "Corporate On-Site Training",
        "Weekly Webinars",
        "In-Person Workshops",
        "AI Sandbox Environment",
        "Lifetime Alumni Network",
      ],
    },
    closingCta: {
      heading: "Ready to build AI skills on your team?",
      cta: { label: "Start free trial", href: "/pricing" },
    },
  },

  contact: {
    meta: {
      title: "Contact — PAKAI TechHub",
      description:
        "Questions about pricing, a product, or partnering with PAKAI TechHub — reach out directly.",
    },
    hero: {
      headline: "Let's talk",
      subhead:
        "Questions about pricing, a product, or partnering with PAKAI TechHub — reach out directly.",
      reach: "We work with businesses and AI providers worldwide.",
      /* Opens the visitor's mail client. See the note on `details` below. */
      primaryCta: { label: "Email us", href: "mailto:info@pakaitechub.com" },
    },
    /*
     * Real details only.
     *
     * There is now a form (see `form` below) backed by Resend. The mailto link
     * in the hero stays as the always-available fallback, and the error state
     * surfaces it too, so a delivery failure never leaves someone stuck.
     *
     * The email address and city are the ones the team supplied. Do not add a
     * phone number, a street address, office hours or a second inbox — none
     * of those have been confirmed.
     */
    details: {
      heading: "How to reach us",
      email: { label: "Email", value: "info@pakaitechub.com" },
      location: { label: "Where we are", value: "Lahore, Pakistan" },
      /*
       * The social rows reuse `footer.connect` — the same handle, the same
       * networks, the same icons. That block still carries its
       * "NEEDS REAL PROFILE URLS" note and every href is still "#"; fixing
       * them there fixes them here too. Do not paste a guessed URL into
       * either place.
       */
      connectLabel: "Social",
    },
    /*
     * Lead-gen form.
     *
     * The industry and product options are NOT listed here — they are derived
     * from `industries.items` and `marketplace.products.items` by the form
     * component, so the dropdowns cannot offer an industry the site does not
     * cover or a product the marketplace does not sell.
     *
     * There is deliberately no Privacy Policy link on the consent checkbox:
     * no such page exists, and linking to one that 404s is worse than not
     * linking at all. Add the link when the page does.
     */
    form: {
      heading: "Send us a message",
      intro:
        "Tell us who you are and what you need. Everything marked with an asterisk is required.",
      fields: {
        firstName: "First name",
        lastName: "Last name",
        jobTitle: "Job title",
        country: "Country",
        email: "Business email",
        industry: "Industry",
        reason: "I am trying to reach…",
        product: "Product of interest",
        message: "Anything else you would like to tell us?",
      },
      /** Shown as the disabled first option of every select. */
      selectPlaceholder: "Select an option",
      optionalLabel: "optional",
      /** Appended to the derived product list — not a real product. */
      productUnsure: "Not sure yet",
      reasons: [
        "General inquiry",
        "I want to list a product (Provider)",
        "I'm interested in using a product (Buyer)",
        "Partnership or press",
      ],
      consent: "I agree to be contacted about this inquiry.",
      submit: "Send message",
      submitting: "Sending…",
      /* Only shown once Resend has confirmed the send, never optimistically. */
      successHeading: "Message sent",
      successBody:
        "Thanks — we have your message and will reply to the email address you gave us.",
      successAgain: "Send another message",
      /* {email} is replaced with the mailto address, so a failure always
         leaves a working way through. */
      errorPrefix: "We could not send that.",
      errorFallback: "Please email us directly at {email} and we will pick it up.",
      validation: {
        required: "This field is required.",
        email: "Enter a valid email address.",
        consent: "Please confirm you agree to be contacted.",
      },
    },
    /*
     * Two cards, mapped to things that actually exist: the provider sign-up
     * route and the marketplace. Do not add an "expert team", a press desk, an
     * RFP flow or office locations — none of those exist.
     */
    reachUs: {
      heading: "Ways to reach us",
      cards: [
        {
          heading: "Have a product to list?",
          body: "List your AI product, reach customers worldwide, and pay commission only when you make a sale.",
          cta: { label: "Sign up as a provider", href: "/sign-up?role=provider" },
        },
        {
          heading: "Looking for AI tools?",
          body: "Browse reviewed products, try them free, and put them to work.",
          cta: { label: "Browse the marketplace", href: "/marketplace" },
        },
      ],
    },
    closingCta: {
      heading: "Ready to get started instead?",
      cta: { label: "Browse AI products", href: "/marketplace" },
    },
  },
};

export default siteCopy;
