import bcrypt from "bcryptjs";

/**
 * The only two functions in the codebase that touch a raw password.
 *
 * RULES, which the rest of the app depends on:
 *  - A plaintext password is never written to the database, never logged,
 *    never returned from a server action, and never put in a cookie or a JWT.
 *  - It exists only as a local variable inside these functions and inside the
 *    server action that receives the form submission.
 *  - Every stored value is a bcrypt hash produced by `hashPassword`.
 */

/**
 * Cost factor. 12 is the current sensible default: ~250ms per hash on typical
 * server hardware, slow enough to make offline cracking expensive without
 * making sign-in feel broken. Raise it as hardware gets faster.
 */
const COST = 12;

/** Minimum length enforced at both the form and the server action. */
export const MIN_PASSWORD_LENGTH = 8;

export function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, COST);
}

export function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * A real bcrypt hash of a value nobody knows, compared against when no user
 * matches the submitted email.
 *
 * Without this, a request for an unknown email returns as soon as the lookup
 * misses, while a known email pays for a bcrypt comparison — a timing gap that
 * tells an attacker which emails have accounts. Burning the same work on both
 * paths closes it.
 */
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7Ky8p6JZbY8Z1oJ2sJ1xW0kQ3TnLQbC";

export async function equalizeTiming(plaintext: string): Promise<void> {
  await bcrypt.compare(plaintext, DUMMY_HASH);
}
