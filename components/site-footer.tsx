import Image from "next/image";
import Link from "next/link";

import { SocialIcon } from "@/components/social-icons";
import { siteCopy } from "@/content/site-copy";

export function SiteFooter() {
  const { brand, footer } = siteCopy;
  const { connect } = footer;

  return (
    <footer className="mt-auto border-t border-black/5 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label={brand.name}>
              <Image
                src="/brand/logo.png"
                alt={brand.logoAlt}
                width={1138}
                height={264}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-navy/65">
              {brand.tagline}
            </p>
          </div>

          {footer.columns.map((column) => (
            <div key={column.heading}>
              <h2 className="text-sm font-bold tracking-wide text-brand-navy uppercase">
                {column.heading}
              </h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-navy/70 transition-colors hover:text-brand-navy"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/*
            NEEDS REAL PROFILE URLS — do not invent them.

            Every href here is "#" until the accounts are confirmed. See the
            note on `footer.connect` in content/site-copy.ts.
          */}
          <div>
            <h2 className="text-sm font-bold tracking-wide text-brand-navy uppercase">
              {connect.heading}
            </h2>
            <p className="mt-5 text-sm text-brand-navy/70">{connect.handle}</p>
            <ul className="mt-4 flex items-center gap-3">
              {connect.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    aria-label={link.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/5 text-brand-navy/65 transition-colors hover:border-brand-navy/25 hover:text-brand-navy"
                  >
                    <SocialIcon icon={link.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 border-t border-black/5 pt-8 sm:flex-row sm:justify-between">
          <Image
            src="/brand/brandmark.png"
            alt={brand.brandmarkAlt}
            width={488}
            height={504}
            className="h-8 w-auto"
          />
          <p className="text-sm text-brand-navy/65">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
