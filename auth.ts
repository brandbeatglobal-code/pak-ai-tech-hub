import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/db";
import { users } from "@/db/schema";
import { equalizeTiming, verifyPassword } from "@/lib/passwords";

/**
 * Auth.js configuration.
 *
 * Credentials (email + password) only, with JWT sessions.
 *
 * ON THE DRIZZLE ADAPTER — read before adding one.
 *
 * The brief asked for `@auth/drizzle-adapter` alongside a JWT session
 * strategy. Those two do not combine: Auth.js only calls an adapter's session
 * methods under the `database` strategy, and the Credentials provider is not
 * supported with that strategy at all — it requires JWT. An adapter wired in
 * here would additionally need the `accounts`, `sessions` and
 * `verificationTokens` tables it expects, which is exactly the "separate
 * session table" the same brief said was not needed.
 *
 * So the adapter is deliberately absent and Drizzle is still the data layer:
 * `authorize()` below reads users through it. Add the adapter when a second,
 * OAuth provider arrives — that is the point at which it starts doing work.
 */

export const { handlers, auth, signIn, signOut } = NextAuth({
  /*
    Auth.js refuses to build callback URLs from the Host header unless the host
    is trusted, and without this every request fails with `UntrustedHost` as
    soon as NODE_ENV is production — including `next start` locally.

    Trusting it is correct here because nothing serves this app on an
    attacker-controlled host: Vercel terminates and validates the Host for the
    project's own domains. If it is ever put behind a proxy that forwards
    arbitrary Host headers, set AUTH_URL to the canonical origin instead.
  */
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        /*
          No such user. Still pay the bcrypt cost so the response time does not
          reveal whether the email has an account — see lib/passwords.ts.
        */
        if (!user) {
          await equalizeTiming(password);
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        /*
          Only these four fields leave this function. passwordHash stays here;
          whatever is returned is what lands in the JWT.
        */
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
  },
});
