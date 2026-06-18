"use client";

import { useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
  ListChecks,
  Presentation,
  TrendingUp,
} from "lucide-react";
import { appendClientAuditEvent } from "@/lib/domain/audit";
import { brandAssets } from "@/lib/brand";
import type { Report, ReportBlock, SessionContext } from "@/lib/domain/types";
import { exportReportPdf } from "@/lib/reports/export-pdf";
import { exportReportPptx } from "@/lib/reports/export-pptx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Textarea } from "@/components/ui/Form";

const blockMeta: Record<ReportBlock["type"], { icon: React.ElementType; tag: string }> = {
  summary: { icon: FileText, tag: "Samenvatting" },
  kpi: { icon: BarChart3, tag: "Kerngetallen" },
  trend: { icon: TrendingUp, tag: "Trend" },
  actions: { icon: ListChecks, tag: "Acties" },
  agreements: { icon: CheckCircle2, tag: "Afspraken" },
};

const statusMeta: Record<Report["status"], { label: string; tone: "warning" | "success" | "info" }> = {
  draft: { label: "Concept", tone: "warning" },
  ready: { label: "Gereed", tone: "success" },
  exported: { label: "Geëxporteerd", tone: "info" },
};

export function ReportBuilder({ initialReport, context }: { initialReport: Report; context: SessionContext }) {
  const [report, setReport] = useState(initialReport);
  const [message, setMessage] = useState("");

  const updateBlock = (blockId: string, content: string) => {
    setReport((current) => ({
      ...current,
      blocks: current.blocks.map((block) => (block.id === blockId ? { ...block, content } : block)),
    }));
  };

  function markReady() {
    setReport((current) => ({ ...current, status: "ready" }));
    appendClientAuditEvent(context, "Rapport vastgesteld", report.title);
    setMessage("Rapport vastgesteld en klaar voor het schoolgesprek.");
  }

  async function runExport(kind: "pdf" | "pptx") {
    if (kind === "pdf") await exportReportPdf(report);
    if (kind === "pptx") await exportReportPptx(report);
    appendClientAuditEvent(context, `Rapport geëxporteerd als ${kind.toUpperCase()}`, report.title);
    setMessage(`${kind.toUpperCase()} export gestart. Controleer je downloads.`);
  }

  const status = statusMeta[report.status];

  return (
    <>
      <div className="editor-toolbar no-print">
        <div className="editor-toolbar-meta">
          <Badge tone={status.tone}>{status.label}</Badge>
          <span className="muted" style={{ fontSize: "0.9rem" }}>
            {report.blocks.length} blokken · controleer en bewerk voordat je vaststelt
          </span>
        </div>
        <div className="cluster">
          <Button type="button" variant="secondary" onClick={() => setMessage("Concept opgeslagen.")}>
            Concept opslaan
          </Button>
          <Button type="button" variant="accent" onClick={markReady}>
            <CheckCircle2 aria-hidden size={16} /> Vaststellen
          </Button>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="stack">
          {report.blocks.map((block) => {
            const meta = blockMeta[block.type];
            const Icon = meta.icon;
            return (
              <Card key={block.id} className="editor-block">
                <div className="editor-block-head">
                  <span className="editor-block-icon" aria-hidden>
                    <Icon size={18} />
                  </span>
                  <span className="editor-block-title">{block.title}</span>
                  <span className="editor-block-type">{meta.tag}</span>
                </div>
                <Field label={`Tekst — ${block.title}`}>
                  <Textarea value={block.content} onChange={(event) => updateBlock(block.id, event.target.value)} />
                </Field>
              </Card>
            );
          })}
        </div>

        <div className="stack" style={{ position: "sticky", top: 96 }}>
          <section className="report-preview surface" aria-label="Live rapportpreview">
            <div className="report-preview-cover">
              <img className="report-preview-logo" src={brandAssets.logo.white} alt="Het Leerinstituut" />
              <h1>{report.title}</h1>
              <p>Gespreksklaar rapport · geen ruwe observatiedata · geen docent-ranking</p>
              <img className="report-preview-mark" src={brandAssets.icon.white} alt="" aria-hidden />
            </div>
            <div className="report-preview-body">
              {report.blocks.map((block) => (
                <section key={block.id} className="report-preview-section">
                  <h2>{block.title}</h2>
                  <p>{block.content}</p>
                </section>
              ))}
            </div>
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
            {message ? (
              <p aria-live="polite" className="help-text--ok" style={{ marginTop: "var(--space-3)" }}>
                <CheckCircle2 aria-hidden size={16} /> {message}
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </>
  );
}
