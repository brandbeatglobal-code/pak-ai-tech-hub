import { redirect } from "next/navigation";

import { auth } from "@/auth";

/**
 * Where "list your product" goes, decided when the link is followed.
 *
 * Every provider CTA on the site — `startListingCta` in the homepage's "How it
 * works" and provider band, the nav's "List your product" button, the contact
 * page card — points here rather than at a fixed page, because the right
 * destination depends on who clicks:
 *
 *   signed out -> /sign-up?role=provider. Sign-up creates a buyer account and,
 *                 because of the parameter, lands it on the application.
 *   buyer      -> /dashboard/apply. The application form, or its "under
 *                 review" / reapply state if they have applied before —
 *                 that page decides, so this handler does not duplicate it.
 *   provider   -> /dashboard/products/new.
 *   admin      -> /dashboard. Not an audience for this CTA; their own
 *                 dashboard is the least surprising place to land.
 *
 * WHY A ROUTE HANDLER AND NOT A STATE-AWARE LINK. It was first chosen so
 * that the marketing pages would not have to read the session and could stay
 * statically prerendered. That reason is gone — the root layout now reads the
 * session for the nav's signed-in state, so every page renders per request.
 * The handler stays because the rest of the case still holds: the routing
 * rules live in one place instead of in every CTA, it costs one redirect on
 * click, and it is never stale — the role is read from the database at the
 * moment of the click (see the `jwt` callback in auth.ts), not whenever the
 * page happened to render.
 *
 * `redirect()` in a route handler is a 307. Keep it temporary: the answer
 * changes per visitor and over time, and a permanent 308 would be cached by
 * the browser and replayed after the visitor's role had moved on.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) redirect("/sign-up?role=provider");

  switch (session.user.role) {
    case "buyer":
      redirect("/dashboard/apply");
    case "provider":
      redirect("/dashboard/products/new");
    default:
      redirect("/dashboard");
  }
}
