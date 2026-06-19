"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  TriangleAlert,
  X,
} from "lucide-react";
import type { SessionContext } from "@/lib/domain/types";
import { can } from "@/lib/domain/permissions";
import { appendClientAuditEvent } from "@/lib/domain/audit";
import type { Lesson, LessonKind, Module } from "@/lib/lessons/types";
import { createLesson, createModule, listLessons, listModules } from "@/lib/lessons/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  addPathItem,
  addStage,
  getPathBundle,
  listTags,
  removePathItem,
  removeStage,
  reorderItems,
  updatePathMeta,
  updateStage,
} from "@/lib/paths/store";
import { listPeople, type Person } from "@/lib/paths/people";
import { orderedItems } from "@/lib/paths/helpers";
import { countPathIssues, validatePathForPublish } from "@/lib/paths/validation";
import type { LearningPath, PathBundle, PathItem, Sequencing, Stage, Tag } from "@/lib/paths/types";
import type { LibrarySelection } from "./LibraryPicker";
import { OverviewStep } from "./steps/OverviewStep";
import { AddContentStep, type AddContentCallbacks } from "./steps/AddContentStep";
import { AssignStep } from "./steps/AssignStep";

const STEPS = ["Overzicht", "Inhoud toevoegen", "Toewijzen"] as const;

export function PathWizard({ pathId, context }: { pathId: string; context: SessionContext }) {
  const tenantId = context.user.tenantId;
  const canPublish = can(context.user.role, "publish:paths");
  const canAssign = can(context.user.role, "assign:paths");

  const [bundle, setBundle] = useState<PathBundle | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showIssues, setShowIssues] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    let active = true;
    void Promise.all([
      getPathBundle(tenantId, pathId),
      listTags(tenantId),
      listLessons(tenantId),
      listModules(tenantId),
      listPeople(tenantId),
    ]).then(([found, tags, less, mods, ppl]) => {
      if (!active) return;
      if (!found) {
        setState("missing");
        return;
      }
      setBundle(found);
      setAllTags(tags);
      setLessons(less);
      setModules(mods);
      setPeople(ppl);
      setState("ready");
    });
    return () => {
      active = false;
    };
  }, [tenantId, pathId]);

  // Autosave van de leerpad-metadata (debounce ~600ms).
  useEffect(() => {
    if (!bundle) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    setSaving(true);
    const timer = window.setTimeout(async () => {
      await updatePathMeta(bundle.path);
      setSavedAt(new Date().toISOString());
      setSaving(false);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [bundle?.path]);

  const validation = useMemo(
    () => (bundle ? validatePathForPublish({ bundle, lessons, modules }) : null),
    [bundle, lessons, modules],
  );

  const setPath = (patch: Partial<LearningPath>) =>
    setBundle((current) => (current ? { ...current, path: { ...current.path, ...patch } } : current));

  const trainerName = useMemo(
    () => (bundle?.path.trainerId ? people.find((p) => p.id === bundle.path.trainerId)?.name ?? null : null),
    [bundle?.path.trainerId, people],
  );

  /* ---- stage- en item-mutaties ---- */
  const nextPosition = () => (bundle ? bundle.items.length : 0);

  const handleAddStage = async () => {
    if (!bundle) return;
    const stage = await addStage(tenantId, pathId, "Nieuwe fase", bundle.stages.length);
    setBundle((c) => (c ? { ...c, stages: [...c.stages, stage] } : c));
  };

  const handleRenameStage = (stage: Stage, title: string) => {
    const updated = { ...stage, title };
    setBundle((c) => (c ? { ...c, stages: c.stages.map((s) => (s.id === stage.id ? updated : s)) } : c));
    void updateStage(updated);
  };

  const handleRemoveStage = async (id: string) => {
    setBundle((c) =>
      c
        ? {
            ...c,
            stages: c.stages.filter((s) => s.id !== id),
            items: c.items.map((i) => (i.stageId === id ? { ...i, stageId: null } : i)),
          }
        : c,
    );
    await removeStage(tenantId, id);
  };

  const handleAddNewLesson = async (kind: LessonKind) => {
    if (!bundle) return;
    const title = kind === "quiz" ? "Naamloze quiz" : "Naamloze pagina";
    const lesson = await createLesson(tenantId, { title, kind });
    const item = await addPathItem(tenantId, { pathId, itemKind: "lesson", lessonId: lesson.id, position: nextPosition() });
    setLessons((c) => [...c, lesson]);
    setBundle((c) => (c ? { ...c, items: [...c.items, item] } : c));
  };

  const handleAddNewModule = async () => {
    if (!bundle) return;
    const mod = await createModule(tenantId, "Naamloze module");
    const item = await addPathItem(tenantId, { pathId, itemKind: "module", moduleId: mod.id, position: nextPosition() });
    setModules((c) => [...c, mod]);
    setBundle((c) => (c ? { ...c, items: [...c.items, item] } : c));
  };

  const handleAddFromLibrary = async (selections: LibrarySelection[]) => {
    if (!bundle) return;
    const added: PathItem[] = [];
    let position = nextPosition();
    for (const selection of selections) {
      const item = await addPathItem(tenantId, {
        pathId,
        itemKind: selection.itemKind,
        lessonId: selection.itemKind === "lesson" ? selection.id : null,
        moduleId: selection.itemKind === "module" ? selection.id : null,
        position: position++,
      });
      added.push(item);
    }
    setBundle((c) => (c ? { ...c, items: [...c.items, ...added] } : c));
  };

  const handleRemoveItem = async (id: string) => {
    setBundle((c) => (c ? { ...c, items: c.items.filter((i) => i.id !== id) } : c));
    await removePathItem(tenantId, id);
  };

  const persistOrder = async (ordered: PathItem[]) => {
    const withPos = ordered.map((i, index) => ({ ...i, position: index }));
    setBundle((c) => (c ? { ...c, items: withPos } : c));
    await reorderItems(tenantId, withPos);
  };

  const handleReorderItems = (ordered: PathItem[]) => void persistOrder(ordered);

  const handleChangeItemStage = (item: PathItem, stageId: string | null) => {
    if (!bundle) return;
    const updatedItem = { ...item, stageId };
    const ordered = orderedItems({ ...bundle, items: bundle.items.map((i) => (i.id === item.id ? updatedItem : i)) });
    void persistOrder(ordered);
  };

  const callbacks: AddContentCallbacks = {
    onSequencingChange: (seq: Sequencing) => setPath({ sequencing: seq }),
    onAddStage: handleAddStage,
    onRenameStage: handleRenameStage,
    onRemoveStage: handleRemoveStage,
    onAddNewLesson: handleAddNewLesson,
    onAddNewModule: handleAddNewModule,
    onAddFromLibrary: handleAddFromLibrary,
    onRemoveItem: handleRemoveItem,
    onReorderItems: handleReorderItems,
    onChangeItemStage: handleChangeItemStage,
  };

  const publish = async () => {
    if (!bundle || !validation) return;
    if (!validation.ok) {
      setShowIssues(true);
      return;
    }
    setPath({ status: "published" });
    await updatePathMeta({ ...bundle.path, status: "published" });
    appendClientAuditEvent(context, "Leerpad gepubliceerd", bundle.path.title);
  };

  const unpublish = () => setPath({ status: "draft" });

  if (state === "loading") return <Card>Leerpad laden…</Card>;
  if (state === "missing" || !bundle) {
    return (
      <Card>
        <h2>Leerpad niet gevonden</h2>
        <p className="muted">Dit leerpad bestaat niet of valt buiten jouw omgeving.</p>
      </Card>
    );
  }

  const issueCount = validation ? countPathIssues(validation) : 0;
  const published = bundle.path.status === "published";

  return (
    <div className="path-wizard">
      <div className="editor-toolbar no-print">
        <div className="editor-toolbar-meta">
          <Link href="/app/materials" className="icon-btn" aria-label="Terug naar overzicht">
            <ArrowLeft size={18} aria-hidden />
          </Link>
          <Badge tone={published ? "success" : "warning"}>{published ? "Gepubliceerd" : "Concept"}</Badge>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {saving ? "Opslaan…" : savedAt ? `Opgeslagen ${new Date(savedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}` : "Autosave staat klaar"}
          </span>
        </div>
        <div className="cluster">
          <Link href={`/app/materials/paths/${pathId}/preview`} className="btn btn-ghost btn-sm">
            <Eye size={15} aria-hidden /> Voorbeeldweergave
          </Link>
          {published ? (
            <Button type="button" variant="secondary" onClick={unpublish}>Terug naar concept</Button>
          ) : (
            <Button type="button" variant="accent" onClick={publish} disabled={!canPublish}>
              <CheckCircle2 size={16} aria-hidden /> Publiceren
            </Button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <ol className="wizard-stepper no-print">
        {STEPS.map((label, index) => (
          <li key={label} className={`wizard-step-pill ${index === step ? "is-active" : ""} ${index < step ? "is-done" : ""}`}>
            <button type="button" onClick={() => setStep(index)}>
              <span className="wizard-step-num">{index + 1}</span>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="wizard-progress" aria-hidden>
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {showIssues && validation && !validation.ok ? (
        <div className="card publish-issues" role="alert">
          <div className="cluster" style={{ justifyContent: "space-between" }}>
            <strong><TriangleAlert size={16} aria-hidden /> Nog {issueCount} aandachtspunt(en) vóór publiceren</strong>
            <button type="button" className="icon-btn" aria-label="Sluiten" onClick={() => setShowIssues(false)}>
              <X size={16} aria-hidden />
            </button>
          </div>
          <ul>
            {validation.general.map((item, i) => <li key={`g-${i}`}>{item}</li>)}
            {Object.entries(validation.byLesson).flatMap(([lessonId, errors]) =>
              errors.map((error, i) => <li key={`${lessonId}-${i}`}>{error}</li>),
            )}
          </ul>
        </div>
      ) : null}

      {step === 0 ? (
        <OverviewStep
          tenantId={tenantId}
          path={bundle.path}
          onChange={setPath}
          allTags={allTags}
          onTagCreated={(tag) => setAllTags((c) => [...c, tag])}
          people={people}
        />
      ) : null}

      {step === 1 ? (
        <AddContentStep
          bundle={bundle}
          lessons={lessons}
          modules={modules}
          allTags={allTags}
          trainerName={trainerName}
          callbacks={callbacks}
        />
      ) : null}

      {step === 2 ? (
        <AssignStep tenantId={tenantId} pathId={pathId} people={people} canAssign={canAssign} />
      ) : null}

      <div className="wizard-nav no-print">
        <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          <ArrowLeft size={15} aria-hidden /> Terug
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
            Verder <ArrowRight size={15} aria-hidden />
          </Button>
        ) : (
          <Button type="button" variant="accent" onClick={publish} disabled={!canPublish}>
            <CheckCircle2 size={16} aria-hidden /> Publiceren
          </Button>
        )}
      </div>
    </div>
  );
}
