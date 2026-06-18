import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { CockpitMetric } from "@/lib/domain/types";
import { Card } from "@/components/ui/Card";

const trendMeta = {
  up: { Icon: ArrowUpRight, label: "Stijgend" },
  down: { Icon: ArrowDownRight, label: "Daalt" },
  stable: { Icon: ArrowRight, label: "Stabiel" },
} as const;

export function KpiCard({ metric }: { metric: CockpitMetric }) {
  const { Icon: TrendIcon, label: trendLabel } = trendMeta[metric.trend];

  return (
    <Card className="kpi">
      <div className="kpi-top">
        <span className="kpi-icon" data-trend={metric.trend} aria-hidden>
          <Activity size={22} />
        </span>
        <span className="kpi-chip" data-trend={metric.trend}>
          <TrendIcon size={14} aria-hidden />
          {trendLabel}
        </span>
      </div>
      <div className="metric-value">{metric.value}</div>
      <p className="kpi-label">{metric.label}</p>
      <p className="muted kpi-context">{metric.context}</p>
    </Card>
  );
}
