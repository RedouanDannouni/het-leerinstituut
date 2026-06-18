"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { useRequireSession } from "@/lib/auth/session";
import type { Observation, Report } from "@/lib/domain/types";
import { createReportFromObservation } from "@/lib/reports/report-generator";
import { Card } from "@/components/ui/Card";

export default function NewReportPage() {
  const { context } = useRequireSession();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("hli.approved-observation");
    if (raw) setReport(createReportFromObservation(JSON.parse(raw) as Observation));
  }, []);

  if (!context) return null;

  if (!report) {
    return (
      <div className="page">
        <Card>
          <p className="eyebrow">Template kiezen</p>
          <h1>Geen goedgekeurde observatiesamenvatting gevonden.</h1>
          <p className="muted">Maak eerst een observatie, genereer een AI-concept, bewerk het en keur het expliciet goed.</p>
          <Link className="btn btn-primary" href="/app/observations/new">Observatie starten</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Gespreksklaar rapport</p>
          <h1>{report.title}</h1>
          <p className="muted">Gemaakt op basis van een goedgekeurde samenvatting, zonder ruwe bewijsdata.</p>
        </div>
      </header>
      <ReportBuilder initialReport={report} context={context} />
    </div>
  );
}
