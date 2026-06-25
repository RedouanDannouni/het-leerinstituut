import { AlertTriangle } from "lucide-react";
import type { StatBlock } from "@/lib/forms/stats";
import { nl, nlShort } from "./helpers";

interface StatStripProps {
  stat: StatBlock;
  /** Toon een caveat bij kleine n. */
  caveatBelow?: number;
}

/** Vast patroon: n | gem | med | SD | top-box, met consensus-signaal bij hoge SD. */
export function StatStrip({ stat, caveatBelow = 10 }: StatStripProps) {
  if (stat.n === 0) {
    return <p className="stat-strip stat-strip--empty">Nog geen antwoorden.</p>;
  }

  return (
    <div className="stat-strip">
      <span className="stat-strip__item">
        n = <strong>{stat.n}</strong>
      </span>
      <span className="stat-strip__sep" aria-hidden />
      <span className="stat-strip__item">
        gem <strong>{nl(stat.mean)}</strong>
      </span>
      <span className="stat-strip__sep" aria-hidden />
      <span className="stat-strip__item">
        med <strong>{nlShort(stat.median)}</strong>
      </span>
      <span className="stat-strip__sep" aria-hidden />
      <span className="stat-strip__item">
        modus <strong>{nlShort(stat.mode)}</strong>
      </span>
      <span className="stat-strip__sep" aria-hidden />
      <span className={`stat-strip__item${stat.highSd ? " stat-strip__item--warn" : ""}`}>
        SD <strong>{nl(stat.sd)}</strong>
        {stat.highSd ? <AlertTriangle aria-label="Hoge spreiding: geen consensus" size={13} /> : null}
      </span>
      <span className="stat-strip__sep" aria-hidden />
      <span className="stat-strip__item stat-strip__item--topbox">
        <strong>{stat.topBox}%</strong> op niveau
      </span>
      {caveatBelow && stat.n < caveatBelow ? (
        <span className="stat-strip__caveat">Kleine groep — interpreteer voorzichtig.</span>
      ) : null}
    </div>
  );
}
