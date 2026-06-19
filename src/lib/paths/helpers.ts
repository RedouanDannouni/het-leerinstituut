import type { Lesson, Module } from "@/lib/lessons/types";
import { DURATION_UNIT_LABELS, type LearningPath, type PathBundle, type PathItem } from "./types";

export function itemTitle(item: PathItem, lessons: Lesson[], modules: Module[]): string {
  if (item.itemKind === "lesson") {
    return lessons.find((l) => l.id === item.lessonId)?.title || "Naamloze les";
  }
  return modules.find((m) => m.id === item.moduleId)?.title || "Naamloze module";
}

/** Aantal "hoofdstukken": blokken bij een les, of lessen bij een module. */
export function itemChapterCount(item: PathItem, lessons: Lesson[]): number {
  if (item.itemKind === "lesson") {
    return lessons.find((l) => l.id === item.lessonId)?.blocks.length ?? 0;
  }
  return lessons.filter((l) => l.moduleId === item.moduleId).length;
}

export function itemUpdatedAt(item: PathItem, lessons: Lesson[], modules: Module[]): string | null {
  if (item.itemKind === "lesson") {
    return lessons.find((l) => l.id === item.lessonId)?.updatedAt ?? null;
  }
  return modules.find((m) => m.id === item.moduleId)?.updatedAt ?? null;
}

export function formatDuration(path: LearningPath): string | null {
  if (!path.durationAmount || !path.durationUnit) return null;
  return `${path.durationAmount} ${DURATION_UNIT_LABELS[path.durationUnit]}`;
}

/**
 * Lineaire lijst van les-id's zoals een docent ze doorloopt: items op volgorde,
 * modules uitgeklapt naar hun (eveneens geordende) lessen. Basis voor gating en
 * voortgangsberekening.
 */
export function flattenPathLessons(bundle: PathBundle, lessons: Lesson[]): string[] {
  const ordered = orderedItems(bundle);
  const result: string[] = [];
  for (const item of ordered) {
    if (item.itemKind === "lesson" && item.lessonId) {
      result.push(item.lessonId);
    } else if (item.itemKind === "module" && item.moduleId) {
      lessons
        .filter((l) => l.moduleId === item.moduleId)
        .sort((a, b) => a.position - b.position)
        .forEach((l) => result.push(l.id));
    }
  }
  return result;
}

/** Items in stage-volgorde, dan op item-positie (items zonder stage eerst). */
export function orderedItems(bundle: PathBundle): PathItem[] {
  const stageOrder = new Map(bundle.stages.map((s) => [s.id, s.position]));
  return [...bundle.items].sort((a, b) => {
    const sa = a.stageId ? stageOrder.get(a.stageId) ?? 0 : -1;
    const sb = b.stageId ? stageOrder.get(b.stageId) ?? 0 : -1;
    if (sa !== sb) return sa - sb;
    return a.position - b.position;
  });
}
