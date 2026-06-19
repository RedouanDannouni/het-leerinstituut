import type { Lesson, Module } from "@/lib/lessons/types";

export function lessonCountForModule(moduleId: string, lessons: Lesson[]): number {
  return lessons.filter((lesson) => lesson.moduleId === moduleId).length;
}

/** Placeholder tot echte inschrijvingen beschikbaar zijn — stabiel per module-id. */
export function placeholderStudentCount(moduleId: string): number {
  let hash = 0;
  for (let i = 0; i < moduleId.length; i += 1) {
    hash = (hash * 31 + moduleId.charCodeAt(i)) >>> 0;
  }
  return 40 + (hash % 320);
}

/** Placeholder tot echte duurdata beschikbaar is — gebaseerd op aantal lessen. */
export function placeholderHours(lessonCount: number): number {
  return Math.max(2, lessonCount * 3 + 4);
}

export function shuffleModules(modules: Module[]): Module[] {
  const copy = [...modules];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
