import { describe, expect, it } from "vitest";
import { observations } from "@/lib/domain/seed-data";
import { createReportFromObservation } from "./report-generator";

describe("report generation", () => {
  it("uses approved summaries and excludes raw evidence/rankings", () => {
    const observation = observations.find((item) => item.id === "o-noord-2");
    if (!observation) throw new Error("Missing fixture observation");

    const report = createReportFromObservation(observation);
    const combined = report.blocks.map((block) => block.content).join("\n");

    expect(report.status).toBe("ready");
    expect(combined).toContain("duidelijke opbouw");
    expect(combined).not.toContain("Eva Jansen");
    expect(combined).not.toContain("Bordfoto");
  });
});
