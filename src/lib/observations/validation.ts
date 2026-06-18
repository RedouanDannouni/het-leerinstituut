import type { Observation } from "@/lib/domain/types";

export interface ObservationErrors {
  lessonTitle?: string;
  subject?: string;
  criteria?: Record<string, string>;
  summary?: string;
}

export function validateObservation(observation: Observation, requireSummary = false): ObservationErrors {
  const errors: ObservationErrors = {};
  if (!observation.lessonTitle.trim()) errors.lessonTitle = "Vul een lestitel in.";
  if (!observation.subject.trim()) errors.subject = "Vul een vak/groep in.";

  const criteriaErrors: Record<string, string> = {};
  observation.criteria.forEach((criterion) => {
    if (criterion.score === null) criteriaErrors[criterion.id] = "Kies een score voor dit criterium.";
  });
  if (Object.keys(criteriaErrors).length) errors.criteria = criteriaErrors;

  if (requireSummary && !observation.aiDraft?.approvedAt) {
    errors.summary = "Keur de samenvatting expliciet goed voordat je rapporteert.";
  }
  return errors;
}

export function hasErrors(errors: ObservationErrors) {
  return Boolean(errors.lessonTitle || errors.subject || errors.summary || (errors.criteria && Object.keys(errors.criteria).length));
}
