"use server";

import { eq, sql } from "drizzle-orm";

import { siteCopy } from "@/content/site-copy";
import { auth } from "@/auth";
import { db } from "@/db";
import { products, providers } from "@/db/schema";
import {
  attemptOf,
  isAllowedCategory,
  parsePrice,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  NAME_MAX,
  NAME_MIN,
  type ProductDraft,
  type ProductSubmissionState,
} from "@/lib/product-submission";

/**
 * Provider product submission.
 *
 * Writes one `products` row with status "pending" and returns a real result.
 * There is no admin review queue yet, so a pending row is where a submission
 * stops — the success copy says exactly that rather than implying someone is
 * about to look at it.
 *
 * AUTHORISATION IS RE-CHECKED HERE, not just on the page.
 *
 * `/dashboard/products/new` gates on the session role before it renders, but a
 * server action is a public endpoint: anything that can reach the app can post
 * to it directly, with any body it likes. The page gate stops the form being
 * shown; the check below is what stops a row being written. Both are needed —
 * see the warning at the top of
 * `node_modules/next/dist/docs/01-app/02-guides/forms.md`.
 *
 * Nothing here is cache-revalidated, and nothing needs to be. The site does
 * read this table now (lib/listings.ts), but only APPROVED rows, and this
 * action only ever writes a pending one. The listings change when an admin
 * approves — `approveProduct` in lib/review-actions.ts refreshes them then. If
 * this action ever writes a row that is listed straight away, it must call
 * `updateTag(LISTINGS_TAG)` the same way.
 *
 * Only `submitProduct` is exported. A `"use server"` module may export async
 * functions and nothing else, which is why the constants, types and helpers
 * live in `lib/product-submission.ts`.
 */

const copy = siteCopy.providerSubmit;

function field(data: FormData, name: string): string {
  return String(data.get(name) ?? "").trim();
}

export async function submitProduct(
  previous: ProductSubmissionState,
  formData: FormData,
): Promise<ProductSubmissionState> {
  const attempt = attemptOf(previous) + 1;

  const values: ProductDraft = {
    name: field(formData, "name"),
    description: field(formData, "description"),
    category: field(formData, "category"),
    price: field(formData, "price"),
  };

  const session = await auth();

  /*
    Role first, before a single field is looked at. A buyer or a signed-out
    caller posting straight at this action gets the same answer whatever they
    put in the body.
  */
  if (!session?.user || session.user.role !== "provider") {
    return { status: "error", attempt, message: copy.errors.notProvider, values };
  }

  const { validation } = copy;
  const errors: Record<string, string> = {};

  if (!values.name) errors.name = validation.nameRequired;
  else if (values.name.length < NAME_MIN || values.name.length > NAME_MAX) {
    errors.name = validation.nameLength;
  }

  if (!values.description) errors.description = validation.descriptionRequired;
  else if (
    values.description.length < DESCRIPTION_MIN ||
    values.description.length > DESCRIPTION_MAX
  ) {
    errors.description = validation.descriptionLength;
  }

  if (!isAllowedCategory(values.category)) errors.category = validation.category;

  const priceAmount = parsePrice(values.price);
  if (priceAmount === null) errors.price = validation.price;

  /*
    The `priceAmount === null` half is redundant at runtime — a null there has
    already put a message in `errors` — but it is what narrows the value to a
    string for the insert below, instead of asserting it non-null later.
  */
  if (Object.keys(errors).length > 0 || priceAmount === null) {
    return { status: "invalid", attempt, errors, values };
  }

  try {
    const [provider] = await db
      .select({ id: providers.id })
      .from(providers)
      .where(eq(providers.userId, session.user.id))
      .limit(1);

    /*
      A provider account gets its `providers` row during sign-up, so this is
      only reachable for a user promoted to "provider" directly in the
      database. Reported rather than papered over by inventing a provider row
      here: guessing a company name is exactly the kind of placeholder data
      this project does not ship.
    */
    if (!provider) {
      return {
        status: "error",
        attempt,
        message: copy.errors.noProviderRecord,
        values,
      };
    }

    /*
      Names are checked across the whole table, not just this provider's rows.

      `db/seed.ts` decides insert-vs-update by matching `products.name`
      globally, so a submission reusing a first-party product's name would
      later be overwritten by a re-seed. The column has no unique constraint —
      this check is the only thing in the way, and it is a read, so two
      submissions racing on the same name could still both get through. That is
      a constraint to add alongside the review queue, not a reason to skip the
      check now.
    */
    const [clash] = await db
      .select({ id: products.id })
      .from(products)
      .where(sql`lower(${products.name}) = lower(${values.name})`)
      .limit(1);

    if (clash) {
      return {
        status: "invalid",
        attempt,
        errors: { name: validation.nameTaken },
        values,
      };
    }

    const [row] = await db
      .insert(products)
      .values({
        providerId: provider.id,
        name: values.name,
        description: values.description,
        category: values.category,
        priceAmount,
        /*
          One hard-coded currency, matching every price the site shows. There
          is no currency selector and should not be one — see the note on
          `Product.price` in content/site-copy.ts.
        */
        priceCurrency: "USD",
        /*
          Explicit rather than leaning on the column default. A submission is
          pending by definition, and saying so here means a later change to
          that default cannot quietly start auto-approving provider listings.

          `reviewedAt` and `reviewedBy` stay null: nobody has reviewed it.
        */
        status: "pending",
      })
      .returning({ name: products.name });

    return { status: "success", name: row.name };
  } catch (cause) {
    /* The error only. No session, no row, nothing a provider typed. */
    console.error("[product-submit] Insert failed:", cause);
    return { status: "error", attempt, message: copy.errors.write, values };
  }
}
