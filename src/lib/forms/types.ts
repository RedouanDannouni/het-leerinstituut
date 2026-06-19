import type { Role } from "@/lib/domain/types";

/**
 * Configuratiemodel voor de 6 Kwaliteitsmonitor-vragenlijsten.
 * De vraagteksten en kolomnamen volgen exact de DAN Analytics-briefing (v3),
 * zodat ze 1-op-1 matchen met de Supabase-tabellen en de oude Google Forms-export.
 */

export type ScaleVariant = "leskwaliteit" | "plc";

export interface ScaleOption {
  value: 1 | 2 | 3 | 4;
  label: string;
  description?: string;
}

export type MetaInput = "text" | "email" | "date" | "time" | "number" | "select" | "textarea";

/** Autofill-bronnen die de renderer vooraf kan invullen vanuit sessie/omgeving. */
export type MetaAutofill = "email" | "naam" | "schoolnaam" | "datum-vandaag" | "tijd-nu";

export interface MetaField {
  column: string;
  label: string;
  input: MetaInput;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  autofill?: MetaAutofill;
  /** Alleen-lezen tonen (bijv. schoolnaam bij een anonieme link). */
  locked?: boolean;
}

export interface RatingItem {
  /** DB-kolomnaam, bijv. "b1_q1", "sl_q1", "dd_q1", "q1". */
  column: string;
  /** Weergavenummer binnen het formulier. */
  nr: number;
  text: string;
}

export interface RatingGroup {
  key: string;
  label: string;
  description?: string;
  /** Optionele bouwsteencode ("b1".."b6") voor het bijbehorende duotone-icoon. */
  icon?: string;
  items: RatingItem[];
  /** Optioneel open tekstveld per groep (alleen lesobservatie coaches: b#_analyse). */
  analyseColumn?: string;
  analyseLabel?: string;
}

/** Hogere indeling boven de groepen (bijv. de 3 PLC-secties). */
export interface FormSection {
  label: string;
  description?: string;
  groupKeys: string[];
}

export type FormAccess = "auth" | "anon";

export type FormTable =
  | "lesobservatie_coaches"
  | "zelfevaluatie"
  | "leerlingfeedback"
  | "plc_schoolleiding"
  | "plc_docenten"
  | "plc_leerlingen";

export interface FormDefinition {
  /** Route-slug, bijv. "lesobservatie-coach". */
  key: string;
  table: FormTable;
  title: string;
  subtitle: string;
  intro: string;
  respondent: string;
  access: FormAccess;
  /** Rollen die het (ingelogde) formulier mogen openen. Leeg = alle ingelogde rollen. */
  allowedRoles?: Role[];
  scale: ScaleVariant;
  meta: MetaField[];
  groups: RatingGroup[];
  /** Optionele secties die groepen bundelen. */
  sections?: FormSection[];
  /** Een open tekstveld los van de bouwstenen (coach: empirische observatie). */
  generalNote?: MetaField;
}

export function allRatingColumns(def: FormDefinition): string[] {
  return def.groups.flatMap((group) => group.items.map((item) => item.column));
}

export function allAnalyseColumns(def: FormDefinition): string[] {
  return def.groups.flatMap((group) => (group.analyseColumn ? [group.analyseColumn] : []));
}
