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
  /**
   * One line of supporting detail, revealed when the step is expanded.
   *
   * Required, so a step cannot be added without saying what it means. Every
   * one of these restates something the site already establishes elsewhere —
   * the trial terms, the review gate, the commission split — rather than
   * making a new claim. Keep it that way: if a detail here is the only place
   * a fact appears, it belongs in the section that owns the fact first.
   */
  detail: string;
};

/** One column of "How it works" — the buyer's journey or the provider's. */
export type HowItWorksSide = {
  id: "buyers" | "providers";
  title: string;
  steps: Step[];
  /**
   * The action the column ends on, shown as a button under its last step.
   *
   * Each side's CTA is the shared object for that action, not a label typed
   * again here — see `browseProductsCta` and `startListingCta`.
   */
  cta: NavLink;
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

/**
 * Every industry in the taxonomy.
 *
 * A union rather than `string` so that adding one is a compile error until a
 * glyph is chosen for it in components/nav-icons.tsx — which is what stops a
 * new category rendering as a blank mark in the browse grid.
 */
export type IndustryId =
  | "healthcare"
  | "agriculture"
  | "education"
  | "retail"
  | "banking-finance"
  | "manufacturing"
  | "logistics"
  | "real-estate";

export type Industry = {
  /**
   * Stable slug. Used as the browse-category id on the homepage and, for the
   * four industries that have products, it matches the `ProductCategory` of
   * those products — which is what lets a category chip filter the grid.
   */
  id: IndustryId;
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
   * The cards that show it prepend `marketplace.products.pricePrefix`, so the
   * prefix is presentation and the number is data. Both /marketplace and the
   * homepage's example listings read this same field, which is what stops the
   * two surfaces quoting different prices.
   *
   * The /pricing table used to read it too, showing the amount without the
   * prefix. That page is gone; this field is unchanged and still the single
   * source for every price the site shows.
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

/**
 * One of the nine categories a visitor can browse by.
 *
 * `productCategory` is set only where products actually exist under that
 * category, which is what lets a chip filter the listings grid. The five
 * without it are real parts of the taxonomy that have nothing listed yet —
 * selecting one shows the empty-state message rather than a broken grid.
 */
export type BrowseCategoryId = "cross-industry" | IndustryId;

export type BrowseCategory = {
  id: BrowseCategoryId;
  label: string;
  productCategory?: ProductCategory;
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

/**
 * The commission model, in one sentence.
 *
 * THIS IS THE ONLY PLACE THE COMMISSION SPLIT SHOULD BE WRITTEN.
 *
 * Two surfaces state it: the last step of the provider column in `howItWorks`,
 * and the body of the `providerCta` band. They previously carried the same
 * sentence typed out twice, which is exactly how the founder content drifted
 * before it was consolidated. Both now read from here, so changing the split
 * is a one-line edit and the two cannot disagree.
 *
 * It is a real term of the marketplace, not a projection. Do not add payout
 * timings, fee tiers or minimums — none of those are settled.
 */
const commissionTerms =
  "We take a 20% commission only when you make a sale — nothing upfront.";

/**
 * The two calls to action that appear in more than one place.
 *
 * THESE ARE THE ONLY PLACES THEIR LABELS SHOULD BE WRITTEN.
 *
 * "Browse AI products" was typed out five times — the flagship banner and the
 * pricing, about and contact pages — and "Start listing — it's free" twice,
 * once in the provider band and once in the provider column of `howItWorks`.
 * Same label, same href, same action each time, which is a copy change waiting
 * to half-land. Every one of them now reads from here.
 *
 * Reusing one action's wording everywhere is the point: a visitor should not
 * meet "Browse AI products", "Browse the marketplace" and "See all products"
 * for the same click. If the wording changes, change it here.
 *
 * Not every marketplace link belongs to these — `contact.reachUs` says "Browse
 * the marketplace" in a sentence-like card, which is deliberately its own
 * phrasing rather than a button label.
 */
const browseProductsCta = {
  label: "Browse AI products",
  href: "/marketplace",
} satisfies NavLink;

const startListingCta = {
  label: "Start listing — it's free",
  href: "/sign-up?role=provider",
} satisfies NavLink;

/**
 * The official inbox.
 *
 * THIS IS THE ONLY PLACE THE ADDRESS SHOULD BE WRITTEN.
 *
 * Four things read it: the email card on /contact, that card's mailto link,
 * the hero's "Email us" button, and — via `contact.details.email.value` —
 * the `to` address the contact form's Resend submission actually delivers to
 * (`lib/contact-actions.ts`). It was typed out twice before, in the card and
 * the hero button, which is how a half-finished address change leaves a form
 * quietly posting to the old inbox while the page displays the new one.
 *
 * `pakaitechub.com` is a verified sending domain in the Resend account, so
 * changing the local part here is safe; changing the DOMAIN is not, and needs
 * the new one verified in Resend first or every submission starts failing.
 */
const contactEmail = "hello@pakaitechub.com";

export const siteCopy = {
  brand: {
    name: "PAKAI TechHub",
    tagline: "AI for every business, everywhere.",
    logoAlt: "PAKAI TechHub — AI for every business, everywhere.",
    brandmarkAlt: "PAKAI TechHub",
  },

  /*
   * The homepage's <title> and description tag, read by app/layout.tsx.
   *
   * `description` is deliberately kept at this literal wording, which the hero
   * subhead used to share. It is a search-result snippet: someone reading it
   * has no page around it, so it should say plainly what the site is and what
   * you can do there. The hero can be punchier because the page is right
   * behind it. See the note on `hero.subhead` — the two are separate fields
   * and are now meant to differ.
   */
  meta: {
    title: "PAKAI TechHub — AI for every business, everywhere.",
    description:
      "Browse AI products from providers worldwide, try them free, and put them to work — all in one place.",
  },

  nav: {
    items: [
      { label: "Marketplace", href: "/marketplace", menu: "marketplace" },
      { label: "Academy", href: "/academy", menu: "academy" },
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
    signUp: { label: "Sign up", href: "/sign-up" },
    /*
     * The nav CTA speaks to providers, not buyers.
     *
     * Buyers already have the search field, the category bar and the whole
     * listings grid as their entry point; the supply side of the marketplace
     * has none, so the one button in the bar is theirs. `?role=provider` is
     * read by /sign-up and preselects the Provider option — do not drop the
     * query string, or the button lands people on the buyer form.
     */
    cta: { label: "List your product", href: "/sign-up?role=provider" },
    /*
     * Copy for the search field in the nav, and for the larger one in the
     * hero, which is the same control at a different size.
     *
     * The search is real: it filters the example listings and the category
     * names that are already in this file. It does not reach a backend, and
     * there is no search results page behind it, so do not write copy here
     * that promises either.
     */
    search: {
      label: "Search AI products",
      placeholder: "Search AI products",
      /** Screen-reader name for the category `<select>` beside the field. */
      categoryLabel: "Filter by category",
      allCategories: "All categories",
      clear: "Clear search",
      resultsLabel: "Search results",
      /** {count} is substituted with the number of matches. */
      resultCountOne: "1 result",
      resultCountOther: "{count} results",
      /** {query} is substituted with what was typed. */
      noResults: "No products match {query}",
      /** Row label distinguishing a category match from a product match. */
      categoryRowLabel: "Category",
    },
  },

  /*
   * The hero is search-first: headline, subhead, then the search field.
   *
   * The two CTA buttons that used to sit here are gone. Everything they
   * pointed at is now closer to hand than a button would be — the search field
   * itself, the category bar under it and the listings grid under that — and
   * three competing calls to action above the fold made the search look
   * optional. The provider side keeps its button in the nav.
   *
   * No stat row. There was one ("8 products, 8 industries, 24/7 support") and
   * it was removed rather than restated: see the note where `stats` used to
   * be, further down this file.
   */
  hero: {
    headline: "Find AI. Try it free. Put it to work.",
    /*
     * Deliberately NOT the same string as `meta.description`.
     *
     * The two were identical until this change — not because one fed the
     * other, but because they had been written the same way. They are separate
     * fields: `meta.description` is read by app/layout.tsx for the description
     * tag, this is read by app/page.tsx for the visible subhead. Nothing
     * derives one from the other, so they were free to diverge, and they now
     * do: this is hero copy, that is a search-result snippet, and the snippet
     * is better off literal about what the site is.
     *
     * If they ever need to agree again, make one read from the other rather
     * than typing the same sentence twice.
     *
     * "every product reviewed before it lists" is not a new claim — it is the
     * review gate already stated in `whyPakai`, `flagship.body` and
     * `about.different`.
     */
    subhead:
      "One marketplace, every product reviewed before it lists — browse, test, and buy with confidence.",
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

  /*
   * REMOVED: the `audience` block ("Who PAKAI TechHub is built for").
   *
   * It held two tiles, "For businesses" and "For AI providers", saying what
   * each side of the marketplace gets. `howItWorks` below now says the same
   * thing in more detail and in the same two-column shape, so the tiles were
   * repeating the section directly beneath them.
   *
   * Do not reinstate it. If a point is missing, it belongs in the matching
   * side of `howItWorks`, not in a second block that has to be kept in step
   * with it.
   *
   * Its caption for the illustration ("AI for modern business") moved to
   * `providerCta.figureCaption`, which is where that artwork now sits, and
   * carries the same constraint with it.
   */

  /**
   * Full-width banner introducing the platform as a whole.
   *
   * Every claim in `body` is one the site already makes elsewhere — own
   * products plus vetted partner tools (`offering`), review before listing
   * and a free trial on every listing (`about.different`), training with
   * every subscription (`pricing.included`). Do not add a new claim here;
   * add it to the section that owns it first.
   *
   * The headline must NOT repeat the hero's. The hero owns "Find AI. Try it
   * free. Put it to work."; this banner sits on the same page. (It previously
   * owned "One place to find, try, and run AI" — if you are grepping for that
   * string after a copy change, this comment is why it used to appear twice.)
   */
  flagship: {
    eyebrow: "The PAKAI TechHub platform",
    headline: "A marketplace built on trust",
    body: "Our own products and vetted partner tools in a single marketplace — every listing reviewed before it goes live, every one with a free trial and AI Academy training included.",
    primaryCta: browseProductsCta,
    secondaryCta: { label: "See how it works", href: "#how-it-works" },
    /**
     * The three-up row under the banner is rendered from `offering.tabs` —
     * same labels, same one-liners, linking down to that section. Do not
     * retype them here.
     */
    linksLabel: "What's on the platform",
  },

  /*
   * How it works, split by which side of the marketplace you are on.
   *
   * This used to be one five-step row written entirely from the buyer's point
   * of view, which left the provider journey unstated anywhere on the page.
   *
   * The buyer steps are the same commitments the old row made, minus two that
   * were platform admin rather than steps a buyer takes ("Subscribe to a
   * monthly plan", "We handle support and updates"). Those used to be stated
   * on /pricing; that page is gone, so neither is stated anywhere on the site
   * now. That is deliberate rather than an oversight — there is no billing to
   * describe yet and no support rota behind a 24/7 claim. Do not reinstate
   * either here; put it on the page that owns it when one exists.
   */
  howItWorks: {
    heading: "How it works",
    /**
     * Each step carries a `detail` line, revealed when the step is expanded.
     *
     * None of them is a new claim — every one restates something the site
     * already establishes, noted per step below. Step 1 of each column is the
     * one open by default, so the section says something before anyone
     * interacts with it.
     */
    sides: [
      {
        id: "buyers",
        title: "For buyers",
        steps: [
          {
            number: "1",
            title: "Browse",
            /* The search field and category bar directly above this section. */
            detail:
              "Search or filter by category to find AI tools for your business.",
          },
          {
            number: "2",
            title: "Try free",
            /* Same trial terms as `hero.reassurance`. */
            detail:
              "Every listing includes a 7-day free trial, no card required.",
          },
          {
            number: "3",
            title: "Use it",
            /* The no-procurement point the audience tiles used to carry. */
            detail: "Put it to work — no long procurement process.",
          },
        ],
        /* Where the buyer journey lands: the marketplace itself. */
        cta: browseProductsCta,
      },
      {
        id: "providers",
        title: "For providers",
        steps: [
          {
            number: "1",
            title: "Sign up free",
            /* The provider side of /sign-up, which the nav CTA links to. */
            detail: "Create a provider account in a couple of minutes.",
          },
          {
            number: "2",
            title: "List your product",
            /* The review gate stated in `whyPakai` and `about.different`. */
            detail: "Submit it for review by our team before it goes live.",
          },
          {
            number: "3",
            title: "Reach buyers worldwide",
            /* The marketplace search this page now leads with. */
            detail: "Get discovered by businesses searching the marketplace.",
          },
          {
            number: "4",
            title: "Get paid, keep 80%",
            /* Read from the shared constant — see `commissionTerms`. */
            detail: commissionTerms,
          },
        ],
        /* The same action, and the same button, as the provider band below. */
        cta: startListingCta,
      },
    ] satisfies HowItWorksSide[],
  },

  /*
   * REMOVED: the `stats` block and the dark stat bar it fed.
   *
   * It showed "8 products", "8 industries" and "24/7 support". The first two
   * counted example listings and taxonomy entries, not anything a visitor
   * would understand the numbers to mean, and the third is a support
   * commitment no rota exists for yet.
   *
   * Do not replace it with other figures. There is no honest number to put
   * above the fold on this page today: every count available is a count of
   * placeholder data. The one true economic fact the marketplace has is the
   * commission split, and that is stated in words in `howItWorks` and
   * `providerCta` rather than dressed up as a metric.
   */

  /*
   * The provider recruitment band.
   *
   * `body` is "Free to list." plus the shared `commissionTerms` sentence —
   * the same words the last step of the provider column in `howItWorks`
   * shows, read from one constant rather than typed out in both places. See
   * the note on `commissionTerms` for what must not be added to it.
   */
  providerCta: {
    heading: "List your AI product on PAKAI TechHub",
    body: `Free to list. ${commissionTerms}`,
    cta: startListingCta,
    /* See the note on the removed `audience` block: keep this generic. */
    figureCaption: "AI for modern business",
  },

  /*
   * The nine browse categories, rendered as the category bar under the hero
   * and as the grid further down.
   *
   * Name only, by design. A product count would read "0" for five of the nine
   * and "1" for three of the rest, which says the marketplace is empty rather
   * than that it is new. Add counts when the counts are worth showing.
   *
   * The list itself is derived in `browseCategories` below, from the industry
   * taxonomy — there is no second list of categories to keep in step.
   */
  categoryBrowse: {
    heading: "Browse by category",
    /** Accessible name for the horizontally scrolling bar under the hero. */
    barLabel: "Browse by category",
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
     * CustomGPT, BotPenguin, TruBot or any other provider here until that
     * partnership is confirmed the same way KladAI's was — see `worksWith`.
     */
    tabs: [
      {
        id: "own-products",
        label: "Own AI Products",
        headline: "Ready to deploy, built in-house",
        /*
         * Describes the in-house products without naming them. They used to be
         * listed here by name, which meant renaming one left this sentence
         * quoting a product that no longer existed. The names live in
         * `marketplace.products.items`; if this line needs them, derive them.
         */
        body: "Customer support, analytics, content, and CRM products — built by our team, with training included from day one.",
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

  /**
   * The industry taxonomy, and the source of record for the browse categories
   * below. Nothing else may define an industry list.
   *
   * The homepage no longer renders this as its own section — the category
   * browse grid and the category bar took that over, and both show name only.
   * The descriptions are kept because they are the only written account of
   * what each industry covers, and the next surface that needs one (an
   * industry page, a category landing page) should read them from here rather
   * than write new ones.
   */
  industries: {
    heading: "Industries we cover",
    /**
     * Descriptions come straight from the existing product portfolio. The last
     * four industries are name-only because no product exists for them yet —
     * do not write a description for them until one does.
     */
    items: [
      {
        id: "healthcare",
        name: "Healthcare",
        description: "Patient triage, diagnostics, and EHR analysis for hospitals.",
      },
      {
        id: "agriculture",
        name: "Agriculture",
        description: "Crop monitoring, yield prediction, and soil analysis.",
      },
      {
        id: "education",
        name: "Education",
        description: "Adaptive learning, grading, and engagement prediction.",
      },
      {
        id: "retail",
        name: "Retail",
        description: "Customer behavior, demand forecasting, and dynamic pricing.",
      },
      { id: "banking-finance", name: "Banking & Finance" },
      { id: "manufacturing", name: "Manufacturing" },
      { id: "logistics", name: "Logistics" },
      { id: "real-estate", name: "Real Estate" },
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
      /*
       * NOT /marketplace. This button sits on /marketplace, so pointing it
       * there would make the page's own primary call to action reload the page
       * you are already looking at. A trial starts with an account, so it goes
       * to /sign-up — the nearest destination that actually does something.
       */
      primaryCta: { label: "Start free trial", href: "/sign-up" },
      secondaryCta: { label: "How it works", href: "/#how-it-works" },
    },
    products: {
      /*
       * "Example listings", not "Our products".
       *
       * Nothing in this array is buyable. The eight entries are illustrative —
       * real product shapes at real-looking prices, standing in for listings
       * that providers have not made yet — so every surface that renders them
       * carries the `exampleBadge` and the disabled `buyLabel` button, and the
       * heading says what they are. Do not relabel this "Our products",
       * "Featured" or "Popular" until there is something behind it.
       */
      heading: "Example listings",
      intro:
        "Illustrative listings showing what a product page will carry. None of these are buyable yet.",
      /** Badge on every card. Same treatment as the "Coming soon" labels. */
      exampleBadge: "Example",
      /*
       * The buy button on each card, permanently disabled. There is no
       * checkout, so a working-looking button would be a lie; a disabled one
       * that says why is not. Do not wire this to a cart.
       */
      buyLabel: "Coming soon",
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
          name: "AI Customer Support Chatbot",
          category: "cross-industry",
          description:
            "Multi-channel AI customer service for web, WhatsApp, and SMS. Available around the clock.",
          price: "$55/mo",
          href: "#",
        },
        {
          id: "analytics",
          name: "AI Predictive Analytics Dashboard",
          category: "cross-industry",
          description:
            "Predictive analytics dashboard with real-time insights and AI recommendations.",
          price: "$90/mo",
          href: "#",
        },
        {
          id: "content",
          name: "AI Content Generator",
          category: "cross-industry",
          description:
            "Blog posts, social media, email campaigns, and product descriptions, generated with AI.",
          price: "$35/mo",
          href: "#",
        },
        {
          id: "crm",
          name: "AI Sales CRM",
          category: "cross-industry",
          description:
            "Lead scoring, automated follow-ups, and customer segmentation powered by AI.",
          price: "$70/mo",
          href: "#",
        },
        {
          id: "health",
          name: "AI Patient Triage & Diagnostics",
          category: "healthcare",
          description:
            "Patient triage bots, diagnostic imaging support, and EHR analysis for hospitals.",
          price: "$180/mo",
          href: "#",
        },
        {
          id: "agri",
          name: "AI Crop Monitoring",
          category: "agriculture",
          description:
            "Crop monitoring, yield prediction, and soil analysis for farmers.",
          price: "$70/mo",
          href: "#",
        },
        {
          id: "edu",
          name: "AI Adaptive Learning Platform",
          category: "education",
          description:
            "Adaptive learning, automated grading, and student engagement prediction.",
          price: "$55/mo",
          href: "#",
        },
        {
          id: "retail",
          name: "AI Demand Forecasting",
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

  /*
   * REMOVED: the `pricing` block, and the /pricing page it fed.
   *
   * It held that page's own content only — its meta, hero, the "what's
   * included" badges, the pricing table's column labels and caption, the
   * "bigger needs" routing line and its closing CTA. No product and no price
   * was ever stored here: the table rendered its rows from
   * `marketplace.products.items`, which is untouched and still the single
   * source for every price the marketplace shows.
   *
   * /pricing now redirects to /marketplace (see next.config.ts). If a pricing
   * page returns, it goes back to reading products from `marketplace.products`
   * rather than restating them — that was the point of the earlier refactor.
   */

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
    cta: { label: "Get started", href: "/marketplace" },
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
        ],
      },
      {
        heading: "Get started",
        links: [{ label: "Start free trial", href: "/marketplace" }],
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
      primaryCta: browseProductsCta,
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
      primaryCta: { label: "Start free trial", href: "/marketplace" },
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
      cta: { label: "Start free trial", href: "/marketplace" },
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
      primaryCta: { label: "Email us", href: `mailto:${contactEmail}` },
    },
    /*
     * Real details only.
     *
     * There is now a form (see `form` below) backed by Resend. The mailto link
     * in the hero stays as the always-available fallback, and the error state
     * surfaces it too, so a delivery failure never leaves someone stuck.
     *
     * The email address and city are the ones the team supplied. The address
     * itself is not written here — it comes from `contactEmail` above, which
     * the Resend `to` address reads from too. Do not add a phone number, a
     * street address, office hours or a second inbox — none of those have
     * been confirmed.
     */
    details: {
      heading: "How to reach us",
      email: { label: "Email", value: contactEmail },
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
      cta: browseProductsCta,
    },
  },
};

/**
 * The nine browse categories, in the order they are shown.
 *
 * Derived, not written. "Cross-Industry" comes off the marketplace filter list
 * — it is a product category that spans every industry rather than an industry
 * in its own right, so it leads — and the other eight are the industry
 * taxonomy in `industries.items`, in its order.
 *
 * Deriving it is the point: there is exactly one place to add an industry, and
 * a category cannot appear in the bar, the grid or the nav's category select
 * without existing in the taxonomy first. Do not hand-write a parallel list,
 * and do not add a category here that no part of the site recognises — the
 * previous version of this page invented categories that matched nothing.
 *
 * `productCategory` is set where the id is also a real `ProductCategory`, and
 * that is what a chip filters on. The five without it — Banking & Finance,
 * Manufacturing, Logistics, Real Estate, and any industry added later — are
 * honest empty categories: selecting one says nothing is listed yet.
 */
const PRODUCT_CATEGORY_IDS = new Set<string>(
  siteCopy.marketplace.products.categories
    .filter((category) => category.id !== "all")
    .map((category) => category.id),
);

function asProductCategory(id: string): ProductCategory | undefined {
  return PRODUCT_CATEGORY_IDS.has(id) ? (id as ProductCategory) : undefined;
}

export const browseCategories: BrowseCategory[] = [
  { id: "cross-industry", label: "Cross-Industry", productCategory: "cross-industry" },
  ...siteCopy.industries.items.map((industry) => ({
    id: industry.id,
    label: industry.name,
    productCategory: asProductCategory(industry.id),
  })),
];

export default siteCopy;
