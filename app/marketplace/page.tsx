import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/placeholder-page";
import { siteCopy } from "@/content/site-copy";

const copy = siteCopy.placeholders.pages.marketplace;

export const metadata: Metadata = {
  title: `${copy.title} — ${siteCopy.brand.name}`,
};

export default function MarketplacePage() {
  return <PlaceholderPage title={copy.title} />;
}
