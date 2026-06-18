"use client";

import { useState } from "react";
import { Download, Presentation } from "lucide-react";
import { appendClientAuditEvent } from "@/lib/domain/audit";
import type { Report, SessionContext } from "@/lib/domain/types";
import { exportReportPdf } from "@/lib/reports/export-pdf";
import { exportReportPptx } from "@/lib/reports/export-pptx";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Textarea } from "@/components/ui/Form";

export function ReportBuilder({ initialReport, context }: { initialReport: Report; context: SessionContext }) {
  const [report, setReport] = useState(initialReport);
  const [message, setMessage] = useState("");

  const updateBlock = (blockId: string, content: string) => {
    setReport((current) => ({
      ...current,
      blocks: current.blocks.map((block) => (block.id === blockId ? { ...block, content } : block)),
    }));
  };

  async function runExport(kind: "pdf" | "pptx") {
    if (kind === "pdf") await exportReportPdf(report);
    if (kind === "pptx") await exportReportPptx(report);
    appendClientAuditEvent(context, `Rapport geëxporteerd als ${kind.toUpperCase()}`, report.title);
    setMessage(`${kind.toUpperCase()} export gestart. Controleer je downloads.`);
  }

  return (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      <div className="stack">
        <Card>
          <h2>Blokken bewerken</h2>
          <p className="muted">Narratief blijft altijd bewerkbaar voordat het rapport gedeeld wordt.</p>
        </Card>
        {report.blocks.map((block) => (
          <Card key={block.id}>
            <Field label={block.title}>
              <Textarea value={block.content} onChange={(event) => updateBlock(block.id, event.target.value)} />
            </Field>
          </Card>
        ))}
      </div>
      <div className="stack" style={{ position: "sticky", top: 96 }}>
        <section className="report-preview" aria-label="Live rapportpreview">
          <p className="eyebrow">Live preview</p>
          <h1 style={{ fontSize: "2rem" }}>{report.title}</h1>
          <p className="muted">Gespreksklaar rapport · geen ruwe observatiedata · geen docent-ranking</p>
          {report.blocks.map((block) => (
            <section key={block.id} style={{ marginTop: "var(--space-6)" }}>
              <h2>{block.title}</h2>
              <p style={{ whiteSpace: "pre-wrap" }}>{block.content}</p>
            </section>
          ))}
        </section>
        <Card>
          <h2>Export</h2>
          <p className="muted">Export is geschikt als eerste demo-output voor het gesprek met de school.</p>
          <div className="cluster">
            <Button type="button" onClick={() => void runExport("pdf")}>
              <Download aria-hidden size={16} /> PDF
            </Button>
            <Button type="button" variant="secondary" onClick={() => void runExport("pptx")}>
              <Presentation aria-hidden size={16} /> PPTX
            </Button>
          </div>
          {message ? <p aria-live="polite" className="help-text">{message}</p> : null}
        </Card>
      </div>
    </div>
  );
}
