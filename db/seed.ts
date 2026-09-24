import { eq } from "drizzle-orm";

import { siteCopy, type Product } from "@/content/site-copy";
import { db } from "./index";
import { products, providers } from "./schema";

/**
 * Seeds the first-party provider and its eight products.
 *
 * FOR A FRESH DATABASE. The site reads its listings from the `products` table
 * (lib/listings.ts); this is how a new local database gets any. The eight
 * entries below used to be the marketplace itself — an array in
 * content/site-copy.ts that every surface rendered. They moved here, unchanged,
 * when the site started reading the table, because this file is now the only
 * thing that uses them.
 *
 * They are what the site showed at the time: the current product names, and
 * the INTERIM prices converted from PKR. The HOSTED database was seeded from
 * an older version of this list, and its eight rows still carry the old
 * "TechHub …" names — read the next paragraph before running this there.
 *
 * Re-running updates rows it recognises BY NAME and inserts the rest. Against
 * a database whose names differ from these (the hosted one), that means eight
 * new rows beside the old eight, not a rename.
 *
 * Seeding writes straight to the table, so it does not refresh the site's
 * cached listings. A running site picks the change up on the hourly refresh in
 * lib/listings.ts, or at the next deploy.
 */

const FIRST_PARTY_COMPANY = siteCopy.brand.name;

/**
 * The eight first-party products. Category is the filter ID and price the
 * display string, as they were in content/site-copy.ts; `seed()` converts both
 * into what the table stores (the label, and an amount and currency).
 */
const SEED_PRODUCTS = [
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
] satisfies Product[];

/** Maps a category id to the label the marketplace filter shows. */
const CATEGORY_LABELS = new Map(
  siteCopy.marketplace.products.categories.map((c) => [c.id, c.label]),
);

/**
 * "$55/mo" -> 55.00
 *
 * Throws rather than guessing: a price that cannot be parsed is a data problem
 * worth failing on, not something to silently store as 0.
 *
 * The "/mo" is dropped — the agreed schema has an amount and a currency but no
 * billing-period column. See the note on `products.priceAmount`.
 */
function parseAmount(price: string): string {
  const match = price.match(/([\d,]+(?:\.\d+)?)/);
  if (!match) throw new Error(`Cannot parse a price amount from "${price}"`);
  const amount = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(amount)) throw new Error(`Bad price amount: "${price}"`);
  return amount.toFixed(2);
}

function parseCurrency(price: string): string {
  if (price.includes("$")) return "USD";
  throw new Error(`Cannot determine a currency from "${price}"`);
}

async function seed() {
  const items = SEED_PRODUCTS;
  console.log(`Seeding ${FIRST_PARTY_COMPANY} with ${items.length} products…`);

  const [existing] = await db
    .select()
    .from(providers)
    .where(eq(providers.companyName, FIRST_PARTY_COMPANY))
    .limit(1);

  /*
    userId stays null: this provider is PAKAI TechHub itself, which has no
    person to sign in as. See the note on `providers.userId`.

    `status` is set explicitly. The column defaults to "pending", because a
    new row is normally an application awaiting review — but the first-party
    provider is approved by definition, and it lists eight approved products.
    Leaning on the default seeded it as pending on any fresh database: the
    migration's backfill only touches rows that already exist, and on an empty
    table there are none.
  */
  const provider =
    existing ??
    (
      await db
        .insert(providers)
        .values({
          companyName: FIRST_PARTY_COMPANY,
          userId: null,
          status: "approved",
        })
        .returning()
    )[0];

  console.log(`  provider ${provider.id} (${existing ? "reused" : "created"})`);

  for (const item of items) {
    const row = {
      providerId: provider.id,
      name: item.name,
      description: item.description,
      category: CATEGORY_LABELS.get(item.category) ?? item.category,
      priceAmount: parseAmount(item.price),
      priceCurrency: parseCurrency(item.price),
      /*
        These eight are PAKAI TechHub's own listings, so they are approved by
        definition — and approved is what puts them on /marketplace. Anything
        submitted through the provider form starts as "pending" and is listed
        only once an admin approves it.
      */
      status: "approved" as const,
      reviewedAt: new Date(),
    };

    const [already] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.name, item.name))
      .limit(1);

    if (already) {
      await db.update(products).set(row).where(eq(products.id, already.id));
      console.log(`  updated  ${item.name.padEnd(20)} ${item.price}`);
    } else {
      await db.insert(products).values(row);
      console.log(`  inserted ${item.name.padEnd(20)} ${item.price}`);
    }
  }

  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
