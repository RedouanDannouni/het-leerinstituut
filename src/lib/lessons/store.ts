"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TenantId } from "@/lib/domain/types";
import { ensureCurrentSchema } from "./migrations";
import { newId } from "./blocks";
import { LESSON_SCHEMA_VERSION } from "./types";
import type {
  Asset,
  AssetKind,
  Block,
  Lesson,
  LessonKind,
  LessonVersion,
  Module,
} from "./types";

const LESSON_KINDS: LessonKind[] = ["page", "quiz", "assignment", "wiki"];

function toLessonKind(value: unknown): LessonKind {
  return LESSON_KINDS.includes(value as LessonKind) ? (value as LessonKind) : "page";
}

/* ------------------------------------------------------------------ */
/* Detectie: echte Supabase-sessie of demo (localStorage)             */
/* ------------------------------------------------------------------ */

let cachedUseDb: boolean | null = null;

async function useDb(): Promise<boolean> {
  if (cachedUseDb !== null) return cachedUseDb;
  if (typeof window === "undefined") return false;
  try {
    const supabase = createSupabaseBrowserClient();
    // Race tegen een timeout: als Supabase niet (snel) antwoordt, vallen we
    // terug op de demo-/localStorage-modus i.p.v. eindeloos te blokkeren.
    const session = await Promise.race([
      supabase.auth.getSession().then((result) => result.data.session),
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 3000)),
    ]);
    cachedUseDb = Boolean(session?.user);
  } catch {
    cachedUseDb = false;
  }
  return cachedUseDb;
}

/* ------------------------------------------------------------------ */
/* Mapping DB-rij <-> domeintype                                       */
/* ------------------------------------------------------------------ */

type LessonRow = {
  id: string;
  tenant_id: string;
  module_id: string | null;
  requires_lesson_id: string | null;
  kind?: string | null;
  title: string;
  status: string;
  is_template: boolean;
  learning_objectives: unknown;
  blocks: unknown;
  schema_version: number;
  position: number;
  created_by: string | null;
  updated_at: string;
};

function rowToLesson(row: LessonRow): Lesson {
  const { blocks } = ensureCurrentSchema(row.blocks, row.schema_version ?? 1);
  return {
    id: row.id,
    tenantId: row.tenant_id as TenantId,
    moduleId: row.module_id,
    requiresLessonId: row.requires_lesson_id,
    kind: toLessonKind(row.kind),
    title: row.title,
    status: row.status === "published" ? "published" : "draft",
    isTemplate: Boolean(row.is_template),
    learningObjectives: Array.isArray(row.learning_objectives) ? (row.learning_objectives as string[]) : [],
    blocks,
    schemaVersion: LESSON_SCHEMA_VERSION,
    position: row.position ?? 0,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
  };
}

/* ------------------------------------------------------------------ */
/* localStorage-backend                                               */
/* ------------------------------------------------------------------ */

const lsKeys = {
  lessons: (t: string) => `hli.lessons.${t}`,
  modules: (t: string) => `hli.modules.${t}`,
  assets: (t: string) => `hli.assets.${t}`,
  versions: (lessonId: string) => `hli.lesson-versions.${lessonId}`,
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

function normalizeLsLesson(lesson: Lesson): Lesson {
  return { ...lesson, kind: toLessonKind(lesson.kind) };
}

/* ------------------------------------------------------------------ */
/* Modules                                                            */
/* ------------------------------------------------------------------ */

export async function listModules(tenantId: TenantId): Promise<Module[]> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("modules").select("*").order("position");
    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id as TenantId,
        courseId: row.course_id,
        title: row.title,
        summary: row.summary,
        category: row.category ?? "",
        coverUrl: row.cover_url,
        position: row.position,
        updatedAt: row.updated_at,
      }));
    }
  }
  return lsRead<Module>(lsKeys.modules(tenantId)).sort((a, b) => a.position - b.position);
}

export async function createModule(tenantId: TenantId, title: string): Promise<Module> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("modules")
      .insert({ tenant_id: tenantId, title })
      .select("*")
      .single();
    if (!error && data) {
      return {
        id: data.id,
        tenantId: data.tenant_id as TenantId,
        courseId: data.course_id,
        title: data.title,
        summary: data.summary,
        category: data.category ?? "",
        coverUrl: data.cover_url,
        position: data.position,
        updatedAt: data.updated_at,
      };
    }
  }
  const modules = lsRead<Module>(lsKeys.modules(tenantId));
  const mod: Module = {
    id: newId("mod"),
    tenantId,
    courseId: null,
    title,
    summary: "",
    category: "",
    coverUrl: null,
    position: modules.length,
    updatedAt: new Date().toISOString(),
  };
  lsWrite(lsKeys.modules(tenantId), [...modules, mod]);
  return mod;
}

export async function updateModule(mod: Module): Promise<void> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("modules")
      .update({
        title: mod.title,
        summary: mod.summary,
        category: mod.category,
        cover_url: mod.coverUrl,
        position: mod.position,
      })
      .eq("id", mod.id);
    if (!error) return;
  }
  const modules = lsRead<Module>(lsKeys.modules(mod.tenantId)).map((m) => (m.id === mod.id ? mod : m));
  lsWrite(lsKeys.modules(mod.tenantId), modules);
}

export async function reorderModules(tenantId: TenantId, ordered: Module[]): Promise<void> {
  const withPos = ordered.map((m, index) => ({ ...m, position: index }));
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await Promise.all(withPos.map((m) => supabase.from("modules").update({ position: m.position }).eq("id", m.id)));
    return;
  }
  lsWrite(lsKeys.modules(tenantId), withPos);
}

export async function deleteModule(tenantId: TenantId, moduleId: string): Promise<void> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("modules").delete().eq("id", moduleId);
    return;
  }
  lsWrite(lsKeys.modules(tenantId), lsRead<Module>(lsKeys.modules(tenantId)).filter((m) => m.id !== moduleId));
}

/* ------------------------------------------------------------------ */
/* Lessen                                                             */
/* ------------------------------------------------------------------ */

export async function listLessons(tenantId: TenantId): Promise<Lesson[]> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("is_template", false)
      .order("position");
    if (!error && data) return (data as LessonRow[]).map(rowToLesson);
  }
  return lsRead<Lesson>(lsKeys.lessons(tenantId))
    .filter((l) => !l.isTemplate)
    .map(normalizeLsLesson)
    .sort((a, b) => a.position - b.position);
}

export async function listTemplates(tenantId: TenantId): Promise<Lesson[]> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("lessons").select("*").eq("is_template", true).order("updated_at");
    if (!error && data) return (data as LessonRow[]).map(rowToLesson);
  }
  return lsRead<Lesson>(lsKeys.lessons(tenantId)).filter((l) => l.isTemplate).map(normalizeLsLesson);
}

export async function getLesson(tenantId: TenantId, lessonId: string): Promise<Lesson | null> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
    if (!error && data) return rowToLesson(data as LessonRow);
  }
  const found = lsRead<Lesson>(lsKeys.lessons(tenantId)).find((l) => l.id === lessonId);
  return found ? normalizeLsLesson(found) : null;
}

export async function createLesson(
  tenantId: TenantId,
  input: { title?: string; moduleId?: string | null; blocks?: Block[]; isTemplate?: boolean; kind?: LessonKind },
): Promise<Lesson> {
  const title = input.title ?? "Naamloze les";
  const kind = input.kind ?? "page";
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        tenant_id: tenantId,
        title,
        kind,
        module_id: input.moduleId ?? null,
        blocks: (input.blocks ?? []) as unknown as never,
        is_template: input.isTemplate ?? false,
        schema_version: LESSON_SCHEMA_VERSION,
        created_by: userData.user?.id ?? null,
      })
      .select("*")
      .single();
    if (!error && data) return rowToLesson(data as LessonRow);
  }
  const lessons = lsRead<Lesson>(lsKeys.lessons(tenantId));
  const lesson: Lesson = {
    id: newId("les"),
    tenantId,
    moduleId: input.moduleId ?? null,
    requiresLessonId: null,
    kind,
    title,
    status: "draft",
    isTemplate: input.isTemplate ?? false,
    learningObjectives: [],
    blocks: input.blocks ?? [],
    schemaVersion: LESSON_SCHEMA_VERSION,
    position: lessons.length,
    createdBy: null,
    updatedAt: new Date().toISOString(),
  };
  lsWrite(lsKeys.lessons(tenantId), [...lessons, lesson]);
  return lesson;
}

export async function saveLesson(lesson: Lesson): Promise<void> {
  const updated = { ...lesson, updatedAt: new Date().toISOString() };
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("lessons")
      .update({
        title: updated.title,
        status: updated.status,
        kind: updated.kind,
        module_id: updated.moduleId,
        requires_lesson_id: updated.requiresLessonId,
        learning_objectives: updated.learningObjectives as unknown as never,
        blocks: updated.blocks as unknown as never,
        schema_version: updated.schemaVersion,
        position: updated.position,
        is_template: updated.isTemplate,
      })
      .eq("id", updated.id);
    if (!error) return;
  }
  const lessons = lsRead<Lesson>(lsKeys.lessons(lesson.tenantId));
  const exists = lessons.some((l) => l.id === lesson.id);
  lsWrite(
    lsKeys.lessons(lesson.tenantId),
    exists ? lessons.map((l) => (l.id === lesson.id ? updated : l)) : [...lessons, updated],
  );
}

export async function reorderLessons(tenantId: TenantId, ordered: Lesson[]): Promise<void> {
  const withPos = ordered.map((l, index) => ({ ...l, position: index }));
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await Promise.all(
      withPos.map((l) => supabase.from("lessons").update({ position: l.position, module_id: l.moduleId }).eq("id", l.id)),
    );
    return;
  }
  const all = lsRead<Lesson>(lsKeys.lessons(tenantId));
  const map = new Map(withPos.map((l) => [l.id, l]));
  lsWrite(lsKeys.lessons(tenantId), all.map((l) => map.get(l.id) ?? l));
}

export async function deleteLesson(tenantId: TenantId, lessonId: string): Promise<void> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("lessons").delete().eq("id", lessonId);
    return;
  }
  lsWrite(lsKeys.lessons(tenantId), lsRead<Lesson>(lsKeys.lessons(tenantId)).filter((l) => l.id !== lessonId));
}

/* ------------------------------------------------------------------ */
/* Versies                                                            */
/* ------------------------------------------------------------------ */

export async function snapshotLesson(lesson: Lesson, label: string): Promise<void> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("lesson_versions").insert({
      tenant_id: lesson.tenantId,
      lesson_id: lesson.id,
      title: lesson.title,
      blocks: lesson.blocks as unknown as never,
      learning_objectives: lesson.learningObjectives as unknown as never,
      schema_version: lesson.schemaVersion,
      label,
      created_by: userData.user?.id ?? null,
    });
    return;
  }
  const versions = lsRead<LessonVersion>(lsKeys.versions(lesson.id));
  versions.unshift({
    id: newId("ver"),
    lessonId: lesson.id,
    title: lesson.title,
    blocks: lesson.blocks,
    learningObjectives: lesson.learningObjectives,
    label,
    createdAt: new Date().toISOString(),
  });
  lsWrite(lsKeys.versions(lesson.id), versions.slice(0, 30));
}

export async function listVersions(lessonId: string): Promise<LessonVersion[]> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("lesson_versions")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        lessonId: row.lesson_id,
        title: row.title,
        blocks: (Array.isArray(row.blocks) ? row.blocks : []) as Block[],
        learningObjectives: (Array.isArray(row.learning_objectives) ? row.learning_objectives : []) as string[],
        label: row.label,
        createdAt: row.created_at,
      }));
    }
  }
  return lsRead<LessonVersion>(lsKeys.versions(lessonId));
}

/* ------------------------------------------------------------------ */
/* Assets (mediabibliotheek + upload)                                 */
/* ------------------------------------------------------------------ */

export async function listAssets(tenantId: TenantId): Promise<Asset[]> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("assets").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id as TenantId,
        kind: row.kind as AssetKind,
        storagePath: row.storage_path,
        url: row.url,
        altText: row.alt_text,
        captionsUrl: row.captions_url,
        title: row.title,
        createdAt: row.created_at,
      }));
    }
  }
  return lsRead<Asset>(lsKeys.assets(tenantId));
}

export async function uploadAsset(
  tenantId: TenantId,
  file: File,
  meta: { kind: AssetKind; altText?: string; title?: string },
): Promise<Asset> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const path = `${tenantId}/${newId("file")}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("lesson-media").upload(path, file, { upsert: false });
    if (!uploadError) {
      const { data: pub } = supabase.storage.from("lesson-media").getPublicUrl(path);
      const { data, error } = await supabase
        .from("assets")
        .insert({
          tenant_id: tenantId,
          kind: meta.kind,
          storage_path: path,
          url: pub.publicUrl,
          alt_text: meta.altText ?? "",
          title: meta.title ?? file.name,
        })
        .select("*")
        .single();
      if (!error && data) {
        return {
          id: data.id,
          tenantId: data.tenant_id as TenantId,
          kind: data.kind as AssetKind,
          storagePath: data.storage_path,
          url: data.url,
          altText: data.alt_text,
          captionsUrl: data.captions_url,
          title: data.title,
          createdAt: data.created_at,
        };
      }
    }
  }
  // Fallback: data-URL in localStorage (demo).
  const dataUrl = await fileToDataUrl(file);
  const asset: Asset = {
    id: newId("asset"),
    tenantId,
    kind: meta.kind,
    storagePath: `local/${file.name}`,
    url: dataUrl,
    altText: meta.altText ?? "",
    captionsUrl: null,
    title: meta.title ?? file.name,
    createdAt: new Date().toISOString(),
  };
  const assets = lsRead<Asset>(lsKeys.assets(tenantId));
  lsWrite(lsKeys.assets(tenantId), [asset, ...assets]);
  return asset;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
