import type { Role, TenantId } from "@/lib/domain/types";

export const LESSON_SCHEMA_VERSION = 1;

export type BlockType =
  // Tekst
  | "heading"
  | "richText"
  | "callout"
  | "quote"
  | "list"
  // Media
  | "image"
  | "video"
  | "audio"
  | "embed"
  | "code"
  | "attachment"
  // Structuur
  | "divider"
  // Toetsing (formatief + summatief)
  | "knowledgeCheck"
  | "quiz"
  | "openQuestion"
  // Interactief (fase 3)
  | "accordion"
  | "tabs"
  | "flashcards"
  | "labeledImage"
  | "timeline"
  | "sort";

export type BlockGroup = "tekst" | "media" | "toetsing" | "interactief" | "structuur";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

/* ---------- Tekst ---------- */
export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 2 | 3;
  text: string;
}
export interface RichTextBlock extends BaseBlock {
  type: "richText";
  html: string;
}
export type CalloutTone = "tip" | "let-op" | "info";
export interface CalloutBlock extends BaseBlock {
  type: "callout";
  tone: CalloutTone;
  title: string;
  text: string;
}
export interface QuoteBlock extends BaseBlock {
  type: "quote";
  text: string;
  attribution: string;
}
export interface ListBlock extends BaseBlock {
  type: "list";
  ordered: boolean;
  items: string[];
}

/* ---------- Media ---------- */
export interface ImageBlock extends BaseBlock {
  type: "image";
  assetId: string | null;
  url: string;
  alt: string;
  caption: string;
}
export type VideoSource = "upload" | "youtube" | "vimeo";
export interface VideoBlock extends BaseBlock {
  type: "video";
  source: VideoSource;
  url: string;
  captionsUrl: string;
  title: string;
}
export interface AudioBlock extends BaseBlock {
  type: "audio";
  url: string;
  transcript: string;
  title: string;
}
export interface EmbedBlock extends BaseBlock {
  type: "embed";
  url: string;
  title: string;
}
export interface CodeBlock extends BaseBlock {
  type: "code";
  language: string;
  code: string;
}
export interface AttachmentBlock extends BaseBlock {
  type: "attachment";
  assetId: string | null;
  url: string;
  label: string;
}

/* ---------- Structuur ---------- */
export interface DividerBlock extends BaseBlock {
  type: "divider";
}

/* ---------- Toetsing ---------- */
export interface ChoiceOption {
  id: string;
  text: string;
  correct: boolean;
}
export interface KnowledgeCheckBlock extends BaseBlock {
  type: "knowledgeCheck";
  question: string;
  multiple: boolean;
  options: ChoiceOption[];
  hint: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}
export interface QuizQuestion {
  id: string;
  question: string;
  multiple: boolean;
  options: ChoiceOption[];
  points: number;
  hint: string;
}
export interface QuizBlock extends BaseBlock {
  type: "quiz";
  title: string;
  mode: "formatief" | "summatief";
  passScore: number;
  questions: QuizQuestion[];
}
export interface OpenQuestionBlock extends BaseBlock {
  type: "openQuestion";
  question: string;
  sampleAnswer: string;
}

/* ---------- Interactief ---------- */
export interface AccordionItem {
  id: string;
  title: string;
  body: string;
}
export interface AccordionBlock extends BaseBlock {
  type: "accordion";
  items: AccordionItem[];
}
export interface TabItem {
  id: string;
  label: string;
  body: string;
}
export interface TabsBlock extends BaseBlock {
  type: "tabs";
  items: TabItem[];
}
export interface Flashcard {
  id: string;
  front: string;
  back: string;
}
export interface FlashcardsBlock extends BaseBlock {
  type: "flashcards";
  cards: Flashcard[];
}
export interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
}
export interface LabeledImageBlock extends BaseBlock {
  type: "labeledImage";
  url: string;
  alt: string;
  hotspots: Hotspot[];
}
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  body: string;
}
export interface TimelineBlock extends BaseBlock {
  type: "timeline";
  events: TimelineEvent[];
}
export interface SortItem {
  id: string;
  text: string;
}
export interface SortBlock extends BaseBlock {
  type: "sort";
  prompt: string;
  items: SortItem[];
}

export type Block =
  | HeadingBlock
  | RichTextBlock
  | CalloutBlock
  | QuoteBlock
  | ListBlock
  | ImageBlock
  | VideoBlock
  | AudioBlock
  | EmbedBlock
  | CodeBlock
  | AttachmentBlock
  | DividerBlock
  | KnowledgeCheckBlock
  | QuizBlock
  | OpenQuestionBlock
  | AccordionBlock
  | TabsBlock
  | FlashcardsBlock
  | LabeledImageBlock
  | TimelineBlock
  | SortBlock;

export type BlockOfType<T extends BlockType> = Extract<Block, { type: T }>;

/* ---------- Les / module / asset ---------- */
export type LessonStatus = "draft" | "published";

/**
 * Discriminator voor de blok-engine. Page/Quiz/Assignment/Wiki delen dezelfde
 * editor; `kind` bepaalt alleen welke blokken benadrukt worden en hoe
 * voortgang/becijfering werkt. 'page' is de standaard (Fase 1-gedrag).
 */
export type LessonKind = "page" | "quiz" | "assignment" | "wiki";

export interface Lesson {
  id: string;
  tenantId: TenantId;
  moduleId: string | null;
  requiresLessonId: string | null;
  kind: LessonKind;
  title: string;
  status: LessonStatus;
  isTemplate: boolean;
  learningObjectives: string[];
  blocks: Block[];
  schemaVersion: number;
  position: number;
  createdBy: string | null;
  updatedAt: string;
}

export interface Module {
  id: string;
  tenantId: TenantId;
  courseId: string | null;
  title: string;
  summary: string;
  category: string;
  coverUrl: string | null;
  position: number;
  updatedAt: string;
}

export type AssetKind = "image" | "video" | "audio" | "file";
export interface Asset {
  id: string;
  tenantId: TenantId;
  kind: AssetKind;
  storagePath: string;
  url: string | null;
  altText: string;
  captionsUrl: string | null;
  title: string;
  createdAt: string;
}

export interface LessonVersion {
  id: string;
  lessonId: string;
  title: string;
  blocks: Block[];
  learningObjectives: string[];
  label: string | null;
  createdAt: string;
}

export type ProgressStatus = "not_started" | "in_progress" | "completed";
export interface LessonProgress {
  lessonId: string;
  userId: string;
  status: ProgressStatus;
  completedAt: string | null;
}

export type LessonPermissionRole = Role;
