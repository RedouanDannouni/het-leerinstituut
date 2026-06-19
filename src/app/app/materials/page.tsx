"use client";

import { useRequireSession } from "@/lib/auth/session";
import { LessonsOverview } from "@/components/lessons/LessonsOverview";

export default function MaterialsPage() {
  const { context } = useRequireSession();
  if (!context) return null;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Lessen / lesmateriaal</p>
          <h1>Lesmateriaal &amp; leerpaden</h1>
          <p className="muted">Bouw blok-gebaseerde lessen, bundel ze tot modules en leerpaden en wijs ze toe aan deelnemers.</p>
        </div>
      </header>
      <LessonsOverview context={context} />
    </div>
  );
}
