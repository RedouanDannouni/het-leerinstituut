"use client";

import { Info, Lightbulb, Plus, TriangleAlert, X } from "lucide-react";
import type {
  CalloutBlock,
  CalloutTone,
  HeadingBlock,
  ListBlock,
  QuoteBlock,
  RichTextBlock,
} from "@/lib/lessons/types";
import { Input, Select, Textarea } from "@/components/ui/Form";
import { RichTextEditor, RichTextView } from "@/components/lessons/RichText";
import type { BlockEditorProps, BlockStudentProps } from "./shared";

/* ---------------- Heading ---------------- */
export function HeadingEditor({ block, onChange }: BlockEditorProps<HeadingBlock>) {
  return (
    <div className="stack-sm">
      <div className="block-inline-controls">
        <Select
          value={String(block.level)}
          onChange={(event) => onChange({ ...block, level: Number(event.target.value) as 2 | 3 })}
          aria-label="Kop-niveau"
          style={{ maxWidth: 120 }}
        >
          <option value="2">Kop</option>
          <option value="3">Subkop</option>
        </Select>
      </div>
      <input
        className={`heading-input heading-input--h${block.level}`}
        value={block.text}
        placeholder="Koptekst…"
        onChange={(event) => onChange({ ...block, text: event.target.value })}
      />
    </div>
  );
}
export function HeadingStudent({ block }: BlockStudentProps<HeadingBlock>) {
  return block.level === 2 ? <h2>{block.text}</h2> : <h3>{block.text}</h3>;
}

/* ---------------- Rich text ---------------- */
export function RichTextBlockEditor({ block, onChange }: BlockEditorProps<RichTextBlock>) {
  return <RichTextEditor html={block.html} onChange={(html) => onChange({ ...block, html })} />;
}
export function RichTextBlockStudent({ block }: BlockStudentProps<RichTextBlock>) {
  return <RichTextView html={block.html} />;
}

/* ---------------- Callout ---------------- */
const calloutMeta: Record<CalloutTone, { icon: React.ElementType; label: string }> = {
  tip: { icon: Lightbulb, label: "Tip" },
  "let-op": { icon: TriangleAlert, label: "Let op" },
  info: { icon: Info, label: "Info" },
};
export function CalloutEditor({ block, onChange }: BlockEditorProps<CalloutBlock>) {
  return (
    <div className="stack-sm">
      <div className="block-inline-controls">
        <Select
          value={block.tone}
          onChange={(event) => onChange({ ...block, tone: event.target.value as CalloutTone })}
          aria-label="Soort callout"
          style={{ maxWidth: 140 }}
        >
          <option value="tip">Tip</option>
          <option value="let-op">Let op</option>
          <option value="info">Info</option>
        </Select>
        <Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} placeholder="Titel" />
      </div>
      <Textarea value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} placeholder="Tekst…" />
    </div>
  );
}
export function CalloutStudent({ block }: BlockStudentProps<CalloutBlock>) {
  const Icon = calloutMeta[block.tone].icon;
  return (
    <div className={`callout callout--${block.tone}`}>
      <span className="callout-icon" aria-hidden>
        <Icon size={18} />
      </span>
      <div>
        {block.title ? <strong>{block.title}</strong> : null}
        <p style={{ margin: 0 }}>{block.text}</p>
      </div>
    </div>
  );
}

/* ---------------- Quote ---------------- */
export function QuoteEditor({ block, onChange }: BlockEditorProps<QuoteBlock>) {
  return (
    <div className="stack-sm">
      <Textarea value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} placeholder="Citaat…" />
      <Input
        value={block.attribution}
        onChange={(event) => onChange({ ...block, attribution: event.target.value })}
        placeholder="Bron / auteur (optioneel)"
      />
    </div>
  );
}
export function QuoteStudent({ block }: BlockStudentProps<QuoteBlock>) {
  return (
    <blockquote className="lesson-quote">
      <p>{block.text}</p>
      {block.attribution ? <cite>— {block.attribution}</cite> : null}
    </blockquote>
  );
}

/* ---------------- List ---------------- */
export function ListEditor({ block, onChange }: BlockEditorProps<ListBlock>) {
  const update = (index: number, value: string) =>
    onChange({ ...block, items: block.items.map((item, i) => (i === index ? value : item)) });
  return (
    <div className="stack-sm">
      <div className="block-inline-controls">
        <Select
          value={block.ordered ? "ordered" : "bullet"}
          onChange={(event) => onChange({ ...block, ordered: event.target.value === "ordered" })}
          aria-label="Lijststijl"
          style={{ maxWidth: 160 }}
        >
          <option value="bullet">Opsomming</option>
          <option value="ordered">Genummerd</option>
        </Select>
      </div>
      {block.items.map((item, index) => (
        <div className="block-inline-controls" key={index}>
          <Input value={item} onChange={(event) => update(index, event.target.value)} placeholder={`Punt ${index + 1}`} />
          <button
            type="button"
            className="icon-btn"
            aria-label="Verwijderen"
            onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== index) })}
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({ ...block, items: [...block.items, ""] })}>
        <Plus size={15} aria-hidden /> Punt toevoegen
      </button>
    </div>
  );
}
export function ListStudent({ block }: BlockStudentProps<ListBlock>) {
  const items = block.items.filter(Boolean);
  return block.ordered ? (
    <ol className="lesson-list">{items.map((item, i) => <li key={i}>{item}</li>)}</ol>
  ) : (
    <ul className="lesson-list">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
  );
}
