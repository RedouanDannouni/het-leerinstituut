"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { useRequireSession } from "@/lib/auth/session";
import { canAccessTenant } from "@/lib/domain/access";
import { canViewRawObservations } from "@/lib/domain/permissions";
import { materials, observations, projects, users } from "@/lib/domain/seed-data";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { context } = useRequireSession();
  if (!context) return null;
  const project = projects.find((item) => item.id === projectId);
  if (!project || !canAccessTenant(context, project.tenantId)) notFound();

  const linkedMaterials = materials.filter((material) => project.materialIds.includes(material.id));
  const linkedObservations = observations.filter((observation) => project.observationIds.includes(observation.id));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Projectdetail</p>
          <h1>{project.title}</h1>
          <p className="muted">{project.description}</p>
        </div>
        <Badge tone={statusTone(project.status)}>{project.status}</Badge>
      </header>
      <div className="grid grid-2">
        <Card>
          <h2>Betrokkenen</h2>
          <div className="stack">
            {project.participants.map((userId) => {
              const user = users.find((item) => item.id === userId);
              return <div key={userId} className="surface" style={{ padding: "var(--space-3)" }}>{user?.name ?? userId}</div>;
            })}
          </div>
        </Card>
        <Card>
          <h2>Gekoppeld materiaal</h2>
          <div className="stack">
            {linkedMaterials.map((material) => (
              <div key={material.id} className="surface" style={{ padding: "var(--space-3)" }}>
                <strong>{material.title}</strong>
                <p className="muted" style={{ margin: 0 }}>{material.description}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2>Observaties</h2>
          {canViewRawObservations(context.user.role) ? (
            <div className="stack">
              {linkedObservations.map((observation) => (
                <Link key={observation.id} className="surface" style={{ padding: "var(--space-3)" }} href={`/app/observations/${observation.id}`}>
                  <strong>{observation.lessonTitle}</strong>
                  <p className="muted" style={{ margin: 0 }}>{observation.status}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">Deze rol ziet geen ruwe observaties. Gebruik het rapport voor geaggregeerde conclusies en acties.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
