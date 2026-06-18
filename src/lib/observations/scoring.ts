import type { ObservationCriterion } from "@/lib/domain/types";

export function averageScore(criteria: ObservationCriterion[]) {
  const scored = criteria.filter((criterion) => criterion.score !== null);
  if (!scored.length) return null;
  return Number((scored.reduce((sum, criterion) => sum + (criterion.score ?? 0), 0) / scored.length).toFixed(1));
}

export function scoreLabel(score: number | null) {
  if (score === null) return "Nog niet gescoord";
  if (score <= 1) return "Startpunt";
  if (score === 2) return "In ontwikkeling";
  if (score === 3) return "Stevig zichtbaar";
  return "Voorbeeldpraktijk";
}
