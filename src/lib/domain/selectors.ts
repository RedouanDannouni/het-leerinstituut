import { canViewRawObservations } from "./permissions";
import { auditEvents, materials, observations, projects, reports, tenants, users } from "./seed-data";
import { scoreLabel } from "@/lib/observations/scoring";
import type { CockpitMetric, LessonMaterial, Observation, Project, Report, SessionContext, TenantId } from "./types";

function scopedTenantIds(context: SessionContext): TenantId[] {
  return context.user.role === "admin" ? tenants.map((tenant) => tenant.id) : [context.user.tenantId];
}

export function getVisibleProjects(context: SessionContext): Project[] {
  const tenantIds = scopedTenantIds(context);
  return projects.filter((project) => tenantIds.includes(project.tenantId));
}

export function getVisibleMaterials(context: SessionContext): LessonMaterial[] {
  const tenantIds = scopedTenantIds(context);
  return materials.filter((material) => {
    if (!tenantIds.includes(material.tenantId)) return false;
    if (context.user.role === "admin") return true;
    if (context.user.role === "docent") return material.ownerId === context.user.id || material.sharedWithRole.includes("docent");
    return material.sharedWithRole.includes(context.user.role);
  });
}

export function getVisibleObservations(context: SessionContext): Observation[] {
  if (!canViewRawObservations(context.user.role)) {
    return [];
  }
  const tenantIds = scopedTenantIds(context);
  return observations.filter((observation) => tenantIds.includes(observation.tenantId));
}

export function getVisibleReports(context: SessionContext): Report[] {
  const tenantIds = scopedTenantIds(context);
  return reports.filter((report) => tenantIds.includes(report.tenantId));
}

export function getTenantUsers(context: SessionContext) {
  if (context.user.role === "admin") return users;
  return users.filter((user) => user.tenantId === context.user.tenantId);
}

export function getAuditEvents(context: SessionContext) {
  const tenantIds = scopedTenantIds(context);
  return auditEvents.filter((event) => tenantIds.includes(event.tenantId));
}

export function getSchoolLeaderMetrics(context: SessionContext): CockpitMetric[] {
  const tenantObservations = observations.filter((observation) => observation.tenantId === context.user.tenantId);
  const completed = tenantObservations.filter((observation) => observation.status === "completed");
  const scoredCriteria = completed.flatMap((observation) => observation.criteria).filter((criterion) => criterion.score !== null);
  const average = scoredCriteria.length
    ? (scoredCriteria.reduce((sum, criterion) => sum + (criterion.score ?? 0), 0) / scoredCriteria.length).toFixed(1)
    : "—";

  return [
    { label: "Gemiddelde leskwaliteit", value: average, context: "Doel: 3,5 of hoger", trend: "up" },
    { label: "Observaties dit kwartaal", value: String(tenantObservations.length), context: "Planning: 6 observaties", trend: "stable" },
    { label: "Goedgekeurde rapporten", value: String(getVisibleReports(context).length), context: "Klaar voor schoolgesprek", trend: "up" },
    { label: "Open acties", value: "3", context: "Waarvan 1 met risico", trend: "down" },
  ];
}

const GROWTH_PHASES = ["Startpunt", "In ontwikkeling", "Stevig zichtbaar", "Voorbeeldpraktijk"] as const;

export function getPhaseDistribution(context: SessionContext): { label: string; value: number }[] {
  const tenantObservations = observations.filter((observation) => observation.tenantId === context.user.tenantId);
  const scored = tenantObservations
    .flatMap((observation) => observation.criteria)
    .filter((criterion) => criterion.score !== null);

  const counts = new Map<string, number>(GROWTH_PHASES.map((phase) => [phase, 0]));
  scored.forEach((criterion) => {
    const phase = scoreLabel(criterion.score);
    counts.set(phase, (counts.get(phase) ?? 0) + 1);
  });

  return GROWTH_PHASES.map((label) => ({ label, value: counts.get(label) ?? 0 }));
}

export function getTeacherName(userId: string) {
  return users.find((user) => user.id === userId)?.name ?? "Onbekende docent";
}

export function getUserInitials(userId: string) {
  return users.find((user) => user.id === userId)?.avatarInitials ?? "··";
}

export function getProjectTitle(projectId: string) {
  return projects.find((project) => project.id === projectId)?.title ?? "Onbekend project";
}
