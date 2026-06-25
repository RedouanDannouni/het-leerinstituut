"use client";

import { AlertTriangle, BarChart3, Check, CheckCircle2, Clock, Eye, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FlipKpiCard } from "@/components/blocks/FlipKpiCard";
import { GrowthDonut } from "@/components/blocks/GrowthDonut";
import { TrendLine } from "@/components/blocks/TrendLine";
import { useCockpitScope } from "@/components/cockpits/cockpit-scope";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { SessionContext } from "@/lib/domain/types";
import {
  getPlannerPhaseDistribution,
  getPlannerSignals,
  getPlannerTrend,
  getSchool,
  getSortedSchools,
  getStatusTone,
  ontwikkelfasen,
  plannerAttentie,
  plannerSchools,
  type AttentieIcon,
  type PlannerScope,
  type PlannerStatus,
} from "@/lib/domain/planner";

const statusDot: Record<PlannerStatus, string> = {
  "op koers": "var(--color-success)",
  aandacht: "var(--color-warning)",
  vertraagd: "var(--color-danger)",
};

const attentieIcon: Record<AttentieIcon, LucideIcon> = {
  clock: Clock,
  alert: AlertTriangle,
  eye: Eye,
  chart: BarChart3,
  check: CheckCircle2,
};

export function PlannerCockpit({ context: _context }: { context: SessionContext }) {
  const { scope, setScope } = useCockpitScope();

  const activeSchool = getSchool(scope);
  const signals = getPlannerSignals(scope);
  const trend = getPlannerTrend(scope);
  const phases = getPlannerPhaseDistribution();
  const sortedSchools = getSortedSchools();
  const attentie = scope === "all" ? plannerAttentie : plannerAttentie.filter((item) => item.schoolId === scope);
  const schoolCount = plannerSchools.length;

  function choose(next: PlannerScope) {
    setScope(next);
  }

  return (
    <div className="stack planner-cockpit">
      <div className="planner-scopebar">
        {activeSchool ? (
          <span className="planner-scope-chip">
            Inzoom: <strong>{activeSchool.naam}</strong>
            <button type="button" aria-label="Terug naar alle scholen" onClick={() => choose("all")}>
              <X size={13} aria-hidden />
            </button>
          </span>
        ) : (
          <span className="planner-scope-hint">
            Portfolio van {schoolCount} scholen · filter rechtsboven of klik een traject om in te zoomen
          </span>
        )}
      </div>

      <section className="stack" style={{ gap: "var(--space-3)" }}>
        <div className="planner-section-title">
          <h2>Signalen</h2>
          <span>dubbelklik een kaart voor de ontleding</span>
        </div>
        <div className="grid grid-3 planner-signals">
          {signals.map((signal) => (
            <FlipKpiCard key={signal.key} signal={signal} />
          ))}
        </div>
      </section>

      <section className="stack" style={{ gap: "var(--space-3)" }}>
        <div className="planner-section-title">
          <h2>Sturing</h2>
          <span>waar moet je deze week heen</span>
        </div>
        <div className="grid planner-grid-lead">
          <Card>
            <div className="card-header">
              <div>
                <h3>Trajecten</h3>
                <p className="muted" style={{ margin: 0 }}>
                  Gesorteerd op aandacht — klik om in te zoomen.
                </p>
              </div>
            </div>
            <div className="planner-traject-head" aria-hidden>
              <span>School</span>
              <span>Fase</span>
              <span>Voortgang</span>
              <span className="planner-traject-status-col">Status</span>
            </div>
            <div className="stack" style={{ gap: "var(--space-1)" }}>
              {sortedSchools.map((school) => (
                <button
                  type="button"
                  key={school.id}
                  className={`planner-traject-row${scope === school.id ? " is-active" : ""}`}
                  onClick={() => choose(school.id)}
                >
                  <span className="planner-traject-name">{school.naam}</span>
                  <span className="muted">{school.fase}</span>
                  <span className="planner-traject-progress">
                    <span className="progress-track">
                      <span
                        className="progress-bar"
                        style={{ width: `${school.voortgang}%`, background: statusDot[school.status] }}
                      />
                    </span>
                    <span className="planner-traject-pct">{school.voortgang}%</span>
                  </span>
                  <span className="planner-traject-status">
                    <Badge tone={getStatusTone(school.status)}>{school.status}</Badge>
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <div>
                <h3>Attentie deze week</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {activeSchool ? `Voor ${activeSchool.naam}.` : "Over alle trajecten."}
                </p>
              </div>
            </div>
            {attentie.length ? (
              <div className="planner-attentie">
                {attentie.map((item) => {
                  const Icon = attentieIcon[item.icon];
                  return (
                    <div className="planner-attentie-item" key={item.text} data-severity={item.severity}>
                      <span className="planner-attentie-icon" aria-hidden>
                        <Icon size={16} />
                      </span>
                      <span className="planner-attentie-text">
                        {item.text}
                        <em>{item.context}</em>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted">Geen openstaande acties voor deze school.</p>
            )}
          </Card>
        </div>
      </section>

      <div className="grid planner-grid-lead">
        <TrendLine
          title="Trend leskwaliteit"
          description={activeSchool ? `Gemiddelde over de observatierondes — ${activeSchool.naam}.` : "Gemiddelde over de observatierondes."}
          points={trend.points}
          labels={trend.labels}
          min={2.8}
          max={4.6}
        />
        <Card>
          <div className="card-header">
            <div>
              <h3>Ontwikkelfasen</h3>
              <p className="muted" style={{ margin: 0 }}>
                Waar staan de scholen?
              </p>
            </div>
          </div>
          <GrowthDonut segments={phases} centerValue={String(schoolCount)} centerLabel="scholen" />
          {activeSchool ? (
            <p className="planner-zoomnote">
              <Check size={14} aria-hidden /> {activeSchool.naam} staat in fase{" "}
              <strong>{ontwikkelfasen[activeSchool.ontwikkelfase]}</strong>
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
