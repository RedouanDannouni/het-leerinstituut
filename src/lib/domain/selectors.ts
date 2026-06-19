import { canViewRawObservations } from "./permissions";
import { isInstituteStaff, roleLabels } from "./roles";
import { auditEvents, invitations, materials, observations, projects, reports, tenants, users } from "./seed-data";
import { scoreLabel } from "@/lib/observations/scoring";
import type { CockpitMetric, LessonMaterial, Observation, Project, Report, Role, SessionContext, TenantId } from "./types";

function scopedTenantIds(context: SessionContext): TenantId[] {
  return isInstituteStaff(context.user.role) ? tenants.map((tenant) => tenant.id) : [context.user.tenantId];
}

export function getVisibleProjects(context: SessionContext): Project[] {
  const tenantIds = scopedTenantIds(context);
  return projects.filter((project) => tenantIds.includes(project.tenantId));
}

export function getVisibleMaterials(context: SessionContext): LessonMaterial[] {
  const tenantIds = scopedTenantIds(context);
  return materials.filter((material) => {
    if (!tenantIds.includes(material.tenantId)) return false;
    if (isInstituteStaff(context.user.role)) return true;
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
  if (isInstituteStaff(context.user.role)) return users;
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

export type ProfileIcon =
  | "school"
  | "route"
  | "alert"
  | "gauge"
  | "eye"
  | "fileCheck"
  | "fileText"
  | "layers"
  | "building"
  | "users"
  | "mail"
  | "calendar";

export interface ProfileStat {
  label: string;
  value: string;
  icon: ProfileIcon;
}

export interface ProfileChartSegment {
  label: string;
  value: number;
}

export interface ProfileChart {
  centerValue: string;
  centerLabel: string;
  segments: ProfileChartSegment[];
}

export interface ProfileSummary {
  scope: string;
  stats: ProfileStat[];
  chart?: ProfileChart;
}

const STATUS_LABELS: Record<string, string> = {
  concept: "Concept",
  open: "Open",
  actief: "Actief",
  afgerond: "Afgerond",
  gepland: "Gepland",
  risico: "Risico",
};

const MATERIAL_TYPE_LABELS: Record<string, string> = {
  text: "Tekst",
  video: "Video",
  audio: "Audio",
  file: "Bestand",
};

function distribution<T>(items: T[], keyOf: (item: T) => string, labelOf: (key: string) => string): ProfileChartSegment[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([key, value]) => ({ label: labelOf(key), value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Compacte, rol-afhankelijke profielsamenvatting voor het accountmenu.
 * Elke rol krijgt bewust maximaal drie cijfers plus één klein diagram, binnen
 * het bereik dat die rol mag zien: instituutsrollen werken cross-tenant,
 * school_leider/docent zien alleen hun eigen school. Schoolleiders krijgen
 * geaggregeerde cijfers, geen ruwe observatiedata (zie `canViewRawObservations`).
 */
export function getProfileSummary(context: SessionContext): ProfileSummary {
  const role = context.user.role;
  const scope = isInstituteStaff(role) ? "Alle scholen (instituut)" : context.tenant.name;
  const schoolCount = tenants.filter((tenant) => tenant.id !== "instituut").length;

  switch (role) {
    case "coach": {
      const visibleProjects = getVisibleProjects(context);
      const activeProjects = visibleProjects.filter((project) => project.status === "actief").length;
      const openActions = getVisibleObservations(context).filter((observation) => !observation.aiDraft?.approvedAt).length;
      return {
        scope,
        stats: [
          { label: "Scholen begeleid", value: String(schoolCount), icon: "school" },
          { label: "Actieve trajecten", value: String(activeProjects), icon: "route" },
          { label: "Open acties", value: String(openActions), icon: "alert" },
        ],
        chart: {
          centerValue: String(visibleProjects.length),
          centerLabel: "trajecten",
          segments: distribution(visibleProjects, (project) => project.status, (key) => STATUS_LABELS[key] ?? key),
        },
      };
    }
    case "school_leider": {
      const metrics = getSchoolLeaderMetrics(context);
      const tenantObservations = observations.filter((observation) => observation.tenantId === context.user.tenantId).length;
      const readyReports = getVisibleReports(context).filter((report) => report.status === "ready").length;
      const phases = getPhaseDistribution(context);
      const totalScored = phases.reduce((sum, phase) => sum + phase.value, 0);
      const strong = phases
        .filter((phase) => phase.label === "Stevig zichtbaar" || phase.label === "Voorbeeldpraktijk")
        .reduce((sum, phase) => sum + phase.value, 0);
      const strongPct = totalScored ? Math.round((strong / totalScored) * 100) : 0;
      return {
        scope,
        stats: [
          { label: "Gem. leskwaliteit", value: metrics[0]?.value ?? "—", icon: "gauge" },
          { label: "Observaties", value: String(tenantObservations), icon: "eye" },
          { label: "Rapporten klaar", value: String(readyReports), icon: "fileCheck" },
        ],
        chart: {
          centerValue: `${strongPct}%`,
          centerLabel: "stevig+",
          segments: phases,
        },
      };
    }
    case "docent": {
      const visibleMaterials = getVisibleMaterials(context);
      const ownMaterials = visibleMaterials.filter((material) => material.ownerId === context.user.id);
      const myProjects = getVisibleProjects(context).filter((project) => project.participants.includes(context.user.id)).length;
      return {
        scope,
        stats: [
          { label: "Mijn lesmateriaal", value: String(ownMaterials.length), icon: "fileText" },
          { label: "Mijn trajecten", value: String(myProjects), icon: "route" },
          { label: "Materiaal beschikbaar", value: String(visibleMaterials.length), icon: "layers" },
        ],
        chart: {
          centerValue: String(visibleMaterials.length),
          centerLabel: "materiaal",
          segments: distribution(visibleMaterials, (material) => material.type, (key) => MATERIAL_TYPE_LABELS[key] ?? key),
        },
      };
    }
    case "admin": {
      const tenantUsers = getTenantUsers(context);
      const openInvitations = invitations.filter((invitation) => invitation.status === "sent").length;
      return {
        scope,
        stats: [
          { label: "Omgevingen", value: String(tenants.length), icon: "building" },
          { label: "Gebruikers", value: String(tenantUsers.length), icon: "users" },
          { label: "Open uitnodigingen", value: String(openInvitations), icon: "mail" },
        ],
        chart: {
          centerValue: String(tenantUsers.length),
          centerLabel: "gebruikers",
          segments: distribution(tenantUsers, (user) => user.role, (key) => roleLabels[key as Role] ?? key),
        },
      };
    }
    case "planner": {
      const visibleProjects = getVisibleProjects(context);
      const activeProjects = visibleProjects.filter((project) => project.status === "actief").length;
      const plannedProjects = visibleProjects.filter((project) => project.status === "gepland").length;
      return {
        scope,
        stats: [
          { label: "Scholen", value: String(schoolCount), icon: "school" },
          { label: "Actieve trajecten", value: String(activeProjects), icon: "route" },
          { label: "Geplande inzet", value: String(plannedProjects), icon: "calendar" },
        ],
        chart: {
          centerValue: String(visibleProjects.length),
          centerLabel: "trajecten",
          segments: distribution(visibleProjects, (project) => project.status, (key) => STATUS_LABELS[key] ?? key),
        },
      };
    }
    default:
      return { scope, stats: [] };
  }
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
