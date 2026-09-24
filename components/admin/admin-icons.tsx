/**
 * Glyphs for the admin shell.
 *
 * Same construction as components/nav-icons.tsx — a 20×20 stroked outline in
 * `currentColor`, hidden from assistive tech — so the admin area and the
 * marketing nav read as one set. Every icon here sits next to a visible or
 * screen-reader text label; none carries meaning on its own.
 */

const PATHS = {
  queue: (
    <>
      <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h8" />
      <path d="m13.5 14.5 1.5 1.5 3-3" />
    </>
  ),
  providers: (
    <>
      <path d="M3 8.5 4.5 4h11L17 8.5" />
      <path d="M3 8.5c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2 0 1.1.9 2 2 2s2-.9 2-2" />
      <path d="M4.5 10.5v6h11v-6M8.5 16.5v-3.5h3v3.5" />
    </>
  ),
  products: (
    <>
      <path d="M10 2.5 17 6v8l-7 3.5L3 14V6Z" />
      <path d="m3 6 7 3.5L17 6M10 9.5v8" />
    </>
  ),
  buyers: (
    <>
      <circle cx="7.5" cy="7" r="2.75" />
      <path d="M2.5 16.5c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" />
      <path d="M13 4.6a2.75 2.75 0 0 1 0 4.8M14.5 12.3c1.8.5 3 1.9 3 4.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" />
    </>
  ),
  search: (
    <>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13 13 4 4" />
    </>
  ),
  bell: (
    <>
      <path d="M5 13.5V9a5 5 0 0 1 10 0v4.5l1.5 1.5h-13Z" />
      <path d="M8.5 17.5a1.5 1.5 0 0 0 3 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.5V10l2.5 1.5" />
    </>
  ),
  check: <path d="m4.5 10.5 3.5 3.5 7.5-8" />,
  cross: <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />,
  back: <path d="M16 10H4.5M9 5 4 10l5 5" />,
} as const;

export type AdminIconName = keyof typeof PATHS;

export function AdminIcon({
  name,
  className = "h-5 w-5",
}: {
  name: AdminIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
