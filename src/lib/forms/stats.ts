/**
 * Statistiek-helpers voor de Kwaliteitsmonitor-resultaten.
 * Werken op platte arrays van 1-4 Likert-waarden. Pure functies, geen IO.
 */

/** Een score op de 4-puntsschaal. */
export type ScalePoint = 1 | 2 | 3 | 4;

/** SD-grens waarboven een item als "geen consensus" wordt gemarkeerd. */
export const HIGH_SD_THRESHOLD = 1.0;

/** Minimum aantal respondenten voordat een (sub)groep getoond mag worden. */
export const MIN_RESPONSES = 5;

export interface Distribution {
  /** Aantal antwoorden per schaalpunt. */
  counts: Record<ScalePoint, number>;
  /** Percentage per schaalpunt (0-100, afgerond op heel getal). */
  percentages: Record<ScalePoint, number>;
}

export interface StatBlock {
  n: number;
  /** Rekenkundig gemiddelde (kopcijfer), 2 decimalen. `null` bij n = 0. */
  mean: number | null;
  /** Mediaan over de ordinale 1-4 data. `null` bij n = 0. */
  median: number | null;
  /** Modus (meest voorkomende waarde, bij gelijkspel de laagste). `null` bij n = 0. */
  mode: ScalePoint | null;
  /** Populatie-standaardafwijking, 2 decimalen. `null` bij n = 0. */
  sd: number | null;
  distribution: Distribution;
  /** Percentage dat 3-4 scoort ("op niveau"). */
  topBox: number;
  /** Percentage dat 1-2 scoort ("ontwikkelpunt"). */
  bottomBox: number;
  /** Markering: hoge spreiding = geen consensus. */
  highSd: boolean;
}

type Row = Record<string, string | number | null>;

const SCALE_POINTS: ScalePoint[] = [1, 2, 3, 4];

function emptyDistribution(): Distribution {
  return {
    counts: { 1: 0, 2: 0, 3: 0, 4: 0 },
    percentages: { 1: 0, 2: 0, 3: 0, 4: 0 },
  };
}

export function emptyStatBlock(): StatBlock {
  return {
    n: 0,
    mean: null,
    median: null,
    mode: null,
    sd: null,
    distribution: emptyDistribution(),
    topBox: 0,
    bottomBox: 0,
    highSd: false,
  };
}

/** Verzamelt alle geldige 1-4 waarden uit de opgegeven kolommen over alle rijen. */
export function collectValues(rows: Row[], columns: string[]): number[] {
  const values: number[] = [];
  for (const row of rows) {
    for (const column of columns) {
      const value = row[column];
      if (typeof value === "number" && value >= 1 && value <= 4) {
        values.push(value);
      }
    }
  }
  return values;
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

/** Berekent een volledig StatBlock voor een platte lijst van scores. */
export function computeStats(values: number[]): StatBlock {
  const n = values.length;
  if (n === 0) return emptyStatBlock();

  const sum = values.reduce((acc, value) => acc + value, 0);
  const mean = sum / n;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  const counts: Record<ScalePoint, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const value of values) {
    counts[value as ScalePoint] += 1;
  }

  let mode: ScalePoint = 1;
  for (const point of SCALE_POINTS) {
    if (counts[point] > counts[mode]) mode = point;
  }

  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance);

  const percentages: Record<ScalePoint, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const point of SCALE_POINTS) {
    percentages[point] = Math.round((counts[point] / n) * 100);
  }

  const topBox = Math.round(((counts[3] + counts[4]) / n) * 100);
  const bottomBox = Math.round(((counts[1] + counts[2]) / n) * 100);

  return {
    n,
    mean: round2(mean),
    median: round2(median),
    mode,
    sd: round2(sd),
    distribution: { counts, percentages },
    topBox,
    bottomBox,
    highSd: sd > HIGH_SD_THRESHOLD,
  };
}

/** Gemak: bereken stats direct vanuit rijen + kolommen. */
export function statsFor(rows: Row[], columns: string[]): StatBlock {
  return computeStats(collectValues(rows, columns));
}
