import type { AiDraftSummary, ObservationCriterion } from "@/lib/domain/types";
import { averageScore, scoreLabel } from "./scoring";

export function generateAiConceptSummary(criteria: ObservationCriterion[]): AiDraftSummary {
  const avg = averageScore(criteria);
  const strongest = [...criteria]
    .filter((criterion) => criterion.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const growth = [...criteria]
    .filter((criterion) => criterion.score !== null)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];

  const text = [
    "AI-concept — controleer en bewerk voordat je dit vaststelt.",
    avg ? `Het gemiddelde beeld is ${avg}/4 (${scoreLabel(Math.round(avg))}).` : "Er zijn nog onvoldoende scores ingevuld voor een betrouwbaar totaalbeeld.",
    strongest ? `Sterk zichtbaar: ${strongest.title.toLowerCase()}. ${strongest.note || "De observatie bevat hier positieve signalen."}` : "",
    growth && growth.id !== strongest?.id
      ? `Ontwikkelkans: ${growth.title.toLowerCase()}. Maak de vervolgstap concreet in de nabespreking.`
      : "",
    "Gebruik deze tekst als startpunt; de observator blijft eigenaar van de uiteindelijke samenvatting.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    id: `ai-${Date.now()}`,
    label: "AI-concept",
    text,
    generatedAt: new Date().toISOString(),
    sourceCriterionIds: criteria.map((criterion) => criterion.id),
  };
}
