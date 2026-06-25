import type { Distribution } from "@/lib/forms/stats";
import type { ScaleVariant } from "@/lib/forms/types";
import { SCALE_POINTS, scaleColor, scaleLabels } from "./helpers";

interface DistributionStripProps {
  distribution: Distribution;
  scale: ScaleVariant;
  /** Toon de percentage-labels in de segmenten. */
  showPercentages?: boolean;
  height?: number;
}

/** Gestapelde balk met het werkelijke percentage per schaalpunt (1/2/3/4). */
export function DistributionStrip({
  distribution,
  scale,
  showPercentages = false,
  height = 22,
}: DistributionStripProps) {
  const labels = scaleLabels(scale);
  return (
    <div className="dist-strip" style={{ height }}>
      {SCALE_POINTS.map((point) => {
        const pct = distribution.percentages[point];
        if (pct === 0) return null;
        return (
          <span
            key={point}
            className="dist-strip__seg"
            style={{ width: `${pct}%`, background: scaleColor(point) }}
            title={`${labels[point]}: ${pct}%`}
          >
            {showPercentages && pct >= 8 ? <span className="dist-strip__pct">{pct}%</span> : null}
          </span>
        );
      })}
    </div>
  );
}
