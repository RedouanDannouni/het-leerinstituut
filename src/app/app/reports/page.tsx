"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireSession } from "@/lib/auth/session";
import { getDemoReports } from "@/lib/reports/report-generator";
import type { Report } from "@/lib/domain/types";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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
        <Link className="btn btn-primary" href="/app/reports/new">Nieuw rapport</Link>
      </header>
      <div className="grid grid-2">
        {visibleReports.map((report) => (
          <Card key={report.id}>
            <div className="cluster" style={{ justifyContent: "space-between" }}>
              <Badge tone={statusTone(report.status)}>{report.status}</Badge>
              <span className="muted">{new Date(report.updatedAt).toLocaleDateString("nl-NL")}</span>
            </div>
            <h2 style={{ marginTop: "var(--space-3)" }}>{report.title}</h2>
            <p className="muted">Blokken: samenvatting, KPI's, trend, acties en afspraken.</p>
            <Link className="btn btn-secondary" href={`/app/reports/${report.id}`}>Open builder</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
