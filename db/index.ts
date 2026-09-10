import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Drizzle client.
 *
 * postgres-js over the standard wire protocol, which works unchanged against
 * a local Postgres in development and against Neon in production — one driver,
 * one code path, no environment branching. If this ever needs to run on the
 * edge runtime, swap to `drizzle-orm/neon-http`; postgres-js needs TCP.
 *
 * CONNECTED LAZILY, ON PURPOSE.
 *
 * Reading DATABASE_URL at module scope would throw during `next build`, when
 * Next evaluates every page module to collect its config — so a deployment
 * with no database configured would fail the whole build, taking the marketing
 * site (which does not use this database at all) down with it.
 *
 * Behind this proxy, the variable is read on the first actual query. A missing
 * DATABASE_URL then breaks only the routes that need a database, loudly and
 * with a message that says what to do, while `/`, `/marketplace`, `/pricing`,
 * `/about`, `/academy` and `/contact` keep building and serving.
 */

const globalForDb = globalThis as unknown as {
  __pakaiSql?: ReturnType<typeof postgres>;
  __pakaiDb?: PostgresJsDatabase<typeof schema>;
};

function connect(): PostgresJsDatabase<typeof schema> {
  if (globalForDb.__pakaiDb) return globalForDb.__pakaiDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in, " +
        "or add the variable in the Vercel project settings.",
    );
  }

  const sql =
    globalForDb.__pakaiSql ??
    postgres(connectionString, {
      max: 5,
      // Neon terminates idle connections; keep the pool honest about that.
      idle_timeout: 20,
    });

  const database = drizzle(sql, { schema });

  /* Cached across dev-server hot reloads so edits do not open a new pool. */
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__pakaiSql = sql;
    globalForDb.__pakaiDb = database;
  }

  return database;
}

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, property) {
    const real = connect();
    const value = Reflect.get(real, property, real);
    /* Bind so drizzle's methods keep their own `this` rather than the proxy. */
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
