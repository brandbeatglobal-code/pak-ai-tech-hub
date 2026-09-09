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
   * The bare amount, e.g. "PKR 15,000/mo" — no "from" prefix baked in.
   *
   * The marketplace cards prepend `marketplace.products.pricePrefix`; the
   * pricing table shows the amount on its own. Keeping the number in one
   * place means the two pages cannot quote different prices.
   */
  price: string;
  /** Individual product pages do not exist yet. */
  href: string;
};

export type TrainingTier = {
  /** Position in the progression, rendered as the step marker. */
  step: string;
  name: string;
  audience: string;
  duration: string;
  format: string;
  price: string;
};

export type Curriculum = {
  industry: string;
  topics: string[];
};

export type AudienceTile = {
  segment: string;
  /** Reach figure for that segment. */
  count: string;
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
  bio: "Visionary leader driving AI adoption across Pakistan. Customer care operations expert.",
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
    /** Same trial terms the pricing page states — not a new claim. */
    reassurance: "7-day free trial, no card required.",
  },

  trustStrip: {
    items: ["Lahore HQ", "PKR pricing", "Urdu support", "Data kept in Pakistan"],
  },

  audience: {
    heading: "Who PAKAI TechHub is built for",
    /*
     * Segment reach figures supplied by the team. This section stands in for
     * the customer-logo band a mature site would have — we do not have named
     * customers to show, so do not add logos, names or "trusted by" claims
     * here until real ones are confirmed.
     */
    tiles: [
      {
        segment: "SMEs",
        count: "5.3M+ businesses",
        body: "Affordable, self-serve AI tools sized for small teams.",
      },
      {
        segment: "Mid-Market",
        count: "10,000+ businesses",
        body: "Multi-product bundles with dedicated onboarding support.",
      },
      {
        segment: "Enterprise",
        count: "2,500+ businesses",
        body: "Custom deployment, priority support, volume pricing.",
      },
      {
        segment: "Government",
        count: "500+ entities",
        body: "Compliance-ready deployment, data sovereignty guaranteed.",
      },
    ] satisfies AudienceTile[],
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
    intro: "Guides and updates on AI adoption in Pakistan — coming soon.",
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
            "Multi-channel AI customer service for web, WhatsApp, and SMS. 24/7 support in Urdu & English.",
          price: "PKR 15,000/mo",
          href: "#",
        },
        {
          id: "analytics",
          name: "TechHub Analytics",
          category: "cross-industry",
          description:
            "Predictive analytics dashboard with real-time insights and AI recommendations.",
          price: "PKR 25,000/mo",
          href: "#",
        },
        {
          id: "content",
          name: "TechHub Content",
          category: "cross-industry",
          description:
            "Blog posts, social media, email campaigns, and product descriptions, generated with AI.",
          price: "PKR 10,000/mo",
          href: "#",
        },
        {
          id: "crm",
          name: "TechHub CRM",
          category: "cross-industry",
          description:
            "Lead scoring, automated follow-ups, and customer segmentation powered by AI.",
          price: "PKR 20,000/mo",
          href: "#",
        },
        {
          id: "health",
          name: "TechHub Health",
          category: "healthcare",
          description:
            "Patient triage bots, diagnostic imaging support, and EHR analysis for hospitals.",
          price: "PKR 50,000/mo",
          href: "#",
        },
        {
          id: "agri",
          name: "TechHub Agri",
          category: "agriculture",
          description:
            "Crop monitoring, yield prediction, and soil analysis for farmers.",
          price: "PKR 20,000/mo",
          href: "#",
        },
        {
          id: "edu",
          name: "TechHub Edu",
          category: "education",
          description:
            "Adaptive learning, automated grading, and student engagement prediction.",
          price: "PKR 15,000/mo",
          href: "#",
        },
        {
          id: "retail",
          name: "TechHub Retail",
          category: "retail",
          description:
            "Customer behavior analysis, demand forecasting, and dynamic pricing for stores.",
          price: "PKR 25,000/mo",
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
        "Founded in Lahore in 2026 to close the gap between what AI can do and what most Pakistani businesses can actually access.",
    },
    hero: {
      headline: "Making AI something every Pakistani business can use",
      subhead:
        "Founded in Lahore in 2026 to close the gap between what AI can do and what most Pakistani businesses can actually access.",
      primaryCta: { label: "Browse AI products", href: "/marketplace" },
      secondaryCta: { label: "Get in touch", href: "/contact" },
    },
    story: {
      heading: "Our story",
      body: "PAKAI TechHub was born from a simple observation: Pakistan's 5.3 million+ businesses are hungry for AI but can't access it. Custom solutions cost PKR 5-50M, and no marketplace exists where businesses can discover, buy, and deploy AI tools easily. We built PAKAI TechHub to bridge this gap — making AI affordable, accessible, and actionable for every Pakistani business.",
    },
    different: {
      heading: "What makes us different",
      body: "We're not just another software house. We're Pakistan's first AI product marketplace — a unified platform where businesses of all sizes can browse, try, buy, and learn AI tools tailored to their industry. With a training-first approach, we don't just sell AI — we teach you how to use it.",
    },
    facts: {
      label: "Company facts",
      items: [
        "Lahore HQ, Punjab",
        "Remote teams in Karachi & Islamabad",
        "Founded 2026",
        "SECP-registered (Pvt.) Ltd.",
        "AI / SaaS / B2B",
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
        { label: "Local Focus", body: "Urdu support, Lahore HQ" },
        { label: "Training First", body: "Every product + training" },
        { label: "Transparency", body: "Clear pricing, no tricks" },
        { label: "Innovation", body: "First to market, always" },
      ] satisfies ValueBadge[],
    },
    marketNumbers: {
      heading: "Pakistan by the numbers",
      /**
       * Market context figures supplied by the team. Each is split into a
       * value and a label to fit the stat-strip treatment; do not add a figure
       * here that the team has not provided.
       */
      items: [
        { value: "207M+", label: "Telecom subscribers" },
        { value: "166M+", label: "Internet users" },
        { value: "5.3M+", label: "SMEs" },
        { value: "$3.23B", label: "AI market by 2030" },
        { value: "$5B", label: "IT exports" },
        { value: "10%", label: "AI-skilled workforce" },
      ] satisfies Stat[],
    },
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
          bio: "AI educator building Pakistan's premier AI training curriculum.",
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
          step: "1",
          name: "AI Awareness",
          audience: "Business Owners",
          duration: "1 Day",
          format: "Online",
          price: "Free",
        },
        {
          step: "2",
          name: "AI Basics",
          audience: "Managers",
          duration: "2 Days",
          format: "Workshop",
          price: "PKR 10,000/person",
        },
        {
          step: "3",
          name: "AI Practitioner",
          audience: "IT Staff",
          duration: "5 Days",
          format: "Bootcamp",
          price: "PKR 30,000/person",
        },
        {
          step: "4",
          name: "AI Champion",
          audience: "Tech Leads",
          duration: "10 Days",
          format: "Certification",
          price: "PKR 75,000/person",
        },
        {
          step: "5",
          name: "AI Master Trainer",
          audience: "Instructors",
          duration: "30 Days",
          format: "Intensive",
          price: "PKR 150,000/person",
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
