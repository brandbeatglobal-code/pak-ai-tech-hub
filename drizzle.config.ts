import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit reads DATABASE_URL from the environment. Load it from
 * .env.local before running any command:
 *
 *   npm run db:generate   # write a migration from schema changes
 *   npm run db:migrate    # apply pending migrations
 *   npm run db:seed       # insert the first-party provider and its products
 */
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
