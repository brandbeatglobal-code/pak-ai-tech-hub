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
 * This is the foundation only — accounts, provider records and product
 * listings with a review state. The product-submission form, the admin review
 * UI and the real provider dashboard are separate, later passes; nothing here
 * assumes their shape beyond the columns they will need.
 *
 * The marketing site does not read from this database. `/marketplace` and
 * `/pricing` still render from `content/site-copy.ts`.
 */

export const userRole = pgEnum("user_role", ["buyer", "provider", "admin"]);

export const productStatus = pgEnum("product_status", [
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
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  website: text("website"),
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
