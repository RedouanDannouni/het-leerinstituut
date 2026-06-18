"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Upload } from "lucide-react";
import { appendClientAuditEvent } from "@/lib/domain/audit";
import { projects, users } from "@/lib/domain/seed-data";
import type { Observation, ObservationCriterion, ObservationEvidence, SessionContext } from "@/lib/domain/types";
import { readObservationDraft, saveObservationDraft } from "@/lib/observations/autosave";
import { averageScore, scoreLabel } from "@/lib/observations/scoring";
import { generateAiConceptSummary } from "@/lib/observations/summary-generator";
import { hasErrors, validateObservation, type ObservationErrors } from "@/lib/observations/validation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";

function cloneObservation(observation: Observation): Observation {
  return JSON.parse(JSON.stringify(observation)) as Observation;
}

export function ObservationForm({ initialObservation, context }: { initialObservation: Observation; context: SessionContext }) {
  const [observation, setObservation] = useState(() => cloneObservation(initialObservation));
  const [errors, setErrors] = useState<ObservationErrors>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    const stored = readObservationDraft(initialObservation.id);
    if (stored) {
      setShowRecovery(true);
      setSavedAt(stored.savedAt);
    }
  }, [initialObservation.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveObservationDraft(observation);
      setSavedAt(new Date().toISOString());
    }, 600);
    return () => window.clearTimeout(timer);
  }, [observation]);

  const avg = useMemo(() => averageScore(observation.criteria), [observation.criteria]);
  const teachers = users.filter((user) => user.tenantId === context.user.tenantId && user.role === "docent");
  const tenantProjects = projects.filter((project) => project.tenantId === context.user.tenantId);

  const updateCriterion = (criterionId: string, updater: (criterion: ObservationCriterion) => ObservationCriterion) => {
    setObservation((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) => (criterion.id === criterionId ? updater(criterion) : criterion)),
    }));
  };

  const approveSummary = () => {
    const nextErrors = validateObservation(observation, false);
    setErrors(nextErrors);
    if (hasErrors(nextErrors) || !observation.aiDraft) return;
    const approved = {
      ...observation.aiDraft,
      approvedAt: new Date().toISOString(),
      approvedBy: context.user.id,
    };
    const next = { ...observation, status: "completed" as const, aiDraft: approved };
    setObservation(next);
    saveObservationDraft(next);
    window.localStorage.setItem("hli.approved-observation", JSON.stringify(next));
    appendClientAuditEvent(context, "AI-concept samenvatting goedgekeurd", next.lessonTitle);
  };

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        const nextErrors = validateObservation(observation, true);
        setErrors(nextErrors);
        if (!hasErrors(nextErrors)) {
          saveObservationDraft(observation);
          setSavedAt(new Date().toISOString());
        }
      }}
    >
      {showRecovery ? (
        <div className="card cluster" role="status" aria-live="polite" style={{ justifyContent: "space-between" }}>
          <div>
            <strong>Concept gevonden</strong>
            <p className="muted" style={{ margin: 0 }}>
              Er is een lokaal opgeslagen versie van {savedAt ? new Date(savedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "eerder"}.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const stored = readObservationDraft(initialObservation.id);
              if (stored) setObservation(stored.observation);
              setShowRecovery(false);
            }}
          >
            Concept herstellen
          </Button>
        </div>
      ) : null}

      <Card>
        <div className="card-header">
          <div>
            <h2>Context</h2>
            <p className="muted">Vooraf ingevuld waar mogelijk en altijd aanpasbaar.</p>
          </div>
          <Badge tone="warning">Concept opgeslagen</Badge>
        </div>
        <div className="grid grid-2">
          <Field label="Project">
            <Select value={observation.projectId} onChange={(event) => setObservation((current) => ({ ...current, projectId: event.target.value }))}>
              {tenantProjects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </Select>
          </Field>
          <Field label="Docent">
            <Select value={observation.teacherId} onChange={(event) => setObservation((current) => ({ ...current, teacherId: event.target.value }))}>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Lestitel" error={errors.lessonTitle}>
            <Input value={observation.lessonTitle} onChange={(event) => setObservation((current) => ({ ...current, lessonTitle: event.target.value }))} />
          </Field>
          <Field label="Vak / groep" error={errors.subject}>
            <Input value={observation.subject} onChange={(event) => setObservation((current) => ({ ...current, subject: event.target.value }))} />
          </Field>
        </div>
      </Card>

      <div className="stack">
        {observation.criteria.map((criterion) => (
          <Card key={criterion.id}>
            <div className="card-header">
              <div>
                <h2>{criterion.title}</h2>
                <p className="muted">{criterion.description}</p>
              </div>
              <Badge tone={criterion.score ? "info" : "neutral"}>{scoreLabel(criterion.score)}</Badge>
            </div>
            <fieldset className="field">
              <legend className="label">Score</legend>
              <div className="score-grid">
                {[1, 2, 3, 4].map((score) => (
                  <button
                    className="score-button"
                    key={score}
                    type="button"
                    aria-pressed={criterion.score === score}
                    onClick={() => updateCriterion(criterion.id, (item) => ({ ...item, score }))}
                  >
                    {score}
                  </button>
                ))}
              </div>
              {errors.criteria?.[criterion.id] ? <span className="error-text">{errors.criteria[criterion.id]}</span> : null}
            </fieldset>
            <Field label="Toelichting">
              <Textarea value={criterion.note} onChange={(event) => updateCriterion(criterion.id, (item) => ({ ...item, note: event.target.value }))} />
            </Field>
            <div className="stack">
              <div className="cluster" style={{ justifyContent: "space-between" }}>
                <strong>Bewijs</strong>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    updateCriterion(criterion.id, (item) => ({
                      ...item,
                      evidence: [
                        ...item.evidence,
                        {
                          id: `ev-${Date.now()}`,
                          type: "note",
                          label: "Nieuwe bewijsnotitie — bewerk in toelichting.",
                          createdAt: new Date().toISOString(),
                        } satisfies ObservationEvidence,
                      ],
                    }))
                  }
                >
                  <Upload aria-hidden size={16} /> Bewijs toevoegen
                </Button>
              </div>
              {criterion.evidence.length ? (
                <div className="stack">
                  {criterion.evidence.map((evidence) => (
                    <div className="surface" key={evidence.id} style={{ padding: "var(--space-3)" }}>
                      {evidence.label}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="help-text">Voeg een foto, bestand of notitie toe via de knop. Upload is niet afhankelijk van slepen.</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="card-header">
          <div>
            <h2>Samenvatting</h2>
            <p className="muted">AI helpt als concept. Jij bewerkt en keurt expliciet goed.</p>
          </div>
          <Badge tone={observation.aiDraft?.approvedAt ? "success" : "warning"}>
            {observation.aiDraft?.approvedAt ? "Goedgekeurd" : "AI-concept"}
          </Badge>
        </div>
        {observation.aiDraft ? (
          <Field label="Bewerkbare samenvatting" error={errors.summary}>
            <Textarea
              value={observation.aiDraft.text}
              onChange={(event) =>
                setObservation((current) => ({
                  ...current,
                  aiDraft: current.aiDraft ? { ...current.aiDraft, text: event.target.value, approvedAt: undefined, approvedBy: undefined } : current.aiDraft,
                }))
              }
            />
          </Field>
        ) : (
          <p className="muted">Genereer een concept zodra de criteria voldoende gevuld zijn.</p>
        )}
        <div className="cluster">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setObservation((current) => ({ ...current, aiDraft: generateAiConceptSummary(current.criteria) }))}
          >
            <Sparkles aria-hidden size={16} /> AI-concept genereren
          </Button>
          <Button type="button" onClick={approveSummary} disabled={!observation.aiDraft}>
            Goedkeuren
          </Button>
          {observation.aiDraft?.approvedAt ? (
            <Link className="btn btn-primary" href="/app/reports/new">Rapport maken</Link>
          ) : null}
        </div>
      </Card>

      <div className="sticky-actions">
        <div aria-live="polite">
          <strong>{avg ? `Gemiddelde score ${avg}/4` : "Nog geen totaalscore"}</strong>
          <br />
          <span className="muted">
            {savedAt ? `Concept opgeslagen om ${new Date(savedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}` : "Autosave staat klaar"}
          </span>
        </div>
        <div className="cluster">
          <Button type="submit" variant="secondary">Opslaan</Button>
          <Button type="button" onClick={approveSummary} disabled={!observation.aiDraft}>Samenvatting goedkeuren</Button>
        </div>
      </div>
    </form>
  );
}
