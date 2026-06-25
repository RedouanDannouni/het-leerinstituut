import type { TriangulationGroup } from "@/lib/forms/results-dashboard";
import type { FormVariant } from "@/lib/forms/types";
import { nl, scaleColor } from "./helpers";

interface PlcThemeHeatmapProps {
  groups: TriangulationGroup[];
}

const COLUMN_ORDER: { variant: FormVariant; label: string }[] = [
  { variant: "leiding", label: "Schoolleiding" },
  { variant: "deelnemer", label: "Docenten" },
  { variant: "leerling", label: "Leerlingen" },
];

function cellColor(mean: number): string {
  const band = Math.min(4, Math.max(1, Math.round(mean))) as 1 | 2 | 3 | 4;
  return scaleColor(band);
}

/** Heatmap: thema's (rijen) × respondentgroepen (kolommen), celkleur volgt de score. */
export function PlcThemeHeatmap({ groups }: PlcThemeHeatmapProps) {
  const activeColumns = COLUMN_ORDER.filter((column) =>
    groups.some((group) => group.perspectives.some((p) => p.variant === column.variant)),
  );

  return (
    <div className="heatmap" role="table" aria-label="Scores per thema en respondentgroep">
      <div className="heatmap__row heatmap__row--head" role="row">
        <span className="heatmap__corner" role="columnheader" />
        {activeColumns.map((column) => (
          <span key={column.variant} className="heatmap__colhead" role="columnheader">
            {column.label}
          </span>
        ))}
      </div>
      {groups.map((group) => (
        <div className="heatmap__row" role="row" key={group.key}>
          <span className="heatmap__rowhead" role="rowheader">
            {group.label}
          </span>
          {activeColumns.map((column) => {
            const perspective = group.perspectives.find((p) => p.variant === column.variant);
            const mean = perspective?.stat.mean ?? null;
            return (
              <span
                key={column.variant}
                className="heatmap__cell"
                role="cell"
                style={mean !== null ? { background: cellColor(mean) } : undefined}
                title={mean !== null ? `${group.label} · ${column.label}: ${nl(mean)}` : "Geen data"}
              >
                {mean !== null ? nl(mean) : "—"}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
