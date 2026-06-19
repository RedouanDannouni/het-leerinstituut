"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2, TriangleAlert } from "lucide-react";
import type { Asset, AssetKind, Block } from "@/lib/lessons/types";
import { blockRegistry } from "./block-registry";

export function BlockWrapper({
  block,
  errors,
  onChange,
  onDuplicate,
  onDelete,
  onRequestAsset,
}: {
  block: Block;
  errors: string[];
  onChange: (block: Block) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRequestAsset: (kinds: AssetKind[], apply: (asset: Asset) => void) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const definition = blockRegistry[block.type];
  const Editor = definition.EditorView;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`lesson-block ${errors.length ? "lesson-block--invalid" : ""}`}>
      <div className="lesson-block-gutter">
        <button type="button" className="block-handle" aria-label="Versleep blok" {...attributes} {...listeners}>
          <GripVertical size={16} aria-hidden />
        </button>
      </div>

      <div className="lesson-block-main">
        <div className="lesson-block-bar">
          <span className="lesson-block-type">{definition.label}</span>
          <div className="lesson-block-actions">
            {errors.length ? (
              <span className="lesson-block-warn" title={errors.join("\n")}>
                <TriangleAlert size={14} aria-hidden /> {errors.length}
              </span>
            ) : null}
            <button type="button" className="icon-btn" aria-label="Dupliceren" onClick={onDuplicate}>
              <Copy size={15} aria-hidden />
            </button>
            <button type="button" className="icon-btn icon-btn--danger" aria-label="Verwijderen" onClick={onDelete}>
              <Trash2 size={15} aria-hidden />
            </button>
          </div>
        </div>
        <div className="lesson-block-body">
          <Editor block={block} onChange={onChange} onRequestAsset={onRequestAsset} />
        </div>
      </div>
    </div>
  );
}
