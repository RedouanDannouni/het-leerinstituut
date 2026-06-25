"use client";

import { use, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info, Layers } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { isInstituteStaff } from "@/lib/domain/roles";
import { tenants } from "@/lib/domain/seed-data";
import { fetchResultsDashboard } from "@/lib/forms/results-actions";
import type { InstrumentDashboard, ResultsDashboard, ResultsFilters } from "@/lib/forms/results-dashboard";
import { MIN_RESPONSES } from "@/lib/forms/stats";
import type { FormInstrument, FormVariant } from "@/lib/forms/types";
import { Card } from "@/components/ui/Card";
import { DumbbellChart } from "@/components/forms/results/DumbbellChart";
import { HorizontalScoreBar } from "@/components/forms/results/HorizontalScoreBar";
import { ItemDistributionList } from "@/components/forms/results/ItemDistributionList";
import { KpiTile } from "@/components/forms/results/KpiTile";
import { MeetmomentTrend } from "@/components/forms/results/MeetmomentTrend";
import { PlcThemeHeatmap } from "@/components/forms/results/PlcThemeHeatmap";
import { QualitativeExcerpts } from "@/components/forms/results/QualitativeExcerpts";
import { SubgroupBreakdown } from "@/components/forms/results/SubgroupBreakdown";
import { StatStrip } from "@/components/forms/results/StatStrip";
import { TriangulationCallout } from "@/components/forms/results/TriangulationCallout";
import { perspectiveColor } from "@/components/forms/results/helpers";

const VARIANT_LABELS: Record<FormInstrument, Record<FormVariant, string>> = {
  lesobservatie: { leiding: "Coach", deelnemer: "Leraar", leerling: "Leerling" },
  plc: { leiding: "Schoolleiding", deelnemer: "Docenten", leerling: "Leerlingen" },
};

const VARIANT_OPTIONS: { value: ResultsFilters["variant"]; label: string }[] = [
  { value: "all", label: "Alle respondenten" },
  { value: "leiding", label: "Leiding (coach / schoolleiding)" },
  { value: "deelnemer", label: "Deelnemers (leraren / docenten)" },
  { value: "leerling", label: "Leerlingen" },
];

const MEETMOMENT_OPTIONS = ["all", "Nulmeting", "Volgmeting", "Eindmeting"];

function legendFor(instrument: InstrumentDashboard): { variant: FormVariant; label: string }[] {
  const labels = VARIANT_LABELS[instrument.key];
  const present = new Set<FormVariant>();
  for (const group of instrument.triangulation) {
    for (const perspective of group.perspectives) present.add(perspective.variant);
  }
  return (["leiding", "deelnemer", "leerling"] as FormVariant[])
    .filter((variant) => present.has(variant))
    .map((variant) => ({ variant, label: labels[variant] }));
}

function InstrumentBlock({ instrument }: { instrument: InstrumentDashboard }) {
  const labels = VARIANT_LABELS[instrument.key];
  const legend = legendFor(instrument);
  const hasData = instrument.forms.some((form) => form.count > 0);

  if (!hasData) {
    return (
      <Card>
        <p className="help-text" style={{ margin: 0 }}>
          Nog geen reacties binnengekomen voor {instrument.label.toLowerCase()}.
        </p>
      </Card>
    );
  }

  return (
    <div className="results-instrument">
      <header className="results-instrument__head">
        <h2>{instrument.label}</h2>
        <p className="muted">{instrument.description}</p>
      </header>

      {/* Laag 0 — Overzicht */}
      <section className="results-layer">
        <p className="results-layer__tag">Laag 0 · Overzicht</p>
        <div className="kpi-grid">
          {instrument.forms.map((form) => (
            <KpiTile
              key={form.formKey}
              title={labels[form.variant]}
              subtitle={form.respondent}
              stat={form.overall}
              scale={form.scale}
              accent={perspectiveColor(form.variant)}
              belowThreshold={form.belowThreshold}
              minResponses={MIN_RESPONSES}
            />
          ))}
        </div>
      </section>

      {/* Laag 1 — Per bouwsteen / thema */}
      <section className="results-layer">
        <p className="results-layer__tag">Laag 1 · Per {instrument.key === "plc" ? "thema" : "bouwsteen"}</p>
        {instrument.key === "plc" ? (
          <Card>
            <p className="muted results-card__lead">
              Scores per thema, naast elkaar voor elke respondentgroep. De kleur volgt de schaalband.
            </p>
            <PlcThemeHeatmap groups={instrument.triangulation} />
          </Card>
        ) : (
          <div className="results-grid">
            {instrument.forms
              .filter((form) => !form.belowThreshold && form.groups.length > 0)
              .map((form) => (
                <Card key={form.formKey}>
                  <div className="card-header">
                    <h3>{labels[form.variant]}</h3>
                  </div>
                  <HorizontalScoreBar groups={form.groups} scale={form.scale} />
                  <StatStrip stat={form.overall} />
                </Card>
              ))}
          </div>
        )}
      </section>

      {/* Laag 2 — Triangulatie */}
      {instrument.triangulation.length > 0 ? (
        <section className="results-layer">
          <p className="results-layer__tag">Laag 2 · Perspectieven naast elkaar</p>
          <Card>
            <div className="card-header">
              <div>
                <h3>Drie brillen op dezelfde {instrument.key === "plc" ? "thema's" : "bouwstenen"}</h3>
                <p className="muted results-card__lead">
                  Observeren, ervaren en reflecteren leveren verschillende beelden op. De afstand tussen de punten is
                  het gespreksonderwerp — geen rangorde.
                </p>
              </div>
            </div>
            <DumbbellChart groups={instrument.triangulation} scale={instrument.forms[0]?.scale ?? "leskwaliteit"} legend={legend} />
            <TriangulationCallout groups={instrument.triangulation} />
          </Card>
        </section>
      ) : null}

      {/* Laag 3 — Ontwikkeling over tijd */}
      <section className="results-layer">
        <p className="results-layer__tag">Laag 3 · Ontwikkeling over tijd</p>
        <Card>
          {instrument.trend.available ? (
            <>
              <div className="card-header">
                <div>
                  <h3>Nulmeting → Volgmeting → Eindmeting</h3>
                  <p className="muted results-card__lead">
                    Op basis van {instrument.trend.formTitle}. Voor een ontwikkelinstrument minstens zo belangrijk als
                    de absolute score.
                  </p>
                </div>
              </div>
              <MeetmomentTrend trend={instrument.trend} scale={instrument.forms[0]?.scale ?? "leskwaliteit"} />
            </>
          ) : (
            <p className="results-empty">
              <Info aria-hidden size={16} />
              Nog geen meetmomenten beschikbaar voor dit instrument. Zodra er een Nul-, Volg- of Eindmeting is
              vastgelegd, verschijnt de ontwikkeling hier.
            </p>
          )}
        </Card>
      </section>

      {/* Laag 4 — Verdieping */}
      <section className="results-layer">
        <p className="results-layer__tag">Laag 4 · Verdieping</p>
        {instrument.forms
          .filter((form) => !form.belowThreshold && form.items.length > 0)
          .map((form) => (
            <details className="results-details" key={form.formKey}>
              <summary className="results-details__summary">
                <span>
                  {labels[form.variant]} — verdeling per item, subgroepen en open feedback
                </span>
                <span className="results-details__hint">n = {form.count}</span>
              </summary>
              <div className="results-details__body">
                <div className="results-subsection">
                  <h4 className="results-subsection__title">Verdeling per item</h4>
                  <ItemDistributionList items={form.items} scale={form.scale} />
                </div>

                {form.subgroups.length > 0 ? (
                  <div className="results-subsection">
                    <h4 className="results-subsection__title">Subgroepen</h4>
                    <SubgroupBreakdown dimensions={form.subgroups} scale={form.scale} minResponses={MIN_RESPONSES} />
                  </div>
                ) : null}

                {form.excerpts.length > 0 ? (
                  <div className="results-subsection">
                    <h4 className="results-subsection__title">Open feedback</h4>
                    <QualitativeExcerpts excerpts={form.excerpts} />
                  </div>
                ) : null}
              </div>
            </details>
          ))}
      </section>
    </div>
  );
}

export default function SchoolResultsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params);
  const { context } = useRequireSession();

  const [dashboard, setDashboard] = useState<ResultsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [instrument, setInstrument] = useState<ResultsFilters["instrument"]>("all");
  const [variant, setVariant] = useState<ResultsFilters["variant"]>("all");
  const [meetmoment, setMeetmoment] = useState<ResultsFilters["meetmoment"]>("all");

  const filters = useMemo<ResultsFilters>(() => ({ instrument, variant, meetmoment }), [instrument, variant, meetmoment]);

  useEffect(() => {
    if (!context) return undefined;
    let active = true;
    startTransition(async () => {
      const response = await fetchResultsDashboard(tenantId, filters);
      if (!active) return;
      if (!response.ok) {
        setError(response.error);
        setDashboard(null);
      } else {
        setError(null);
        setDashboard(response.dashboard);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [context, tenantId, filters]);

  if (!context) return null;
  const role = context.user.role;
  if (!can(role, "view:forms")) notFound();
  if (!isInstituteStaff(role) && context.user.tenantId !== tenantId) notFound();

  const tenant = tenants.find((item) => item.id === tenantId);
  if (!tenant) notFound();

  return (
    <div className="page materials-page forms-page forms-results">
      <div className="stack forms-stack">
        <header className="materials-header">
          <div className="materials-header__title">
            <p className="eyebrow">Kwaliteitsmonitor · {tenant.name}</p>
            <div className="materials-header__heading">
              <h1>Resultaten</h1>
            </div>
            <p className="muted forms-header-lead">
              Een gelaagde analyse: van het overzicht in één oogopslag tot de verdeling per item. De 4-puntsschaal is de
              norm — elke kleurband staat voor een niveau.
            </p>
          </div>
          <div className="materials-header__controls forms-header-actions">
            <Link className="materials-header__control" href={`/app/forms/school/${tenantId}`}>
              <ArrowLeft aria-hidden size={16} /> Terug
            </Link>
          </div>
        </header>

        <div className="results-filters">
          <Layers aria-hidden size={16} className="results-filters__icon" />
          <label className="results-filters__field">
            <span>Instrument</span>
            <select value={instrument} onChange={(event) => setInstrument(event.target.value as ResultsFilters["instrument"])}>
              <option value="all">Beide instrumenten</option>
              <option value="lesobservatie">Lesobservaties</option>
              <option value="plc">PLC-scan</option>
            </select>
          </label>
          <label className="results-filters__field">
            <span>Respondent</span>
            <select value={variant} onChange={(event) => setVariant(event.target.value as ResultsFilters["variant"])}>
              {VARIANT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="results-filters__field">
            <span>Meetmoment</span>
            <select value={meetmoment} onChange={(event) => setMeetmoment(event.target.value as ResultsFilters["meetmoment"])}>
              {MEETMOMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "Alle meetmomenten" : option}
                </option>
              ))}
            </select>
          </label>
          {pending ? <span className="results-filters__status">Bijwerken…</span> : null}
        </div>

        {error ? (
          <Card>
            <p className="error-text" style={{ margin: 0 }}>{error}</p>
          </Card>
        ) : null}

        {dashboard?.truncated ? (
          <p className="results-warning">
            <Info aria-hidden size={15} /> Eén of meer formulieren bevatten meer dan 1000 reacties; de weergave is op de
            eerste 1000 gebaseerd.
          </p>
        ) : null}

        {loading && !dashboard ? (
          <Card>
            <p className="muted">Resultaten laden…</p>
          </Card>
        ) : dashboard ? (
          dashboard.instruments.map((item) => <InstrumentBlock key={item.key} instrument={item} />)
        ) : null}
      </div>
    </div>
  );
}
