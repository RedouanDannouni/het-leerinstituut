"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { ObservationForm } from "@/components/observations/ObservationForm";
import { useRequireSession } from "@/lib/auth/session";
import { canAccessTenant } from "@/lib/domain/access";
import { canViewRawObservations } from "@/lib/domain/permissions";
import { observations } from "@/lib/domain/seed-data";

export default function ObservationDetailPage({ params }: { params: Promise<{ observationId: string }> }) {
  const { observationId } = use(params);
  const { context } = useRequireSession();
  if (!context) return null;
  if (!canViewRawObservations(context.user.role)) notFound();
  const observation = observations.find((item) => item.id === observationId);
  if (!observation || !canAccessTenant(context, observation.tenantId)) notFound();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Lesbezoek</p>
          <h1>{observation.lessonTitle}</h1>
          <p className="muted">Bewerkbaar formulier met concept-herstel en AI-conceptsamenvatting.</p>
        </div>
      </header>
      <ObservationForm initialObservation={observation} context={context} />
    </div>
  );
}
