import Link from "next/link";
import { ActionList } from "@/components/blocks/ActionList";
import { BulletMetric } from "@/components/blocks/BulletMetric";
import { GrowthDonut } from "@/components/blocks/GrowthDonut";
import { KpiCard } from "@/components/blocks/KpiCard";
import { TrendLine } from "@/components/blocks/TrendLine";
import { Card } from "@/components/ui/Card";
import { getPhaseDistribution, getSchoolLeaderMetrics } from "@/lib/domain/selectors";
import type { SessionContext } from "@/lib/domain/types";

const PHASE_COLORS: Record<string, string> = {
  Startpunt: "#e08a6b",
  "In ontwikkeling": "#ffd000",
  "Stevig zichtbaar": "#38c9a6",
  Voorbeeldpraktijk: "#0e6a8c",
};

export function SchoolLeiderCockpit({ context }: { context: SessionContext }) {
  const metrics = getSchoolLeaderMetrics(context);
  const phases = getPhaseDistribution(context);
  const totalScored = phases.reduce((sum, phase) => sum + phase.value, 0);
  const strong = phases
    .filter((phase) => phase.label === "Stevig zichtbaar" || phase.label === "Voorbeeldpraktijk")
    .reduce((sum, phase) => sum + phase.value, 0);
  const strongPct = totalScored ? Math.round((strong / totalScored) * 100) : 0;
  const segments = phases.map((phase) => ({ ...phase, color: PHASE_COLORS[phase.label] ?? "#dae3e6" }));

  return (
    <div className="stack">
      <div className="grid grid-4">
        {metrics.map((metric) => (
          <KpiCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="grid grid-2">
        <TrendLine title="Trend leskwaliteit per periode" />
        <Card>
          <div className="card-header">
            <div>
              <h2>Waar staat het team</h2>
              <p className="muted" style={{ margin: 0 }}>
                Verdeling van waargenomen criteria over ontwikkelfasen — geen cijfers, geen ranglijst.
              </p>
            </div>
          </div>
          <GrowthDonut
            segments={segments}
            centerValue={`${strongPct}%`}
            centerLabel="stevig+"
          />
        </Card>
      </div>
      <div className="grid grid-2">
        <Card>
          <h2>Voortgang t.o.v. afspraken</h2>
          <div className="stack">
            <BulletMetric label="Observatieronde 2" value={4} target={6} />
            <BulletMetric label="Teamsessie feedback" value={1} target={2} />
            <BulletMetric label="Rapporten besproken" value={2} target={3} />
          </div>
          <p className="muted" style={{ marginTop: "var(--space-4)" }}>
            Deze cockpit toont bewust trends en gespreksonderwerpen — geen ruwe observatiedata en geen ranglijst van docenten.
          </p>
          <Link href="/app/reports" className="btn btn-primary">Rapport downloaden</Link>
        </Card>
        <ActionList
          title="Gespreksonderwerpen voor het MT"
          items={[
            "Maak begrip controleren zichtbaar in elke lesafsluiting.",
            "Koppel collegiale observaties aan één gedeelde feedbackvraag.",
            "Gebruik het rapport als agenda, niet als beoordelingslijst.",
          ]}
        />
      </div>
    </div>
  );
}
