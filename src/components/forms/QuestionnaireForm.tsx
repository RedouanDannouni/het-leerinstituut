"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AutoTextarea, FloatingInput, ScaleMeter, SegmentedField } from "@/components/ui/FormControls";
import { BouwsteenIcon, isBouwsteenCode, type BouwsteenCode } from "@/components/forms/BouwsteenIcon";
import { SCALES } from "@/lib/forms/definitions";
import { submitKwaliteitsmonitorForm } from "@/lib/forms/actions";
import { allRatingColumns, type FormDefinition, type MetaAutofill, type MetaField, type RatingGroup } from "@/lib/forms/types";

type MetaState = Record<string, string>;
type RatingState = Record<string, number>;
type AnalyseState = Record<string, string>;

export interface QuestionnaireFormProps {
  def: FormDefinition;
  tenantId?: string;
  autofill?: Partial<Record<MetaAutofill, string>>;
  /** Waar de gebruiker naartoe kan na succesvol verzenden (ingelogde formulieren). */
  doneHref?: string;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function metaInitial(def: FormDefinition, autofill?: QuestionnaireFormProps["autofill"]): MetaState {
  const state: MetaState = {};
  for (const field of def.meta) {
    let value = "";
    if (field.autofill && autofill?.[field.autofill]) value = autofill[field.autofill] as string;
    if (field.autofill === "datum-vandaag" && !value) value = todayIso();
    if (field.autofill === "tijd-nu" && !value) value = nowTime();
    state[field.column] = value;
  }
  return state;
}

export function QuestionnaireForm({ def, tenantId, autofill, doneHref }: QuestionnaireFormProps) {
  const draftKey = `hli.form-draft.${def.key}.${tenantId ?? "me"}`;
  const scale = SCALES[def.scale];
  const totalRatings = useMemo(() => allRatingColumns(def).length, [def]);

  const [meta, setMeta] = useState<MetaState>(() => metaInitial(def, autofill));
  const [ratings, setRatings] = useState<RatingState>({});
  const [analyses, setAnalyses] = useState<AnalyseState>({});
  const [generalNote, setGeneralNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Concept herstellen uit localStorage.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(draftKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.meta) setMeta((current) => ({ ...current, ...parsed.meta }));
        if (parsed.ratings) setRatings(parsed.ratings);
        if (parsed.analyses) setAnalyses(parsed.analyses);
        if (typeof parsed.generalNote === "string") setGeneralNote(parsed.generalNote);
      }
    } catch {
      // corrupte draft negeren
    }
    hydrated.current = true;
  }, [draftKey]);

  // Autosave (debounced).
  useEffect(() => {
    if (!hydrated.current || done) return undefined;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify({ meta, ratings, analyses, generalNote }));
      setSavedAt(new Date().toISOString());
    }, 600);
    return () => window.clearTimeout(timer);
  }, [meta, ratings, analyses, generalNote, draftKey, done]);

  const answered = useMemo(
    () => allRatingColumns(def).filter((column) => ratings[column] != null).length,
    [def, ratings],
  );

  const setRating = (column: string, value: number) => {
    setRatings((current) => ({ ...current, [column]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    for (const field of def.meta) {
      if (field.required && !(meta[field.column] ?? "").trim()) {
        setError(`Vul het veld "${field.label}" in.`);
        return;
      }
    }
    if (answered < totalRatings) {
      setError(`Beantwoord alle vragen (${answered}/${totalRatings} ingevuld).`);
      return;
    }

    setSubmitting(true);
    const result = await submitKwaliteitsmonitorForm({
      formKey: def.key,
      tenantId,
      values: { meta, ratings, analyses, generalNote },
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.localStorage.removeItem(draftKey);
    setDone(true);
  };

  if (done) {
    return (
      <Card>
        <div className="stack" style={{ alignItems: "center", textAlign: "center", padding: "var(--space-4)" }}>
          <CheckCircle2 size={40} aria-hidden style={{ color: "var(--color-success, #16a34a)" }} />
          <h2>Bedankt — je antwoorden zijn opgeslagen.</h2>
          <p className="muted">De ingevulde gegevens zijn veilig verwerkt in de Kwaliteitsmonitor.</p>
          {doneHref ? (
            <a className="btn btn-primary" href={doneHref}>
              Terug naar overzicht
            </a>
          ) : null}
        </div>
      </Card>
    );
  }

  const renderGroup = (group: RatingGroup) => {
    const answeredCount = group.items.filter((item) => ratings[item.column] != null).length;
    const hasIcon = group.icon != null && isBouwsteenCode(group.icon);
    return (
    <Card key={group.key}>
      {hasIcon ? (
        <div className="bs-title">
          <span className="bs-tile">
            <BouwsteenIcon code={group.icon as BouwsteenCode} title="" />
          </span>
          <h2>{group.label}</h2>
          {group.description ? <p className="muted">{group.description}</p> : null}
          <Badge tone="neutral">
            {answeredCount}/{group.items.length}
          </Badge>
        </div>
      ) : (
        <div className="card-header">
          <div>
            <h2>{group.label}</h2>
            {group.description ? <p className="muted">{group.description}</p> : null}
          </div>
          <Badge tone="neutral">
            {answeredCount}/{group.items.length}
          </Badge>
        </div>
      )}
      <div className="stack">
        {group.items.map((item) => (
          <fieldset className="q-row" key={item.column}>
            <legend className="q-text">
              <span className="q-nr">{item.nr}.</span> {item.text}
            </legend>
            <ScaleMeter
              name={`${def.key}-${item.column}`}
              options={scale}
              value={ratings[item.column]}
              onChange={(value) => setRating(item.column, value)}
              ariaLabel={`Score voor vraag ${item.nr}`}
            />
          </fieldset>
        ))}
      </div>
      {group.analyseColumn ? (
        <AutoTextarea
          label={group.analyseLabel ?? "Toelichting"}
          value={analyses[group.analyseColumn] ?? ""}
          onChange={(event) =>
            setAnalyses((current) => ({ ...current, [group.analyseColumn as string]: event.target.value }))
          }
        />
      ) : null}
    </Card>
    );
  };

  const groupByKey = new Map(def.groups.map((group) => [group.key, group]));

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <Card>
        <div className="card-header">
          <div>
            <h2>Gegevens</h2>
            <p className="muted">{def.respondent}</p>
          </div>
        </div>
        <div className="grid grid-2">
          {def.meta.map((field) => {
            const wide = field.input === "select" || field.input === "textarea";
            return (
              <div key={field.column} style={wide ? { gridColumn: "1 / -1" } : undefined}>
                <MetaInputField
                  field={field}
                  value={meta[field.column] ?? ""}
                  onChange={(value) => {
                    setMeta((current) => ({ ...current, [field.column]: value }));
                    setError(null);
                  }}
                />
              </div>
            );
          })}
        </div>
        {def.generalNote ? (
          <AutoTextarea
            label={def.generalNote.label}
            help={def.generalNote.help}
            value={generalNote}
            onChange={(event) => setGeneralNote(event.target.value)}
          />
        ) : null}
      </Card>

      <div className="surface" style={{ padding: "var(--space-3)" }}>
        <strong>Antwoordschaal</strong>
        <div className="cluster" style={{ flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
          {scale.map((option) => (
            <span key={option.value} className="help-text">
              <strong>{option.value}</strong> = {option.label}
              {option.description ? ` (${option.description})` : ""}
            </span>
          ))}
        </div>
      </div>

      {def.sections ? (
        def.sections.map((section) => (
          <section className="stack" key={section.label}>
            <h3 className="eyebrow" style={{ marginBottom: 0 }}>{section.label}</h3>
            {section.groupKeys.map((key) => {
              const group = groupByKey.get(key);
              return group ? renderGroup(group) : null;
            })}
          </section>
        ))
      ) : (
        def.groups.map((group) => renderGroup(group))
      )}

      <div className="sticky-actions">
        <div className="sticky-actions__status" aria-live="polite">
          <strong>
            {answered}/{totalRatings} vragen beantwoord
          </strong>
          <div className="q-progress" role="progressbar" aria-valuemin={0} aria-valuemax={totalRatings} aria-valuenow={answered}>
            <span style={{ width: `${totalRatings ? Math.round((answered / totalRatings) * 100) : 0}%` }} />
          </div>
          <span className="muted">
            {error ? (
              <span className="error-text">{error}</span>
            ) : savedAt ? (
              `Concept opgeslagen om ${new Date(savedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`
            ) : (
              "Autosave staat klaar"
            )}
          </span>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Versturen…" : "Verzenden"}
        </Button>
      </div>
    </form>
  );
}

function MetaInputField({ field, value, onChange }: { field: MetaField; value: string; onChange: (value: string) => void }) {
  if (field.input === "textarea") {
    return (
      <AutoTextarea
        label={field.label}
        help={field.help}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  if (field.input === "select") {
    return (
      <SegmentedField
        label={field.label}
        name={field.column}
        options={field.options ?? []}
        value={value}
        onChange={onChange}
        help={field.help}
        clearable={!field.required}
      />
    );
  }
  return (
    <FloatingInput
      label={field.label}
      help={field.help}
      type={field.input}
      value={value}
      locked={field.locked}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
