import type { ReactNode, SVGProps } from "react";

/**
 * Lijn-SVG-iconenset voor de 6 bouwstenen van de Kwaliteitsmonitor.
 *
 * Vector-natekeningen van de originele PNG-afbeeldingen: één doorlopende
 * lijnkleur, theme-aware via CSS-variabelen (zie globals.css, `.bs-icon`):
 *   --icon-ink = de lijnkleur (kleurt mee met light/dark)
 *   --icon-bg  = de achtergrond achter het icoon, gebruikt voor occlusie
 *                (vormen die elkaar overlappen) — wordt op `.bs-tile` gezet.
 *
 * Eén plek herkleuren? Pas `--icon-ink` aan en de hele set volgt.
 */

export type BouwsteenCode = "b1" | "b2" | "b3" | "b4" | "b5" | "b6";

const ICONS: Record<BouwsteenCode, { label: string; paths: ReactNode }> = {
  // 1 · Beheersingsgericht leren — procesnetwerk (tandwiel, vinkje, persoon, pijl, klembord)
  b1: {
    label: "Beheersingsgericht leren",
    paths: (
      <>
        <path d="M30 28 L38 41 M58 41 L63 30 M71 34 V47 M59 51 L62 55 M37 64 L41 57" />
        <circle className="occlude" cx="23" cy="24" r="6" />
        <circle cx="23" cy="24" r="2.4" />
        <path d="M29 24 H32 M23 18 V15 M17 24 H14 M23 30 V33 M27.2 19.8 L29.3 17.7 M18.8 19.8 L16.7 17.7 M18.8 28.2 L16.7 30.3 M27.2 28.2 L29.3 30.3" />
        <circle className="occlude" cx="71" cy="24" r="10.5" />
        <path d="M65.8 24.5 l3.4 3.4 l6.2 -7.4" />
        <circle className="occlude" cx="47" cy="47" r="12" />
        <circle cx="47" cy="43.5" r="3.4" />
        <path d="M41.5 52.5 a5.5 5.5 0 0 1 11 0" />
        <circle className="occlude" cx="71" cy="58" r="10.5" />
        <path d="M66.5 58 H75.5 M71.5 54 l4 4 l-4 4" />
        <rect className="occlude" x="18" y="62" width="18" height="21" rx="2.5" />
        <rect className="occlude" x="23.5" y="59.5" width="7" height="4" rx="1.2" />
        <path d="M22 70 H32 M22 75 H29" />
        <path className="occlude" d="M37 65 l3 3 l-9 9 l-3 -3 z" />
        <path className="occlude" d="M28 77 l-3 5.5 l5.5 -2.5 z" />
      </>
    ),
  },
  // 2 · Doelgericht leren — staafdiagram met klimmende persoon, pijl en ster
  b2: {
    label: "Doelgericht leren",
    paths: (
      <>
        <line x1="15" y1="79" x2="82" y2="79" />
        <rect x="45" y="56" width="10" height="23" />
        <rect x="58" y="44" width="10" height="35" />
        <rect x="71" y="32" width="10" height="47" />
        <path d="M76 15 L77.5 19 L81.7 19.2 L78.4 21.8 L79.5 25.9 L76 23.5 L72.5 25.9 L73.6 21.8 L70.3 19.2 L74.5 19 Z" />
        <circle cx="27" cy="49" r="4" />
        <path d="M27 53 V62 M27 55 l7 -5 M27 62 l-3 7 M27 62 l3 7" />
        <path d="M35 50 L42 43 M42 43 l-4.2 0.4 M42 43 l-0.4 4.2" />
      </>
    ),
  },
  // 3 · Zelfregulerend leren — afgestudeerde + brein binnen een gestippelde kringloop
  b3: {
    label: "Zelfregulerend leren",
    paths: (
      <>
        <circle cx="49" cy="47" r="31" strokeDasharray="0.5 6" />
        <path d="M49 16 l-5 -2.5 M49 16 l-2.5 5" />
        <path className="occlude" d="M27 40 l11 -4 l11 4 l-11 4 z" />
        <path d="M49 40 V46" />
        <circle className="occlude" cx="38" cy="48" r="5" />
        <path className="occlude" d="M28 65 a10 10 0 0 1 20 0" />
        <path d="M64 24 c-4 -2 -8 0 -8 4 c-3 0 -4 4 -1 6 c-1 3 2 5 5 4 c1 2 4 2 5 0" />
        <path d="M64 24 c4 -2 8 0 8 4 c3 0 4 4 1 6 c1 3 -2 5 -5 4 c-1 2 -4 2 -5 0" />
        <path d="M64 24 V38" />
        <path d="M59 30 q3 1 1 4 M69 30 q-3 1 -1 4" />
      </>
    ),
  },
  // 4 · Effectieve feedback — spraakbubbel (duim/hart/ster) + twee personen die uitwisselen
  b4: {
    label: "Effectieve feedback",
    paths: (
      <>
        <ellipse cx="48" cy="28" rx="27" ry="15" />
        <path className="occlude" d="M40 40 l-2 8 l10 -5 z" />
        <path d="M33 31 V27 h3.5 V31 z" />
        <path d="M36.5 31 h6.5 q2 0 2.3 -2 l0.6 -3.5 q0.3 -2 -1.8 -2 h-4 l0.8 -3.2 q0.4 -2 -1.4 -2.4 q-1 -0.2 -1.4 0.8 l-1.6 4 l-0.6 0.6 z" />
        <path d="M59 28 c-2 -3 -6.5 -1.5 -6.5 1.5 c0 3.2 4 5.2 6.5 7.2 c2.5 -2 6.5 -4 6.5 -7.2 c0 -3 -4.5 -4.5 -6.5 -1.5 z" />
        <path d="M49 31 L49.9 33.4 L52.5 33.5 L50.4 35.1 L51.2 37.6 L49 36.1 L46.8 37.6 L47.6 35.1 L45.5 33.5 L48.1 33.4 Z" />
        <circle cx="27" cy="66" r="4" />
        <path d="M20 84 v-3 a7 7 0 0 1 14 0 v3" />
        <circle cx="69" cy="66" r="4" />
        <path d="M62 84 v-3 a7 7 0 0 1 14 0 v3" />
        <path d="M41 65 H55 M52 62 l3 3 l-3 3" />
        <path d="M55 72 H41 M44 69 l-3 3 l3 3" />
      </>
    ),
  },
  // 5 · Positief leerklimaat — spreker met +/- bubbels boven een publiek
  b5: {
    label: "Bevorderen van een positief leerklimaat",
    paths: (
      <>
        <rect x="15" y="20" width="22" height="15" rx="6" />
        <path className="occlude" d="M26 35 l1 5 l5 -5 z" />
        <path d="M22 27.5 h8 M26 23.5 v8" />
        <rect x="59" y="20" width="22" height="15" rx="6" />
        <path className="occlude" d="M70 35 l-1 5 l-5 -5 z" />
        <path d="M66 27.5 h8" />
        <circle cx="48" cy="46" r="5" />
        <path className="occlude" d="M39 68 v-3 a9 9 0 0 1 18 0 v3 z" />
        <path className="occlude" d="M36 68 h24 l-2 8 h-20 z" />
        <circle className="occlude" cx="24" cy="74" r="3.4" />
        <path className="occlude" d="M18 88 v-3 a6 6 0 0 1 12 0 v3" />
        <circle className="occlude" cx="72" cy="74" r="3.4" />
        <path className="occlude" d="M66 88 v-3 a6 6 0 0 1 12 0 v3" />
        <circle className="occlude" cx="38" cy="77" r="3.4" />
        <path className="occlude" d="M32 90 v-3 a6 6 0 0 1 12 0 v3" />
        <circle className="occlude" cx="58" cy="77" r="3.4" />
        <path className="occlude" d="M52 90 v-3 a6 6 0 0 1 12 0 v3" />
      </>
    ),
  },
  // 6 · Flexibel differentiëren — diverse groep mensen
  b6: {
    label: "Flexibel differentiëren",
    paths: (
      <>
        <circle className="occlude" cx="22" cy="50" r="5" />
        <path className="occlude" d="M13 74 v-3 a9 9 0 0 1 18 0 v3" />
        <circle className="occlude" cx="74" cy="50" r="5" />
        <path className="occlude" d="M65 74 v-3 a9 9 0 0 1 18 0 v3" />
        <circle className="occlude" cx="34" cy="40" r="5.5" />
        <path className="occlude" d="M24 66 v-3 a10 10 0 0 1 20 0 v3" />
        <circle className="occlude" cx="62" cy="40" r="5.5" />
        <path className="occlude" d="M52 66 v-3 a10 10 0 0 1 20 0 v3" />
        <circle className="occlude" cx="48" cy="52" r="7" />
        <path className="occlude" d="M36 84 v-4 a12 12 0 0 1 24 0 v4" />
      </>
    ),
  },
};

export function isBouwsteenCode(code: string): code is BouwsteenCode {
  return code in ICONS;
}

export interface BouwsteenIconProps extends Omit<SVGProps<SVGSVGElement>, "viewBox"> {
  code: BouwsteenCode;
  /** Toegankelijk label; standaard de bouwsteennaam. Geef "" voor puur decoratief gebruik. */
  title?: string;
}

export function BouwsteenIcon({ code, title, className, ...rest }: BouwsteenIconProps) {
  const icon = ICONS[code];
  const label = title ?? icon.label;
  const decorative = label === "";
  return (
    <svg
      viewBox="0 0 96 96"
      className={["bs-icon", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      {...rest}
    >
      {icon.paths}
    </svg>
  );
}
