import { reports } from "@/lib/domain/seed-data";
import type { Observation, Report } from "@/lib/domain/types";
import { averageScore } from "@/lib/observations/scoring";

export function createReportFromObservation(observation: Observation): Report {
  const average = averageScore(observation.criteria);
  const narrative = observation.aiDraft?.approvedAt
    ? observation.aiDraft.text.replace(/^AI-concept — controleer en bewerk voordat je dit vaststelt\.\n\n/, "")
    : "Er is nog geen goedgekeurde samenvatting. Keur eerst het AI-concept goed.";

  return {
    id: "local-report",
    tenantId: observation.tenantId,
    projectId: observation.projectId,
    title: `Gespreksrapport — ${observation.lessonTitle}`,
    status: observation.aiDraft?.approvedAt ? "ready" : "draft",
    templateId: "rt-gesprek",
    observationIds: [observation.id],
    updatedAt: new Date().toISOString(),
    blocks: [
      { id: "summary", type: "summary", title: "Samenvatting", content: narrative },
      { id: "kpi", type: "kpi", title: "KPI's", content: `Gemiddelde observatiescore: ${average ?? "nog onbekend"}/4. Observaties: 1.` },
      {
        id: "trend",
        type: "trend",
        title: "Trend",
        content: "Trendweergave is geaggregeerd en bedoeld als gespreksondersteuning, niet als ranglijst.",
      },
      { id: "actions", type: "actions", title: "Acties", content: "1. Leg één concrete vervolgstap vast. 2. Plan een korte terugblik na twee weken." },
      { id: "agreements", type: "agreements", title: "Afspraken", content: "Bespreek dit rapport met schoolleider, coach en betrokken docent." },
    ],
  };
}

export function getDemoReports(): Report[] {
  if (typeof window === "undefined") return reports;
  const rawObservation = window.localStorage.getItem("hli.approved-observation");
  if (!rawObservation) return reports;
  try {
    const observation = JSON.parse(rawObservation) as Observation;
    return [createReportFromObservation(observation), ...reports];
  } catch {
    return reports;
  }
}
