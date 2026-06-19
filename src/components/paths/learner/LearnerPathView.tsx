"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Circle, Clock, Lock } from "lucide-react";
import type { Lesson, Module } from "@/lib/lessons/types";
import { StudentLessonView } from "@/components/lessons/StudentLessonView";
import { formatDuration, orderedItems } from "@/lib/paths/helpers";
import { computePathProgress, getCompletedLessons, setLessonCompleted } from "@/lib/paths/progress";
import type { PathBundle } from "@/lib/paths/types";
import { ThumbnailPreview } from "../ThumbnailPreview";

interface Row {
  lessonId: string;
  stageId: string | null;
  moduleTitle: string | null;
}

export function LearnerPathView({
  bundle,
  lessons,
  modules,
  userId,
}: {
  bundle: PathBundle;
  lessons: Lesson[];
  modules: Module[];
  userId: string;
}) {
  const [completed, setCompleted] = useState<Set<string>>(() => getCompletedLessons(userId));
  const [openId, setOpenId] = useState<string | null>(null);

  const lessonById = useMemo(() => new Map(lessons.map((l) => [l.id, l])), [lessons]);

  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];
    for (const item of orderedItems(bundle)) {
      if (item.itemKind === "lesson" && item.lessonId) {
        result.push({ lessonId: item.lessonId, stageId: item.stageId, moduleTitle: null });
      } else if (item.itemKind === "module" && item.moduleId) {
        const moduleTitle = modules.find((m) => m.id === item.moduleId)?.title ?? "Module";
        lessons
          .filter((l) => l.moduleId === item.moduleId)
          .sort((a, b) => a.position - b.position)
          .forEach((l) => result.push({ lessonId: l.id, stageId: item.stageId, moduleTitle }));
      }
    }
    return result;
  }, [bundle, lessons, modules]);

  const sequential = bundle.path.sequencing === "sequential";
  const progress = computePathProgress(rows.map((r) => r.lessonId), completed);
  const duration = formatDuration(bundle.path);

  const toggleComplete = (lessonId: string) => {
    const next = setLessonCompleted(userId, lessonId, !completed.has(lessonId));
    setCompleted(new Set(next));
  };

  const stageTitle = (stageId: string | null) =>
    stageId ? bundle.stages.find((s) => s.id === stageId)?.title || "Fase" : null;

  let previousStage: string | null | undefined = undefined;

  return (
    <div className="learner-path">
      <header className="learner-path-head">
        <ThumbnailPreview path={bundle.path} className="learner-path-thumb" />
        <div>
          <p className="eyebrow">Leerpad</p>
          <h1>{bundle.path.title || "Naamloos leerpad"}</h1>
          {bundle.path.description ? <p className="muted">{bundle.path.description}</p> : null}
          <div className="cluster" style={{ marginTop: "var(--space-2)" }}>
            {duration ? <span className="path-meta-chip"><Clock size={12} aria-hidden /> {duration}</span> : null}
            <span className="path-meta-chip">{sequential ? "Stap voor stap" : "Vrije volgorde"}</span>
          </div>
          <div className="learner-progress">
            <div className="learner-progress-bar"><span style={{ width: `${Math.round(progress.ratio * 100)}%` }} /></div>
            <span className="muted">{progress.completed} / {progress.total} afgerond</span>
          </div>
        </div>
      </header>

      <div className="learner-rows">
        {rows.map((row, index) => {
          const lesson = lessonById.get(row.lessonId);
          if (!lesson) return null;
          const isDone = completed.has(row.lessonId);
          const lockedBySequence = sequential && rows.slice(0, index).some((r) => !completed.has(r.lessonId));
          const isOpen = openId === row.lessonId;

          const header = stageTitle(row.stageId);
          const showStageHeader = row.stageId !== previousStage;
          previousStage = row.stageId;

          return (
            <div key={row.lessonId}>
              {showStageHeader && header ? <h2 className="learner-stage-title">{header}</h2> : null}
              <div className={`learner-row ${lockedBySequence ? "is-locked" : ""} ${isDone ? "is-done" : ""}`}>
                <span className="learner-row-status" aria-hidden>
                  {lockedBySequence ? <Lock size={16} /> : isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </span>
                <button
                  type="button"
                  className="learner-row-main"
                  disabled={lockedBySequence}
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : row.lessonId)}
                >
                  <span className="learner-row-title">
                    {lesson.title || "Naamloze les"}
                    {row.moduleTitle ? <span className="muted"> · {row.moduleTitle}</span> : null}
                  </span>
                  {!lockedBySequence ? <ChevronDown size={16} aria-hidden className={isOpen ? "is-open" : ""} /> : null}
                </button>
                {lockedBySequence ? (
                  <span className="muted learner-row-hint">Rond eerst het vorige onderdeel af</span>
                ) : (
                  <button
                    type="button"
                    className={`btn btn-sm ${isDone ? "btn-secondary" : "btn-primary"}`}
                    onClick={() => toggleComplete(row.lessonId)}
                  >
                    {isDone ? "Heropenen" : "Markeer als afgerond"}
                  </button>
                )}
              </div>
              {isOpen && !lockedBySequence ? (
                <div className="learner-lesson-body">
                  <StudentLessonView lesson={lesson} />
                </div>
              ) : null}
            </div>
          );
        })}
        {!rows.length ? <p className="muted">Dit leerpad bevat nog geen onderdelen.</p> : null}
      </div>
    </div>
  );
}
