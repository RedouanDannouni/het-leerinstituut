"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { newId } from "@/lib/lessons/blocks";
import type { TenantId } from "@/lib/domain/types";
import { migratePath } from "./migrations";
import {
  PATH_SCHEMA_VERSION,
  type AudienceKind,
  type DurationUnit,
  type LearningPath,
  type PathAssignment,
  type PathBundle,
  type PathItem,
  type PathItemKind,
  type Sequencing,
  type Stage,
  type Tag,
  type ThumbnailKind,
} from "./types";

/* ------------------------------------------------------------------ */
/* Backend-detectie: echte Supabase-sessie of demo (localStorage)      */
/* ------------------------------------------------------------------ */

let cachedUseDb: boolean | null = null;

async function useDb(): Promise<boolean> {
  if (cachedUseDb !== null) return cachedUseDb;
  if (typeof window === "undefined") return false;
  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    cachedUseDb = Boolean(data.session?.user);
  } catch {
    cachedUseDb = false;
  }
  return cachedUseDb;
}

/* ------------------------------------------------------------------ */
/* localStorage-backend                                                */
/* ------------------------------------------------------------------ */

const lsKeys = {
  tags: (t: string) => `hli.tags.${t}`,
  paths: (t: string) => `hli.paths.${t}`,
  stages: (t: string) => `hli.stages.${t}`,
  items: (t: string) => `hli.path-items.${t}`,
  assignments: (t: string) => `hli.path-assignments.${t}`,
};

function lsRead<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}
function lsWrite<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/* ------------------------------------------------------------------ */
/* DB-rij <-> domeintype                                               */
/* ------------------------------------------------------------------ */

type PathRow = {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: string;
  duration_amount: number | null;
  duration_unit: string | null;
  trainer_id: string | null;
  language: string;
  sequencing: string;
  thumbnail_kind: string | null;
  thumbnail_asset_id: string | null;
  thumbnail_value: string | null;
  schema_version: number;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function rowToPath(row: PathRow, tagIds: string[]): LearningPath {
  return migratePath({
    id: row.id,
    tenantId: row.tenant_id as TenantId,
    title: row.title,
    description: row.description ?? "",
    status: row.status === "published" ? "published" : "draft",
    durationAmount: row.duration_amount,
    durationUnit: (row.duration_unit as DurationUnit | null) ?? null,
    trainerId: row.trainer_id,
    language: row.language ?? "nl",
    sequencing: (row.sequencing as Sequencing) ?? "free",
    thumbnailKind: (row.thumbnail_kind as ThumbnailKind | null) ?? null,
    thumbnailAssetId: row.thumbnail_asset_id,
    thumbnailValue: row.thumbnail_value,
    tagIds,
    schemaVersion: row.schema_version ?? 1,
    position: row.position ?? 0,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function pathToRow(path: LearningPath) {
  return {
    title: path.title,
    description: path.description,
    status: path.status,
    duration_amount: path.durationAmount,
    duration_unit: path.durationUnit,
    trainer_id: path.trainerId,
    language: path.language,
    sequencing: path.sequencing,
    thumbnail_kind: path.thumbnailKind,
    thumbnail_asset_id: path.thumbnailAssetId,
    thumbnail_value: path.thumbnailValue,
    schema_version: path.schemaVersion,
    position: path.position,
  };
}

/* ------------------------------------------------------------------ */
/* Tags                                                                */
/* ------------------------------------------------------------------ */

export async function listTags(tenantId: TenantId): Promise<Tag[]> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("tags").select("*").order("label");
    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id as TenantId,
        label: row.label,
        color: row.color,
        createdAt: row.created_at,
      }));
    }
  }
  return lsRead<Tag>(lsKeys.tags(tenantId)).sort((a, b) => a.label.localeCompare(b.label));
}

/** Maakt een tag aan of geeft de bestaande terug (dedupe op tenant + label). */
export async function createTag(tenantId: TenantId, label: string, color?: string): Promise<Tag> {
  const trimmed = label.trim();
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data: existing } = await supabase.from("tags").select("*").eq("label", trimmed).maybeSingle();
    if (existing) {
      return { id: existing.id, tenantId: existing.tenant_id as TenantId, label: existing.label, color: existing.color, createdAt: existing.created_at };
    }
    const { data, error } = await supabase
      .from("tags")
      .insert({ tenant_id: tenantId, label: trimmed, color: color ?? null })
      .select("*")
      .single();
    if (!error && data) {
      return { id: data.id, tenantId: data.tenant_id as TenantId, label: data.label, color: data.color, createdAt: data.created_at };
    }
  }
  const tags = lsRead<Tag>(lsKeys.tags(tenantId));
  const existing = tags.find((t) => t.label.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  const tag: Tag = {
    id: newId("tag"),
    tenantId,
    label: trimmed,
    color: color ?? null,
    createdAt: new Date().toISOString(),
  };
  lsWrite(lsKeys.tags(tenantId), [...tags, tag]);
  return tag;
}

/* ------------------------------------------------------------------ */
/* Leerpaden                                                           */
/* ------------------------------------------------------------------ */

async function fetchTagIds(pathIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (!pathIds.length) return map;
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("learning_path_tags").select("path_id, tag_id").in("path_id", pathIds);
  for (const row of data ?? []) {
    const list = map.get(row.path_id) ?? [];
    list.push(row.tag_id);
    map.set(row.path_id, list);
  }
  return map;
}

export async function listPaths(tenantId: TenantId): Promise<LearningPath[]> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("learning_paths").select("*").order("position");
    if (!error && data) {
      const tagMap = await fetchTagIds(data.map((r) => r.id));
      return (data as PathRow[]).map((row) => rowToPath(row, tagMap.get(row.id) ?? []));
    }
  }
  return lsRead<LearningPath>(lsKeys.paths(tenantId))
    .map(migratePath)
    .sort((a, b) => a.position - b.position);
}

export async function getPathBundle(tenantId: TenantId, pathId: string): Promise<PathBundle | null> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data: pathRow, error } = await supabase.from("learning_paths").select("*").eq("id", pathId).maybeSingle();
    if (!error && pathRow) {
      const tagMap = await fetchTagIds([pathId]);
      const [{ data: stageRows }, { data: itemRows }] = await Promise.all([
        supabase.from("stages").select("*").eq("path_id", pathId).order("position"),
        supabase.from("path_items").select("*").eq("path_id", pathId).order("position"),
      ]);
      return {
        path: rowToPath(pathRow as PathRow, tagMap.get(pathId) ?? []),
        stages: (stageRows ?? []).map(rowToStage),
        items: (itemRows ?? []).map(rowToItem),
      };
    }
  }
  const path = lsRead<LearningPath>(lsKeys.paths(tenantId)).find((p) => p.id === pathId);
  if (!path) return null;
  const stages = lsRead<Stage>(lsKeys.stages(tenantId))
    .filter((s) => s.pathId === pathId)
    .sort((a, b) => a.position - b.position);
  const items = lsRead<PathItem>(lsKeys.items(tenantId))
    .filter((i) => i.pathId === pathId)
    .sort((a, b) => a.position - b.position);
  return { path: migratePath(path), stages, items };
}

export async function createPath(tenantId: TenantId, input: { title: string }): Promise<LearningPath> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("learning_paths")
      .insert({ tenant_id: tenantId, title: input.title, created_by: userData.user?.id ?? null, schema_version: PATH_SCHEMA_VERSION })
      .select("*")
      .single();
    if (!error && data) return rowToPath(data as PathRow, []);
  }
  const paths = lsRead<LearningPath>(lsKeys.paths(tenantId));
  const path: LearningPath = {
    id: newId("path"),
    tenantId,
    title: input.title,
    description: "",
    status: "draft",
    durationAmount: null,
    durationUnit: null,
    trainerId: null,
    language: "nl",
    sequencing: "free",
    thumbnailKind: null,
    thumbnailAssetId: null,
    thumbnailValue: null,
    tagIds: [],
    schemaVersion: PATH_SCHEMA_VERSION,
    position: paths.length,
    createdBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  lsWrite(lsKeys.paths(tenantId), [...paths, path]);
  return path;
}

export async function updatePathMeta(path: LearningPath): Promise<void> {
  const updated = { ...path, updatedAt: new Date().toISOString() };
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("learning_paths").update({ ...pathToRow(updated), updated_at: updated.updatedAt }).eq("id", updated.id);
    if (!error) {
      await syncPathTags(updated.id, updated.tagIds);
      return;
    }
  }
  const paths = lsRead<LearningPath>(lsKeys.paths(path.tenantId));
  const exists = paths.some((p) => p.id === path.id);
  lsWrite(
    lsKeys.paths(path.tenantId),
    exists ? paths.map((p) => (p.id === path.id ? updated : p)) : [...paths, updated],
  );
}

async function syncPathTags(pathId: string, tagIds: string[]): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.from("learning_path_tags").delete().eq("path_id", pathId);
  if (tagIds.length) {
    await supabase.from("learning_path_tags").insert(tagIds.map((tagId) => ({ path_id: pathId, tag_id: tagId })));
  }
}

export async function reorderPaths(tenantId: TenantId, ordered: LearningPath[]): Promise<void> {
  const withPos = ordered.map((p, index) => ({ ...p, position: index }));
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await Promise.all(withPos.map((p) => supabase.from("learning_paths").update({ position: p.position }).eq("id", p.id)));
    return;
  }
  const all = lsRead<LearningPath>(lsKeys.paths(tenantId));
  const map = new Map(withPos.map((p) => [p.id, p]));
  lsWrite(lsKeys.paths(tenantId), all.map((p) => map.get(p.id) ?? p));
}

export async function deletePath(tenantId: TenantId, pathId: string): Promise<void> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("learning_paths").delete().eq("id", pathId);
    return;
  }
  lsWrite(lsKeys.paths(tenantId), lsRead<LearningPath>(lsKeys.paths(tenantId)).filter((p) => p.id !== pathId));
  lsWrite(lsKeys.stages(tenantId), lsRead<Stage>(lsKeys.stages(tenantId)).filter((s) => s.pathId !== pathId));
  lsWrite(lsKeys.items(tenantId), lsRead<PathItem>(lsKeys.items(tenantId)).filter((i) => i.pathId !== pathId));
}

/* ------------------------------------------------------------------ */
/* Stages                                                              */
/* ------------------------------------------------------------------ */

function rowToStage(row: { id: string; tenant_id: string; path_id: string; title: string; position: number }): Stage {
  return { id: row.id, tenantId: row.tenant_id as TenantId, pathId: row.path_id, title: row.title, position: row.position };
}

export async function addStage(tenantId: TenantId, pathId: string, title: string, position: number): Promise<Stage> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("stages")
      .insert({ tenant_id: tenantId, path_id: pathId, title, position })
      .select("*")
      .single();
    if (!error && data) return rowToStage(data);
  }
  const stage: Stage = { id: newId("stage"), tenantId, pathId, title, position };
  lsWrite(lsKeys.stages(tenantId), [...lsRead<Stage>(lsKeys.stages(tenantId)), stage]);
  return stage;
}

export async function updateStage(stage: Stage): Promise<void> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("stages").update({ title: stage.title, position: stage.position }).eq("id", stage.id);
    if (!error) return;
  }
  lsWrite(lsKeys.stages(stage.tenantId), lsRead<Stage>(lsKeys.stages(stage.tenantId)).map((s) => (s.id === stage.id ? stage : s)));
}

export async function reorderStages(tenantId: TenantId, ordered: Stage[]): Promise<void> {
  const withPos = ordered.map((s, index) => ({ ...s, position: index }));
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await Promise.all(withPos.map((s) => supabase.from("stages").update({ position: s.position }).eq("id", s.id)));
    return;
  }
  const all = lsRead<Stage>(lsKeys.stages(tenantId));
  const map = new Map(withPos.map((s) => [s.id, s]));
  lsWrite(lsKeys.stages(tenantId), all.map((s) => map.get(s.id) ?? s));
}

export async function removeStage(tenantId: TenantId, stageId: string): Promise<void> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("stages").delete().eq("id", stageId);
    return;
  }
  lsWrite(lsKeys.stages(tenantId), lsRead<Stage>(lsKeys.stages(tenantId)).filter((s) => s.id !== stageId));
  // Items in deze stage worden losgekoppeld (stage_id = null), niet verwijderd.
  lsWrite(
    lsKeys.items(tenantId),
    lsRead<PathItem>(lsKeys.items(tenantId)).map((i) => (i.stageId === stageId ? { ...i, stageId: null } : i)),
  );
}

/* ------------------------------------------------------------------ */
/* Path items                                                          */
/* ------------------------------------------------------------------ */

function rowToItem(row: {
  id: string;
  tenant_id: string;
  path_id: string;
  stage_id: string | null;
  item_kind: string;
  lesson_id: string | null;
  module_id: string | null;
  position: number;
}): PathItem {
  return {
    id: row.id,
    tenantId: row.tenant_id as TenantId,
    pathId: row.path_id,
    stageId: row.stage_id,
    itemKind: row.item_kind as PathItemKind,
    lessonId: row.lesson_id,
    moduleId: row.module_id,
    position: row.position,
  };
}

export async function addPathItem(
  tenantId: TenantId,
  input: { pathId: string; stageId?: string | null; itemKind: PathItemKind; lessonId?: string | null; moduleId?: string | null; position: number },
): Promise<PathItem> {
  const payload = {
    tenant_id: tenantId,
    path_id: input.pathId,
    stage_id: input.stageId ?? null,
    item_kind: input.itemKind,
    lesson_id: input.itemKind === "lesson" ? input.lessonId ?? null : null,
    module_id: input.itemKind === "module" ? input.moduleId ?? null : null,
    position: input.position,
  };
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("path_items").insert(payload).select("*").single();
    if (!error && data) return rowToItem(data);
  }
  const item: PathItem = {
    id: newId("item"),
    tenantId,
    pathId: input.pathId,
    stageId: input.stageId ?? null,
    itemKind: input.itemKind,
    lessonId: payload.lesson_id,
    moduleId: payload.module_id,
    position: input.position,
  };
  lsWrite(lsKeys.items(tenantId), [...lsRead<PathItem>(lsKeys.items(tenantId)), item]);
  return item;
}

export async function reorderItems(tenantId: TenantId, ordered: PathItem[]): Promise<void> {
  const withPos = ordered.map((i, index) => ({ ...i, position: index }));
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await Promise.all(
      withPos.map((i) => supabase.from("path_items").update({ position: i.position, stage_id: i.stageId }).eq("id", i.id)),
    );
    return;
  }
  const all = lsRead<PathItem>(lsKeys.items(tenantId));
  const map = new Map(withPos.map((i) => [i.id, i]));
  lsWrite(lsKeys.items(tenantId), all.map((i) => map.get(i.id) ?? i));
}

export async function removePathItem(tenantId: TenantId, itemId: string): Promise<void> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("path_items").delete().eq("id", itemId);
    return;
  }
  lsWrite(lsKeys.items(tenantId), lsRead<PathItem>(lsKeys.items(tenantId)).filter((i) => i.id !== itemId));
}

/* ------------------------------------------------------------------ */
/* Toewijzingen (wizard stap 3)                                        */
/* ------------------------------------------------------------------ */

function rowToAssignment(row: {
  id: string;
  tenant_id: string;
  path_id: string;
  audience_kind: string;
  user_id: string | null;
  group_id: string | null;
  due_at: string | null;
  assigned_by: string | null;
  assigned_at: string;
}): PathAssignment {
  return {
    id: row.id,
    tenantId: row.tenant_id as TenantId,
    pathId: row.path_id,
    audienceKind: row.audience_kind as AudienceKind,
    userId: row.user_id,
    groupId: row.group_id,
    dueAt: row.due_at,
    assignedBy: row.assigned_by,
    assignedAt: row.assigned_at,
  };
}

export async function listAssignments(tenantId: TenantId, pathId: string): Promise<PathAssignment[]> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("path_assignments").select("*").eq("path_id", pathId);
    if (!error && data) return data.map(rowToAssignment);
  }
  return lsRead<PathAssignment>(lsKeys.assignments(tenantId)).filter((a) => a.pathId === pathId);
}

export async function assignUser(tenantId: TenantId, pathId: string, userId: string, dueAt: string | null): Promise<PathAssignment> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("path_assignments")
      .insert({ tenant_id: tenantId, path_id: pathId, audience_kind: "user", user_id: userId, due_at: dueAt, assigned_by: userData.user?.id ?? null })
      .select("*")
      .single();
    if (!error && data) return rowToAssignment(data);
  }
  const assignment: PathAssignment = {
    id: newId("assign"),
    tenantId,
    pathId,
    audienceKind: "user",
    userId,
    groupId: null,
    dueAt,
    assignedBy: null,
    assignedAt: new Date().toISOString(),
  };
  lsWrite(lsKeys.assignments(tenantId), [...lsRead<PathAssignment>(lsKeys.assignments(tenantId)), assignment]);
  return assignment;
}

export async function removeAssignment(tenantId: TenantId, assignmentId: string): Promise<void> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("path_assignments").delete().eq("id", assignmentId);
    return;
  }
  lsWrite(lsKeys.assignments(tenantId), lsRead<PathAssignment>(lsKeys.assignments(tenantId)).filter((a) => a.id !== assignmentId));
}
