"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  History,
  Pencil,
  Plus,
  Save,
  Settings2,
  Target,
  TriangleAlert,
  X,
} from "lucide-react";
import type { SessionContext } from "@/lib/domain/types";
import { can } from "@/lib/domain/permissions";
import { appendClientAuditEvent } from "@/lib/domain/audit";
import type { Asset, AssetKind, Block, BlockType, Lesson, LessonVersion, Module } from "@/lib/lessons/types";
import { createBlock, duplicateBlock, moveBlock } from "@/lib/lessons/blocks";
import { countBlockIssues, validateLessonForPublish } from "@/lib/lessons/block-validate";
import { clearLessonDraft, readLessonDraft, saveLessonDraft } from "@/lib/lessons/autosave";
import { setMaterialsFlash } from "@/lib/lessons/flash";
import { saveLesson, snapshotLesson } from "@/lib/lessons/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { BlockList } from "./BlockList";
import { AssetPicker, type AssetPickerRequest } from "./AssetPicker";
import { PreviewToggle, type PreviewDevice } from "./PreviewToggle";
import { StudentLessonView } from "./StudentLessonView";
import { VersionHistory } from "./VersionHistory";

export function LessonEditor({
  initialLesson,
  context,
  modules,
  lessons,
}: {
  initialLesson: Lesson;
  context: SessionContext;
  modules: Module[];
  lessons: Lesson[];
}) {
  const [lesson, setLesson] = useState<Lesson>(initialLesson);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [assetRequest, setAssetRequest] = useState<AssetPickerRequest | null>(null);
  const [closing, setClosing] = useState(false);
  const firstRender = useRef(true);
  const router = useRouter();

  const canPublish = can(context.user.role, "publish:lessons");
  const validation = useMemo(() => validateLessonForPublish(lesson), [lesson]);

  useEffect(() => {
    const draft = readLessonDraft(initialLesson.id);
    if (draft && draft.lesson.updatedAt !== initialLesson.updatedAt) {
      setShowRecovery(true);
    }
  }, [initialLesson.id, initialLesson.updatedAt]);

  // Autosave (debounce) naar Supabase/localStorage + lokale back-up.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaving(true);
    const timer = window.setTimeout(async () => {
      saveLessonDraft(lesson);
      await saveLesson(lesson);
      setSavedAt(new Date().toISOString());
      setSaving(false);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [lesson]);

  const update = (patch: Partial<Lesson>) => setLesson((current) => ({ ...current, ...patch }));

  /* ---- blok-acties ---- */
  const insertAt = (index: number, type: BlockType) =>
    setLesson((current) => {
      const blocks = [...current.blocks];
      blocks.splice(index, 0, createBlock(type));
      return { ...current, blocks };
    });
  const changeBlock = (block: Block) =>
    setLesson((current) => ({ ...current, blocks: current.blocks.map((b) => (b.id === block.id ? block : b)) }));
  const duplicateAt = (index: number) =>
    setLesson((current) => {
      const blocks = [...current.blocks];
      blocks.splice(index + 1, 0, duplicateBlock(blocks[index]));
      return { ...current, blocks };
    });
  const deleteAt = (index: number) =>
    setLesson((current) => ({ ...current, blocks: current.blocks.filter((_, i) => i !== index) }));
  const reorder = (from: number, to: number) =>
    setLesson((current) => ({ ...current, blocks: moveBlock(current.blocks, from, to) }));

  const requestAsset = (kinds: AssetKind[], apply: (asset: Asset) => void) => setAssetRequest({ kinds, apply });

  /* ---- leerdoelen ---- */
  const setObjective = (index: number, value: string) =>
    update({ learningObjectives: lesson.learningObjectives.map((item, i) => (i === index ? value : item)) });
  const addObjective = () => update({ learningObjectives: [...lesson.learningObjectives, ""] });
  const removeObjective = (index: number) =>
    update({ learningObjectives: lesson.learningObjectives.filter((_, i) => i !== index) });

  /* ---- publiceren / versies ---- */
  const publish = async () => {
    if (!validation.ok) {
      setShowIssues(true);
      return;
    }
    const next = { ...lesson, status: "published" as const };
    setLesson(next);
    await snapshotLesson(next, "Gepubliceerd");
    appendClientAuditEvent(context, "Les gepubliceerd", next.title);
  };
  const unpublish = () => update({ status: "draft" });

  const restoreVersion = (version: LessonVersion) => {
    update({ title: version.title, blocks: version.blocks, learningObjectives: version.learningObjectives });
    setHistoryOpen(false);
  };

  const otherLessons = lessons.filter((item) => item.id !== lesson.id);
  const issueCount = countBlockIssues(validation);

  const saveAndClose = async () => {
    if (closing) return;
    setClosing(true);
    try {
      clearLessonDraft(lesson.id);
      saveLessonDraft(lesson);
      await saveLesson(lesson);
      setMaterialsFlash(`Les "${lesson.title.trim() || "Naamloze les"}" is opgeslagen.`);
      router.push(lesson.moduleId ? `/app/materials/modules/${lesson.moduleId}` : "/app/materials");
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="lesson-editor">
      {/* Toolbar */}
      <div className="editor-toolbar no-print">
        <div className="editor-toolbar-meta">
          <Link href="/app/materials" className="icon-btn" aria-label="Terug naar overzicht">
            <ArrowLeft size={18} aria-hidden />
          </Link>
          <Badge tone={lesson.status === "published" ? "success" : "warning"}>
            {lesson.status === "published" ? "Gepubliceerd" : "Concept"}
          </Badge>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {saving ? "Opslaan…" : savedAt ? `Opgeslagen ${new Date(savedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}` : "Autosave staat klaar"}
          </span>
        </div>
        <div className="cluster">
          <div className="segmented" role="group" aria-label="Weergave">
            <button type="button" className={`segmented-btn ${mode === "edit" ? "is-active" : ""}`} onClick={() => setMode("edit")}>
              <Pencil size={15} aria-hidden /> Bewerken
            </button>
            <button type="button" className={`segmented-btn ${mode === "preview" ? "is-active" : ""}`} onClick={() => setMode("preview")}>
              <Eye size={15} aria-hidden /> Voorbeeld
            </button>
          </div>
          <button type="button" className="icon-btn" aria-label="Versiegeschiedenis" title="Versiegeschiedenis" onClick={() => setHistoryOpen((v) => !v)}>
            <History size={18} aria-hidden />
          </button>
          <button type="button" className="icon-btn" aria-label="Lesinstellingen" title="Lesinstellingen" onClick={() => setShowSettings((v) => !v)}>
            <Settings2 size={18} aria-hidden />
          </button>
          {lesson.status === "published" ? (
            <Button type="button" variant="secondary" onClick={unpublish}>
              Terug naar concept
            </Button>
          ) : (
            <Button type="button" variant="accent" onClick={publish} disabled={!canPublish}>
              <CheckCircle2 size={16} aria-hidden /> Publiceren
            </Button>
          )}
        </div>
      </div>

      {showRecovery ? (
        <div className="card cluster" role="status" style={{ justifyContent: "space-between" }}>
          <div>
            <strong>Lokale versie gevonden</strong>
            <p className="muted" style={{ margin: 0 }}>Er staat een nieuwere lokale back-up van deze les klaar.</p>
          </div>
          <div className="cluster">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const draft = readLessonDraft(initialLesson.id);
                if (draft) setLesson(draft.lesson);
                setShowRecovery(false);
              }}
            >
              Herstellen
            </Button>
            <button type="button" className="icon-btn" aria-label="Negeren" onClick={() => { clearLessonDraft(initialLesson.id); setShowRecovery(false); }}>
              <X size={16} aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      {showIssues && !validation.ok ? (
        <div className="card publish-issues" role="alert">
          <div className="cluster" style={{ justifyContent: "space-between" }}>
            <strong>
              <TriangleAlert size={16} aria-hidden /> Nog {issueCount} aandachtspunt(en) vóór publiceren
            </strong>
            <button type="button" className="icon-btn" aria-label="Sluiten" onClick={() => setShowIssues(false)}>
              <X size={16} aria-hidden />
            </button>
          </div>
          <ul>
            {validation.general.map((item, i) => (
              <li key={`g-${i}`}>{item}</li>
            ))}
            {Object.entries(validation.byBlock).flatMap(([blockId, errors]) =>
              errors.map((error, i) => <li key={`${blockId}-${i}`}>{error}</li>),
            )}
          </ul>
        </div>
      ) : null}

      {showSettings ? (
        <div className="card stack">
          <div className="card-header">
            <div>
              <h2>Lesinstellingen</h2>
              <p className="muted">Plaats de les in een module en bepaal de volgorde-afhankelijkheid.</p>
            </div>
          </div>
          <div className="grid grid-2">
            <Field label="Module">
              <Select value={lesson.moduleId ?? ""} onChange={(event) => update({ moduleId: event.target.value || null })}>
                <option value="">Geen module</option>
                {modules.map((mod) => (
                  <option key={mod.id} value={mod.id}>{mod.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Beschikbaar na (gating)" help="De les wordt pas aangeraden na het afronden van de gekozen les.">
              <Select value={lesson.requiresLessonId ?? ""} onChange={(event) => update({ requiresLessonId: event.target.value || null })}>
                <option value="">Altijd beschikbaar</option>
                {otherLessons.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      ) : null}

      <div className={`lesson-editor-layout ${historyOpen ? "with-history" : ""}`}>
        <div className="lesson-editor-main">
          {mode === "edit" ? (
            <>
              <input
                className="lesson-title-input"
                value={lesson.title}
                placeholder="Titel van de les"
                onChange={(event) => update({ title: event.target.value })}
              />

              <div className="objectives-editor card">
                <div className="objectives-head">
                  <Target size={16} aria-hidden /> <strong>Leerdoelen</strong>
                </div>
                {lesson.learningObjectives.map((objective, index) => (
                  <div className="block-inline-controls" key={index}>
                    <Input value={objective} onChange={(event) => setObjective(index, event.target.value)} placeholder={`Leerdoel ${index + 1}`} />
                    <button type="button" className="icon-btn" aria-label="Verwijderen" onClick={() => removeObjective(index)}>
                      <X size={16} aria-hidden />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={addObjective}>
                  <Plus size={15} aria-hidden /> Leerdoel toevoegen
                </button>
              </div>

              <BlockList
                blocks={lesson.blocks}
                errorsByBlock={validation.byBlock}
                onChangeBlock={changeBlock}
                onInsertAt={insertAt}
                onDuplicate={duplicateAt}
                onDelete={deleteAt}
                onReorder={reorder}
                onRequestAsset={requestAsset}
              />

              <div className="cluster" style={{ marginTop: "var(--space-4)", justifyContent: "flex-end" }}>
                <Button type="button" variant="secondary" onClick={saveAndClose} disabled={closing}>
                  <Save size={16} aria-hidden /> {closing ? "Opslaan…" : "Nu opslaan"}
                </Button>
              </div>
            </>
          ) : (
            <div className="preview-stage">
              <div className="preview-stage-bar">
                <PreviewToggle device={device} onChange={setDevice} />
                <Link className="btn btn-ghost btn-sm" href={`/app/materials/lessons/${lesson.id}/preview`} target="_blank">
                  Open in nieuw tabblad
                </Link>
              </div>
              <div className={`device-frame device-frame--${device}`}>
                <StudentLessonView lesson={lesson} />
              </div>
            </div>
          )}
        </div>

        {historyOpen ? (
          <VersionHistory lesson={lesson} open={historyOpen} onClose={() => setHistoryOpen(false)} onRestore={restoreVersion} />
        ) : null}
      </div>

      <AssetPicker tenantId={context.user.tenantId} request={assetRequest} onClose={() => setAssetRequest(null)} />
    </div>
  );
}
