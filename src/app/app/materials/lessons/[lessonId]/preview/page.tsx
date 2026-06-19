"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import type { Lesson } from "@/lib/lessons/types";
import { getLesson } from "@/lib/lessons/store";
import { PreviewToggle, type PreviewDevice } from "@/components/lessons/PreviewToggle";
import { StudentLessonView } from "@/components/lessons/StudentLessonView";
import { Card } from "@/components/ui/Card";

export default function LessonPreviewPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const { context } = useRequireSession();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!context) return;
    let active = true;
    void getLesson(context.user.tenantId, lessonId).then((found) => {
      if (!active) return;
      setLesson(found);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [context, lessonId]);

  if (!context) return null;

  return (
    <div className="page page--wide">
      <div className="preview-stage-bar no-print">
        <Link href={`/app/materials/lessons/${lessonId}`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} aria-hidden /> Terug naar editor
        </Link>
        <PreviewToggle device={device} onChange={setDevice} />
      </div>
      {loading ? (
        <Card>Voorbeeld laden…</Card>
      ) : lesson ? (
        <div className={`device-frame device-frame--${device}`}>
          <StudentLessonView lesson={lesson} />
        </div>
      ) : (
        <Card>
          <h2>Les niet gevonden</h2>
        </Card>
      )}
    </div>
  );
}
