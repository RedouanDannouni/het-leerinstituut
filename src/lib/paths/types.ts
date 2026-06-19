import type { TenantId } from "@/lib/domain/types";

export const PATH_SCHEMA_VERSION = 1;

export type Sequencing = "sequential" | "free";
export type PathStatus = "draft" | "published";
export type DurationUnit = "days" | "weeks" | "months";
export type ThumbnailKind = "asset" | "solid" | "illustration";
export type PathItemKind = "lesson" | "module";
export type AudienceKind = "user" | "group";

export interface Tag {
  id: string;
  tenantId: TenantId;
  label: string;
  color: string | null;
  createdAt: string;
}

export interface LearningPath {
  id: string;
  tenantId: TenantId;
  title: string;
  description: string;
  status: PathStatus;
  durationAmount: number | null;
  durationUnit: DurationUnit | null;
  trainerId: string | null;
  language: string;
  sequencing: Sequencing;
  thumbnailKind: ThumbnailKind | null;
  thumbnailAssetId: string | null;
  thumbnailValue: string | null;
  tagIds: string[];
  schemaVersion: number;
  position: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  tenantId: TenantId;
  pathId: string;
  title: string;
  position: number;
}

export interface PathItem {
  id: string;
  tenantId: TenantId;
  pathId: string;
  stageId: string | null;
  itemKind: PathItemKind;
  lessonId: string | null;
  moduleId: string | null;
  position: number;
}

export interface PathAssignment {
  id: string;
  tenantId: TenantId;
  pathId: string;
  audienceKind: AudienceKind;
  userId: string | null;
  groupId: string | null;
  dueAt: string | null;
  assignedBy: string | null;
  assignedAt: string;
}

/** Volledig leerpad met geneste structuur (lees-aggregaat). */
export interface PathBundle {
  path: LearningPath;
  stages: Stage[];
  items: PathItem[];
}

export const DURATION_UNIT_LABELS: Record<DurationUnit, string> = {
  days: "dagen",
  weeks: "weken",
  months: "maanden",
};

/** Huisstijl-palet voor solid-color thumbnails. */
export const SOLID_THUMBNAILS: { value: string; label: string }[] = [
  { value: "#1f6feb", label: "Blauw" },
  { value: "#0e9f6e", label: "Groen" },
  { value: "#7c3aed", label: "Paars" },
  { value: "#f59e0b", label: "Oker" },
  { value: "#ef4444", label: "Rood" },
  { value: "#0f172a", label: "Nacht" },
];

/** Kant-en-klare huisstijl-illustraties (key -> presentatie). */
export const ILLUSTRATION_THUMBNAILS: { key: string; label: string; gradient: string }[] = [
  { key: "studie", label: "Studie", gradient: "linear-gradient(135deg, #1f6feb, #7c3aed)" },
  { key: "groei", label: "Groei", gradient: "linear-gradient(135deg, #0e9f6e, #1f6feb)" },
  { key: "samen", label: "Samenwerken", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  { key: "reflectie", label: "Reflectie", gradient: "linear-gradient(135deg, #7c3aed, #0f172a)" },
];
