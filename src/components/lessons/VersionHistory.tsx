"use client";

import { useEffect, useState } from "react";
import { History, RotateCcw, X } from "lucide-react";
import type { Lesson, LessonVersion } from "@/lib/lessons/types";
import { listVersions } from "@/lib/lessons/store";

export function VersionHistory({
  lesson,
  open,
  onClose,
  onRestore,
}: {
  lesson: Lesson;
  open: boolean;
  onClose: () => void;
  onRestore: (version: LessonVersion) => void;
}) {
  const [versions, setVersions] = useState<LessonVersion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void listVersions(lesson.id)
      .then(setVersions)
      .finally(() => setLoading(false));
  }, [open, lesson.id]);

  if (!open) return null;

  return (
    <aside className="version-panel" aria-label="Versiegeschiedenis">
      <div className="version-panel-head">
        <strong>
          <History size={16} aria-hidden /> Versiegeschiedenis
        </strong>
        <button type="button" className="icon-btn" aria-label="Sluiten" onClick={onClose}>
          <X size={16} aria-hidden />
        </button>
      </div>
      {loading ? (
        <p className="muted">Laden…</p>
      ) : versions.length ? (
        <ul className="version-list">
          {versions.map((version) => (
            <li key={version.id} className="version-item">
              <div>
                <strong>{version.label ?? "Snapshot"}</strong>
                <span className="muted">
                  {new Date(version.createdAt).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRestore(version)}>
                <RotateCcw size={14} aria-hidden /> Herstellen
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Nog geen opgeslagen versies. Bij elke publicatie wordt automatisch een versie bewaard.</p>
      )}
    </aside>
  );
}
