"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Layers, Trash2, Users } from "lucide-react";
import type { Lesson, Module } from "@/lib/lessons/types";
import {
  lessonCountForModule,
  placeholderStudentCount,
} from "@/lib/lessons/materials-display";
import { Badge } from "@/components/ui/Badge";

type ViewMode = "grid" | "list";

function moduleStatus(moduleId: string, lessons: Lesson[]): "published" | "draft" {
  const inModule = lessons.filter((lesson) => lesson.moduleId === moduleId);
  return inModule.some((lesson) => lesson.status === "published") ? "published" : "draft";
}

export function MaterialsCourseCard({
  mod,
  lessons,
  view,
  canEdit,
  onDelete,
}: {
  mod: Module;
  lessons: Lesson[];
  view: ViewMode;
  canEdit: boolean;
  onDelete: (mod: Module) => void;
}) {
  const href = `/app/materials/modules/${mod.id}`;
  const lessonCount = lessonCountForModule(mod.id, lessons);
  const students = placeholderStudentCount(mod.id);
  const status = moduleStatus(mod.id, lessons);

  const cover = (
    <Link href={href} className="course-card-cover" aria-label={mod.title}>
      {mod.coverUrl ? (
        <img src={mod.coverUrl} alt="" />
      ) : (
        <span className="course-card-cover-fallback" aria-hidden>
          <Layers size={view === "list" ? 22 : 30} />
        </span>
      )}
      {canEdit ? (
        <button
          type="button"
          className="course-card-delete"
          aria-label="Module verwijderen"
          onClick={(event) => {
            event.preventDefault();
            onDelete(mod);
          }}
        >
          <Trash2 size={15} aria-hidden />
        </button>
      ) : null}
    </Link>
  );

  const stats = (
    <div className="course-card-stats">
      <span className="course-card-meta">
        <BookOpen size={15} aria-hidden />
        {lessonCount} {lessonCount === 1 ? "les" : "lessen"}
      </span>
      <span className="course-card-meta">
        <Users size={15} aria-hidden />
        {students} deelnemers
      </span>
    </div>
  );

  const openBtn = (
    <Link href={href} className="course-card-open" aria-label={`${mod.title} openen`}>
      <ArrowUpRight size={18} aria-hidden />
    </Link>
  );

  if (view === "list") {
    return (
      <article className="course-card course-card--list">
        {cover}
        <div className="course-card-body">
          <div className="course-card-top">
            <span className="course-card-tag">{mod.category || "Cursus"}</span>
            <Badge tone={status === "published" ? "success" : "warning"}>
              {status === "published" ? "Gepubliceerd" : "Concept"}
            </Badge>
          </div>
          <Link href={href} className="course-card-title">
            {mod.title}
          </Link>
          {stats}
        </div>
        {openBtn}
      </article>
    );
  }

  return (
    <article className="course-card">
      {cover}
      <div className="course-card-body">
        <div className="course-card-top">
          <span className="course-card-tag">{mod.category || "Cursus"}</span>
          <Badge tone={status === "published" ? "success" : "warning"}>
            {status === "published" ? "Gepubliceerd" : "Concept"}
          </Badge>
        </div>
        <Link href={href} className="course-card-title">
          {mod.title}
        </Link>
        <div className="course-card-foot">
          {stats}
          {openBtn}
        </div>
      </div>
    </article>
  );
}
