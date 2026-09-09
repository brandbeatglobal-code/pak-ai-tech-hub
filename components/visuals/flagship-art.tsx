/**
 * Abstract artwork for the flagship platform banner.
 *
 * Generated, not photographed — it extends the same blue/green language as
 * `HeroBackdrop` into a single hard-edged form that reads against the navy
 * band. Built from concentric rotated ellipses rather than a bitmap, so it
 * scales to any width, weighs nothing, and needs no network request.
 *
 * Purely decorative: the banner's meaning is entirely in its text, so this is
 * hidden from assistive technology.
 */

/** Ellipse count. Enough to read as a woven form without turning into moiré. */
const RINGS = 9;

export function FlagshipArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 520 420"
      className={className}
      role="presentation"
    >
      <defs>
        <linearGradient id="flagship-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-blue)" />
          <stop offset="100%" stopColor="var(--color-brand-green)" />
        </linearGradient>

        <radialGradient id="flagship-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-brand-blue)" stopOpacity="0.55" />
          <stop offset="55%" stopColor="var(--color-brand-green)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-brand-green)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="flagship-core" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="var(--color-brand-green)" stopOpacity="0.95" />
          <stop offset="60%" stopColor="var(--color-brand-blue)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-brand-blue)" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* Soft field behind the form, so it sits in light rather than on top of it. */}
      <ellipse cx="260" cy="210" rx="260" ry="210" fill="url(#flagship-glow)" />

      {Array.from({ length: RINGS }, (_, index) => {
        const t = index / (RINGS - 1);
        return (
          <ellipse
            key={index}
            cx="260"
            cy="210"
            rx={48 + t * 148}
            ry={158 - t * 26}
            transform={`rotate(${-32 + index * 13} 260 210)`}
            fill="none"
            stroke="url(#flagship-stroke)"
            strokeWidth={1.4}
            opacity={0.9 - t * 0.55}
          />
        );
      })}

      <circle cx="260" cy="210" r="62" fill="url(#flagship-core)" />
      <circle
        cx="260"
        cy="210"
        r="62"
        fill="none"
        stroke="url(#flagship-stroke)"
        strokeWidth="1.6"
        opacity="0.7"
      />
    </svg>
  );
}

export default FlagshipArt;
