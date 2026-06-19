"use client";

import { useState } from "react";
import { Check, CircleHelp, Lightbulb, Plus, X } from "lucide-react";
import type {
  ChoiceOption,
  KnowledgeCheckBlock,
  OpenQuestionBlock,
  QuizBlock,
  QuizQuestion,
} from "@/lib/lessons/types";
import { newId } from "@/lib/lessons/blocks";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import type { BlockEditorProps, BlockStudentProps } from "./shared";

/* ============ Gedeelde optie-editor ============ */
function OptionsEditor({
  options,
  multiple,
  onChange,
}: {
  options: ChoiceOption[];
  multiple: boolean;
  onChange: (options: ChoiceOption[]) => void;
}) {
  const toggleCorrect = (id: string) =>
    onChange(
      options.map((option) =>
        multiple
          ? option.id === id
            ? { ...option, correct: !option.correct }
            : option
          : { ...option, correct: option.id === id },
      ),
    );
  return (
    <div className="stack-sm">
      {options.map((option) => (
        <div className="block-inline-controls" key={option.id}>
          <button
            type="button"
            className={`correct-toggle ${option.correct ? "is-correct" : ""}`}
            aria-pressed={option.correct}
            aria-label={option.correct ? "Juist antwoord" : "Markeer als juist"}
            title="Markeer als juist antwoord"
            onClick={() => toggleCorrect(option.id)}
          >
            <Check size={15} aria-hidden />
          </button>
          <Input
            value={option.text}
            onChange={(event) => onChange(options.map((o) => (o.id === option.id ? { ...o, text: event.target.value } : o)))}
            placeholder="Antwoordoptie"
          />
          <button
            type="button"
            className="icon-btn"
            aria-label="Optie verwijderen"
            onClick={() => onChange(options.filter((o) => o.id !== option.id))}
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onChange([...options, { id: newId("o"), text: "", correct: false }])}
      >
        <Plus size={15} aria-hidden /> Optie toevoegen
      </button>
    </div>
  );
}

/* ============ Knowledge check (formatief) ============ */
export function KnowledgeCheckEditor({ block, onChange }: BlockEditorProps<KnowledgeCheckBlock>) {
  return (
    <div className="stack-sm">
      <Field label="Vraag">
        <Textarea value={block.question} onChange={(event) => onChange({ ...block, question: event.target.value })} />
      </Field>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={block.multiple}
          onChange={(event) => onChange({ ...block, multiple: event.target.checked })}
        />
        Meerdere antwoorden mogelijk
      </label>
      <OptionsEditor options={block.options} multiple={block.multiple} onChange={(options) => onChange({ ...block, options })} />
      <Field label="Hint (optioneel)">
        <Input value={block.hint} onChange={(event) => onChange({ ...block, hint: event.target.value })} />
      </Field>
      <div className="grid grid-2">
        <Field label="Feedback bij goed">
          <Input value={block.feedbackCorrect} onChange={(event) => onChange({ ...block, feedbackCorrect: event.target.value })} />
        </Field>
        <Field label="Feedback bij fout">
          <Input value={block.feedbackIncorrect} onChange={(event) => onChange({ ...block, feedbackIncorrect: event.target.value })} />
        </Field>
      </div>
    </div>
  );
}

export function KnowledgeCheckStudent({ block }: BlockStudentProps<KnowledgeCheckBlock>) {
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const choose = (id: string) => {
    setChecked(false);
    setSelected((current) =>
      block.multiple ? (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]) : [id],
    );
  };

  const correctIds = block.options.filter((o) => o.correct).map((o) => o.id);
  const isCorrect =
    checked &&
    selected.length === correctIds.length &&
    selected.every((id) => correctIds.includes(id));

  return (
    <div className="lesson-question">
      <div className="lesson-question-head">
        <span className="lesson-question-tag">Kennischeck</span>
        {block.hint ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowHint((value) => !value)}>
            <Lightbulb size={15} aria-hidden /> Hint
          </button>
        ) : null}
      </div>
      <p className="lesson-question-text">{block.question}</p>
      {showHint && block.hint ? <p className="lesson-hint">{block.hint}</p> : null}
      <div className="stack-sm">
        {block.options.map((option) => {
          const isSel = selected.includes(option.id);
          const state = checked ? (option.correct ? "correct" : isSel ? "wrong" : "") : isSel ? "selected" : "";
          return (
            <button type="button" key={option.id} className={`answer-option answer-option--${state}`} onClick={() => choose(option.id)}>
              <span className="answer-marker" aria-hidden />
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
      <div className="cluster" style={{ marginTop: "var(--space-3)" }}>
        <button type="button" className="btn btn-primary btn-sm" disabled={!selected.length} onClick={() => setChecked(true)}>
          Controleer
        </button>
      </div>
      {checked ? (
        <p className={`lesson-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
          {isCorrect ? block.feedbackCorrect || "Goed!" : block.feedbackIncorrect || "Nog niet juist."}
        </p>
      ) : null}
    </div>
  );
}

/* ============ Quiz (summatief/formatief) ============ */
export function QuizEditor({ block, onChange }: BlockEditorProps<QuizBlock>) {
  const updateQuestion = (id: string, updater: (q: QuizQuestion) => QuizQuestion) =>
    onChange({ ...block, questions: block.questions.map((q) => (q.id === id ? updater(q) : q)) });

  return (
    <div className="stack-sm">
      <div className="grid grid-2">
        <Field label="Titel">
          <Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
        </Field>
        <Field label="Type">
          <Select value={block.mode} onChange={(event) => onChange({ ...block, mode: event.target.value as QuizBlock["mode"] })}>
            <option value="summatief">Summatief (becijferd)</option>
            <option value="formatief">Formatief (oefenen)</option>
          </Select>
        </Field>
      </div>
      <Field label="Slaagpercentage" help="Minimaal percentage goed om te slagen.">
        <Input
          type="number"
          min={0}
          max={100}
          value={block.passScore}
          onChange={(event) => onChange({ ...block, passScore: Number(event.target.value) })}
          style={{ maxWidth: 120 }}
        />
      </Field>
      {block.questions.map((question, index) => (
        <div className="surface stack-sm" key={question.id} style={{ padding: "var(--space-3)" }}>
          <div className="cluster" style={{ justifyContent: "space-between" }}>
            <strong>Vraag {index + 1}</strong>
            <button
              type="button"
              className="icon-btn"
              aria-label="Vraag verwijderen"
              onClick={() => onChange({ ...block, questions: block.questions.filter((q) => q.id !== question.id) })}
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          <Textarea value={question.question} onChange={(event) => updateQuestion(question.id, (q) => ({ ...q, question: event.target.value }))} placeholder="Vraag…" />
          <label className="checkbox-row">
            <input type="checkbox" checked={question.multiple} onChange={(event) => updateQuestion(question.id, (q) => ({ ...q, multiple: event.target.checked }))} />
            Meerdere antwoorden mogelijk
          </label>
          <OptionsEditor
            options={question.options}
            multiple={question.multiple}
            onChange={(options) => updateQuestion(question.id, (q) => ({ ...q, options }))}
          />
          <Field label="Hint (optioneel)">
            <Input value={question.hint} onChange={(event) => updateQuestion(question.id, (q) => ({ ...q, hint: event.target.value }))} />
          </Field>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() =>
          onChange({
            ...block,
            questions: [
              ...block.questions,
              { id: newId("q"), question: "", multiple: false, points: 1, hint: "", options: [{ id: newId("o"), text: "", correct: true }, { id: newId("o"), text: "", correct: false }] },
            ],
          })
        }
      >
        <Plus size={15} aria-hidden /> Vraag toevoegen
      </button>
    </div>
  );
}

export function QuizStudent({ block }: BlockStudentProps<QuizBlock>) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const choose = (questionId: string, optionId: string, multiple: boolean) => {
    if (submitted) return;
    setAnswers((current) => {
      const existing = current[questionId] ?? [];
      const next = multiple
        ? existing.includes(optionId)
          ? existing.filter((x) => x !== optionId)
          : [...existing, optionId]
        : [optionId];
      return { ...current, [questionId]: next };
    });
  };

  const isQuestionCorrect = (question: QuizQuestion) => {
    const selected = answers[question.id] ?? [];
    const correctIds = question.options.filter((o) => o.correct).map((o) => o.id);
    return selected.length === correctIds.length && selected.every((id) => correctIds.includes(id));
  };

  const correctCount = block.questions.filter(isQuestionCorrect).length;
  const percentage = block.questions.length ? Math.round((correctCount / block.questions.length) * 100) : 0;
  const passed = percentage >= block.passScore;

  return (
    <div className="lesson-quiz">
      <div className="lesson-question-head">
        <span className="lesson-question-tag">{block.mode === "summatief" ? "Toets" : "Oefenquiz"}</span>
        <strong>{block.title}</strong>
      </div>
      <div className="stack">
        {block.questions.map((question, index) => (
          <div className="lesson-question" key={question.id}>
            <p className="lesson-question-text">
              {index + 1}. {question.question}
            </p>
            <div className="stack-sm">
              {question.options.map((option) => {
                const selected = (answers[question.id] ?? []).includes(option.id);
                const state = submitted ? (option.correct ? "correct" : selected ? "wrong" : "") : selected ? "selected" : "";
                return (
                  <button type="button" key={option.id} className={`answer-option answer-option--${state}`} onClick={() => choose(question.id, option.id, question.multiple)}>
                    <span className="answer-marker" aria-hidden />
                    <span>{option.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="cluster" style={{ marginTop: "var(--space-3)" }}>
        {!submitted ? (
          <button type="button" className="btn btn-primary" onClick={() => setSubmitted(true)}>
            Inleveren
          </button>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={() => { setSubmitted(false); setAnswers({}); }}>
            Opnieuw
          </button>
        )}
      </div>
      {submitted ? (
        <p className={`lesson-feedback ${passed ? "is-correct" : "is-wrong"}`}>
          {correctCount} van {block.questions.length} goed ({percentage}%). {passed ? "Geslaagd!" : `Nog niet gehaald (${block.passScore}% nodig).`}
        </p>
      ) : null}
    </div>
  );
}

/* ============ Open vraag ============ */
export function OpenQuestionEditor({ block, onChange }: BlockEditorProps<OpenQuestionBlock>) {
  return (
    <div className="stack-sm">
      <Field label="Vraag">
        <Textarea value={block.question} onChange={(event) => onChange({ ...block, question: event.target.value })} />
      </Field>
      <Field label="Voorbeeldantwoord (optioneel)" help="Wordt na inzenden getoond als zelfcontrole.">
        <Textarea value={block.sampleAnswer} onChange={(event) => onChange({ ...block, sampleAnswer: event.target.value })} />
      </Field>
    </div>
  );
}
export function OpenQuestionStudent({ block }: BlockStudentProps<OpenQuestionBlock>) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="lesson-question">
      <div className="lesson-question-head">
        <span className="lesson-question-tag">
          <CircleHelp size={14} aria-hidden /> Open vraag
        </span>
      </div>
      <p className="lesson-question-text">{block.question}</p>
      <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Typ je antwoord…" />
      {block.sampleAnswer ? (
        <div className="cluster" style={{ marginTop: "var(--space-2)" }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRevealed((value) => !value)}>
            {revealed ? "Verberg voorbeeld" : "Toon voorbeeldantwoord"}
          </button>
        </div>
      ) : null}
      {revealed && block.sampleAnswer ? <p className="lesson-hint">{block.sampleAnswer}</p> : null}
    </div>
  );
}
