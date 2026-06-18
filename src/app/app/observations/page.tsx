"use client";

import Link from "next/link";
import { useRequireSession } from "@/lib/auth/session";
import { canViewRawObservations } from "@/lib/domain/permissions";
import { getProjectTitle, getTeacherName, getVisibleObservations } from "@/lib/domain/selectors";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function ObservationsPage() {
  const { context } = useRequireSession();
  if (!context) return null;

  if (!canViewRawObservations(context.user.role)) {
    return (
      <div className="page">
        <Card>
          <h1>Observaties zijn afgeschermd.</h1>
          <p className="muted">Deze rol ziet geen ruwe observatiedata. Gebruik rapporten voor samenvatting, trend en afspraken.</p>
          <Link className="btn btn-primary" href="/app/reports">Naar rapporten</Link>
        </Card>
      </div>
    );
  }

  const observations = getVisibleObservations(context);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Lesbezoek</p>
          <h1>Observatieformulieren.</h1>
          <p className="muted">Concepten, geplande bezoeken en afgeronde observaties binnen jouw schoolomgeving.</p>
        </div>
        <Link className="btn btn-primary" href="/app/observations/new">Nieuw lesbezoek</Link>
      </header>
      <div className="stack">
        {observations.map((observation) => (
          <Link key={observation.id} className="card" href={`/app/observations/${observation.id}`}>
            <div className="cluster" style={{ justifyContent: "space-between" }}>
              <div>
                <h2>{observation.lessonTitle}</h2>
                <p className="muted">{getTeacherName(observation.teacherId)} · {getProjectTitle(observation.projectId)}</p>
              </div>
              <Badge tone={statusTone(observation.status)}>{observation.status}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
