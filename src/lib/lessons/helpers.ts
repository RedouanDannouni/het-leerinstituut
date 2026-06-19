import type { Lesson } from "./types";

export function getLessonTitle(lessons: Lesson[], lessonId: string): string {
  return lessons.find((lesson) => lesson.id === lessonId)?.title ?? "Onbekende les";
}
