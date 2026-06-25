import { formsForInstrument } from "./definitions";
import {
  collectValues,
  computeStats,
  emptyStatBlock,
  MIN_RESPONSES,
  statsFor,
  type StatBlock,
} from "./stats";
import {
  allRatingColumns,
  INSTRUMENTS,
  type FormDefinition,
  type FormInstrument,
  type FormVariant,
  type ScaleVariant,
} from "./types";

type Row = Record<string, string | number | null>;

export interface ResultsFilters {
  instrument?: FormInstrument | "all";
  variant?: FormVariant | "all";
  meetmoment?: string | "all";
}

export interface GroupStat {
  key: string;
  label: string;
  icon?: string;
  stat: StatBlock;
}

export interface ItemStat {
  column: string;
  nr: number;
  text: string;
  groupKey: string;
  groupLabel: string;
  stat: StatBlock;
}

export interface SubgroupBucket {
  label: string;
  stat: StatBlock;
  belowThreshold: boolean;
}

export interface SubgroupDimension {
  key: string;
  label: string;
  buckets: SubgroupBucket[];
}

export interface QualitativeExcerpt {
  label: string;
  text: string;
}

export interface FormDetail {
  formKey: string;
  title: string;
  respondent: string;
  variant: FormVariant;
  scale: ScaleVariant;
  count: number;
  /** True voor leerling-varianten onder de privacy-drempel: aggregaten worden niet getoond. */
  belowThreshold: boolean;
  overall: StatBlock;
  groups: GroupStat[];
  items: ItemStat[];
  subgroups: SubgroupDimension[];
  excerpts: QualitativeExcerpt[];
}

export interface TriangulationPerspective {
  variant: FormVariant;
  formKey: string;
  respondent: string;
  stat: StatBlock;
}

export interface TriangulationGroup {
  key: string;
  label: string;
  icon?: string;
  perspectives: TriangulationPerspective[];
  /** Grootste afstand tussen de gemiddelden van de perspectieven. */
  gap: number | null;
}

export interface MeetmomentPoint {
  meetmoment: string;
  stat: StatBlock;
}

export interface MeetmomentTrendGroup {
  key: string;
  label: string;
  icon?: string;
  points: MeetmomentPoint[];
  /** Laatste minus eerste beschikbare gemiddelde. */
  growth: number | null;
}

export interface InstrumentTrend {
  available: boolean;
  formKey?: string;
  formTitle?: string;
  groups: MeetmomentTrendGroup[];
}

export interface InstrumentDashboard {
  key: FormInstrument;
  label: string;
  description: string;
  forms: FormDetail[];
  triangulation: TriangulationGroup[];
  trend: InstrumentTrend;
}

export interface ResultsDashboard {
  filters: ResultsFilters;
  /** Minstens één formulier raakte de 1000-rijen-limiet. */
  truncated: boolean;
  instruments: InstrumentDashboard[];
}

const MEETMOMENT_ORDER = ["Nulmeting", "Volgmeting", "Eindmeting"];

interface SubgroupConfig {
  column: string;
  label: string;
  bin?: "adult" | "child";
}

const SUBGROUP_DIMENSIONS: Record<string, SubgroupConfig[]> = {
  "lesobservatie-coach": [
    { column: "klas", label: "Klas" },
    { column: "vak", label: "Vak" },
  ],
  zelfevaluatie: [
    { column: "gender", label: "Geslacht" },
    { column: "leeftijd", label: "Leeftijd", bin: "adult" },
    { column: "hoogst_genoten_opleiding", label: "Opleiding" },
    { column: "lesgroep", label: "Lesgroep" },
  ],
  leerlingfeedback: [
    { column: "gender", label: "Geslacht" },
    { column: "leeftijd", label: "Leeftijd", bin: "child" },
    { column: "klas", label: "Klas" },
  ],
  "plc-schoolleiding": [
    { column: "geslacht", label: "Geslacht" },
    { column: "leeftijd", label: "Leeftijd", bin: "adult" },
    { column: "opleiding", label: "Opleiding" },
  ],
  "plc-docenten": [
    { column: "geslacht", label: "Geslacht" },
    { column: "leeftijd", label: "Leeftijd", bin: "adult" },
    { column: "opleiding", label: "Opleiding" },
  ],
  "plc-leerlingen": [
    { column: "geslacht", label: "Geslacht" },
    { column: "leeftijd", label: "Leeftijd", bin: "child" },
    { column: "leerjaar", label: "Leerjaar" },
    { column: "onderwijs_type", label: "Onderwijstype" },
  ],
};

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function hasMeetmoment(def: FormDefinition): boolean {
  return def.meta.some((field) => field.column === "type_meting");
}

function isLeerling(def: FormDefinition): boolean {
  return def.variant === "leerling";
}

/** Past het meetmoment-filter alleen toe op formulieren die een type_meting-veld hebben. */
function applyMeetmomentFilter(def: FormDefinition, rows: Row[], filters: ResultsFilters): Row[] {
  const meetmoment = filters.meetmoment;
  if (!meetmoment || meetmoment === "all" || !hasMeetmoment(def)) return rows;
  return rows.filter((row) => row.type_meting === meetmoment);
}

function adultAgeBucket(age: number): string {
  if (age < 30) return "Jonger dan 30";
  if (age <= 45) return "30 t/m 45";
  return "Ouder dan 45";
}

function bucketLabel(config: SubgroupConfig, value: string | number | null): string | null {
  if (value === null || value === "") return null;
  if (config.bin === "adult" && typeof value === "number") return adultAgeBucket(value);
  if (config.bin === "child" && typeof value === "number") return `${value} jaar`;
  return String(value);
}

function buildSubgroups(def: FormDefinition, rows: Row[]): SubgroupDimension[] {
  const configs = SUBGROUP_DIMENSIONS[def.key] ?? [];
  const ratingColumns = allRatingColumns(def);

  return configs
    .map((config) => {
      const groups = new Map<string, Row[]>();
      for (const row of rows) {
        const label = bucketLabel(config, row[config.column]);
        if (label === null) continue;
        const bucket = groups.get(label);
        if (bucket) bucket.push(row);
        else groups.set(label, [row]);
      }

      const buckets: SubgroupBucket[] = [...groups.entries()]
        .map(([label, bucketRows]) => {
          const belowThreshold = bucketRows.length < MIN_RESPONSES;
          return {
            label,
            belowThreshold,
            stat: belowThreshold ? { ...emptyStatBlock(), n: bucketRows.length } : statsFor(bucketRows, ratingColumns),
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label, "nl"));

      return { key: config.column, label: config.label, buckets };
    })
    .filter((dimension) => dimension.buckets.length > 0);
}

function buildExcerpts(def: FormDefinition, rows: Row[]): QualitativeExcerpt[] {
  const excerpts: QualitativeExcerpt[] = [];
  const seen = new Set<string>();
  const push = (label: string, value: string | number | null) => {
    if (excerpts.length >= 8) return;
    if (typeof value !== "string") return;
    const text = value.trim();
    if (!text || seen.has(text)) return;
    seen.add(text);
    excerpts.push({ label, text });
  };

  const noteColumn = def.generalNote?.column;
  for (const row of rows) {
    if (noteColumn) push(def.generalNote?.label ?? "Observatie", row[noteColumn]);
    for (const group of def.groups) {
      if (group.analyseColumn) push(group.label, row[group.analyseColumn]);
    }
    if (excerpts.length >= 8) break;
  }
  return excerpts;
}

function buildFormDetail(def: FormDefinition, rawRows: Row[], filters: ResultsFilters): FormDetail {
  const rows = applyMeetmomentFilter(def, rawRows, filters);
  const count = rows.length;
  const belowThreshold = isLeerling(def) && count < MIN_RESPONSES;

  if (belowThreshold) {
    return {
      formKey: def.key,
      title: def.title,
      respondent: def.respondent,
      variant: def.variant,
      scale: def.scale,
      count,
      belowThreshold: true,
      overall: { ...emptyStatBlock(), n: count },
      groups: [],
      items: [],
      subgroups: [],
      excerpts: [],
    };
  }

  const groups: GroupStat[] = def.groups.map((group) => ({
    key: group.key,
    label: group.label,
    icon: group.icon,
    stat: statsFor(rows, group.items.map((item) => item.column)),
  }));

  const items: ItemStat[] = def.groups.flatMap((group) =>
    group.items.map((item) => ({
      column: item.column,
      nr: item.nr,
      text: item.text,
      groupKey: group.key,
      groupLabel: group.label,
      stat: statsFor(rows, [item.column]),
    })),
  );

  return {
    formKey: def.key,
    title: def.title,
    respondent: def.respondent,
    variant: def.variant,
    scale: def.scale,
    count,
    belowThreshold: false,
    overall: computeStats(collectValues(rows, allRatingColumns(def))),
    groups,
    items,
    subgroups: buildSubgroups(def, rows),
    excerpts: buildExcerpts(def, rows),
  };
}

function buildTriangulation(
  defs: FormDefinition[],
  rowsByForm: Record<string, Row[]>,
  filters: ResultsFilters,
): TriangulationGroup[] {
  const order: { key: string; label: string; icon?: string }[] = [];
  const seen = new Set<string>();
  for (const def of defs) {
    for (const group of def.groups) {
      if (!seen.has(group.key)) {
        seen.add(group.key);
        order.push({ key: group.key, label: group.label, icon: group.icon });
      }
    }
  }

  return order
    .map(({ key, label, icon }) => {
      const perspectives: TriangulationPerspective[] = [];
      for (const def of defs) {
        const group = def.groups.find((g) => g.key === key);
        if (!group) continue;
        const rows = applyMeetmomentFilter(def, rowsByForm[def.key] ?? [], filters);
        if (isLeerling(def) && rows.length < MIN_RESPONSES) continue;
        const stat = statsFor(rows, group.items.map((item) => item.column));
        if (stat.n === 0) continue;
        perspectives.push({ variant: def.variant, formKey: def.key, respondent: def.respondent, stat });
      }

      const means = perspectives.map((p) => p.stat.mean).filter((m): m is number => m !== null);
      const gap = means.length >= 2 ? round2(Math.max(...means) - Math.min(...means)) : null;
      return { key, label, icon, perspectives, gap };
    })
    .filter((group) => group.perspectives.length >= 2);
}

function buildTrend(defs: FormDefinition[], rowsByForm: Record<string, Row[]>): InstrumentTrend {
  const def = defs.find((candidate) => hasMeetmoment(candidate));
  if (!def) return { available: false, groups: [] };

  const rows = rowsByForm[def.key] ?? [];
  const present = MEETMOMENT_ORDER.filter((moment) => rows.some((row) => row.type_meting === moment));
  if (present.length === 0) return { available: false, formKey: def.key, formTitle: def.title, groups: [] };

  const groups: MeetmomentTrendGroup[] = def.groups.map((group) => {
    const columns = group.items.map((item) => item.column);
    const points: MeetmomentPoint[] = present.map((moment) => ({
      meetmoment: moment,
      stat: statsFor(
        rows.filter((row) => row.type_meting === moment),
        columns,
      ),
    }));
    const withData = points.filter((point) => point.stat.mean !== null);
    const growth =
      withData.length >= 2 && withData[0].stat.mean !== null && withData[withData.length - 1].stat.mean !== null
        ? round2((withData[withData.length - 1].stat.mean as number) - (withData[0].stat.mean as number))
        : null;
    return { key: group.key, label: group.label, icon: group.icon, points, growth };
  });

  return { available: true, formKey: def.key, formTitle: def.title, groups };
}

export function buildResultsDashboard(
  rowsByForm: Record<string, Row[]>,
  filters: ResultsFilters,
  truncated: boolean,
): ResultsDashboard {
  const instrumentFilter = filters.instrument && filters.instrument !== "all" ? filters.instrument : null;
  const variantFilter = filters.variant && filters.variant !== "all" ? filters.variant : null;

  const instruments: InstrumentDashboard[] = INSTRUMENTS.filter(
    (instrument) => !instrumentFilter || instrument.key === instrumentFilter,
  ).map((instrument) => {
    const allDefs = formsForInstrument(instrument.key);
    const visibleDefs = variantFilter ? allDefs.filter((def) => def.variant === variantFilter) : allDefs;

    return {
      key: instrument.key,
      label: instrument.label,
      description: instrument.description,
      forms: visibleDefs.map((def) => buildFormDetail(def, rowsByForm[def.key] ?? [], filters)),
      // Triangulatie en trend gebruiken altijd alle varianten, los van het variant-filter.
      triangulation: buildTriangulation(allDefs, rowsByForm, filters),
      trend: buildTrend(allDefs, rowsByForm),
    };
  });

  return { filters, truncated, instruments };
}
