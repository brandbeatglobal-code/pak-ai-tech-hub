import { siteCopy } from "@/content/site-copy";

type PlaceholderPageProps = {
  title: string;
};

/**
 * Minimal shell for routes that exist only so the navigation does not 404.
 * Replace each caller with a real page as it is built.
 */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-lg text-brand-navy/70">
        {siteCopy.placeholders.comingSoon}
      </p>
    </section>
  );
}

export default PlaceholderPage;
