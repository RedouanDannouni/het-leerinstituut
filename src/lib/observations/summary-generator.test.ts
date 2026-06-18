import { describe, expect, it } from "vitest";
import { criteriaTemplate } from "@/lib/domain/seed-data";
import { averageScore } from "./scoring";
import { generateAiConceptSummary } from "./summary-generator";
import type { ObservationCriterion } from "@/lib/domain/types";

const criteria: ObservationCriterion[] = criteriaTemplate.map((criterion, index) => ({
  ...criterion,
  score: [4, 3, 2, 3][index],
  note: index === 0 ? "Lesdoel zichtbaar en actief gebruikt." : "",
  evidence: [],
}));

describe("observation scoring and AI concept generation", () => {
  it("calculates the average score", () => {
    expect(averageScore(criteria)).toBe(3);
  });

  it("marks generated summaries as editable AI concepts", () => {
    const summary = generateAiConceptSummary(criteria);

    expect(summary.label).toBe("AI-concept");
    expect(summary.approvedAt).toBeUndefined();
    expect(summary.text).toContain("controleer en bewerk");
  });
});
