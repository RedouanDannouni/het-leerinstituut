/**
 * Demo-dataset voor de Projectleider- (planner-)cockpit.
 *
 * Alle cijfers hier zijn seed-/demo-waarden zodat de cockpit een geloofwaardig
 * portfolio toont. De twee kaarten die uiteindelijk live moeten zijn om echt
 * waarde te hebben zijn `leskwaliteit per bouwsteen` en `cadans` — die komen
 * later uit de observatie- en planningsdata. PLC en respons mogen demo blijven.
 */

export type PlannerStatus = "op koers" | "aandacht" | "vertraagd";

export interface PlannerSchool {
  id: string;
  naam: string;
  fase: string;
  voortgang: number;
  status: PlannerStatus;
  /** Gemiddelde leskwaliteit (schaal 1–5). */
  lk: number;
  /** PLC-scan (schaal 1–5). */
  plc: number;
  /** Observatie-cadans: % van geplande observaties dat ook is uitgevoerd. */
  cadans: number;
  /** Vragenlijst-respons in %. */
  respons: number;
  /** Index in `ontwikkelfasen`. */
  ontwikkelfase: number;
}

export const plannerSchools: PlannerSchool[] = [
  { id: "horizon", naam: "OBS De Horizon", fase: "Interventie", voortgang: 62, status: "vertraagd", lk: 3.5, plc: 3.4, cadans: 60, respons: 58, ontwikkelfase: 2 },
  { id: "anker", naam: "Het Anker", fase: "Nulmeting", voortgang: 28, status: "aandacht", lk: 3.2, plc: 3.6, cadans: 40, respons: 49, ontwikkelfase: 1 },
  { id: "sterren", naam: "Sterrenschool", fase: "Eindmeting", voortgang: 91, status: "op koers", lk: 4.2, plc: 3.9, cadans: 95, respons: 81, ontwikkelfase: 4 },
  { id: "vlieger", naam: "De Vlieger", fase: "Interventie", voortgang: 70, status: "op koers", lk: 3.9, plc: 3.6, cadans: 80, respons: 66, ontwikkelfase: 3 },
  { id: "montessori", naam: "Montessori Noord", fase: "Intake", voortgang: 12, status: "aandacht", lk: 3.0, plc: 3.3, cadans: 30, respons: 42, ontwikkelfase: 1 },
];

/** Portfolio-gemiddelde per bouwsteen (lesobservaties coaches, schaal 1–5). */
export const bouwstenen: { label: string; value: number }[] = [
  { label: "Pedagogisch klimaat", value: 4.2 },
  { label: "Klassenmanagement", value: 4.0 },
  { label: "Doelgericht werken", value: 3.8 },
  { label: "Activerende didactiek", value: 3.6 },
  { label: "Feedback & check", value: 3.4 },
  { label: "Differentiatie", value: 3.1 },
];

/** PLC-scan per thema (schaal 1–5). */
export const plcThemes: { label: string; value: number }[] = [
  { label: "Opvattingen over leerbaarheid", value: 3.8 },
  { label: "Leercultuur", value: 3.5 },
  { label: "Onderwijskundig leiderschap", value: 3.4 },
];

/** Respons per respondentgroep (%). */
export const responsGroups: { label: string; value: number }[] = [
  { label: "Schoolleiding", value: 85 },
  { label: "Leraren", value: 64 },
  { label: "Leerlingen", value: 50 },
];

export const ontwikkelfasen = ["Startpunt", "Oriëntatie", "Ontwikkeling", "Verdieping", "Voorbeeldpraktijk"] as const;

export const ontwikkelfaseKleur = ["#d6ece4", "#9bd9c1", "#4fc2a0", "#1f9e7d", "#0e6a8c"];

export type AttentieSeverity = "danger" | "warning" | "success";
export type AttentieIcon = "clock" | "alert" | "eye" | "chart" | "check";

export interface AttentieItem {
  severity: AttentieSeverity;
  icon: AttentieIcon;
  text: string;
  context: string;
  schoolId: string;
}

export const plannerAttentie: AttentieItem[] = [
  { severity: "danger", icon: "clock", text: "OBS De Horizon — nulmeting 2 weken over tijd", context: "Plan een gesprek met de schoolopleider", schoolId: "horizon" },
  { severity: "danger", icon: "alert", text: "Het Anker — geen observatie gepland deze maand", context: "Cadans valt stil", schoolId: "anker" },
  { severity: "warning", icon: "eye", text: "Coach Yara — 6 open observaties", context: "Horizon & Het Anker", schoolId: "horizon" },
  { severity: "warning", icon: "chart", text: "Leerling-vragenlijst — 42% respons na 14 dagen", context: "Montessori Noord", schoolId: "montessori" },
  { severity: "success", icon: "check", text: "Sterrenschool — eindrapport klaar voor goedkeuring", context: "Wacht op jouw akkoord", schoolId: "sterren" },
];

export type PlannerScope = "all" | string;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function average<T>(items: T[], pick: (item: T) => number): number {
  if (!items.length) return 0;
  return items.reduce((sum, item) => sum + pick(item), 0) / items.length;
}

export interface PlannerPortfolioAverages {
  lk: number;
  plc: number;
  cadans: number;
  respons: number;
}

export function getPortfolioAverages(): PlannerPortfolioAverages {
  return {
    lk: round1(average(plannerSchools, (s) => s.lk)),
    plc: round1(average(plannerSchools, (s) => s.plc)),
    cadans: Math.round(average(plannerSchools, (s) => s.cadans)),
    respons: Math.round(average(plannerSchools, (s) => s.respons)),
  };
}

export function getSchool(scope: PlannerScope): PlannerSchool | null {
  if (scope === "all") return null;
  return plannerSchools.find((school) => school.id === scope) ?? null;
}

/**
 * Schaalt een bouwsteen-/themaverdeling met een factor (school t.o.v. portfolio)
 * zodat de inzoom-weergave plausibel blijft binnen de schaalgrens.
 */
function scaleSeries(items: { label: string; value: number }[], factor: number, max: number): { label: string; value: number }[] {
  return items.map((item) => {
    const scaled = Math.min(max, Math.max(max === 5 ? 1 : 0, item.value * factor));
    return { label: item.label, value: max === 5 ? round1(scaled) : Math.round(scaled) };
  });
}

export type SignalIcon = "leskwaliteit" | "plc" | "cadans" | "respons";
export type SignalTrend = "up" | "down" | "stable";

export interface SignalBar {
  label: string;
  value: number;
  max: number;
  unit: "score" | "pct";
  highlight?: boolean;
}

export interface PlannerSignal {
  key: SignalIcon;
  icon: SignalIcon;
  label: string;
  value: string;
  unit: string;
  trend: SignalTrend;
  trendLabel: string;
  context: string;
  backTitle: string;
  /** Extra duiding die achter het info-icoon op de achterkant verschijnt. */
  info: string;
  bars: SignalBar[];
}

const shortName = (naam: string) => naam.replace("OBS ", "");

export function getPlannerSignals(scope: PlannerScope): PlannerSignal[] {
  const portfolio = getPortfolioAverages();
  const cadansBars = (highlight?: string): SignalBar[] =>
    plannerSchools.map((school) => ({
      label: shortName(school.naam),
      value: school.cadans,
      max: 100,
      unit: "pct",
      highlight: highlight ? shortName(school.naam) === highlight : false,
    }));

  if (scope === "all") {
    return [
      {
        key: "leskwaliteit",
        icon: "leskwaliteit",
        label: "Gem. leskwaliteit",
        value: portfolio.lk.toFixed(1),
        unit: "/5",
        trend: "up",
        trendLabel: "+0,3",
        context: "over 5 scholen · deze ronde",
        backTitle: "Gemiddelde per bouwsteen",
        info: "Gemiddelde per bouwsteen op basis van lesobservaties door coaches over alle scholen (schaal 1–5).",
        bars: bouwstenen.map((item) => ({ label: item.label, value: item.value, max: 5, unit: "score" })),
      },
      {
        key: "plc",
        icon: "plc",
        label: "PLC-scan",
        value: portfolio.plc.toFixed(1),
        unit: "/5",
        trend: "stable",
        trendLabel: "stabiel",
        context: "laatste scan · 3 thema's",
        backTitle: "PLC-scan per thema",
        info: "Resultaat van de laatste PLC-scan per thema (schaal 1–5).",
        bars: plcThemes.map((item) => ({ label: item.label, value: item.value, max: 5, unit: "score" })),
      },
      {
        key: "cadans",
        icon: "cadans",
        label: "Observatie-cadans",
        value: String(portfolio.cadans),
        unit: "%",
        trend: "up",
        trendLabel: "+8%",
        context: "gepland vs. gedaan dit kwartaal",
        backTitle: "Cadans per school",
        info: "Aandeel uitgevoerde van geplande observaties dit kwartaal, per school.",
        bars: cadansBars(),
      },
    ];
  }

  const school = getSchool(scope);
  if (!school) return getPlannerSignals("all");

  const lkDelta = round1(school.lk - portfolio.lk);
  const factorLk = school.lk / portfolio.lk;
  const factorPlc = school.plc / portfolio.plc;

  return [
    {
      key: "leskwaliteit",
      icon: "leskwaliteit",
      label: "Gem. leskwaliteit",
      value: school.lk.toFixed(1),
      unit: "/5",
      trend: school.lk >= portfolio.lk ? "up" : "down",
      trendLabel: `${lkDelta >= 0 ? "+" : ""}${lkDelta.toFixed(1)}`,
      context: school.naam,
      backTitle: "Gemiddelde per bouwsteen",
      info: `Gemiddelde per bouwsteen op basis van lesobservaties door coaches — ${school.naam} (schaal 1–5).`,
      bars: scaleSeries(bouwstenen, factorLk, 5).map((item) => ({ label: item.label, value: item.value, max: 5, unit: "score" })),
    },
    {
      key: "plc",
      icon: "plc",
      label: "PLC-scan",
      value: school.plc.toFixed(1),
      unit: "/5",
      trend: school.plc >= portfolio.plc ? "up" : "down",
      trendLabel: "t.o.v. portfolio",
      context: school.naam,
      backTitle: "PLC-scan per thema",
      info: `Resultaat van de laatste PLC-scan per thema — ${school.naam} (schaal 1–5).`,
      bars: scaleSeries(plcThemes, factorPlc, 5).map((item) => ({ label: item.label, value: item.value, max: 5, unit: "score" })),
    },
    {
      key: "cadans",
      icon: "cadans",
      label: "Observatie-cadans",
      value: String(school.cadans),
      unit: "%",
      trend: school.cadans >= 60 ? "up" : "down",
      trendLabel: school.cadans >= 60 ? "op schema" : "achter",
      context: school.naam,
      backTitle: "Cadans per school",
      info: "Aandeel uitgevoerde van geplande observaties dit kwartaal; deze school is gemarkeerd.",
      bars: cadansBars(shortName(school.naam)),
    },
  ];
}

/** Verdeling van scholen over ontwikkelfasen voor de donut. */
export function getPlannerPhaseDistribution(): { label: string; value: number; color: string }[] {
  return ontwikkelfasen.map((label, index) => ({
    label,
    value: plannerSchools.filter((school) => school.ontwikkelfase === index).length,
    color: ontwikkelfaseKleur[index],
  }));
}

/** Trendpunten leskwaliteit over de observatierondes. */
export function getPlannerTrend(scope: PlannerScope): { points: number[]; labels: string[] } {
  const labels = ["Ronde 1", "Ronde 2", "Ronde 3", "Ronde 4", "Nu"];
  const portfolio = getPortfolioAverages();
  const school = getSchool(scope);
  if (!school) {
    return { points: [3.2, 3.4, 3.5, 3.6, portfolio.lk], labels };
  }
  const points = [school.lk - 0.6, school.lk - 0.4, school.lk - 0.2, school.lk - 0.1, school.lk].map((value) =>
    Math.max(2.9, round1(value)),
  );
  return { points, labels };
}

export function getStatusTone(status: PlannerStatus): "success" | "warning" | "danger" {
  if (status === "op koers") return "success";
  if (status === "aandacht") return "warning";
  return "danger";
}

/** Trajecten gesorteerd op aandacht (vertraagd → aandacht → op koers). */
export function getSortedSchools(): PlannerSchool[] {
  const order: PlannerStatus[] = ["vertraagd", "aandacht", "op koers"];
  return [...plannerSchools].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
}
