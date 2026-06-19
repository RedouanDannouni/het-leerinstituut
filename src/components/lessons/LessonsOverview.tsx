"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Eye,
  LayoutGrid,
  Layers,
  List,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import type { SessionContext } from "@/lib/domain/types";
import { can } from "@/lib/domain/permissions";
import type { Lesson, Module } from "@/lib/lessons/types";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  listLessons,
  listModules,
  saveLesson,
} from "@/lib/lessons/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Form";
import { FeaturedCourseCarousel } from "@/components/lessons/FeaturedCourseCarousel";
import { MaterialsCourseCard } from "@/components/lessons/MaterialsCourseCard";

type SortKey = "latest" | "title" | "status";
type ViewMode = "grid" | "list";

function moduleStatus(moduleId: string, lessons: Lesson[]): "published" | "draft" {
  const inModule = lessons.filter((l) => l.moduleId === moduleId);
  return inModule.some((l) => l.status === "published") ? "published" : "draft";
}

export function LessonsOverview({ context }: { context: SessionContext }) {
  const router = useRouter();
  const tenantId = context.user.tenantId;
  const canEdit = can(context.user.role, "edit:lessons");

  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("latest");
  const [category, setCategory] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const addRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([listModules(tenantId), listLessons(tenantId)]).then(([mods, less]) => {
      if (!active) return;
      setModules(mods);
      setLessons(less);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [tenantId]);

  useEffect(() => {
    if (!addOpen) return;
    const handler = (event: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(event.target as Node)) setAddOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [addOpen]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    modules.forEach((mod) => mod.category && set.add(mod.category));
    return Array.from(set).sort();
  }, [modules]);

  const visibleModules = useMemo(() => {
    let result = modules.filter((mod) => {
      const matchesQuery = !query || mod.title.toLowerCase().includes(query.toLowerCase()) || mod.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || mod.category === category;
      return matchesQuery && matchesCategory;
    });
    result = [...result].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "nl");
      if (sort === "status") return moduleStatus(a.id, lessons).localeCompare(moduleStatus(b.id, lessons));
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return result;
  }, [modules, lessons, query, category, sort]);

  const looseLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) =>
          !lesson.moduleId &&
          (!query || lesson.title.toLowerCase().includes(query.toLowerCase())),
      ),
    [lessons, query],
  );

  const handleCreateLesson = async () => {
    setBusy(true);
    const lesson = await createLesson(tenantId, { title: "Naamloze les" });
    router.push(`/app/materials/lessons/${lesson.id}`);
  };

  const handleCreateModule = async () => {
    setAddOpen(false);
    const mod = await createModule(tenantId, "Nieuwe module");
    setModules((current) => [mod, ...current]);
    router.push(`/app/materials/modules/${mod.id}`);
  };

  const removeModule = async (mod: Module) => {
    setModules((current) => current.filter((m) => m.id !== mod.id));
    await deleteModule(tenantId, mod.id);
    setLessons((current) => current.map((l) => (l.moduleId === mod.id ? { ...l, moduleId: null } : l)));
  };

  const removeLesson = async (lesson: Lesson) => {
    setLessons((current) => current.filter((l) => l.id !== lesson.id));
    await deleteLesson(tenantId, lesson.id);
  };

  const moveLessonToModule = async (lesson: Lesson, moduleId: string | null) => {
    const next = { ...lesson, moduleId };
    setLessons((current) => current.map((l) => (l.id === lesson.id ? next : l)));
    await saveLesson(next);
  };

  const courseCountLabel = useMemo(() => {
    const total = modules.length;
    const visible = visibleModules.length;
    const noun = total === 1 ? "cursus" : "cursussen";
    if (visible !== total) return `${visible} van ${total} ${noun}`;
    return `${total} ${noun}`;
  }, [modules.length, visibleModules.length]);

  if (loading) return <Card>Lessen laden…</Card>;

  return (
    <div className="stack">
      <header className="materials-header">
        <div className="materials-header__title">
          <p className="eyebrow">Lesmateriaal</p>
          <div className="materials-header__heading">
            <h1>Cursussen</h1>
            <span className="materials-header__count">{courseCountLabel}</span>
          </div>
        </div>

        <div className="materials-header__controls">
          <label className="materials-header__search">
            <Search className="icon" size={17} aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Zoek in je cursussen…"
              aria-label="Zoeken"
            />
          </label>

          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="Sorteren"
            className="materials-header__control materials-header__select"
          >
            <option value="latest">Nieuwste eerst</option>
            <option value="title">Titel (A–Z)</option>
            <option value="status">Status</option>
          </Select>

          <Select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Categorie"
            className="materials-header__control materials-header__select"
          >
            <option value="all">Alle categorieën</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>

          <button type="button" className="materials-header__control">
            <SlidersHorizontal className="icon" size={16} aria-hidden />
            Filteren
          </button>

          <div className="materials-header__toggle" role="group" aria-label="Weergave">
            <button
              type="button"
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid size={16} aria-hidden />
              Grid
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              <List size={16} aria-hidden />
              Lijst
            </button>
          </div>

          {canEdit ? (
            <div className="add-content" ref={addRef}>
              <button
                type="button"
                className="materials-header__primary"
                onClick={() => setAddOpen((v) => !v)}
                disabled={busy}
              >
                <Plus className="icon" size={16} aria-hidden />
                Nieuwe cursus
              </button>
              {addOpen ? (
                <div className="add-menu" role="menu">
                  <button type="button" className="add-menu-item" role="menuitem" onClick={handleCreateModule}>
                    <Layers size={16} aria-hidden />
                    <span>
                      <strong>Nieuwe module</strong>
                      <span className="muted">Een cursus / lessenreeks</span>
                    </span>
                  </button>
                  <button type="button" className="add-menu-item" role="menuitem" onClick={handleCreateLesson}>
                    <BookOpen size={16} aria-hidden />
                    <span>
                      <strong>Nieuwe les</strong>
                      <span className="muted">Losse blok-gebaseerde les</span>
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      {visibleModules.length ? (
        <FeaturedCourseCarousel modules={visibleModules} lessons={lessons} />
      ) : null}

      {visibleModules.length ? (
        <div className={`course-grid${viewMode === "list" ? " course-grid--list" : ""}`}>
          {visibleModules.map((mod) => (
            <MaterialsCourseCard
              key={mod.id}
              mod={mod}
              lessons={lessons}
              view={viewMode}
              canEdit={canEdit}
              onDelete={(item) => void removeModule(item)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="lesson-empty">
            <span className="lesson-empty-icon" aria-hidden>
              <Layers size={26} />
            </span>
            <h3>Nog geen modules</h3>
            <p className="muted">Bundel lessen tot een cursus. Maak je eerste module via &quot;Nieuwe cursus&quot;.</p>
            {canEdit ? (
              <Button type="button" onClick={handleCreateModule}>
                <Plus size={16} aria-hidden /> Nieuwe module
              </Button>
            ) : null}
          </div>
        </Card>
      )}

      {/* Losse lessen (zonder module) */}
      {looseLessons.length ? (
        <Card>
          <div className="card-header">
            <div>
              <h2>Losse lessen</h2>
              <p className="muted">Lessen die nog niet in een module zitten. Wijs ze toe of bewerk ze.</p>
            </div>
          </div>
          <div className="lesson-rows">
            {looseLessons.map((lesson) => (
              <div className="lesson-row" key={lesson.id}>
                <Link href={`/app/materials/lessons/${lesson.id}`} className="lesson-row-title">
                  <span className="lesson-row-icon" aria-hidden>
                    <BookOpen size={16} />
                  </span>
                  <span>{lesson.title || "Naamloze les"}</span>
                </Link>
                <Badge tone={lesson.status === "published" ? "success" : "warning"}>
                  {lesson.status === "published" ? "Gepubliceerd" : "Concept"}
                </Badge>
                {canEdit ? (
                  <Select
                    aria-label="Aan module toewijzen"
                    value=""
                    onChange={(event) => event.target.value && moveLessonToModule(lesson, event.target.value)}
                    style={{ maxWidth: 180 }}
                  >
                    <option value="">Aan module toewijzen…</option>
                    {modules.map((mod) => (
                      <option key={mod.id} value={mod.id}>{mod.title}</option>
                    ))}
                  </Select>
                ) : null}
                <div className="lesson-row-actions">
                  <Link href={`/app/materials/lessons/${lesson.id}/preview`} className="icon-btn" aria-label="Voorbeeldweergave" title="Voorbeeldweergave">
                    <Eye size={15} aria-hidden />
                  </Link>
                  <Link href={`/app/materials/lessons/${lesson.id}`} className="icon-btn" aria-label="Bewerken" title="Bewerken">
                    <Pencil size={15} aria-hidden />
                  </Link>
                  {canEdit ? (
                    <button type="button" className="icon-btn icon-btn--danger" aria-label="Verwijderen" onClick={() => removeLesson(lesson)}>
                      <Trash2 size={15} aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
