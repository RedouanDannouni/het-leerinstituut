"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, Plus, RotateCw, X } from "lucide-react";
import type {
  AccordionBlock,
  FlashcardsBlock,
  LabeledImageBlock,
  SortBlock,
  TabsBlock,
  TimelineBlock,
} from "@/lib/lessons/types";
import { newId } from "@/lib/lessons/blocks";
import { Input, Textarea } from "@/components/ui/Form";
import type { BlockEditorProps, BlockStudentProps } from "./shared";

/* ============ Accordion ============ */
export function AccordionEditor({ block, onChange }: BlockEditorProps<AccordionBlock>) {
  return (
    <div className="stack-sm">
      {block.items.map((item) => (
        <div className="surface stack-sm" key={item.id} style={{ padding: "var(--space-3)" }}>
          <div className="block-inline-controls">
            <Input value={item.title} onChange={(event) => onChange({ ...block, items: block.items.map((i) => (i.id === item.id ? { ...i, title: event.target.value } : i)) })} placeholder="Titel" />
            <button type="button" className="icon-btn" aria-label="Verwijderen" onClick={() => onChange({ ...block, items: block.items.filter((i) => i.id !== item.id) })}>
              <X size={16} aria-hidden />
            </button>
          </div>
          <Textarea value={item.body} onChange={(event) => onChange({ ...block, items: block.items.map((i) => (i.id === item.id ? { ...i, body: event.target.value } : i)) })} placeholder="Inhoud" />
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({ ...block, items: [...block.items, { id: newId("a"), title: "Nieuw item", body: "" }] })}>
        <Plus size={15} aria-hidden /> Item toevoegen
      </button>
    </div>
  );
}
export function AccordionStudent({ block }: BlockStudentProps<AccordionBlock>) {
  return (
    <div className="accordion">
      {block.items.map((item) => (
        <details className="accordion-item" key={item.id}>
          <summary>
            {item.title}
            <ChevronDown size={16} aria-hidden className="accordion-caret" />
          </summary>
          <div className="accordion-body">{item.body}</div>
        </details>
      ))}
    </div>
  );
}

/* ============ Tabs ============ */
export function TabsEditor({ block, onChange }: BlockEditorProps<TabsBlock>) {
  return (
    <div className="stack-sm">
      {block.items.map((item, index) => (
        <div className="surface stack-sm" key={item.id} style={{ padding: "var(--space-3)" }}>
          <div className="block-inline-controls">
            <Input value={item.label} onChange={(event) => onChange({ ...block, items: block.items.map((i) => (i.id === item.id ? { ...i, label: event.target.value } : i)) })} placeholder={`Tab ${index + 1}`} />
            <button type="button" className="icon-btn" aria-label="Verwijderen" onClick={() => onChange({ ...block, items: block.items.filter((i) => i.id !== item.id) })}>
              <X size={16} aria-hidden />
            </button>
          </div>
          <Textarea value={item.body} onChange={(event) => onChange({ ...block, items: block.items.map((i) => (i.id === item.id ? { ...i, body: event.target.value } : i)) })} placeholder="Inhoud" />
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({ ...block, items: [...block.items, { id: newId("t"), label: "Nieuwe tab", body: "" }] })}>
        <Plus size={15} aria-hidden /> Tab toevoegen
      </button>
    </div>
  );
}
export function TabsStudent({ block }: BlockStudentProps<TabsBlock>) {
  const [active, setActive] = useState(0);
  if (!block.items.length) return null;
  const current = block.items[Math.min(active, block.items.length - 1)];
  return (
    <div className="tabs">
      <div className="tabs-bar" role="tablist">
        {block.items.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={index === active}
            className={`tabs-tab ${index === active ? "is-active" : ""}`}
            onClick={() => setActive(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="tabs-panel" role="tabpanel">
        {current.body}
      </div>
    </div>
  );
}

/* ============ Flashcards ============ */
export function FlashcardsEditor({ block, onChange }: BlockEditorProps<FlashcardsBlock>) {
  return (
    <div className="stack-sm">
      {block.cards.map((card, index) => (
        <div className="block-inline-controls" key={card.id}>
          <Input value={card.front} onChange={(event) => onChange({ ...block, cards: block.cards.map((c) => (c.id === card.id ? { ...c, front: event.target.value } : c)) })} placeholder={`Voorkant ${index + 1}`} />
          <Input value={card.back} onChange={(event) => onChange({ ...block, cards: block.cards.map((c) => (c.id === card.id ? { ...c, back: event.target.value } : c)) })} placeholder="Achterkant" />
          <button type="button" className="icon-btn" aria-label="Verwijderen" onClick={() => onChange({ ...block, cards: block.cards.filter((c) => c.id !== card.id) })}>
            <X size={16} aria-hidden />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({ ...block, cards: [...block.cards, { id: newId("f"), front: "", back: "" }] })}>
        <Plus size={15} aria-hidden /> Kaart toevoegen
      </button>
    </div>
  );
}
export function FlashcardsStudent({ block }: BlockStudentProps<FlashcardsBlock>) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!block.cards.length) return null;
  const card = block.cards[index];
  const go = (delta: number) => {
    setFlipped(false);
    setIndex((current) => (current + delta + block.cards.length) % block.cards.length);
  };
  return (
    <div className="flashcards">
      <button type="button" className={`flashcard ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((value) => !value)} aria-label="Kaart omdraaien">
        <span className="flashcard-face">{flipped ? card.back : card.front}</span>
        <span className="flashcard-hint">
          <RotateCw size={13} aria-hidden /> {flipped ? "Achterkant" : "Voorkant"}
        </span>
      </button>
      <div className="flashcards-nav">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(-1)}>Vorige</button>
        <span className="muted">{index + 1} / {block.cards.length}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(1)}>Volgende</button>
      </div>
    </div>
  );
}

/* ============ Labeled image (hotspots) ============ */
export function LabeledImageEditor({ block, onChange, onRequestAsset }: BlockEditorProps<LabeledImageBlock>) {
  const addHotspot = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    onChange({ ...block, hotspots: [...block.hotspots, { id: newId("h"), x, y, label: "Nieuw punt", detail: "" }] });
  };
  return (
    <div className="stack-sm">
      {block.url ? (
        <div className="labeled-image labeled-image--editor" onClick={addHotspot} role="presentation">
          <img src={block.url} alt={block.alt || "Voorbeeld"} />
          {block.hotspots.map((spot, index) => (
            <span key={spot.id} className="hotspot-dot" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>{index + 1}</span>
          ))}
          <span className="labeled-image-hint">Klik op de afbeelding om een punt toe te voegen</span>
        </div>
      ) : (
        <button type="button" className="media-dropzone" onClick={() => onRequestAsset?.(["image"], (asset) => onChange({ ...block, url: asset.url ?? "", alt: asset.altText || block.alt }))}>
          Afbeelding kiezen
        </button>
      )}
      <Input value={block.alt} onChange={(event) => onChange({ ...block, alt: event.target.value })} placeholder="Alt-tekst (verplicht)" />
      {block.hotspots.map((spot, index) => (
        <div className="surface stack-sm" key={spot.id} style={{ padding: "var(--space-3)" }}>
          <div className="block-inline-controls">
            <strong style={{ minWidth: 24 }}>{index + 1}.</strong>
            <Input value={spot.label} onChange={(event) => onChange({ ...block, hotspots: block.hotspots.map((h) => (h.id === spot.id ? { ...h, label: event.target.value } : h)) })} placeholder="Label" />
            <button type="button" className="icon-btn" aria-label="Verwijderen" onClick={() => onChange({ ...block, hotspots: block.hotspots.filter((h) => h.id !== spot.id) })}>
              <X size={16} aria-hidden />
            </button>
          </div>
          <Textarea value={spot.detail} onChange={(event) => onChange({ ...block, hotspots: block.hotspots.map((h) => (h.id === spot.id ? { ...h, detail: event.target.value } : h)) })} placeholder="Toelichting" />
        </div>
      ))}
    </div>
  );
}
export function LabeledImageStudent({ block }: BlockStudentProps<LabeledImageBlock>) {
  const [active, setActive] = useState<string | null>(null);
  if (!block.url) return null;
  const activeSpot = block.hotspots.find((spot) => spot.id === active);
  return (
    <div className="stack-sm">
      <div className="labeled-image">
        <img src={block.url} alt={block.alt} />
        {block.hotspots.map((spot, index) => (
          <button
            key={spot.id}
            type="button"
            className={`hotspot-dot hotspot-dot--btn ${active === spot.id ? "is-active" : ""}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            onClick={() => setActive((current) => (current === spot.id ? null : spot.id))}
            aria-label={spot.label}
          >
            {index + 1}
          </button>
        ))}
      </div>
      {activeSpot ? (
        <div className="callout callout--info">
          <div>
            <strong>{activeSpot.label}</strong>
            <p style={{ margin: 0 }}>{activeSpot.detail}</p>
          </div>
        </div>
      ) : (
        <p className="muted">Klik op een genummerd punt voor uitleg.</p>
      )}
    </div>
  );
}

/* ============ Timeline ============ */
export function TimelineEditor({ block, onChange }: BlockEditorProps<TimelineBlock>) {
  return (
    <div className="stack-sm">
      {block.events.map((event) => (
        <div className="surface stack-sm" key={event.id} style={{ padding: "var(--space-3)" }}>
          <div className="block-inline-controls">
            <Input value={event.date} onChange={(e) => onChange({ ...block, events: block.events.map((ev) => (ev.id === event.id ? { ...ev, date: e.target.value } : ev)) })} placeholder="Datum / jaar" style={{ maxWidth: 140 }} />
            <Input value={event.title} onChange={(e) => onChange({ ...block, events: block.events.map((ev) => (ev.id === event.id ? { ...ev, title: e.target.value } : ev)) })} placeholder="Titel" />
            <button type="button" className="icon-btn" aria-label="Verwijderen" onClick={() => onChange({ ...block, events: block.events.filter((ev) => ev.id !== event.id) })}>
              <X size={16} aria-hidden />
            </button>
          </div>
          <Textarea value={event.body} onChange={(e) => onChange({ ...block, events: block.events.map((ev) => (ev.id === event.id ? { ...ev, body: e.target.value } : ev)) })} placeholder="Beschrijving" />
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({ ...block, events: [...block.events, { id: newId("e"), date: "", title: "", body: "" }] })}>
        <Plus size={15} aria-hidden /> Gebeurtenis toevoegen
      </button>
    </div>
  );
}
export function TimelineStudent({ block }: BlockStudentProps<TimelineBlock>) {
  return (
    <ol className="timeline">
      {block.events.map((event) => (
        <li className="timeline-item" key={event.id}>
          <span className="timeline-dot" aria-hidden />
          <div className="timeline-content">
            {event.date ? <span className="timeline-date">{event.date}</span> : null}
            <strong>{event.title}</strong>
            {event.body ? <p>{event.body}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ============ Sort (sleep in volgorde) ============ */
export function SortEditor({ block, onChange }: BlockEditorProps<SortBlock>) {
  const move = (index: number, delta: number) => {
    const next = [...block.items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...block, items: next });
  };
  return (
    <div className="stack-sm">
      <Input value={block.prompt} onChange={(event) => onChange({ ...block, prompt: event.target.value })} placeholder="Opdracht" />
      <p className="help-text">De volgorde hieronder is de juiste volgorde. Docenten krijgen ze door elkaar.</p>
      {block.items.map((item, index) => (
        <div className="block-inline-controls" key={item.id}>
          <span className="sort-index">{index + 1}</span>
          <Input value={item.text} onChange={(event) => onChange({ ...block, items: block.items.map((i) => (i.id === item.id ? { ...i, text: event.target.value } : i)) })} placeholder="Item" />
          <button type="button" className="icon-btn" aria-label="Omhoog" onClick={() => move(index, -1)}><ArrowUp size={15} aria-hidden /></button>
          <button type="button" className="icon-btn" aria-label="Omlaag" onClick={() => move(index, 1)}><ArrowDown size={15} aria-hidden /></button>
          <button type="button" className="icon-btn" aria-label="Verwijderen" onClick={() => onChange({ ...block, items: block.items.filter((i) => i.id !== item.id) })}><X size={16} aria-hidden /></button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({ ...block, items: [...block.items, { id: newId("s"), text: "" }] })}>
        <Plus size={15} aria-hidden /> Item toevoegen
      </button>
    </div>
  );
}
export function SortStudent({ block }: BlockStudentProps<SortBlock>) {
  const correctOrder = block.items.map((item) => item.id);
  const [order, setOrder] = useState<string[]>(() => shuffle(correctOrder));
  const [checked, setChecked] = useState(false);
  const byId = new Map(block.items.map((item) => [item.id, item]));
  const move = (index: number, delta: number) => {
    setChecked(false);
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };
  const isCorrect = checked && order.every((id, index) => id === correctOrder[index]);
  return (
    <div className="lesson-question">
      <p className="lesson-question-text">{block.prompt}</p>
      <div className="stack-sm">
        {order.map((id, index) => (
          <div className="sort-row" key={id}>
            <span className="sort-index">{index + 1}</span>
            <span className="sort-text">{byId.get(id)?.text}</span>
            <button type="button" className="icon-btn" aria-label="Omhoog" onClick={() => move(index, -1)}><ArrowUp size={15} aria-hidden /></button>
            <button type="button" className="icon-btn" aria-label="Omlaag" onClick={() => move(index, 1)}><ArrowDown size={15} aria-hidden /></button>
          </div>
        ))}
      </div>
      <div className="cluster" style={{ marginTop: "var(--space-3)" }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setChecked(true)}>
          <Check size={15} aria-hidden /> Controleer
        </button>
      </div>
      {checked ? (
        <p className={`lesson-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
          {isCorrect ? "Helemaal goed!" : "Nog niet in de juiste volgorde."}
        </p>
      ) : null}
    </div>
  );
}

function shuffle<T>(input: T[]): T[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  // garandeer dat het niet exact gelijk start als er meer dan 1 item is
  if (array.length > 1 && array.every((value, index) => value === input[index])) {
    [array[0], array[1]] = [array[1], array[0]];
  }
  return array;
}
