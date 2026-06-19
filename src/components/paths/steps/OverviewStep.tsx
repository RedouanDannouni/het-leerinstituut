"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import type { TenantId } from "@/lib/domain/types";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import type { DurationUnit, LearningPath, Tag } from "@/lib/paths/types";
import { DURATION_UNIT_LABELS } from "@/lib/paths/types";
import type { Person } from "@/lib/paths/people";
import { TagInput } from "../TagInput";
import { ThumbnailPicker } from "../ThumbnailPicker";
import { ThumbnailPreview } from "../ThumbnailPreview";

const DESCRIPTION_LIMIT = 400;
const LANGUAGES: { value: string; label: string }[] = [
  { value: "nl", label: "Nederlands" },
  { value: "en", label: "Engels" },
  { value: "de", label: "Duits" },
  { value: "fr", label: "Frans" },
];

export function OverviewStep({
  tenantId,
  path,
  onChange,
  allTags,
  onTagCreated,
  people,
}: {
  tenantId: TenantId;
  path: LearningPath;
  onChange: (patch: Partial<LearningPath>) => void;
  allTags: Tag[];
  onTagCreated: (tag: Tag) => void;
  people: Person[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const remaining = DESCRIPTION_LIMIT - path.description.length;

  return (
    <div className="wizard-step stack">
      <Field label="Titel">
        <Input
          value={path.title}
          placeholder="Bijv. Differentiëren in de onderbouw"
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </Field>

      <Field label="Tags / categorieën" help="Kies bestaande tags of maak er een aan.">
        <TagInput
          tenantId={tenantId}
          allTags={allTags}
          selectedIds={path.tagIds}
          onChange={(ids) => onChange({ tagIds: ids })}
          onTagCreated={onTagCreated}
        />
      </Field>

      <div className="grid grid-2">
        <Field label="Geschatte duur">
          <div className="block-inline-controls">
            <Input
              type="number"
              min={1}
              value={path.durationAmount ?? ""}
              placeholder="1"
              onChange={(event) => onChange({ durationAmount: event.target.value ? Number(event.target.value) : null })}
              style={{ maxWidth: 90 }}
            />
            <Select
              value={path.durationUnit ?? ""}
              onChange={(event) => onChange({ durationUnit: (event.target.value || null) as DurationUnit | null })}
            >
              <option value="">Eenheid…</option>
              {(Object.keys(DURATION_UNIT_LABELS) as DurationUnit[]).map((unit) => (
                <option key={unit} value={unit}>{DURATION_UNIT_LABELS[unit]}</option>
              ))}
            </Select>
          </div>
        </Field>

        <Field label="Taal">
          <Select value={path.language} onChange={(event) => onChange({ language: event.target.value })}>
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Trainer / begeleider">
        <Select value={path.trainerId ?? ""} onChange={(event) => onChange({ trainerId: event.target.value || null })}>
          <option value="">Geen trainer</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}
        </Select>
      </Field>

      <Field label="Beschrijving" help={`${path.description.length}/${DESCRIPTION_LIMIT}`} error={remaining < 0 ? "Beschrijving is te lang." : undefined}>
        <Textarea
          rows={4}
          value={path.description}
          maxLength={DESCRIPTION_LIMIT}
          placeholder="Waar gaat dit leerpad over en voor wie is het bedoeld?"
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </Field>

      <Field label="Thumbnail">
        <div className="thumb-field">
          <ThumbnailPreview path={path} className="thumb-field-preview" />
          <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>
            <ImagePlus size={15} aria-hidden /> {path.thumbnailKind ? "Thumbnail wijzigen" : "Thumbnail kiezen"}
          </button>
        </div>
      </Field>

      {pickerOpen ? (
        <ThumbnailPicker
          tenantId={tenantId}
          current={{ kind: path.thumbnailKind, assetId: path.thumbnailAssetId, value: path.thumbnailValue }}
          onApply={(value) => {
            onChange({ thumbnailKind: value.kind, thumbnailAssetId: value.assetId, thumbnailValue: value.value });
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  );
}
