import { nanoid } from "nanoid";
import type { Block, BlockType } from "./types";

export function newId(prefix = "b"): string {
  return `${prefix}_${nanoid(8)}`;
}

/** Maakt een nieuw blok met zinnige standaardwaarden. */
export function createBlock(type: BlockType): Block {
  const id = newId();
  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "Nieuwe kop" };
    case "richText":
      return { id, type, html: "<p>Begin hier met typen…</p>" };
    case "callout":
      return { id, type, tone: "tip", title: "Tip", text: "Een korte tip voor de leerling." };
    case "quote":
      return { id, type, text: "Een citaat dat blijft hangen.", attribution: "" };
    case "list":
      return { id, type, ordered: false, items: ["Eerste punt", "Tweede punt"] };
    case "image":
      return { id, type, assetId: null, url: "", alt: "", caption: "" };
    case "video":
      return { id, type, source: "youtube", url: "", captionsUrl: "", title: "" };
    case "audio":
      return { id, type, url: "", transcript: "", title: "" };
    case "embed":
      return { id, type, url: "", title: "" };
    case "code":
      return { id, type, language: "text", code: "" };
    case "attachment":
      return { id, type, assetId: null, url: "", label: "Download" };
    case "divider":
      return { id, type };
    case "knowledgeCheck":
      return {
        id,
        type,
        question: "Stel hier je vraag…",
        multiple: false,
        options: [
          { id: newId("o"), text: "Antwoord A", correct: true },
          { id: newId("o"), text: "Antwoord B", correct: false },
        ],
        hint: "",
        feedbackCorrect: "Goed gedaan!",
        feedbackIncorrect: "Bekijk de uitleg nog eens.",
      };
    case "quiz":
      return {
        id,
        type,
        title: "Quiz",
        mode: "summatief",
        passScore: 60,
        questions: [
          {
            id: newId("q"),
            question: "Eerste vraag…",
            multiple: false,
            points: 1,
            hint: "",
            options: [
              { id: newId("o"), text: "Antwoord A", correct: true },
              { id: newId("o"), text: "Antwoord B", correct: false },
            ],
          },
        ],
      };
    case "openQuestion":
      return { id, type, question: "Open vraag…", sampleAnswer: "" };
    case "accordion":
      return {
        id,
        type,
        items: [
          { id: newId("a"), title: "Eerste item", body: "Inhoud…" },
          { id: newId("a"), title: "Tweede item", body: "Inhoud…" },
        ],
      };
    case "tabs":
      return {
        id,
        type,
        items: [
          { id: newId("t"), label: "Tab 1", body: "Inhoud…" },
          { id: newId("t"), label: "Tab 2", body: "Inhoud…" },
        ],
      };
    case "flashcards":
      return {
        id,
        type,
        cards: [
          { id: newId("f"), front: "Begrip", back: "Definitie" },
          { id: newId("f"), front: "Begrip", back: "Definitie" },
        ],
      };
    case "labeledImage":
      return { id, type, url: "", alt: "", hotspots: [] };
    case "timeline":
      return {
        id,
        type,
        events: [
          { id: newId("e"), date: "", title: "Gebeurtenis", body: "" },
        ],
      };
    case "sort":
      return {
        id,
        type,
        prompt: "Zet in de juiste volgorde:",
        items: [
          { id: newId("s"), text: "Stap 1" },
          { id: newId("s"), text: "Stap 2" },
          { id: newId("s"), text: "Stap 3" },
        ],
      };
    default: {
      const _exhaustive: never = type;
      throw new Error(`Onbekend bloktype: ${_exhaustive as string}`);
    }
  }
}

/** Verplaatst een blok van index `from` naar `to` (immutabel). */
export function moveBlock(blocks: Block[], from: number, to: number): Block[] {
  if (from === to || from < 0 || to < 0 || from >= blocks.length || to >= blocks.length) return blocks;
  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Dupliceert een blok met verse id's (recursief voor geneste id's). */
export function duplicateBlock(block: Block): Block {
  const cloned = JSON.parse(JSON.stringify(block)) as Block;
  return reIdBlock(cloned);
}

function reIdBlock(block: Block): Block {
  const next = { ...block, id: newId() } as Block & Record<string, unknown>;
  for (const key of Object.keys(next)) {
    const value = next[key];
    if (Array.isArray(value)) {
      next[key] = value.map((item) =>
        item && typeof item === "object" && "id" in (item as object)
          ? { ...(item as object), id: newId("n") }
          : item,
      );
    }
  }
  return next as Block;
}
