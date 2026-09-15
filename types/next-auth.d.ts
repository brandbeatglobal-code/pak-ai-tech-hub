import type { DefaultSession } from "next-auth";

import type { UserRole } from "@/db/schema";

/**
 * Module augmentation so `session.user.role` and `token.role` are typed.
 *
 * NOTE the JWT target: `@auth/core/jwt`, not `next-auth/jwt`. The latter is a
 * pure re-export barrel (`export * from "@auth/core/jwt"`), and TypeScript
 * cannot augment an interface through a re-export — it has to be declared in
 * the module being augmented. Pointing at `next-auth/jwt` fails with
 * "Invalid module name in augmentation".
 */
declare module "next-auth" {
  interface Session {
    user: { id: string; role: UserRole } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
  }
}
