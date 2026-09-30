import { siteCopy, type HomeTabId } from "@/content/site-copy";

/**
 * Which homepage view a `?tab=` value asks for.
 *
 * Shared by the page, which renders that view, and the nav, which marks the
 * matching tab `aria-current="page"` — so the two cannot disagree about which
 * view is on show. Anything unrecognised, missing or repeated falls back to
 * the default view rather than an empty page: `/?tab=nonsense` is the For
 * Businesses view, the same as `/`.
 */
export function resolveHomeTab(
  value: string | string[] | null | undefined,
): HomeTabId {
  const requested = Array.isArray(value) ? value[0] : value;
  const match = siteCopy.nav.homeTabs.find((tab) => tab.id === requested);
  return match ? match.id : "businesses";
}
