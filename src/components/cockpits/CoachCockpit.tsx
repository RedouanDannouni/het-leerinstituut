import Link from "next/link";
import { KpiCard } from "@/components/blocks/KpiCard";
import { ActionList } from "@/components/blocks/ActionList";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { getProjectTitle, getTeacherName, getVisibleObservations, getVisibleProjects, getVisibleReports } from "@/lib/domain/selectors";
import type { SessionContext } from "@/lib/domain/types";

export function CoachCockpit({ context }: { context: SessionContext }) {
  const observations = getVisibleObservations(context);
  const projects = getVisibleProjects(context);
  const reports = getVisibleReports(context);
  const drafts = observations.filter((item) => item.status === "draft");

  return (
    <div className="stack">
      <div className="grid grid-4">
        <KpiCard metric={{ label: "Open observaties", value: String(observations.length), context: "Inclusief concepten", trend: "stable" }} />
        <KpiCard metric={{ label: "Conceptformulieren", value: String(drafts.length), context: "Autosave actief", trend: "down" }} />
        <KpiCard metric={{ label: "Actieve projecten", value: String(projects.length), context: "Over al jouw scholen", trend: "up" }} />
        <KpiCard metric={{ label: "Recente rapporten", value: String(reports.length), context: "Gereed voor gesprek", trend: "up" }} />
      </div>
      <div className="grid grid-2">
        <Card>
          <CardHeader title="Observaties die aandacht vragen" description="Werk door waar je gebleven was of start een nieuw lesbezoek." />
          <div className="stack">
            {observations.map((observation) => (
              <div className="surface stack" key={observation.id} style={{ padding: "var(--space-4)" }}>
                <div className="cluster" style={{ justifyContent: "space-between" }}>
                  <strong>{observation.lessonTitle}</strong>
                  <Badge tone={statusTone(observation.status)}>{observation.status}</Badge>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {getTeacherName(observation.teacherId)} · {getProjectTitle(observation.projectId)}
                </p>
                <Link className="btn btn-secondary" href={`/app/observations/${observation.id}`}>
                  Open formulier
                </Link>
              </div>
            ))}
            <Link className="btn btn-primary" href="/app/observations/new">Nieuw lesbezoek</Link>
          </div>
        </Card>
        <ActionList
          title="Aanbevolen volgende stappen"
          items={[
            "Rond het conceptformulier voor Breuken vergelijken af.",
            "Bespreek de exit-ticket afspraak in het projectoverleg.",
            "Maak na goedkeuring een gespreksklaar rapport voor de schoolleider.",
          ]}
        />
      </div>
    </div>
  );
}
