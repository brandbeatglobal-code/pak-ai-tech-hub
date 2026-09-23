import { relations } from "drizzle-orm";
import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Database schema for the marketplace platform.
 *
 * Accounts, provider records and product listings, each of the last two with a
 * review state. Two writers exist: the product-submission form
 * (`lib/product-actions.ts`) and the provider application
 * (`lib/application-actions.ts`). The admin review UI that would move either
 * one out of "pending" is a separate, later pass — until then a review
 * decision is made directly in the database.
 *
 * The marketing site does not read from this database. `/marketplace` still
 * renders from `content/site-copy.ts`.
 */

export const userRole = pgEnum("user_role", ["buyer", "provider", "admin"]);

export const productStatus = pgEnum("product_status", [
  "pending",
  "approved",
  "rejected",
]);

/**
 * Same three values as `product_status`, but its own type.
 *
 * A provider application and a product listing are reviewed separately and
 * could grow apart — an application might one day need "withdrawn", a listing
 * "delisted". Sharing one enum would couple the two, and a column typed
 * `product_status` on the `providers` table would mislead anyone reading it.
 */
export const providerStatus = pgEnum("provider_status", [
  "pending",
  "approved",
  "rejected",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  /**
   * bcrypt hash — NEVER a plaintext password, and never logged.
   *
   * Written only by `hashPassword()` in lib/passwords.ts and read only by
   * `verifyPassword()`. Nothing else in the codebase should touch this column,
   * and no query that returns it should reach a client component.
   */
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("buyer"),
  name: text("name").notNull(),
  /** Optional: B2B buyers may give a company, individuals may not. */
  companyName: text("company_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  /**
   * Nullable on purpose.
   *
   * PAKAI TechHub is itself a provider — it lists its own eight products — but
   * it has no person to sign in as. A null `user_id` means a first-party
   * provider rather than a signed-up one, which is cleaner than inventing a
   * placeholder user row that could then be logged into.
   */
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    /*
      One provider record per person, enforced by the database.

      The application flow resubmits a rejected application by updating the
      applicant's existing row, and it does that with an upsert keyed on this
      column. Without the constraint the upsert has nothing to conflict on,
      and two submissions racing each other would leave two rows. Postgres
      treats NULLs as distinct here, so the first-party provider's null is
      unaffected.
    */
    .unique(),
  /** The business name. Shown to reviewers and, once approved, to buyers. */
  companyName: text("company_name").notNull(),
  website: text("website"),
  /**
   * Where this provider is in review.
   *
   * New rows default to "pending": an application has to be approved before
   * the person is a provider. Rows that existed before this column did — the
   * first-party provider and anyone who signed up as a provider under the old
   * flow — were backfilled to "approved" by the migration that added it,
   * because they were already providers and nobody had reviewed anything.
   *
   * Approving is TWO writes, and the review UI must make them in one
   * transaction: this column to "approved", and `users.role` to "provider".
   * The session reads the role, not this column — see the `jwt` callback in
   * auth.ts — so setting only this one grants nothing.
   */
  status: providerStatus("status").notNull().default("pending"),
  /*
    The three application answers.

    Nullable in the database, required by the application form. Rows that
    predate the application flow have no answers to give, and inventing some
    for them would be placeholder data. `lib/application-actions.ts` is the
    one place that decides these are mandatory.

    `category` follows `products.category` exactly: plain text, with the
    allowed values enforced in code against `CATEGORY_LABELS` rather than by a
    Postgres enum. Both columns hold the same vocabulary — the labels the
    marketplace filter shows.
  */
  description: text("description"),
  category: text("category"),
  reasonForListing: text("reason_for_listing"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  /**
   * Stored as an exact decimal, never a float — this is money.
   *
   * NOTE: there is no billing-period column. The marketing site quotes these
   * as "$55/mo", but the agreed schema has only an amount and a currency, so
   * "per month" is not represented here. Add a period column before anything
   * bills off this table.
   */
  priceAmount: numeric("price_amount", { precision: 12, scale: 2 }).notNull(),
  priceCurrency: text("price_currency").notNull().default("USD"),
  status: productStatus("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  /** The admin who made the decision. Null until a product is reviewed. */
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewNotes: text("review_notes"),
});

export const usersRelations = relations(users, ({ many }) => ({
  providers: many(providers),
  reviewedProducts: many(products),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
  user: one(users, { fields: [providers.userId], references: [users.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  provider: one(providers, {
    fields: [products.providerId],
    references: [providers.id],
  }),
  reviewer: one(users, {
    fields: [products.reviewedBy],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Provider = typeof providers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
export type ProviderStatus = (typeof providerStatus.enumValues)[number];
