"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { useRequireSession } from "@/lib/auth/session";
import type { Report } from "@/lib/domain/types";
import { getDemoReports } from "@/lib/reports/report-generator";

export default function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = use(params);
  const { context } = useRequireSession();
  const [report, setReport] = useState<Report | null | undefined>(undefined);

  useEffect(() => {
    setReport(getDemoReports().find((item) => item.id === reportId) ?? null);
  }, [reportId]);

  if (!context || report === undefined) return null;
  if (!report || (context.user.role !== "admin" && report.tenantId !== context.user.tenantId)) notFound();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Rapportbuilder</p>
          <h1>{report.title}</h1>
          <p className="muted">Bewerk de narratieve blokken en exporteer voor het schoolgesprek.</p>
        </div>
      </header>
      <ReportBuilder initialReport={report} context={context} />
    </div>
  );
}
