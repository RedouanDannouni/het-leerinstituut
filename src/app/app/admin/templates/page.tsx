"use client";

import { notFound } from "next/navigation";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { criteriaTemplate, reportTemplates } from "@/lib/domain/seed-data";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function AdminTemplatesPage() {
  const { context } = useRequireSession();
  if (!context) return null;
  if (!can(context.user.role, "view:admin")) notFound();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Beheer</p>
          <h1>Templates.</h1>
        </div>
      </header>
      <div className="grid grid-2">
        <Card>
          <Badge tone="info">Observatieformulier</Badge>
          <h2 style={{ marginTop: "var(--space-3)" }}>Leskwaliteitscriteria</h2>
          <div className="stack">
            {criteriaTemplate.map((criterion) => (
              <div className="surface" key={criterion.id} style={{ padding: "var(--space-3)" }}>
                <strong>{criterion.title}</strong>
                <p className="muted" style={{ margin: 0 }}>{criterion.description}</p>
              </div>
            ))}
          </div>
        </Card>
        {reportTemplates.map((template) => (
          <Card key={template.id}>
            <Badge tone="success">Rapporttemplate</Badge>
            <h2 style={{ marginTop: "var(--space-3)" }}>{template.name}</h2>
            <p className="muted">{template.description}</p>
            <div className="cluster">
              {template.blocks.map((block) => <span className="badge badge-neutral" key={block}>{block}</span>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
