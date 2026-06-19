"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, LayoutGrid, Plus, Search, X } from "lucide-react";
import type { Lesson, Module } from "@/lib/lessons/types";
import { Badge } from "@/components/ui/Badge";

export interface LibrarySelection {
  itemKind: "lesson" | "module";
  id: string;
}

type TypeFilter = "all" | "lesson" | "module";
type StatusFilter = "all" | "published" | "draft";

export function LibraryPicker({
  lessons,
  modules,
  onAdd,
  onClose,
}: {
  lessons: Lesson[];
  modules: Module[];
  onAdd: (selection: LibrarySelection[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<LibrarySelection[]>([]);

  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());

  const visibleModules = useMemo(
    () => (typeFilter === "lesson" ? [] : modules.filter((m) => matches(m.title))),
    [modules, typeFilter, query],
  );
  const standaloneLessons = useMemo(
    () =>
      typeFilter === "module"
        ? []
        : lessons.filter(
            (l) =>
              matches(l.title) &&
              (statusFilter === "all" || l.status === statusFilter),
          ),
    [lessons, typeFilter, statusFilter, query],
  );

  const isSelected = (kind: "lesson" | "module", id: string) =>
    selected.some((s) => s.itemKind === kind && s.id === id);

  const toggle = (kind: "lesson" | "module", id: string) => {
    setSelected((current) =>
      isSelected(kind, id)
        ? current.filter((s) => !(s.itemKind === kind && s.id === id))
        : [...current, { itemKind: kind, id }],
    );
  };

  const titleFor = (sel: LibrarySelection) =>
    sel.itemKind === "lesson"
      ? lessons.find((l) => l.id === sel.id)?.title ?? "Les"
      : modules.find((m) => m.id === sel.id)?.title ?? "Module";

  const empty = !visibleModules.length && !standaloneLessons.length;

  return (
    <div className="modal-overlay no-print" role="dialog" aria-modal="true" aria-label="Selecteer uit bibliotheek" onClick={onClose}>
      <div className="modal modal--lg library-picker" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">Bibliotheek</p>
            <h2>Selecteer bestaande content</h2>
          </div>
          <button type="button" className="icon-btn" aria-label="Sluiten" onClick={onClose}>
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="library-toolbar">
          <div className="library-search">
            <Search size={15} aria-hidden />
            <input
              className="input"
              value={query}
              placeholder="Zoek in modules en lessen…"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select className="select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)} aria-label="Type">
            <option value="all">Alle types</option>
            <option value="lesson">Alleen lessen</option>
            <option value="module">Alleen modules</option>
          </select>
          <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="Status">
            <option value="all">Alle statussen</option>
            <option value="published">Gepubliceerd</option>
            <option value="draft">Concept</option>
          </select>
        </div>

        <div className="library-body">
          <div className="library-list">
            {empty ? (
              <p className="muted library-empty">Geen content — kies de module of les die je wilt toevoegen.</p>
            ) : null}

            {visibleModules.map((mod) => {
              const moduleLessons = lessons.filter((l) => l.moduleId === mod.id);
              return (
                <details key={mod.id} className="library-source" open>
                  <summary>
                    <span className="library-source-title">
                      <LayoutGrid size={15} aria-hidden /> {mod.title}
                      <span className="muted">{moduleLessons.length} lessen</span>
                    </span>
                    <button
                      type="button"
                      className={`icon-btn ${isSelected("module", mod.id) ? "is-active" : ""}`}
                      aria-label="Module toevoegen"
                      onClick={(event) => { event.preventDefault(); toggle("module", mod.id); }}
                    >
                      {isSelected("module", mod.id) ? <Check size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
                    </button>
                  </summary>
                  {moduleLessons.map((lesson) => (
                    <LibraryRow
                      key={lesson.id}
                      lesson={lesson}
                      selected={isSelected("lesson", lesson.id)}
                      onToggle={() => toggle("lesson", lesson.id)}
                    />
                  ))}
                </details>
              );
            })}

            {standaloneLessons.length ? (
              <div className="library-source library-source--flat">
                <p className="library-source-label">Losse lessen</p>
                {standaloneLessons.map((lesson) => (
                  <LibraryRow
                    key={lesson.id}
                    lesson={lesson}
                    selected={isSelected("lesson", lesson.id)}
                    onToggle={() => toggle("lesson", lesson.id)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <aside className="library-selected">
            <div className="cluster" style={{ justifyContent: "space-between" }}>
              <strong>Geselecteerd ({selected.length})</strong>
              {selected.length ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Alles wissen</button>
              ) : null}
            </div>
            {selected.length ? (
              <ul className="library-selected-list">
                {selected.map((sel) => (
                  <li key={`${sel.itemKind}-${sel.id}`}>
                    {sel.itemKind === "module" ? <LayoutGrid size={13} aria-hidden /> : <BookOpen size={13} aria-hidden />}
                    <span>{titleFor(sel)}</span>
                    <button type="button" className="icon-btn icon-btn--sm" aria-label="Verwijderen" onClick={() => toggle(sel.itemKind, sel.id)}>
                      <X size={13} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Nog niets geselecteerd.</p>
            )}
          </aside>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Annuleren</button>
          <button type="button" className="btn btn-primary" disabled={!selected.length} onClick={() => onAdd(selected)}>
            Toevoegen ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

function LibraryRow({ lesson, selected, onToggle }: { lesson: Lesson; selected: boolean; onToggle: () => void }) {
  return (
    <div className="library-row">
      <span className="library-row-title">
        <BookOpen size={14} aria-hidden /> {lesson.title || "Naamloze les"}
      </span>
      <Badge tone={lesson.status === "published" ? "success" : "warning"}>
        {lesson.status === "published" ? "Gepubliceerd" : "Concept"}
      </Badge>
      <button
        type="button"
        className={`icon-btn ${selected ? "is-active" : ""}`}
        aria-label={selected ? "Verwijderen uit selectie" : "Toevoegen aan selectie"}
        onClick={onToggle}
      >
        {selected ? <Check size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
      </button>
    </div>
  );
}
