/**
 * Abstract business-district skyline.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THIS IS AN ILLUSTRATION, NOT A PHOTOGRAPH, AND NOT A REAL PLACE.
 *
 * The brief for this section asked for a licensed stock photo of a modern
 * business district (Unsplash or Pexels, both free for commercial use). Every
 * one of those hosts is blocked by this environment's egress policy, so no
 * photo could be downloaded. Rather than ship a photo from an unlicensed
 * source, or dress a generated image up as one, the slot holds generated
 * geometric art instead.
 *
 * To swap in the real photo later: save it to `public/images/`, replace this
 * component's usage in `app/page.tsx` with `next/image`, keep the wrapper's
 * aspect ratio so layout does not shift, and keep the caption generic — it
 * describes a subject, not a location PAKAI operates in or a customer it
 * serves.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Decorative: the caption beside it carries whatever meaning it has, so this
 * is hidden from assistive technology.
 */

/** [x, width, height-above-baseline] per building, back to front. */
const BACK = [
  [16, 66, 296],
  [96, 46, 358],
  [156, 78, 268],
  [248, 58, 330],
  [320, 88, 238],
  [422, 54, 312],
  [490, 74, 278],
  [578, 58, 350],
  [650, 84, 258],
  [748, 58, 300],
  [820, 78, 332],
  [912, 52, 276],
] as const;

const MID = [
  [-10, 88, 220],
  [92, 68, 262],
  [174, 98, 190],
  [286, 78, 242],
  [378, 58, 300],
  [450, 108, 208],
  [572, 74, 256],
  [660, 92, 186],
  [766, 68, 232],
  [848, 118, 266],
] as const;

const FRONT = [
  [28, 108, 152],
  [156, 88, 196],
  [262, 128, 118],
  [408, 98, 172],
  [522, 84, 138],
  [622, 118, 186],
  [758, 94, 128],
  [870, 102, 162],
] as const;

/** Buildings stand on this line; everything below it is ground haze. */
const BASE = 520;

export function SkylineArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 960 600"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      role="presentation"
    >
      <defs>
        <linearGradient id="skyline-sky" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#0a1433" />
          <stop offset="55%" stopColor="#0d2447" />
          <stop offset="100%" stopColor="#123a55" />
        </linearGradient>

        <radialGradient id="skyline-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-brand-green)" stopOpacity="0.85" />
          <stop offset="45%" stopColor="var(--color-brand-blue)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-brand-blue)" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="skyline-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050d22" />
          <stop offset="100%" stopColor="#0a1433" />
        </linearGradient>

        <linearGradient id="skyline-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-blue)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--color-brand-blue)" stopOpacity="0.3" />
        </linearGradient>

        {/* Lit windows, as a tile rather than a few hundred individual rects. */}
        <pattern
          id="skyline-windows"
          width="16"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="4"
            y="5"
            width="6"
            height="9"
            rx="1.5"
            fill="var(--color-brand-blue)"
            opacity="0.5"
          />
        </pattern>
      </defs>

      <rect width="960" height="600" fill="url(#skyline-sky)" />
      <circle cx="742" cy="176" r="188" fill="url(#skyline-sun)" />

      {BACK.map(([x, w, h]) => (
        <rect
          key={`b-${x}`}
          x={x}
          y={BASE - h}
          width={w}
          height={h}
          fill="#0a1433"
          opacity="0.55"
        />
      ))}

      {MID.map(([x, w, h]) => (
        <rect
          key={`m-${x}`}
          x={x}
          y={BASE - h}
          width={w}
          height={h}
          fill="#071026"
          opacity="0.8"
        />
      ))}

      {FRONT.map(([x, w, h]) => (
        <g key={`f-${x}`}>
          <rect x={x} y={BASE - h} width={w} height={h} fill="url(#skyline-front)" />
          <rect
            x={x}
            y={BASE - h}
            width={w}
            height={h}
            fill="url(#skyline-windows)"
          />
          {/* Top edge catches the light, which is what separates the layers. */}
          <rect
            x={x}
            y={BASE - h}
            width={w}
            height="2"
            fill="var(--color-brand-green)"
            opacity="0.35"
          />
        </g>
      ))}

      {/* Ground haze, so the buildings sit in atmosphere rather than on a line. */}
      <rect x="0" y="392" width="960" height="208" fill="url(#skyline-haze)" />
    </svg>
  );
}

export default SkylineArt;
