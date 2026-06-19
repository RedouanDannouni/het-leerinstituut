export type Role = "coach" | "school_leider" | "docent" | "admin" | "planner";

export type TenantId = "school-noord" | "school-zuid" | "instituut";

export type Status = "concept" | "open" | "actief" | "afgerond" | "gepland" | "risico";

export interface Tenant {
  id: TenantId;
  name: string;
  region: string;
  status: "active" | "setup" | "paused";
  learnerCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: TenantId;
  avatarInitials: string;
}

export interface SessionContext {
  user: User;
  tenant: Tenant;
}

export interface Project {
  id: string;
  tenantId: TenantId;
  title: string;
  description: string;
  status: Status;
  startDate: string;
  endDate: string;
  participants: string[];
  materialIds: string[];
  observationIds: string[];
}

export type MaterialType = "text" | "video" | "audio" | "file";

export interface LessonMaterial {
  id: string;
  tenantId: TenantId;
  ownerId: string;
  projectId: string;
  title: string;
  type: MaterialType;
  description: string;
  updatedAt: string;
  sharedWithRole: Role[];
}

export interface ObservationCriterion {
  id: string;
  title: string;
  description: string;
  score: number | null;
  note: string;
  evidence: ObservationEvidence[];
}

export interface ObservationEvidence {
  id: string;
  type: "note" | "file" | "photo";
  label: string;
  createdAt: string;
}

export interface AiDraftSummary {
  id: string;
  label: "AI-concept";
  text: string;
  generatedAt: string;
  sourceCriterionIds: string[];
  approvedAt?: string;
  approvedBy?: string;
}

export interface Observation {
  id: string;
  tenantId: TenantId;
  projectId: string;
  teacherId: string;
  observerId: string;
  lessonTitle: string;
  subject: string;
  observedAt: string;
  status: "draft" | "planned" | "completed";
  criteria: ObservationCriterion[];
  aiDraft?: AiDraftSummary;
}

export interface ReportBlock {
  id: string;
  type: "summary" | "kpi" | "trend" | "actions" | "agreements";
  title: string;
  content: string;
}

export interface Report {
  id: string;
  tenantId: TenantId;
  projectId: string;
  title: string;
  status: "draft" | "ready" | "exported";
  templateId: string;
  observationIds: string[];
  blocks: ReportBlock[];
  updatedAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  blocks: ReportBlock["type"][];
}

export interface Invitation {
  id: string;
  token: string;
  tenantId: TenantId;
  email: string;
  role: Role;
  status: "sent" | "accepted";
}

export interface AuditEvent {
  id: string;
  tenantId: TenantId;
  actorId: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface CockpitMetric {
  label: string;
  value: string;
  context: string;
  trend: "up" | "down" | "stable";
}
