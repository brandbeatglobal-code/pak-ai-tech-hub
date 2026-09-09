import Image from "next/image";
import Link from "next/link";

import { siteCopy } from "@/content/site-copy";

export function SiteFooter() {
  const { brand, footer } = siteCopy;

  return (
    <footer className="mt-auto border-t border-black/5 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label={brand.name}>
              <Image
                src="/brand/logo.png"
                alt={brand.logoAlt}
                width={1138}
                height={264}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-brand-navy/65">{brand.tagline}</p>
          </div>

          {footer.columns.map((column) => (
            <div key={column.heading}>
              <h2 className="text-sm font-semibold text-brand-navy">{column.heading}</h2>
              <ul className="mt-4 space-y-3">
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
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-black/5 pt-8 sm:flex-row sm:justify-between">
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
