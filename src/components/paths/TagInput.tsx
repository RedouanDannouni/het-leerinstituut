"use client";

import { useState } from "react";
import { Plus, Tag as TagIcon, X } from "lucide-react";
import type { TenantId } from "@/lib/domain/types";
import { createTag } from "@/lib/paths/store";
import type { Tag } from "@/lib/paths/types";

export function TagInput({
  tenantId,
  allTags,
  selectedIds,
  onChange,
  onTagCreated,
}: {
  tenantId: TenantId;
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onTagCreated: (tag: Tag) => void;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  const handleCreate = async () => {
    const label = draft.trim();
    if (!label || busy) return;
    setBusy(true);
    const tag = await createTag(tenantId, label);
    onTagCreated(tag);
    if (!selectedIds.includes(tag.id)) onChange([...selectedIds, tag.id]);
    setDraft("");
    setBusy(false);
  };

  const selected = allTags.filter((t) => selectedIds.includes(t.id));
  const available = allTags.filter((t) => !selectedIds.includes(t.id));

  return (
    <div className="tag-input">
      {selected.length ? (
        <div className="tag-chip-row">
          {selected.map((tag) => (
            <span key={tag.id} className="tag-chip" style={tag.color ? { borderColor: tag.color } : undefined}>
              <TagIcon size={12} aria-hidden />
              {tag.label}
              <button type="button" aria-label={`${tag.label} verwijderen`} onClick={() => toggle(tag.id)}>
                <X size={12} aria-hidden />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="block-inline-controls">
        <input
          className="input"
          value={draft}
          placeholder="Tag zoeken of nieuwe maken…"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleCreate();
            }
          }}
        />
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleCreate} disabled={!draft.trim() || busy}>
          <Plus size={14} aria-hidden /> Maken
        </button>
      </div>

      {available.length ? (
        <div className="tag-chip-row tag-chip-row--muted">
          {available
            .filter((t) => !draft.trim() || t.label.toLowerCase().includes(draft.trim().toLowerCase()))
            .map((tag) => (
              <button key={tag.id} type="button" className="tag-chip tag-chip--add" onClick={() => toggle(tag.id)}>
                <Plus size={12} aria-hidden />
                {tag.label}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}
