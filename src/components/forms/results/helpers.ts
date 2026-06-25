import { SCALES } from "@/lib/forms/definitions";
import type { ScalePoint } from "@/lib/forms/stats";
import type { ScaleVariant } from "@/lib/forms/types";

/** Formatteert een getal met Nederlandse komma. `null` → em-dash. */
export function nl(value: number | null, decimals = 2): string {
  if (value === null || Number.isNaN(value)) return "—";
  return value.toLocaleString("nl-NL", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Mediaan/modus zonder onnodige decimalen. */
export function nlShort(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return value.toLocaleString("nl-NL", { maximumFractionDigits: 1 });
}

export const SCALE_POINTS: ScalePoint[] = [1, 2, 3, 4];

/** Kleur-token per schaalpunt (consequent op alle assen). */
export function scaleColor(point: ScalePoint): string {
  return `var(--scale-${point})`;
}

/** Labels per schaalpunt voor de gekozen schaalvariant. */
export function scaleLabels(scale: ScaleVariant): Record<ScalePoint, string> {
  const options = SCALES[scale];
  return {
    1: options[0]?.label ?? "1",
    2: options[1]?.label ?? "2",
    3: options[2]?.label ?? "3",
    4: options[3]?.label ?? "4",
  };
}

/** Positie (0-100%) van een score op de continue 1-4 as. */
export function scorePosition(value: number): number {
  return ((value - 1) / 3) * 100;
}

/** CSS-token per respondentvariant (vast kleurschema). */
export function perspectiveColor(variant: "leiding" | "deelnemer" | "leerling"): string {
  return `var(--perspective-${variant})`;
}
