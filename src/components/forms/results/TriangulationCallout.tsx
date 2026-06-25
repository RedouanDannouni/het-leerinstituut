import { Eye } from "lucide-react";
import type { TriangulationGroup } from "@/lib/forms/results-dashboard";
import { nl } from "./helpers";

interface TriangulationCalloutProps {
  groups: TriangulationGroup[];
}

/** Neutrale auto-callout op de grootste perceptiekloof. Geen afrekening, wel een gespreksstart. */
export function TriangulationCallout({ groups }: TriangulationCalloutProps) {
  const widest = groups
    .filter((group) => group.gap !== null)
    .sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0))[0];

  if (!widest || widest.gap === null || widest.gap < 0.4) return null;

  const sorted = [...widest.perspectives]
    .filter((p) => p.stat.mean !== null)
    .sort((a, b) => (a.stat.mean ?? 0) - (b.stat.mean ?? 0));
  const low = sorted[0];
  const high = sorted[sorted.length - 1];

  return (
    <div className="tri-callout">
      <Eye aria-hidden size={18} className="tri-callout__icon" />
      <p className="tri-callout__text">
        De perspectieven liggen het verst uiteen bij <strong>{widest.label}</strong>: {low.respondent} ziet hier{" "}
        gemiddeld <strong>{nl(low.stat.mean)}</strong>, {high.respondent} <strong>{nl(high.stat.mean)}</strong>{" "}
        (Δ {nl(widest.gap)}). Een mooi startpunt voor het gesprek — observeren, ervaren en reflecteren leveren
        verschillende beelden op.
      </p>
    </div>
  );
}
