import type { StatBlock } from "@/lib/forms/stats";
import type { ScaleVariant } from "@/lib/forms/types";
import { nl } from "./helpers";
import { ScaleBand } from "./ScaleBand";

interface KpiTileProps {
  title: string;
  subtitle?: string;
  stat: StatBlock;
  scale: ScaleVariant;
  accent?: string;
  belowThreshold?: boolean;
  minResponses?: number;
}

/** Eén-oogopslag-tegel: kopcijfer (mean) + n + top-box, met de score op de schaalband. */
export function KpiTile({
  title,
  subtitle,
  stat,
  scale,
  accent,
  belowThreshold = false,
  minResponses = 5,
}: KpiTileProps) {
  return (
    <div className="kpi-tile" style={accent ? { ["--kpi-accent" as string]: accent } : undefined}>
      <div className="kpi-tile__head">
        <span className="kpi-tile__dot" aria-hidden />
        <div>
          <p className="kpi-tile__title">{title}</p>
          {subtitle ? <p className="kpi-tile__subtitle">{subtitle}</p> : null}
        </div>
      </div>

      {belowThreshold ? (
        <p className="kpi-tile__locked">
          Te weinig respondenten (n = {stat.n}, minimaal {minResponses}).
        </p>
      ) : stat.n === 0 ? (
        <p className="kpi-tile__locked">Nog geen reacties.</p>
      ) : (
        <>
          <div className="kpi-tile__figures">
            <span className="kpi-tile__value">{nl(stat.mean)}</span>
            <span className="kpi-tile__scale">/ 4</span>
            <span className="kpi-tile__n">n = {stat.n}</span>
          </div>
          <ScaleBand scale={scale} markers={[{ value: stat.mean ?? 1 }]} height={12} />
          <p className="kpi-tile__topbox">
            <strong>{stat.topBox}%</strong> scoort op niveau (3–4)
          </p>
        </>
      )}
    </div>
  );
}
