"use client";

import Link from "next/link";
import { useRequireSession } from "@/lib/auth/session";
import { getVisibleProjects } from "@/lib/domain/selectors";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function ProjectsPage() {
  const { context } = useRequireSession();
  if (!context) return null;
  const projects = getVisibleProjects(context);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Projecten</p>
          <h1>Trajecten per schoolomgeving.</h1>
          <p className="muted">Status, betrokkenen, gekoppeld materiaal en observaties in één rustige projectkaart.</p>
        </div>
      </header>
      <div className="grid grid-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <div className="cluster" style={{ justifyContent: "space-between" }}>
              <Badge tone={statusTone(project.status)}>{project.status}</Badge>
              <span className="muted">{project.startDate} — {project.endDate}</span>
            </div>
            <h2 style={{ marginTop: "var(--space-3)" }}>{project.title}</h2>
            <p className="muted">{project.description}</p>
            <div className="cluster">
              <span className="badge badge-neutral">{project.participants.length} betrokkenen</span>
              <span className="badge badge-neutral">{project.materialIds.length} materialen</span>
              <span className="badge badge-neutral">{project.observationIds.length} observaties</span>
            </div>
            <Link className="btn btn-secondary" href={`/app/projects/${project.id}`} style={{ marginTop: "var(--space-4)" }}>Bekijk project</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
