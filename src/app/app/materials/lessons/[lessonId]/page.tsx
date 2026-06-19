"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import type { Lesson, Module } from "@/lib/lessons/types";
import { getLesson, listLessons, listModules } from "@/lib/lessons/store";
import { LessonEditor } from "@/components/lessons/LessonEditor";
import { Card } from "@/components/ui/Card";

export default function LessonEditorPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const { context } = useRequireSession();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (!context) return;
    let active = true;
    const tenantId = context.user.tenantId;
    void Promise.all([getLesson(tenantId, lessonId), listModules(tenantId), listLessons(tenantId)]).then(
      ([found, mods, less]) => {
        if (!active) return;
        if (!found) {
          setState("missing");
          return;
        }
        setLesson(found);
        setModules(mods);
        setLessons(less);
        setState("ready");
      },
    );
    return () => {
      active = false;
    };
  }, [context, lessonId]);

  if (!context) return null;
  if (!can(context.user.role, "edit:lessons")) notFound();

  return (
    <div className="page page--wide">
      {state === "loading" ? (
        <Card>Les laden…</Card>
      ) : state === "missing" || !lesson ? (
        <Card>
          <h2>Les niet gevonden</h2>
          <p className="muted">Deze les bestaat niet of valt buiten jouw omgeving.</p>
        </Card>
      ) : (
        <LessonEditor initialLesson={lesson} context={context} modules={modules} lessons={lessons} />
      )}
    </div>
  );
}
