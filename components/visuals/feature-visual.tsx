/**
 * Supporting visual for each tab in "What you get with PAKAI TechHub".
 *
 * Abstract and diagrammatic on purpose. These are NOT product screenshots and
 * must never become them: no interface exists yet, so a picture of one would
 * be a claim we cannot back. Each visual expresses the shape of the idea —
 * layered products, many tools billed as one, one core serving four
 * industries — using nothing but the brand gradient and neutral geometry.
 *
 * Decorative. Every tab panel states its own headline and body, so these are
 * hidden from assistive technology.
 */

/** Neutral outline used for every non-accent shape, so the set reads as one. */
const LINE = "var(--color-brand-navy)";

type Variant = "own-products" | "marketplace" | "industry-solutions";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--color-brand-blue)" />
        <stop offset="100%" stopColor="var(--color-brand-green)" />
      </linearGradient>
    </defs>
  );
}

/** Layered panels: products that ship ready to run, stacked and identical. */
function OwnProducts() {
  return (
    <>
      <Defs id="fv-own" />
      <rect
        x="64"
        y="34"
        width="200"
        height="130"
        rx="16"
        fill="#fff"
        stroke={LINE}
        strokeOpacity="0.1"
      />
      <rect
        x="52"
        y="52"
        width="216"
        height="138"
        rx="17"
        fill="#fff"
        stroke={LINE}
        strokeOpacity="0.14"
      />
      <rect
        x="40"
        y="70"
        width="232"
        height="134"
        rx="18"
        fill="#fff"
        stroke={LINE}
        strokeOpacity="0.18"
      />

      <rect x="60" y="92" width="94" height="11" rx="5.5" fill="url(#fv-own)" />
      {[120, 140, 160].map((y, index) => (
        <rect
          key={y}
          x="60"
          y={y}
          width={[192, 164, 132][index]}
          height="8"
          rx="4"
          fill={LINE}
          fillOpacity="0.1"
        />
      ))}
      <circle cx="66" cy="184" r="6" fill="url(#fv-own)" />
      <rect x="80" y="180" width="64" height="8" rx="4" fill={LINE} fillOpacity="0.1" />
    </>
  );
}

/** Many tools above, one bar below: one marketplace, one bill. */
function Marketplace() {
  const columns = [44, 132, 220];
  const rows = [30, 102];

  return (
    <>
      <Defs id="fv-market" />
      {rows.map((y, rowIndex) =>
        columns.map((x, columnIndex) => {
          const accented = (rowIndex + columnIndex) % 3 === 0;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="56"
              height="56"
              rx="15"
              fill={accented ? "url(#fv-market)" : "#fff"}
              fillOpacity={accented ? 0.9 : 1}
              stroke={LINE}
              strokeOpacity={accented ? 0 : 0.16}
            />
          );
        }),
      )}

      {columns.map((x) => (
        <path
          key={`link-${x}`}
          d={`M${x + 28} 158 L${x + 28} 186`}
          stroke={LINE}
          strokeOpacity="0.18"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      ))}

      <rect x="44" y="186" width="232" height="28" rx="14" fill="url(#fv-market)" />
    </>
  );
}

/** One core, four industries — the four that have a shipped product today. */
function IndustrySolutions() {
  const nodes = [
    { x: 34, y: 36 },
    { x: 242, y: 36 },
    { x: 34, y: 160 },
    { x: 242, y: 160 },
  ];

  return (
    <>
      <Defs id="fv-industry" />
      {nodes.map((node) => (
        <line
          key={`line-${node.x}-${node.y}`}
          x1={node.x + 22}
          y1={node.y + 22}
          x2="160"
          y2="120"
          stroke={LINE}
          strokeOpacity="0.16"
          strokeWidth="1.5"
        />
      ))}

      <circle
        cx="160"
        cy="120"
        r="76"
        fill="none"
        stroke={LINE}
        strokeOpacity="0.1"
        strokeDasharray="3 6"
      />

      {nodes.map((node) => (
        <g key={`node-${node.x}-${node.y}`}>
          <rect
            x={node.x}
            y={node.y}
            width="44"
            height="44"
            rx="13"
            fill="#fff"
            stroke={LINE}
            strokeOpacity="0.18"
          />
          {/* Keeps each node reading as a thing rather than an empty box. */}
          <rect
            x={node.x + 12}
            y={node.y + 16}
            width="20"
            height="4"
            rx="2"
            fill={LINE}
            fillOpacity="0.18"
          />
          <rect
            x={node.x + 12}
            y={node.y + 25}
            width="13"
            height="4"
            rx="2"
            fill={LINE}
            fillOpacity="0.12"
          />
        </g>
      ))}

      <rect x="126" y="86" width="68" height="68" rx="21" fill="url(#fv-industry)" />
    </>
  );
}

const VARIANTS: Record<Variant, () => React.JSX.Element> = {
  "own-products": OwnProducts,
  marketplace: Marketplace,
  "industry-solutions": IndustrySolutions,
};

/**
 * Renders nothing for a tab id with no artwork, rather than falling back to
 * some other tab's picture — a wrong visual is worse than none.
 */
export function FeatureVisual({
  variant,
  className,
}: {
  variant: string;
  className?: string;
}) {
  const Art = VARIANTS[variant as Variant];
  if (!Art) return null;

  return (
    <svg
      aria-hidden
      focusable="false"
      role="presentation"
      viewBox="0 0 320 240"
      className={className}
    >
      <Art />
    </svg>
  );
}

export default FeatureVisual;
