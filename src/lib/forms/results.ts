import { formsForInstrument } from "./definitions";
import { allRatingColumns, INSTRUMENTS, type FormDefinition } from "./types";

export interface FormResult {
  count: number;
  overall: number | null;
  groups: { label: string; avg: number | null }[];
}

type Row = Record<string, number | null>;

function average(rows: Row[], columns: string[]): number | null {
  let sum = 0;
  let n = 0;
  for (const row of rows) {
    for (const column of columns) {
      const value = row[column];
      if (typeof value === "number") {
        sum += value;
        n += 1;
      }
    }
  }
  return n ? Number((sum / n).toFixed(2)) : null;
}

export function computeFormResult(def: FormDefinition, rows: Row[]): FormResult {
  return {
    count: rows.length,
    overall: average(rows, allRatingColumns(def)),
    groups: def.groups.map((group) => ({
      label: group.label,
      avg: average(rows, group.items.map((item) => item.column)),
    })),
  };
}

export function emptyFormResults(): Record<string, FormResult> {
  const allDefs = INSTRUMENTS.flatMap((instrument) => formsForInstrument(instrument.key));
  return Object.fromEntries(
    allDefs.map((def) => [def.key, { count: 0, overall: null, groups: def.groups.map((g) => ({ label: g.label, avg: null })) }]),
  );
}
