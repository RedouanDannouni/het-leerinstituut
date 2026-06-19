import type { Lesson } from "./types";

function draftKey(lessonId: string) {
  return `hli.lesson-draft.${lessonId}`;
}

/** Lokale back-up van de les (crash-recovery), naast de Supabase-opslag. */
export function saveLessonDraft(lesson: Lesson) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(draftKey(lesson.id), JSON.stringify({ savedAt: new Date().toISOString(), lesson }));
}

export function readLessonDraft(lessonId: string): { savedAt: string; lesson: Lesson } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(draftKey(lessonId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { savedAt: string; lesson: Lesson };
  } catch {
    return null;
  }
}

export function clearLessonDraft(lessonId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftKey(lessonId));
}
