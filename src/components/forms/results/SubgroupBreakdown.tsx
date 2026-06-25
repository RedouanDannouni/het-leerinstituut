import type { SubgroupDimension } from "@/lib/forms/results-dashboard";
import type { ScaleVariant } from "@/lib/forms/types";
import { nl, SCALE_POINTS, scaleColor, scorePosition } from "./helpers";

interface SubgroupBreakdownProps {
  dimensions: SubgroupDimension[];
  scale: ScaleVariant;
  minResponses?: number;
}

/** Demografische uitsplitsing met verplichte n-drempel: kleine groepen zijn ruis, geen bevinding. */
export function SubgroupBreakdown({ dimensions, scale, minResponses = 5 }: SubgroupBreakdownProps) {
  return (
    <div className="subgroups">
      {dimensions.map((dimension) => (
        <div className="subgroups__dim" key={dimension.key}>
          <h4 className="subgroups__title">{dimension.label}</h4>
          <div className="subgroups__rows">
            {dimension.buckets.map((bucket) => (
              <div
                className={`subgroups__row${bucket.belowThreshold ? " subgroups__row--muted" : ""}`}
                key={bucket.label}
              >
                <span className="subgroups__bucket">{bucket.label}</span>
                {bucket.belowThreshold ? (
                  <span className="subgroups__note">Te weinig respondenten (n = {bucket.stat.n}, min. {minResponses})</span>
                ) : (
                  <>
                    <div className="subgroups__track">
                      {SCALE_POINTS.map((point) => (
                        <span key={point} className="subgroups__zone" style={{ background: scaleColor(point) }} />
                      ))}
                      {bucket.stat.mean !== null ? (
                        <span
                          className="subgroups__marker"
                          style={{ left: `${scorePosition(bucket.stat.mean)}%` }}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <span className="subgroups__value">
                      {nl(bucket.stat.mean)} <span className="subgroups__n">n {bucket.stat.n}</span>
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
