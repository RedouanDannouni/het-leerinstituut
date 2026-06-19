/**
 * Platform breakpoint-tokens (mobile-first).
 * Houd in sync met --bp-* in src/styles/globals.css.
 */
export const breakpoints = {
  tablet: 480,
  desktop: 768,
  wide: 1024,
} as const;

export type BreakpointToken = keyof typeof breakpoints;

export const mediaQueries = {
  /** < 480px */
  mobile: `(max-width: ${breakpoints.tablet - 1}px)`,
  /** ≥ 480px */
  tabletUp: `(min-width: ${breakpoints.tablet}px)`,
  /** < 768px */
  belowDesktop: `(max-width: ${breakpoints.desktop - 1}px)`,
  /** ≥ 768px */
  desktopUp: `(min-width: ${breakpoints.desktop}px)`,
  /** < 1024px */
  belowWide: `(max-width: ${breakpoints.wide - 1}px)`,
  /** ≥ 1024px */
  wideUp: `(min-width: ${breakpoints.wide}px)`,
} as const;

export type MediaQueryToken = keyof typeof mediaQueries;

export function matchesBreakpoint(query: MediaQueryToken): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(mediaQueries[query]).matches;
}
