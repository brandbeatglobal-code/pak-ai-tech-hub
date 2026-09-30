import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ListingPage } from "@/components/listing-page";
import { siteCopy } from "@/content/site-copy";

export const metadata: Metadata = {
  title: siteCopy.providerListing.meta.title,
};

/**
 * The dashboard's way into the listing form — the same form as
 * /list-your-product, which for a signed-in buyer opens at step 2. Kept as
 * its own address because the dashboard panel and the decline email link
 * here.
 *
 * Signed out, there is no dashboard to be in: the listing form itself is the
 * way in, from step 1.
 */
export default async function ApplyPage() {
  const session = await auth();
  if (!session?.user) redirect("/list-your-product");
  return <ListingPage />;
}
