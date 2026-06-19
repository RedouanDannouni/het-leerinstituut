import type { Lesson, Module } from "@/lib/lessons/types";
import { validateLessonForPublish } from "@/lib/lessons/block-validate";
import type { PathBundle } from "./types";

export interface PathValidation {
  ok: boolean;
  /** Algemene leerpad-fouten. */
  general: string[];
  /** Fouten per onderliggende les (les-id -> meldingen), incl. a11y-poort. */
  byLesson: Record<string, string[]>;
}

export interface PathValidationInput {
  bundle: PathBundle;
  lessons: Lesson[];
  modules: Module[];
}

/**
 * Publiceer-poort op leerpad-niveau. Aggregeert:
 *  - minimaal 1 item;
 *  - titel + thumbnail aanwezig;
 *  - elke gerefereerde les/module is gepubliceerd;
 *  - sequential: geen dubbele posities;
 *  - de a11y-poort erft door: een onderliggende les met blok-fouten blokkeert.
 */
export function validatePathForPublish({ bundle, lessons, modules }: PathValidationInput): PathValidation {
  const { path, items } = bundle;
  const general: string[] = [];
  const byLesson: Record<string, string[]> = {};

  if (!path.title.trim()) general.push("Geef het leerpad een titel.");
  if (!path.thumbnailKind) general.push("Kies een thumbnail voor het leerpad.");
  if (!items.length) general.push("Voeg minstens één onderdeel toe aan het leerpad.");

  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const moduleById = new Map(modules.map((m) => [m.id, m]));

  // Verzamel alle lessen die via het leerpad worden ontsloten (modules uitgeklapt).
  const lessonIds = new Set<string>();
  for (const item of items) {
    if (item.itemKind === "lesson" && item.lessonId) {
      lessonIds.add(item.lessonId);
    } else if (item.itemKind === "module" && item.moduleId) {
      const mod = moduleById.get(item.moduleId);
      const moduleLessons = lessons.filter((l) => l.moduleId === item.moduleId);
      if (!mod) {
        general.push("Een gekoppelde module bestaat niet meer.");
      } else if (!moduleLessons.length) {
        general.push(`Module "${mod.title}" bevat nog geen lessen.`);
      }
      moduleLessons.forEach((l) => lessonIds.add(l.id));
    }
  }

  for (const lessonId of lessonIds) {
    const lesson = lessonById.get(lessonId);
    if (!lesson) {
      general.push("Een gekoppelde les bestaat niet meer.");
      continue;
    }
    const errors: string[] = [];
    if (lesson.status !== "published") {
      errors.push(`Les "${lesson.title || "naamloos"}" is nog niet gepubliceerd.`);
    }
    const lessonValidation = validateLessonForPublish(lesson);
    if (!lessonValidation.ok) {
      errors.push(...lessonValidation.general);
      for (const blockErrors of Object.values(lessonValidation.byBlock)) {
        errors.push(...blockErrors);
      }
    }
    if (errors.length) byLesson[lessonId] = errors;
  }

  if (path.sequencing === "sequential") {
    const positions = items.map((i) => i.position);
    if (new Set(positions).size !== positions.length) {
      general.push("Sequentiële volgorde vereist unieke posities voor alle onderdelen.");
    }
  }

  const ok = general.length === 0 && Object.keys(byLesson).length === 0;
  return { ok, general, byLesson };
}

export function countPathIssues(validation: PathValidation): number {
  return validation.general.length + Object.values(validation.byLesson).reduce((sum, list) => sum + list.length, 0);
}
