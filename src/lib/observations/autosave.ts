import type { Observation } from "@/lib/domain/types";

export function draftKey(observationId: string) {
  return `hli.observation-draft.${observationId}`;
}

export function saveObservationDraft(observation: Observation) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(draftKey(observation.id), JSON.stringify({ savedAt: new Date().toISOString(), observation }));
}

export function readObservationDraft(observationId: string): { savedAt: string; observation: Observation } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(draftKey(observationId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { savedAt: string; observation: Observation };
  } catch {
    return null;
  }
}
