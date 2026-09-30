"use client";

import { useEffect } from "react";

/**
 * Sets `document.title` from inside a page — for the homepage's views.
 *
 * WHY THIS EXISTS. Each homepage view has its own title (`generateMetadata`
 * in app/page.tsx), and a full page load gets it. But switching views is a
 * client-side navigation that changes only `?tab=`, and on those Next.js
 * (16.3.4, checked 2026-09-30) leaves the old `<title>` in place — with or
 * without prefetching. The route announcer reads `document.title` to tell a
 * screen-reader user where they have landed, so it announced the previous
 * view's name, or nothing.
 *
 * This effect runs in the page, before the announcer's own effect in the
 * app router, so the announcer reads the new title. If a later Next.js
 * updates the head on search-param navigations itself, this becomes a no-op
 * (it sets the same string) and can be removed.
 */
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}

export default DocumentTitle;
