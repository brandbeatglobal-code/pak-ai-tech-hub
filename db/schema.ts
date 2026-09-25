import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Database schema for the marketplace platform.
 *
 * User accounts (plus `accounts`, their Google sign-ins), provider records and
 * product listings, each of the last two with a review state. Two things write
 * a pending row: the product-submission form (`lib/product-actions.ts`) and
 * the provider application (`lib/application-actions.ts`). One thing moves a
 * row out of "pending": the admin review queue at /dashboard/admin
 * (`lib/review-actions.ts`).
 *
 * The marketing site reads approved products from here through one cached
 * read, `getListings()` in lib/listings.ts.
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
   *
   * NULL for an account created by signing in with Google: it has no password,
   * and `authorize()` in auth.ts refuses a password login for it. Nothing sets
   * one later yet — there is no set- or reset-password flow.
   */
  passwordHash: text("password_hash"),
  role: userRole("role").notNull().default("buyer"),
  name: text("name").notNull(),
  /** Optional: B2B buyers may give a company, individuals may not. */
  companyName: text("company_name"),
  /*
    `emailVerified` and `image` are here because the Auth.js Drizzle adapter's
    users-table contract requires them, not because anything uses them. Both
    stay NULL: the adapter's `createUser` is replaced in auth.ts with one that
    writes neither. Password sign-ups do not verify the address either, which
    is why a Google sign-in is never linked to an existing account by email —
    see the note on account linking in auth.ts.
  */
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Sign-in accounts from outside providers — today, Google only. One row says
 * "this Google account signs in as this user".
 *
 * The shape is the Auth.js Drizzle adapter's accounts table (its JavaScript
 * property names, `refresh_token` and the rest, are what the adapter reads and
 * writes). The token columns are part of that contract but are never filled:
 * `linkAccount` in auth.ts stores who the account is, not Google's tokens,
 * because nothing here calls a Google API. They stay NULL.
 *
 * Password accounts have no row here; they live entirely in `users`.
 */
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    /** "google". */
    provider: text("provider").notNull(),
    /** Google's stable id for the person (the ID token's `sub`) — not the email. */
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    /** When the Google account was first used to sign in. */
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  /**
   * Nullable on purpose.
   *
   * PAKAI TechHub is itself a provider — it lists its own eight products — but
   * it has no person to sign in as. A null `user_id` means a first-party
   * provider rather than a signed-up one, which is cleaner than inventing a
   * placeholder user row that could then be logged into.
   *
   * It also decides the "Example" badge: a null here makes every product of
   * this provider an example listing on the site (`Listing.example`, set in
   * lib/listings.ts). Linking a user to the house provider would silently
   * turn its eight placeholder-priced products into real-looking listings.
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
   * Approving is TWO writes, made in one transaction by `approveProvider` in
   * lib/review-actions.ts: this column to "approved", and `users.role` to
   * "provider". The session reads the role, not this column — see the `jwt`
   * callback in auth.ts — so setting only this one grants nothing. Anything
   * else that ever approves a provider must do both, together.
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
  /**
   * When the row was created. Fixed for life — a resubmission updates the same
   * row, so this is the FIRST application, not the current one. Sort the
   * review queue by `submittedAt`, never by this.
   */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  /**
   * When the current application was sent: set on the first application and
   * again on every resubmission (`submitApplication`). This is what the queue
   * sorts by, so a declined applicant who resubmits joins the back of the
   * queue rather than keeping the place of their first attempt.
   *
   * Rows that existed before this column were backfilled from `createdAt` by
   * the migration that added it — the best available answer, since a
   * resubmission time was never recorded.
   */
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  /**
   * When an admin last decided this application. Set only by an approve or a
   * decline in the review queue — never by the application form, and never
   * by the migration backfill, so a legacy provider row reads null here: it
   * was never reviewed, it predates review.
   *
   * A resubmission does not clear it. The row goes back to "pending" with the
   * previous decision's time still here; "pending" is what says it is waiting,
   * and nothing counts a pending row as reviewed.
   */
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  /**
   * Why the most recent decision was a decline, in the admin's words. Set on
   * decline; cleared on approve, so a value here always belongs to the latest
   * decision.
   *
   * A resubmission leaves it in place on purpose: the admin reviewing the new
   * attempt sees why the last one was declined. The applicant is told the
   * reason by email; /dashboard/apply does not show it — piece 1's resubmit
   * flow is unchanged.
   */
  rejectionReason: text("rejection_reason"),
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
  /**
   * When the decision was made. Written by the review queue on approve and on
   * decline — and ALSO by db/seed.ts, which marks the eight first-party
   * products approved at seed time. So "has a `reviewedAt`" does not mean an
   * admin reviewed it; `reviewedBy` is what says that.
   */
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  /**
   * The admin who made the decision. Null until a product is reviewed — and
   * null for the seeded first-party products, which no admin reviewed. The
   * queue's "recently reviewed" list and its Approved / Declined counts only
   * include rows where this is set, so re-running the seed does not show up
   * as eight approvals this week.
   */
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  /**
   * UNUSED, and overlapping `rejectionReason` below. It predates the review
   * queue and nothing has ever written it. Kept rather than dropped in the
   * same migration that added its replacement, so that migration stays
   * additive; drop it in a cleanup pass once that is confirmed on every
   * database.
   */
  reviewNotes: text("review_notes"),
  /**
   * Why an admin declined this product. Set on decline, cleared on approve —
   * the same rule as `providers.rejectionReason`, and the same name, so the
   * review queue handles both tables one way. Emailed to the provider.
   */
  rejectionReason: text("rejection_reason"),
});

export const usersRelations = relations(users, ({ many }) => ({
  providers: many(providers),
  reviewedProducts: many(products),
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
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
