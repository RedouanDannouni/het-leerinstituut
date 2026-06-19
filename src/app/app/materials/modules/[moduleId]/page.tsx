"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, BookOpen, GripVertical, ImagePlus, Lock, Plus, Save } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import type { Asset, Lesson, Module } from "@/lib/lessons/types";
import { getLessonTitle } from "@/lib/lessons/helpers";
import { createLesson, listLessons, listModules, reorderLessons, updateModule } from "@/lib/lessons/store";
import { AssetPicker, type AssetPickerRequest } from "@/components/lessons/AssetPicker";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { useRouter } from "next/navigation";

export default function ModuleDetailPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);
  const { context } = useRequireSession();
  const router = useRouter();
  const [mod, setMod] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [assetRequest, setAssetRequest] = useState<AssetPickerRequest | null>(null);

  const canEdit = context ? can(context.user.role, "edit:lessons") : false;

  useEffect(() => {
    if (!context) return;
    let active = true;
    const tenantId = context.user.tenantId;
    void Promise.all([listModules(tenantId), listLessons(tenantId)]).then(([mods, less]) => {
      if (!active) return;
      setMod(mods.find((m) => m.id === moduleId) ?? null);
      setAllLessons(less);
      setLessons(less.filter((l) => l.moduleId === moduleId));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [context, moduleId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleReorder = async (event: DragEndEvent) => {
    if (!context) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = lessons.findIndex((l) => l.id === active.id);
    const to = lessons.findIndex((l) => l.id === over.id);
    if (from < 0 || to < 0) return;
    const next = [...lessons];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLessons(next);
    await reorderLessons(context.user.tenantId, next);
  };

  const patchModule = (patch: Partial<Module>) => setMod((current) => (current ? { ...current, ...patch } : current));

  const saveModule = async () => {
    if (!mod) return;
    await updateModule(mod);
    setSavedAt(new Date().toISOString());
  };

  const addLesson = async () => {
    if (!context || !mod) return;
    const lesson = await createLesson(context.user.tenantId, { title: "Naamloze les", moduleId: mod.id });
    router.push(`/app/materials/lessons/${lesson.id}`);
  };

  if (!context) return null;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link href="/app/materials" className="btn btn-ghost btn-sm" style={{ marginBottom: "var(--space-2)" }}>
            <ArrowLeft size={15} aria-hidden /> Alle cursussen
          </Link>
          <p className="eyebrow">Module / lessenreeks</p>
          <h1>{mod?.title ?? "Module"}</h1>
          {mod?.summary ? <p className="muted">{mod.summary}</p> : null}
        </div>
      </header>

      {loading ? (
        <Card>Laden…</Card>
      ) : !mod ? (
        <Card>
          <h2>Module niet gevonden</h2>
        </Card>
      ) : (
        <div className="grid grid-2" style={{ alignItems: "start" }}>
          {/* Lessen */}
          <Card>
            <div className="card-header">
              <div>
                <h2>Lessen in deze module</h2>
                <p className="muted">Sleep om de leervolgorde te bepalen.</p>
              </div>
              {canEdit ? (
                <Button type="button" onClick={addLesson}>
                  <Plus size={16} aria-hidden /> Les toevoegen
                </Button>
              ) : null}
            </div>
            {lessons.length ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
                <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  <ol className="module-lesson-list">
                    {lessons.map((lesson, index) => (
                      <ModuleLessonRow key={lesson.id} index={index} lesson={lesson} allLessons={allLessons} canEdit={canEdit} />
                    ))}
                  </ol>
                </SortableContext>
              </DndContext>
            ) : (
              <p className="muted">Nog geen lessen. Voeg er een toe of wijs lessen toe vanuit het overzicht.</p>
            )}
          </Card>

          {/* Module-instellingen */}
          {canEdit ? (
            <Card className="stack">
              <div className="card-header">
                <div>
                  <h2>Module-instellingen</h2>
                  <p className="muted">Deze gegevens vullen de cursuskaart in het overzicht.</p>
                </div>
              </div>
              <button
                type="button"
                className="cover-picker"
                onClick={() =>
                  setAssetRequest({ kinds: ["image"], apply: (asset: Asset) => patchModule({ coverUrl: asset.url ?? null }) })
                }
              >
                {mod.coverUrl ? (
                  <img src={mod.coverUrl} alt="Omslag" />
                ) : (
                  <span className="cover-picker-empty">
                    <ImagePlus size={22} aria-hidden /> Omslagafbeelding kiezen
                  </span>
                )}
              </button>
              <Field label="Titel">
                <Input value={mod.title} onChange={(event) => patchModule({ title: event.target.value })} />
              </Field>
              <Field label="Categorie" help="Bijv. een vak of niveau — wordt als tag getoond.">
                <Input value={mod.category} onChange={(event) => patchModule({ category: event.target.value })} placeholder="Bijv. Rekenen · groep 7" />
              </Field>
              <Field label="Samenvatting">
                <Textarea value={mod.summary} onChange={(event) => patchModule({ summary: event.target.value })} />
              </Field>
              <div className="cluster" style={{ justifyContent: "space-between" }}>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  {savedAt ? `Opgeslagen ${new Date(savedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}` : "Niet opgeslagen wijzigingen"}
                </span>
                <Button type="button" onClick={saveModule}>
                  <Save size={16} aria-hidden /> Opslaan
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      )}

      <AssetPicker tenantId={context.user.tenantId} request={assetRequest} onClose={() => setAssetRequest(null)} />
    </div>
  );
}

function ModuleLessonRow({
  index,
  lesson,
  allLessons,
  canEdit,
}: {
  index: number;
  lesson: Lesson;
  allLessons: Lesson[];
  canEdit: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const gate = lesson.requiresLessonId ? getLessonTitle(allLessons, lesson.requiresLessonId) : null;

  return (
    <li ref={setNodeRef} style={style} className="module-lesson-item">
      <span className="module-lesson-index">{index + 1}</span>
      {canEdit ? (
        <button type="button" className="block-handle" aria-label="Versleep" {...attributes} {...listeners}>
          <GripVertical size={16} aria-hidden />
        </button>
      ) : null}
      <Link href={`/app/materials/lessons/${lesson.id}`} className="module-lesson-title">
        <BookOpen size={16} aria-hidden />
        <span>{lesson.title || "Naamloze les"}</span>
      </Link>
      {gate ? (
        <span className="gate-chip" title={`Beschikbaar na: ${gate}`}>
          <Lock size={13} aria-hidden /> na {gate}
        </span>
      ) : null}
      <Badge tone={lesson.status === "published" ? "success" : "warning"}>
        {lesson.status === "published" ? "Gepubliceerd" : "Concept"}
      </Badge>
    </li>
  );
}
