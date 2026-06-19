import { Clock, Globe, Tag as TagIcon, UserCircle2 } from "lucide-react";
import { formatDuration } from "@/lib/paths/helpers";
import type { LearningPath, Tag } from "@/lib/paths/types";
import { ThumbnailPreview } from "./ThumbnailPreview";

export function PathSummaryCard({ path, allTags, trainerName }: { path: LearningPath; allTags: Tag[]; trainerName: string | null }) {
  const tags = allTags.filter((t) => path.tagIds.includes(t.id));
  const duration = formatDuration(path);

  return (
    <div className="path-summary-card">
      <ThumbnailPreview path={path} className="path-summary-thumb" />
      <div className="path-summary-body">
        <h3>{path.title || "Naamloos leerpad"}</h3>
        {path.description ? <p className="muted">{path.description}</p> : null}
        <div className="path-summary-meta">
          {tags.map((tag) => (
            <span key={tag.id} className="path-meta-chip"><TagIcon size={12} aria-hidden /> {tag.label}</span>
          ))}
          {duration ? <span className="path-meta-chip"><Clock size={12} aria-hidden /> {duration}</span> : null}
          <span className="path-meta-chip"><Globe size={12} aria-hidden /> {path.language.toUpperCase()}</span>
          {trainerName ? <span className="path-meta-chip"><UserCircle2 size={12} aria-hidden /> {trainerName}</span> : null}
        </div>
      </div>
    </div>
  );
}
