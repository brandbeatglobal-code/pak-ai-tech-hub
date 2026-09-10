import { eq } from "drizzle-orm";

import { siteCopy } from "@/content/site-copy";
import { db } from "./index";
import { products, providers } from "./schema";

/**
 * Seeds the first-party provider and its eight products.
 *
 * The product rows are read from `siteCopy.marketplace.products.items` — the
 * same array `/marketplace` and `/pricing` render — rather than retyped, so
 * the seed cannot disagree with what the site shows.
 *
 * This is seed data only. The marketing pages still render from the static
 * file; nothing reads these rows yet. The point is to prove the schema holds
 * real data.
 *
 * Idempotent: re-running updates the existing rows instead of duplicating
 * them, so it is safe to run against an already-seeded database.
 */

const FIRST_PARTY_COMPANY = siteCopy.brand.name;

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
  const items = siteCopy.marketplace.products.items;
  console.log(`Seeding ${FIRST_PARTY_COMPANY} with ${items.length} products…`);

  const [existing] = await db
    .select()
    .from(providers)
    .where(eq(providers.companyName, FIRST_PARTY_COMPANY))
    .limit(1);

  /*
    userId stays null: this provider is PAKAI TechHub itself, which has no
    person to sign in as. See the note on `providers.userId`.
  */
  const provider =
    existing ??
    (
      await db
        .insert(providers)
        .values({ companyName: FIRST_PARTY_COMPANY, userId: null })
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
        These eight are already live on the marketing site, so they are
        approved by definition. Anything submitted through the (not yet built)
        provider form will default to "pending" instead.
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
