import Image from "next/image";
import Link from "next/link";

import { siteCopy } from "@/content/site-copy";

/**
 * Top navigation. Shows the full horizontal lockup from `md` upwards and the
 * compact square brandmark on narrow screens, where the lockup would shrink
 * below a legible size.
 */
export function SiteNav() {
  const { brand, nav } = siteCopy;

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex shrink-0 items-center" aria-label={brand.name}>
          <Image
            src="/brand/logo.png"
            alt={brand.logoAlt}
            width={1138}
            height={264}
            priority
            className="hidden h-10 w-auto md:block"
          />
          <Image
            src="/brand/brandmark.png"
            alt={brand.brandmarkAlt}
            width={488}
            height={504}
            priority
            className="h-9 w-auto md:hidden"
          />
        </Link>

        <ul className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {nav.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center md:ml-0">
          <Link
            href={nav.cta.href}
            className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {nav.cta.label}
          </Link>
        </div>
      </nav>

      {/* Compact link row for narrow screens, so nothing is unreachable
          without JavaScript. */}
      <ul className="flex items-center gap-5 overflow-x-auto border-t border-black/5 px-4 py-2 md:hidden">
        {nav.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-brand-navy/70"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  );
}

export default SiteNav;
