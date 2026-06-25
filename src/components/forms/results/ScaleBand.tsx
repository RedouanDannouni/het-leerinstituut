import type { ScaleVariant } from "@/lib/forms/types";
import { nl, SCALE_POINTS, scaleColor, scaleLabels, scorePosition } from "./helpers";

interface ScaleBandProps {
  scale: ScaleVariant;
  /** Score-punt(en) op de band. */
  markers?: { value: number; color?: string; label?: string }[];
  /** Toon de kwalitatieve labels onder de band. */
  showLabels?: boolean;
  height?: number;
}

/**
 * Horizontale 1-4 as met de vier kwalitatieve banden als gekleurde achtergrond.
 * "De schaal is de norm": elk getal krijgt direct betekenis via de bandkleur.
 */
export function ScaleBand({ scale, markers = [], showLabels = false, height = 14 }: ScaleBandProps) {
  const labels = scaleLabels(scale);
  return (
    <div className="scale-band">
      <div className="scale-band__track" style={{ height }}>
        {SCALE_POINTS.map((point) => (
          <span
            key={point}
            className="scale-band__zone"
            style={{ background: scaleColor(point) }}
            title={`${point} — ${labels[point]}`}
          />
        ))}
        {markers.map((marker, index) => (
          <span
            key={`${marker.value}-${index}`}
            className="scale-band__marker"
            style={{ left: `${scorePosition(marker.value)}%`, background: marker.color ?? "var(--brand-ink)" }}
            title={marker.label ? `${marker.label}: ${nl(marker.value)}` : nl(marker.value)}
            aria-hidden
          />
        ))}
      </div>
      {showLabels ? (
        <div className="scale-band__labels" aria-hidden>
          {SCALE_POINTS.map((point) => (
            <span key={point} className="scale-band__label">
              <strong>{point}</strong> {labels[point]}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
