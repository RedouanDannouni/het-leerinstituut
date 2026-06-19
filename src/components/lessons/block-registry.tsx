"use client";

import {
  AlignLeft,
  AudioLines,
  CircleHelp,
  Clock,
  Code2,
  Columns3,
  FileDown,
  GalleryVerticalEnd,
  Heading,
  Image as ImageIcon,
  Info,
  LayoutList,
  ListChecks,
  ListOrdered,
  MapPin,
  Minus,
  MoveVertical,
  Quote,
  SquareStack,
  Type,
  Video,
} from "lucide-react";
import type { Block, BlockGroup, BlockType } from "@/lib/lessons/types";
import { validateBlock } from "@/lib/lessons/block-validate";
import type { BlockEditorProps, BlockStudentProps } from "./blocks/shared";
import {
  CalloutEditor,
  CalloutStudent,
  HeadingEditor,
  HeadingStudent,
  ListEditor,
  ListStudent,
  QuoteEditor,
  QuoteStudent,
  RichTextBlockEditor,
  RichTextBlockStudent,
} from "./blocks/TextBlocks";
import {
  AttachmentEditor,
  AttachmentStudent,
  AudioEditor,
  AudioStudent,
  CodeEditor,
  CodeStudent,
  EmbedEditor,
  EmbedStudent,
  ImageEditor,
  ImageStudent,
  VideoEditor,
  VideoStudent,
} from "./blocks/MediaBlocks";
import { DividerEditor, DividerStudent } from "./blocks/StructureBlocks";
import {
  KnowledgeCheckEditor,
  KnowledgeCheckStudent,
  OpenQuestionEditor,
  OpenQuestionStudent,
  QuizEditor,
  QuizStudent,
} from "./blocks/AssessmentBlocks";
import {
  AccordionEditor,
  AccordionStudent,
  FlashcardsEditor,
  FlashcardsStudent,
  LabeledImageEditor,
  LabeledImageStudent,
  SortEditor,
  SortStudent,
  TabsEditor,
  TabsStudent,
  TimelineEditor,
  TimelineStudent,
} from "./blocks/InteractiveBlocks";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ElementType;
  group: BlockGroup;
  EditorView: React.FC<BlockEditorProps<any>>;
  StudentView: React.FC<BlockStudentProps<any>>;
  validate: (block: Block) => string[];
}

export const blockRegistry: Record<BlockType, BlockDefinition> = {
  heading: { type: "heading", label: "Kop", description: "Titel of subkop", icon: Heading, group: "tekst", EditorView: HeadingEditor, StudentView: HeadingStudent, validate: validateBlock },
  richText: { type: "richText", label: "Tekst", description: "Paragraaf met opmaak", icon: Type, group: "tekst", EditorView: RichTextBlockEditor, StudentView: RichTextBlockStudent, validate: validateBlock },
  callout: { type: "callout", label: "Callout", description: "Tip, let-op of info", icon: Info, group: "tekst", EditorView: CalloutEditor, StudentView: CalloutStudent, validate: validateBlock },
  quote: { type: "quote", label: "Citaat", description: "Quote met bron", icon: Quote, group: "tekst", EditorView: QuoteEditor, StudentView: QuoteStudent, validate: validateBlock },
  list: { type: "list", label: "Lijst", description: "Opsomming of genummerd", icon: ListOrdered, group: "tekst", EditorView: ListEditor, StudentView: ListStudent, validate: validateBlock },

  image: { type: "image", label: "Afbeelding", description: "Beeld met alt-tekst", icon: ImageIcon, group: "media", EditorView: ImageEditor, StudentView: ImageStudent, validate: validateBlock },
  video: { type: "video", label: "Video", description: "Upload of YouTube/Vimeo", icon: Video, group: "media", EditorView: VideoEditor, StudentView: VideoStudent, validate: validateBlock },
  audio: { type: "audio", label: "Audio", description: "Geluid met transcript", icon: AudioLines, group: "media", EditorView: AudioEditor, StudentView: AudioStudent, validate: validateBlock },
  embed: { type: "embed", label: "Embed", description: "Externe inhoud (iframe)", icon: GalleryVerticalEnd, group: "media", EditorView: EmbedEditor, StudentView: EmbedStudent, validate: validateBlock },
  code: { type: "code", label: "Code", description: "Codeblok", icon: Code2, group: "media", EditorView: CodeEditor, StudentView: CodeStudent, validate: validateBlock },
  attachment: { type: "attachment", label: "Bijlage", description: "Downloadbaar bestand", icon: FileDown, group: "media", EditorView: AttachmentEditor, StudentView: AttachmentStudent, validate: validateBlock },

  knowledgeCheck: { type: "knowledgeCheck", label: "Kennischeck", description: "Formatief, directe feedback", icon: CircleHelp, group: "toetsing", EditorView: KnowledgeCheckEditor, StudentView: KnowledgeCheckStudent, validate: validateBlock },
  quiz: { type: "quiz", label: "Quiz", description: "Meerdere vragen, becijferd", icon: ListChecks, group: "toetsing", EditorView: QuizEditor, StudentView: QuizStudent, validate: validateBlock },
  openQuestion: { type: "openQuestion", label: "Open vraag", description: "Vrije tekst met voorbeeld", icon: AlignLeft, group: "toetsing", EditorView: OpenQuestionEditor, StudentView: OpenQuestionStudent, validate: validateBlock },

  accordion: { type: "accordion", label: "Accordion", description: "In- en uitklapbare items", icon: LayoutList, group: "interactief", EditorView: AccordionEditor, StudentView: AccordionStudent, validate: validateBlock },
  tabs: { type: "tabs", label: "Tabs", description: "Inhoud in tabbladen", icon: Columns3, group: "interactief", EditorView: TabsEditor, StudentView: TabsStudent, validate: validateBlock },
  flashcards: { type: "flashcards", label: "Flashcards", description: "Omdraaibare leerkaarten", icon: SquareStack, group: "interactief", EditorView: FlashcardsEditor, StudentView: FlashcardsStudent, validate: validateBlock },
  labeledImage: { type: "labeledImage", label: "Hotspots", description: "Afbeelding met punten", icon: MapPin, group: "interactief", EditorView: LabeledImageEditor, StudentView: LabeledImageStudent, validate: validateBlock },
  timeline: { type: "timeline", label: "Tijdlijn", description: "Gebeurtenissen op een rij", icon: Clock, group: "interactief", EditorView: TimelineEditor, StudentView: TimelineStudent, validate: validateBlock },
  sort: { type: "sort", label: "Sorteren", description: "Zet in de juiste volgorde", icon: MoveVertical, group: "interactief", EditorView: SortEditor, StudentView: SortStudent, validate: validateBlock },

  divider: { type: "divider", label: "Scheiding", description: "Horizontale lijn", icon: Minus, group: "structuur", EditorView: DividerEditor, StudentView: DividerStudent, validate: validateBlock },
};

export const blockGroupLabels: Record<BlockGroup, string> = {
  tekst: "Tekst",
  media: "Media",
  toetsing: "Toetsing",
  interactief: "Interactief",
  structuur: "Structuur",
};

export const blockGroupOrder: BlockGroup[] = ["tekst", "media", "toetsing", "interactief", "structuur"];

export function blocksByGroup(group: BlockGroup): BlockDefinition[] {
  return Object.values(blockRegistry).filter((definition) => definition.group === group);
}
