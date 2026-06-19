"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import type { Lesson, Module } from "@/lib/lessons/types";
import { listLessons, listModules } from "@/lib/lessons/store";
import { getPathBundle } from "@/lib/paths/store";
import type { PathBundle } from "@/lib/paths/types";
import { LearnerPathView } from "@/components/paths/learner/LearnerPathView";
import { Card } from "@/components/ui/Card";

export default function PathPreviewPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = use(params);
  const { context } = useRequireSession();
  const [bundle, setBundle] = useState<PathBundle | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (!context) return;
    let active = true;
    const tenantId = context.user.tenantId;
    void Promise.all([getPathBundle(tenantId, pathId), listLessons(tenantId), listModules(tenantId)]).then(
      ([found, less, mods]) => {
        if (!active) return;
        if (!found) {
          setState("missing");
          return;
        }
        setBundle(found);
        setLessons(less);
        setModules(mods);
        setState("ready");
      },
    );
    return () => {
      active = false;
    };
  }, [context, pathId]);

  if (!context) return null;

  return (
    <div className="page page--wide">
      <div className="no-print" style={{ marginBottom: "var(--space-3)" }}>
        <Link href={`/app/materials/paths/${pathId}`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} aria-hidden /> Terug naar bouwer
        </Link>
      </div>
      {state === "loading" ? (
        <Card>Leerpad laden…</Card>
      ) : state === "missing" || !bundle ? (
        <Card>
          <h2>Leerpad niet gevonden</h2>
        </Card>
      ) : (
        <LearnerPathView bundle={bundle} lessons={lessons} modules={modules} userId={context.user.id} />
      )}
    </div>
  );
}
