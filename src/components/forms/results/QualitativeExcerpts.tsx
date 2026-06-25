import { Quote } from "lucide-react";
import type { QualitativeExcerpt } from "@/lib/forms/results-dashboard";

interface QualitativeExcerptsProps {
  excerpts: QualitativeExcerpt[];
}

/** Open/kwalitatieve feedback naast de cijfers. */
export function QualitativeExcerpts({ excerpts }: QualitativeExcerptsProps) {
  if (excerpts.length === 0) return null;
  return (
    <ul className="excerpts">
      {excerpts.map((excerpt, index) => (
        <li className="excerpts__item" key={`${excerpt.label}-${index}`}>
          <Quote aria-hidden size={15} className="excerpts__icon" />
          <div>
            <p className="excerpts__label">{excerpt.label}</p>
            <p className="excerpts__text">{excerpt.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
