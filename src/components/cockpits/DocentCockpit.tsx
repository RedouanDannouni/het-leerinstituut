import Link from "next/link";
import { BulletMetric } from "@/components/blocks/BulletMetric";
import { TrendLine } from "@/components/blocks/TrendLine";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getVisibleMaterials } from "@/lib/domain/selectors";
import type { SessionContext } from "@/lib/domain/types";

export function DocentCockpit({ context }: { context: SessionContext }) {
  const ownMaterials = getVisibleMaterials(context);

  return (
    <div className="grid grid-2">
      <Card>
        <h2>Mijn lesmateriaal</h2>
        <div className="stack">
          {ownMaterials.map((material) => (
            <div className="surface" key={material.id} style={{ padding: "var(--space-4)" }}>
              <div className="cluster" style={{ justifyContent: "space-between" }}>
                <strong>{material.title}</strong>
                <Badge tone="info">{material.type}</Badge>
              </div>
              <p className="muted">{material.description}</p>
            </div>
          ))}
          <Link className="btn btn-primary" href="/app/materials">Materiaal bekijken</Link>
        </div>
      </Card>
      <Card>
        <h2>Feedback & afspraken</h2>
        <p className="muted">Ontwikkelgericht en alleen jouw eigen voortgang. Geen vergelijking met collega's.</p>
        <div className="stack">
          <BulletMetric label="Afspraken afgerond" value={2} target={3} />
          <BulletMetric label="Eigen reflecties" value={4} target={5} />
        </div>
      </Card>
      <TrendLine title="Mijn voortgang over tijd" />
      <Card>
        <h2>Volgende afspraak</h2>
        <p>
          <strong>24 juni · 14:30</strong>
          <br />
          Nabespreking instructiekwaliteit met Sanne.
        </p>
        <Link className="btn btn-secondary" href="/app/projects">Projectafspraken bekijken</Link>
      </Card>
    </div>
  );
}
