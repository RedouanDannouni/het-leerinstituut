"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, FolderKanban } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { getUserInitials, getVisibleProjects } from "@/lib/domain/selectors";
import { Badge, statusTone } from "@/components/ui/Badge";

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
        {projects.map((project) => {
          const shown = project.participants.slice(0, 4);
          const extra = project.participants.length - shown.length;
          return (
            <div className="card rich-card" key={project.id}>
              <div className="rich-card-strip">
                <span className="list-row-icon" aria-hidden>
                  <FolderKanban size={22} />
                </span>
                <Badge tone={statusTone(project.status)}>{project.status}</Badge>
              </div>
              <h2>{project.title}</h2>
              <p className="muted" style={{ margin: 0 }}>
                {project.description}
              </p>
              <div className="meta-row">
                <span className="chip">
                  <BookOpen aria-hidden size={14} />
                  {project.materialIds.length} materialen
                </span>
                <span className="chip">
                  <ClipboardCheck aria-hidden size={14} />
                  {project.observationIds.length} observaties
                </span>
              </div>
              <div className="rich-card-foot">
                <div className="cluster" style={{ gap: "var(--space-3)" }}>
                  <div className="avatar-stack" aria-label={`${project.participants.length} betrokkenen`}>
                    {shown.map((id) => (
                      <span className="avatar-sm" key={id}>
                        {getUserInitials(id)}
                      </span>
                    ))}
                    {extra > 0 ? <span className="avatar-sm avatar-sm--more">+{extra}</span> : null}
                  </div>
                  <span className="muted" style={{ fontSize: "0.8rem" }}>
                    {project.startDate} — {project.endDate}
                  </span>
                </div>
                <Link className="btn btn-secondary" href={`/app/projects/${project.id}`}>
                  Bekijk <ArrowRight aria-hidden size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
