import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * /pricing was a real, published page. It is gone, but the URL was live in
   * production long enough to be bookmarked, linked to and indexed, so it
   * redirects rather than 404s.
   *
   * Server-side, via this config, not a client-side bounce: a redirect here is
   * sent as a real HTTP response, so a crawler follows it and transfers any
   * ranking the old URL had, and a visitor never renders a page only to be
   * thrown off it a moment later.
   *
   * `permanent: true` issues a 308. That is the honest status — the page is
   * not coming back — but note that browsers and crawlers cache a 308 hard.
   * If /pricing is ever reinstated, this entry has to go before the new page
   * will be reachable for anyone who has already been redirected.
   */
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/marketplace",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
