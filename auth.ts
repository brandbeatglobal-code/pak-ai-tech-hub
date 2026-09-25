import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { db, getDb } from "@/db";
import { accounts, users } from "@/db/schema";
import { equalizeTiming, verifyPassword } from "@/lib/passwords";

/**
 * Auth.js configuration.
 *
 * Two ways in, both on JWT sessions:
 *   - email + password (the Credentials provider), and
 *   - Google, when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are both set.
 *
 * THE DRIZZLE ADAPTER. It was left out while email + password was the only
 * way in: Auth.js only calls an adapter's session methods under the
 * `database` strategy, and the Credentials provider requires JWT, so it would
 * have done nothing. With Google it does real work — finding the user a
 * Google account belongs to, creating one on a first sign-in, recording the
 * link in `accounts`. Sessions stay JWT (Credentials still requires it), so
 * there is no `sessions` or `verificationTokens` table and the adapter's
 * session methods are never called.
 *
 * It is wrapped rather than used as it comes: see `adapter` below, where the
 * methods this app has rules about are replaced.
 */

/**
 * Google sign-in is on only when both variables are set.
 *
 * Without them the provider is not registered and neither /login nor
 * /sign-up shows the button — no button is better than one that can only
 * fail. Set both in the Vercel project and redeploy to turn it on. The
 * redirect URI to register with Google is `{origin}/api/auth/callback/google`.
 */
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const googleSignInEnabled = Boolean(googleClientId && googleClientSecret);

/**
 * The `?error=` code the `signIn` callback below sends to /login when Google
 * has not verified the email. Auth.js's own codes (OAuthAccountNotLinked and
 * the rest) come from Auth.js; this one is ours, so both ends read it here.
 */
export const GOOGLE_EMAIL_UNVERIFIED = "GoogleEmailUnverified";

/**
 * The Drizzle adapter, built on first use.
 *
 * Not at module scope: it has to be handed the real client (`getDb`, see
 * db/index.ts), and connecting on import would make every page — the root
 * layout imports this file — need DATABASE_URL just to build.
 */
let drizzleAdapter: Adapter | undefined;
function drizzle(): Adapter {
  drizzleAdapter ??= DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
  });
  return drizzleAdapter;
}

/**
 * Only what Auth.js needs to know about a user.
 *
 * The adapter's reads return the whole row, `passwordHash` included, and
 * Auth.js passes that object on to the callbacks. Nothing there copies the
 * hash today, but the safe number of places it can travel is zero.
 */
function toAdapterUser(row: AdapterUser | null | undefined): AdapterUser | null {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    image: row.image,
    role: row.role,
  };
}

/**
 * Emails are stored lowercased (see `signUp` in lib/auth-actions.ts), so they
 * are looked up and written lowercased too. Without this a Google address in
 * a different case would miss an existing account and create a second one.
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/*
  ACCOUNT LINKING — decided, not defaulted into. Read before changing.

  A Google sign-in whose email already belongs to an account here is REFUSED.
  The accounts are not linked; the person lands on /login with a message
  telling them to log in with their email and password
  (`googleSignIn.errors.accountExists` in content/site-copy.ts).

  That is Auth.js's own default — it throws OAuthAccountNotLinked unless a
  provider sets `allowDangerousEmailAccountLinking` — and it is kept on
  purpose. Password sign-up here never checks that the person owns the
  address they typed. Linking by email would let someone sign up with a
  victim's address and a password of their choosing, then wait: the first
  time the victim used "Continue with Google" they would be signed straight
  into that account, which the other person can still log into. Refusing
  costs the real owner a step; linking could cost them the account.

  Auth.js has a second way to link, also turned off here. When a Google
  sign-in finishes while someone is ALREADY signed in, it attaches that
  Google account to the signed-in user — whatever email the Google account
  has. Nothing on the site offers that as a feature, and on a shared
  computer it would let the next person attach their Google account to
  someone else's session and keep getting in after that person logs out.
  `getUser` below is how Auth.js finds out who is signed in during a sign-in,
  and it is its only caller under JWT sessions; returning null makes every
  Google sign-in behave as if nobody were. If linking is wanted later, it
  belongs on a signed-in settings page, as a deliberate action.
*/
const adapter: Adapter = {
  async getUser() {
    return null;
  },

  async getUserByEmail(email) {
    return toAdapterUser(await drizzle().getUserByEmail!(normalizeEmail(email)));
  },

  async getUserByAccount(providerAccount) {
    return toAdapterUser(await drizzle().getUserByAccount!(providerAccount));
  },

  /*
    A GOOGLE SIGN-UP CREATES A BUYER AND NOTHING MORE — the same rule as
    `signUp` in lib/auth-actions.ts.

    The adapter's own `createUser` inserts whatever profile object Auth.js
    hands it, and `role` is a column on this table. This one writes an
    explicit list and sets the role itself, so no claim in a Google profile —
    or in a later provider's — can choose it. No `providers` row either:
    being a provider is what an approved application makes you, and nothing
    else does.

    `name` falls back to the email because the column is NOT NULL and Google
    does not always send a name. `emailVerified` and `image` are left NULL
    (see the note on them in db/schema.ts).
  */
  async createUser(profile) {
    const email = normalizeEmail(profile.email);
    const [row] = await db
      .insert(users)
      .values({ name: profile.name?.trim() || email, email, role: "buyer" })
      .returning();
    return toAdapterUser(row)!;
  },

  /*
    Records which Google account signs in as which user — and only that.
    Auth.js passes Google's tokens along too; they are not stored, because
    nothing here calls a Google API. A token that is never written cannot
    leak from this database.
  */
  async linkAccount(account) {
    await db.insert(accounts).values({
      userId: account.userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    });
  },

  /*
    No other method is called. Under JWT sessions, with no email or passkey
    provider, Auth.js uses exactly the five above — read from its
    sign-in handler (@auth/core, lib/actions/callback/handle-login.js), not
    assumed.
  */
};

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
  /* Explicit: with an adapter configured, Auth.js would default to "database". */
  session: { strategy: "jwt" },
  adapter,
  /*
    Every sign-in problem comes back to /login, which says what happened
    (`googleSignIn.errors` in content/site-copy.ts) — including the ones
    Auth.js would otherwise show on its own unstyled error page.
  */
  pages: { signIn: "/login", error: "/login" },
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
          No such user — or one with no password, created by signing in with
          Google. Either way, still pay the bcrypt cost so the response time
          does not reveal whether the email has an account (see
          lib/passwords.ts), and give the same answer as a wrong password.
        */
        if (!user?.passwordHash) {
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
    ...(googleSignInEnabled
      ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
      : []),
  ],
  callbacks: {
    /*
      Google must vouch for the address.

      Whoever signs in with Google first gets an account under that email,
      and an email with an account here cannot be signed up again. So an
      address Google has NOT verified could be used to take someone else's
      email before they arrive. Google states it in the ID token's
      `email_verified`; anything but `true` is refused, with its own message.
    */
    signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email_verified !== true) {
        return `/login?error=${GOOGLE_EMAIL_UNVERIFIED}`;
      }
      return true;
    },
    async jwt({ token, user }) {
      /*
        Signing in: `authorize()` (email + password) or the adapter (Google)
        has just read or written the row, so trust it.
      */
      if (user) {
        token.role = user.role;
        token.sub = user.id;
        return token;
      }

      /*
        EVERY LATER CALL RE-READS THE ROLE FROM THE DATABASE.

        The role used to be written into the JWT once, at sign-in, and trusted
        until the cookie expired. That stopped being safe when roles started
        changing after sign-in: approving a provider application flips
        `users.role` from "buyer" to "provider" while that person is signed
        in. With the old behaviour they would stay a buyer — refused by
        /dashboard/products/new and by `submitProduct` — until they happened
        to log out and back in. The same staleness would let a demoted
        account keep its old role for the life of the cookie.

        So `session.user.role` is the database's answer on every `auth()`
        call. The cost is one primary-key lookup per call. The root layout
        calls `auth()` on every page for the nav, but Auth.js returns before
        this callback when there is no session cookie, so only signed-in
        requests pay it.

        Returning null gives back no session, so the visitor is treated as
        signed out. That is what happens if the user row is gone, and a token
        with no subject was never valid. If the lookup itself throws, Auth.js
        logs a JWTSessionError and likewise returns no session: a database
        outage sends people to /login rather than letting them keep a role
        nobody can confirm. Both were observed, not assumed — deleting a
        signed-in user's row, and stopping Postgres under a signed-in session,
        each landed on /login.
      */
      if (!token.sub) return null;

      const [current] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, token.sub))
        .limit(1);

      if (!current) return null;

      token.role = current.role;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
  },
});
