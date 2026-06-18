"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, FileText, LayoutList, Plus } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { getDemoReports } from "@/lib/reports/report-generator";
import type { Report } from "@/lib/domain/types";
import { Badge } from "@/components/ui/Badge";

const statusMeta: Record<Report["status"], { label: string; tone: "warning" | "success" | "info" }> = {
  draft: { label: "Concept", tone: "warning" },
  ready: { label: "Gereed", tone: "success" },
  exported: { label: "Geëxporteerd", tone: "info" },
};

export default function ReportsPage() {
  const { context } = useRequireSession();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => setReports(getDemoReports()), []);
  if (!context) return null;

  const visibleReports = reports.filter((report) => context.user.role === "admin" || report.tenantId === context.user.tenantId);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Rapporten</p>
          <h1>Rapportgenerator.</h1>
          <p className="muted">Template, live preview, bewerkbaar narratief en export naar PDF/PPTX.</p>
        </div>
        <Link className="btn btn-primary" href="/app/reports/new">
          <Plus aria-hidden size={18} /> Nieuw rapport
        </Link>
      </header>
      <div className="grid grid-2">
        {visibleReports.map((report) => {
          const meta = statusMeta[report.status];
          return (
            <div className="card rich-card" key={report.id}>
              <div className="rich-card-strip">
                <span className="list-row-icon" data-tone={meta.tone} aria-hidden>
                  <FileText size={22} />
                </span>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </div>
              <h2>{report.title}</h2>
              <p className="muted" style={{ margin: 0 }}>
                Gespreksklaar narratief — samenvatting, KPI&apos;s, trend, acties en afspraken.
              </p>
              <div className="meta-row">
                <span className="chip">
                  <LayoutList aria-hidden size={14} />
                  {report.blocks.length} blokken
                </span>
                <span className="chip">
                  <CalendarClock aria-hidden size={14} />
                  {new Date(report.updatedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="rich-card-foot">
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  {report.observationIds.length} observatie(s) gekoppeld
                </span>
                <Link className="btn btn-secondary" href={`/app/reports/${report.id}`}>
                  Open builder <ArrowRight aria-hidden size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
