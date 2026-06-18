"use client";

import { notFound } from "next/navigation";
import { ObservationForm } from "@/components/observations/ObservationForm";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { criteriaTemplate, projects, users } from "@/lib/domain/seed-data";
import type { Observation } from "@/lib/domain/types";

export default function NewObservationPage() {
  const { context } = useRequireSession();
  if (!context) return null;
  if (!can(context.user.role, "edit:observations")) notFound();

  const project = projects.find((item) => item.tenantId === context.user.tenantId);
  const teacher = users.find((user) => user.tenantId === context.user.tenantId && user.role === "docent");

  const observation: Observation = {
    id: "new",
    tenantId: context.user.tenantId,
    projectId: project?.id ?? "",
    teacherId: teacher?.id ?? "",
    observerId: context.user.id,
    lessonTitle: "Nieuwe lesobservatie",
    subject: "",
    observedAt: new Date().toISOString(),
    status: "draft",
    criteria: criteriaTemplate.map((criterion) => ({ ...criterion, score: null, note: "", evidence: [] })),
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Nieuw lesbezoek</p>
          <h1>Observatieformulier.</h1>
          <p className="muted">Context vooraf ingevuld, criteria als kaarten en autosave met expliciete goedkeuring.</p>
        </div>
      </header>
      <ObservationForm initialObservation={observation} context={context} />
    </div>
  );
}
