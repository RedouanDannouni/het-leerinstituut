import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { CockpitMetric } from "@/lib/domain/types";
import { Card } from "@/components/ui/Card";

export function KpiCard({ metric }: { metric: CockpitMetric }) {
  const Icon = metric.trend === "up" ? ArrowUpRight : metric.trend === "down" ? ArrowDownRight : ArrowRight;

  return (
    <Card>
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <p className="muted" style={{ margin: 0, fontWeight: 750 }}>
          {metric.label}
        </p>
        <Icon aria-hidden size={20} />
      </div>
      <div className="metric-value">{metric.value}</div>
      <p className="muted" style={{ marginBottom: 0 }}>
        {metric.context}
      </p>
    </Card>
  );
}
