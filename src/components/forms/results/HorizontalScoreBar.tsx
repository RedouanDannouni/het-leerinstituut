import type { GroupStat } from "@/lib/forms/results-dashboard";
import type { ScaleVariant } from "@/lib/forms/types";
import { nl, SCALE_POINTS, scaleColor, scorePosition } from "./helpers";

interface HorizontalScoreBarProps {
  groups: GroupStat[];
  scale: ScaleVariant;
}

/** Per bouwsteen een horizontale balk met de schaalbanden als achtergrond. */
export function HorizontalScoreBar({ groups, scale }: HorizontalScoreBarProps) {
  return (
    <div className="score-bars">
      {groups.map((group) => {
        const mean = group.stat.mean;
        return (
          <div className="score-bars__row" key={group.key}>
            <span className="score-bars__label">{group.label}</span>
            <div className="score-bars__track">
              {SCALE_POINTS.map((point) => (
                <span key={point} className="score-bars__zone" style={{ background: scaleColor(point) }} />
              ))}
              {mean !== null ? (
                <>
                  <span className="score-bars__fill" style={{ width: `${scorePosition(mean)}%` }} />
                  <span className="score-bars__marker" style={{ left: `${scorePosition(mean)}%` }} aria-hidden />
                </>
              ) : null}
            </div>
            <span className="score-bars__value">{nl(mean)}</span>
          </div>
        );
      })}
    </div>
  );
}
