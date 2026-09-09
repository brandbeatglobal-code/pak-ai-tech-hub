import { Reveal } from "@/components/motion/reveal";
import { SectionGlow } from "@/components/motion/section-glow";
import { siteCopy } from "@/content/site-copy";

type PlaceholderPageProps = {
  title: string;
};

/**
 * Minimal shell for routes that exist only so the navigation does not 404.
 * Replace each caller with a real page as it is built.
 *
 * It carries the same heading weight, colour tokens, soft gradient backdrop
 * and reveal motion as the homepage, so a "Coming soon" route still reads as
 * part of the same site rather than an unstyled stub.
 */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <SectionGlow placement="right" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <Reveal>
          <h1 className="text-[2.75rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-brand-navy sm:text-display-lg">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-navy/70">
            {siteCopy.placeholders.comingSoon}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default PlaceholderPage;
