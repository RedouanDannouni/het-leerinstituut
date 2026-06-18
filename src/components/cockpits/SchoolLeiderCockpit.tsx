import Link from "next/link";
import { ActionList } from "@/components/blocks/ActionList";
import { BulletMetric } from "@/components/blocks/BulletMetric";
import { KpiCard } from "@/components/blocks/KpiCard";
import { TrendLine } from "@/components/blocks/TrendLine";
import { Card } from "@/components/ui/Card";
import { getSchoolLeaderMetrics } from "@/lib/domain/selectors";
import type { SessionContext } from "@/lib/domain/types";

export function SchoolLeiderCockpit({ context }: { context: SessionContext }) {
  const metrics = getSchoolLeaderMetrics(context);

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
      </div>
      <ActionList
        title="Gespreksonderwerpen voor het MT"
        items={[
          "Maak begrip controleren zichtbaar in elke lesafsluiting.",
          "Koppel collegiale observaties aan één gedeelde feedbackvraag.",
          "Gebruik het rapport als agenda, niet als beoordelingslijst.",
        ]}
      />
    </div>
  );
}
