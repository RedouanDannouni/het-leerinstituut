import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { InstrumentTrend } from "@/lib/forms/results-dashboard";
import type { ScaleVariant } from "@/lib/forms/types";
import { nl, SCALE_POINTS, scaleColor, scorePosition } from "./helpers";

interface MeetmomentTrendProps {
  trend: InstrumentTrend;
  scale: ScaleVariant;
}

const MOMENT_SHADE: Record<string, string> = {
  Nulmeting: "rgba(20, 41, 48, 0.45)",
  Volgmeting: "rgba(20, 41, 48, 0.7)",
  Eindmeting: "var(--brand-ink)",
};

function GrowthBadge({ growth }: { growth: number | null }) {
  if (growth === null) return null;
  const tone = growth > 0.04 ? "up" : growth < -0.04 ? "down" : "flat";
  const Icon = tone === "up" ? ArrowUpRight : tone === "down" ? ArrowDownRight : ArrowRight;
  const sign = growth > 0 ? "+" : "";
  return (
    <span className={`trend__growth trend__growth--${tone}`}>
      <Icon aria-hidden size={13} />
      {sign}
      {nl(growth)}
    </span>
  );
}

/** Ontwikkeling over de meetmomenten (Nulmeting → Volgmeting → Eindmeting) per bouwsteen. */
export function MeetmomentTrend({ trend, scale }: MeetmomentTrendProps) {
  const moments = trend.groups[0]?.points.map((point) => point.meetmoment) ?? [];

  return (
    <div className="trend">
      <div className="trend__legend">
        {moments.map((moment) => (
          <span key={moment} className="trend__legend-item">
            <span className="trend__swatch" style={{ background: MOMENT_SHADE[moment] ?? "var(--brand-ink)" }} aria-hidden />
            {moment}
          </span>
        ))}
      </div>

      {trend.groups.map((group) => (
        <div className="trend__row" key={group.key}>
          <div className="trend__label">
            <span>{group.label}</span>
            <GrowthBadge growth={group.growth} />
          </div>
          <div className="trend__track">
            {SCALE_POINTS.map((point) => (
              <span key={point} className="trend__zone" style={{ background: scaleColor(point) }} />
            ))}
            {group.points.map((point) =>
              point.stat.mean !== null ? (
                <span
                  key={point.meetmoment}
                  className="trend__dot"
                  style={{
                    left: `${scorePosition(point.stat.mean)}%`,
                    background: MOMENT_SHADE[point.meetmoment] ?? "var(--brand-ink)",
                  }}
                  title={`${point.meetmoment}: ${nl(point.stat.mean)} (n = ${point.stat.n})`}
                />
              ) : null,
            )}
          </div>
          <div className="trend__values">
            {group.points.map((point) => (
              <span key={point.meetmoment} className="trend__value">
                {nl(point.stat.mean)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
