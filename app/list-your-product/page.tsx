import type { Metadata } from "next";

import { ListingPage } from "@/components/listing-page";
import { siteCopy } from "@/content/site-copy";

export const metadata: Metadata = {
  title: siteCopy.providerListing.meta.title,
};

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * The provider listing form — where every "List your product" and "Start
 * listing" button leads (through /start-listing), and where /sign-up's
 * Provider choice sends people. The page itself is components/listing-page.tsx,
 * shared with /dashboard/apply.
 */
export default async function ListYourProductPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <ListingPage type={first(params.type)} submitted={first(params.submitted) === "1"} />;
}
