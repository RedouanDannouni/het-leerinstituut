"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BookOpen,
  FileText,
  GripVertical,
  Layers,
  LayoutGrid,
  Library,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Form";
import type { Lesson, LessonKind, Module } from "@/lib/lessons/types";
import { itemChapterCount, itemTitle, itemUpdatedAt, orderedItems } from "@/lib/paths/helpers";
import type { PathBundle, PathItem, Sequencing, Stage, Tag } from "@/lib/paths/types";
import type { LibrarySelection } from "../LibraryPicker";
import { LibraryPicker } from "../LibraryPicker";
import { PathSummaryCard } from "../PathSummaryCard";

export interface AddContentCallbacks {
  onSequencingChange: (seq: Sequencing) => void;
  onAddStage: () => void;
  onRenameStage: (stage: Stage, title: string) => void;
  onRemoveStage: (id: string) => void;
  onAddNewLesson: (kind: LessonKind) => void;
  onAddNewModule: () => void;
  onAddFromLibrary: (selections: LibrarySelection[]) => void;
  onRemoveItem: (id: string) => void;
  onReorderItems: (ordered: PathItem[]) => void;
  onChangeItemStage: (item: PathItem, stageId: string | null) => void;
}

export function AddContentStep({
  bundle,
  lessons,
  modules,
  allTags,
  trainerName,
  callbacks,
}: {
  bundle: PathBundle;
  lessons: Lesson[];
  modules: Module[];
  allTags: Tag[];
  trainerName: string | null;
  callbacks: AddContentCallbacks;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const items = orderedItems(bundle);

  const handleReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    callbacks.onReorderItems(next);
  };

  return (
    <div className="wizard-step stack">
      <PathSummaryCard path={bundle.path} allTags={allTags} trainerName={trainerName} />

      <div className="builder-toolbar">
        <div className="cluster">
          <button type="button" className="btn btn-secondary btn-sm" onClick={callbacks.onAddStage}>
            <Layers size={15} aria-hidden /> Fase
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={callbacks.onAddNewModule}>
            <LayoutGrid size={15} aria-hidden /> Module
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => callbacks.onAddNewLesson("page")}>
            <FileText size={15} aria-hidden /> Pagina
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => callbacks.onAddNewLesson("quiz")}>
            <ListChecks size={15} aria-hidden /> Quiz
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLibraryOpen(true)}>
            <Library size={15} aria-hidden /> Bibliotheek
          </button>
        </div>

        <div className="segmented" role="group" aria-label="Volgorde-modus">
          <button
            type="button"
            className={`segmented-btn ${bundle.path.sequencing === "sequential" ? "is-active" : ""}`}
            onClick={() => callbacks.onSequencingChange("sequential")}
          >
            Sequentieel
          </button>
          <button
            type="button"
            className={`segmented-btn ${bundle.path.sequencing === "free" ? "is-active" : ""}`}
            onClick={() => callbacks.onSequencingChange("free")}
          >
            Vrij
          </button>
        </div>
      </div>

      {bundle.stages.length ? (
        <div className="card stack-sm">
          <div className="card-header">
            <div>
              <h3>Fases</h3>
              <p className="muted">Groepeer onderdelen in niveaugroepen (bijv. Junior, Senior).</p>
            </div>
          </div>
          {bundle.stages.map((stage) => (
            <div className="stage-row" key={stage.id}>
              <Layers size={15} aria-hidden className="muted" />
              <Input
                value={stage.title}
                placeholder="Naam van de fase"
                onChange={(event) => callbacks.onRenameStage(stage, event.target.value)}
              />
              <button type="button" className="icon-btn icon-btn--danger" aria-label="Fase verwijderen" onClick={() => callbacks.onRemoveStage(stage.id)}>
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="card stack-sm">
        <div className="card-header">
          <div>
            <h3>Onderdelen</h3>
            <p className="muted">Sleep om de leervolgorde te bepalen. Wijs onderdelen toe aan een fase.</p>
          </div>
        </div>

        {items.length ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="path-item-rows">
                {items.map((item, index) => (
                  <PathItemRow
                    key={item.id}
                    index={index}
                    item={item}
                    lessons={lessons}
                    modules={modules}
                    stages={bundle.stages}
                    sequential={bundle.path.sequencing === "sequential"}
                    onChangeStage={(stageId) => callbacks.onChangeItemStage(item, stageId)}
                    onRemove={() => callbacks.onRemoveItem(item.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="lesson-empty">
            <span className="lesson-empty-icon" aria-hidden><BookOpen size={24} /></span>
            <h3>Nog geen onderdelen</h3>
            <p className="muted">Voeg een pagina of quiz toe, of kies bestaande content uit de bibliotheek.</p>
          </div>
        )}
      </div>

      {libraryOpen ? (
        <LibraryPicker
          lessons={lessons}
          modules={modules}
          onClose={() => setLibraryOpen(false)}
          onAdd={(selections) => {
            callbacks.onAddFromLibrary(selections);
            setLibraryOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function PathItemRow({
  index,
  item,
  lessons,
  modules,
  stages,
  sequential,
  onChangeStage,
  onRemove,
}: {
  index: number;
  item: PathItem;
  lessons: Lesson[];
  modules: Module[];
  stages: Stage[];
  sequential: boolean;
  onChangeStage: (stageId: string | null) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const title = itemTitle(item, lessons, modules);
  const chapters = itemChapterCount(item, lessons);
  const updatedAt = itemUpdatedAt(item, lessons, modules);
  const lesson = item.itemKind === "lesson" ? lessons.find((l) => l.id === item.lessonId) : undefined;
  const status = item.itemKind === "lesson" ? lesson?.status ?? "draft" : "published";
  const editHref =
    item.itemKind === "lesson"
      ? `/app/materials/lessons/${item.lessonId}`
      : `/app/materials/modules/${item.moduleId}`;

  return (
    <div ref={setNodeRef} style={style} className="path-item-row">
      <button type="button" className="block-handle" aria-label="Versleep onderdeel" {...attributes} {...listeners}>
        <GripVertical size={16} aria-hidden />
      </button>
      {sequential ? <span className="path-item-index">{index + 1}</span> : null}
      <span className="path-item-icon" aria-hidden>
        {item.itemKind === "module" ? <LayoutGrid size={16} /> : <BookOpen size={16} />}
      </span>
      <div className="path-item-main">
        <span className="path-item-title">{title}</span>
        <span className="muted path-item-sub">
          {item.itemKind === "module" ? "Module" : "Les"} · {chapters} {item.itemKind === "module" ? "lessen" : "blokken"}
          {updatedAt ? ` · bijgewerkt ${new Date(updatedAt).toLocaleDateString("nl-NL")}` : ""}
        </span>
      </div>
      <Badge tone={status === "published" ? "success" : "warning"}>
        {status === "published" ? "Gepubliceerd" : "Concept"}
      </Badge>
      {stages.length ? (
        <select
          className="select select--sm"
          aria-label="Fase"
          value={item.stageId ?? ""}
          onChange={(event) => onChangeStage(event.target.value || null)}
        >
          <option value="">Geen fase</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>{stage.title || "Fase"}</option>
          ))}
        </select>
      ) : null}
      <div className="path-item-actions">
        <Link href={editHref} className="icon-btn" aria-label="Bewerken" title="Bewerken">
          <Pencil size={15} aria-hidden />
        </Link>
        <button type="button" className="icon-btn icon-btn--danger" aria-label="Verwijderen" onClick={onRemove}>
          <Trash2 size={15} aria-hidden />
        </button>
      </div>
    </div>
  );
}
