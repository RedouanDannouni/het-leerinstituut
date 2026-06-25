import type { TriangulationGroup } from "@/lib/forms/results-dashboard";
import type { FormVariant, ScaleVariant } from "@/lib/forms/types";
import { nl, perspectiveColor, SCALE_POINTS, scaleColor, scorePosition } from "./helpers";

interface DumbbellChartProps {
  groups: TriangulationGroup[];
  scale: ScaleVariant;
  legend: { variant: FormVariant; label: string }[];
}

/**
 * Dumbbell per bouwsteen/thema: de afstand tussen de perspectieven is het inzicht.
 * Neutraal gekaderd — drie brillen op dezelfde bouwsteen, geen rangorde.
 */
export function DumbbellChart({ groups, scale, legend }: DumbbellChartProps) {
  return (
    <div className="dumbbell">
      <div className="dumbbell__legend">
        {legend.map((entry) => (
          <span key={entry.variant} className="dumbbell__legend-item">
            <span className="dumbbell__swatch" style={{ background: perspectiveColor(entry.variant) }} aria-hidden />
            {entry.label}
          </span>
        ))}
      </div>

      {groups.map((group) => {
        const means = group.perspectives.map((p) => p.stat.mean).filter((m): m is number => m !== null);
        const min = means.length ? Math.min(...means) : null;
        const max = means.length ? Math.max(...means) : null;
        return (
          <div className="dumbbell__row" key={group.key}>
            <div className="dumbbell__label">
              <span>{group.label}</span>
              {group.gap !== null ? <span className="dumbbell__gap">Δ {nl(group.gap)}</span> : null}
            </div>
            <div className="dumbbell__track">
              {SCALE_POINTS.map((point) => (
                <span key={point} className="dumbbell__zone" style={{ background: scaleColor(point) }} />
              ))}
              {min !== null && max !== null ? (
                <span
                  className="dumbbell__connector"
                  style={{ left: `${scorePosition(min)}%`, width: `${scorePosition(max) - scorePosition(min)}%` }}
                  aria-hidden
                />
              ) : null}
              {group.perspectives.map((p) =>
                p.stat.mean !== null ? (
                  <span
                    key={p.formKey}
                    className="dumbbell__dot"
                    style={{ left: `${scorePosition(p.stat.mean)}%`, background: perspectiveColor(p.variant) }}
                    title={`${p.respondent}: ${nl(p.stat.mean)} (n = ${p.stat.n})`}
                  />
                ) : null,
              )}
            </div>
            <div className="dumbbell__values">
              {group.perspectives.map((p) => (
                <span key={p.formKey} className="dumbbell__value" style={{ color: perspectiveColor(p.variant) }}>
                  {nl(p.stat.mean)}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
