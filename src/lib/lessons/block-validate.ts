import type { Block, Lesson } from "./types";

/**
 * Validatie per blok. Lege array = in orde.
 * Hier dwingen we toegankelijkheid af (alt-tekst, ondertiteling, titels).
 */
export function validateBlock(block: Block): string[] {
  const errors: string[] = [];
  switch (block.type) {
    case "heading":
      if (!block.text.trim()) errors.push("Kop heeft tekst nodig.");
      break;
    case "image":
      if (!block.url.trim()) errors.push("Afbeelding ontbreekt.");
      if (!block.alt.trim()) errors.push("Alt-tekst is verplicht voor afbeeldingen.");
      break;
    case "video":
      if (!block.url.trim()) errors.push("Video-URL ontbreekt.");
      if (!block.captionsUrl.trim()) errors.push("Ondertiteling (captions) is verplicht voor video.");
      break;
    case "audio":
      if (!block.url.trim()) errors.push("Audio ontbreekt.");
      if (!block.transcript.trim()) errors.push("Transcript is verplicht voor audio.");
      break;
    case "embed":
      if (!block.url.trim()) errors.push("Embed-URL ontbreekt.");
      if (!block.title.trim()) errors.push("Titel is verplicht voor een embed (toegankelijkheid).");
      break;
    case "labeledImage":
      if (!block.url.trim()) errors.push("Afbeelding ontbreekt.");
      if (!block.alt.trim()) errors.push("Alt-tekst is verplicht.");
      break;
    case "attachment":
      if (!block.url.trim()) errors.push("Bijlage ontbreekt.");
      if (!block.label.trim()) errors.push("Geef de bijlage een duidelijk label.");
      break;
    case "knowledgeCheck":
      if (!block.question.trim()) errors.push("Vraag mag niet leeg zijn.");
      if (block.options.length < 2) errors.push("Minimaal twee antwoordopties.");
      if (!block.options.some((option) => option.correct)) errors.push("Markeer minstens één juist antwoord.");
      break;
    case "quiz":
      if (!block.questions.length) errors.push("Quiz heeft minstens één vraag nodig.");
      block.questions.forEach((question, index) => {
        if (!question.question.trim()) errors.push(`Vraag ${index + 1} is leeg.`);
        if (!question.options.some((option) => option.correct)) errors.push(`Vraag ${index + 1} heeft geen juist antwoord.`);
      });
      break;
    case "openQuestion":
      if (!block.question.trim()) errors.push("Open vraag mag niet leeg zijn.");
      break;
    default:
      break;
  }
  return errors;
}

export interface LessonValidation {
  ok: boolean;
  /** map van blok-id naar foutmeldingen */
  byBlock: Record<string, string[]>;
  general: string[];
}

/** Poort vóór publiceren: aggregeert alle blok-validaties + lesniveau-checks. */
export function validateLessonForPublish(lesson: Lesson): LessonValidation {
  const byBlock: Record<string, string[]> = {};
  const general: string[] = [];

  if (!lesson.title.trim()) general.push("Geef de les een titel.");
  if (!lesson.blocks.length) general.push("Voeg minstens één blok toe.");

  for (const block of lesson.blocks) {
    const errors = validateBlock(block);
    if (errors.length) byBlock[block.id] = errors;
  }

  const ok = general.length === 0 && Object.keys(byBlock).length === 0;
  return { ok, byBlock, general };
}

export function countBlockIssues(validation: LessonValidation): number {
  return validation.general.length + Object.values(validation.byBlock).reduce((sum, list) => sum + list.length, 0);
}
