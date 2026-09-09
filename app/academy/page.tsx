import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/placeholder-page";
import { siteCopy } from "@/content/site-copy";

const copy = siteCopy.placeholders.pages.academy;

export const metadata: Metadata = {
  title: `${copy.title} — ${siteCopy.brand.name}`,
};

export default function AcademyPage() {
  return <PlaceholderPage title={copy.title} />;
}
