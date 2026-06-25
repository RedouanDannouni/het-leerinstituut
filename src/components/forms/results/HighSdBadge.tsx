import { AlertTriangle } from "lucide-react";

/** Signaal dat een item geen consensus kent (hoge spreiding). */
export function HighSdBadge() {
  return (
    <span className="sd-badge" title="Hoge spreiding: de groep is verdeeld over dit item">
      <AlertTriangle aria-hidden size={12} /> geen consensus
    </span>
  );
}
