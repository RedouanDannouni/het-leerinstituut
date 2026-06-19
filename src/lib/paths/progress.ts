/**
 * Voortgang wordt afgeleid uit de voltooide lessen (geen aparte path_progress-
 * tabel). In de DB-omgeving leeft dit in lesson_progress; voor de preview/demo
 * houden we een lichte localStorage-spiegel bij, gesleuteld per gebruiker.
 */

function key(userId: string): string {
  return `hli.lesson-progress.${userId}`;
}

export function getCompletedLessons(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(key(userId)) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function setLessonCompleted(userId: string, lessonId: string, completed: boolean): Set<string> {
  const set = getCompletedLessons(userId);
  if (completed) set.add(lessonId);
  else set.delete(lessonId);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key(userId), JSON.stringify([...set]));
  }
  return set;
}

export interface PathProgress {
  total: number;
  completed: number;
  ratio: number;
}

export function computePathProgress(lessonIds: string[], completed: Set<string>): PathProgress {
  const total = lessonIds.length;
  const done = lessonIds.filter((id) => completed.has(id)).length;
  return { total, completed: done, ratio: total === 0 ? 0 : done / total };
}
