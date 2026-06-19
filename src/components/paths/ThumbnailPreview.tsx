import { Image as ImageIcon } from "lucide-react";
import { ILLUSTRATION_THUMBNAILS, type LearningPath } from "@/lib/paths/types";

export function ThumbnailPreview({ path, className = "" }: { path: Pick<LearningPath, "thumbnailKind" | "thumbnailValue" | "title">; className?: string }) {
  if (path.thumbnailKind === "solid" && path.thumbnailValue) {
    return <span className={`thumb-preview ${className}`} style={{ background: path.thumbnailValue }} aria-hidden />;
  }
  if (path.thumbnailKind === "illustration") {
    const ill = ILLUSTRATION_THUMBNAILS.find((i) => i.key === path.thumbnailValue);
    return <span className={`thumb-preview ${className}`} style={{ background: ill?.gradient ?? "#1f6feb" }} aria-hidden />;
  }
  if (path.thumbnailKind === "asset" && path.thumbnailValue) {
    return <span className={`thumb-preview thumb-preview--image ${className}`} aria-hidden><img src={path.thumbnailValue} alt="" /></span>;
  }
  return (
    <span className={`thumb-preview thumb-preview--empty ${className}`} aria-hidden>
      <ImageIcon size={18} />
    </span>
  );
}
