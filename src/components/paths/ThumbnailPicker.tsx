"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Image as ImageIcon, Palette, Sparkles, Upload, X } from "lucide-react";
import type { TenantId } from "@/lib/domain/types";
import { listAssets, uploadAsset } from "@/lib/lessons/store";
import type { Asset } from "@/lib/lessons/types";
import { ILLUSTRATION_THUMBNAILS, SOLID_THUMBNAILS, type ThumbnailKind } from "@/lib/paths/types";

export interface ThumbnailValue {
  kind: ThumbnailKind | null;
  assetId: string | null;
  value: string | null;
}

type Source = "illustration" | "asset" | "solid";

export function ThumbnailPicker({
  tenantId,
  current,
  onApply,
  onClose,
}: {
  tenantId: TenantId;
  current: ThumbnailValue;
  onApply: (value: ThumbnailValue) => void;
  onClose: () => void;
}) {
  const [source, setSource] = useState<Source>(current.kind ?? "illustration");
  const [draft, setDraft] = useState<ThumbnailValue>(current);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void listAssets(tenantId).then((list) => setAssets(list.filter((a) => a.kind === "image")));
  }, [tenantId]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const asset = await uploadAsset(tenantId, file, { kind: "image", title: file.name });
    setAssets((current) => [asset, ...current]);
    setDraft({ kind: "asset", assetId: asset.id, value: asset.url });
    setUploading(false);
  };

  const tabs: { id: Source; label: string; icon: React.ElementType }[] = [
    { id: "illustration", label: "Gallery", icon: Sparkles },
    { id: "asset", label: "Upload", icon: Upload },
    { id: "solid", label: "Kleur", icon: Palette },
  ];

  return (
    <div className="modal-overlay no-print" role="dialog" aria-modal="true" aria-label="Thumbnail kiezen" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>Thumbnail</h2>
          <button type="button" className="icon-btn" aria-label="Sluiten" onClick={onClose}>
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="segmented" role="group" aria-label="Bron">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} type="button" className={`segmented-btn ${source === tab.id ? "is-active" : ""}`} onClick={() => setSource(tab.id)}>
                <Icon size={14} aria-hidden /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="thumb-picker-body">
          {source === "illustration" ? (
            <div className="thumb-grid">
              {ILLUSTRATION_THUMBNAILS.map((ill) => {
                const active = draft.kind === "illustration" && draft.value === ill.key;
                return (
                  <button
                    key={ill.key}
                    type="button"
                    className={`thumb-tile ${active ? "is-active" : ""}`}
                    style={{ background: ill.gradient }}
                    onClick={() => setDraft({ kind: "illustration", assetId: null, value: ill.key })}
                  >
                    <span>{ill.label}</span>
                    {active ? <span className="thumb-check"><Check size={14} aria-hidden /></span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          {source === "solid" ? (
            <div className="thumb-grid">
              {SOLID_THUMBNAILS.map((solid) => {
                const active = draft.kind === "solid" && draft.value === solid.value;
                return (
                  <button
                    key={solid.value}
                    type="button"
                    className={`thumb-tile ${active ? "is-active" : ""}`}
                    style={{ background: solid.value }}
                    onClick={() => setDraft({ kind: "solid", assetId: null, value: solid.value })}
                  >
                    <span>{solid.label}</span>
                    {active ? <span className="thumb-check"><Check size={14} aria-hidden /></span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          {source === "asset" ? (
            <div className="stack-sm">
              <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload size={15} aria-hidden /> {uploading ? "Uploaden…" : "Afbeelding uploaden"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />
              <div className="thumb-grid">
                {assets.map((asset) => {
                  const active = draft.kind === "asset" && draft.assetId === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      className={`thumb-tile thumb-tile--image ${active ? "is-active" : ""}`}
                      onClick={() => setDraft({ kind: "asset", assetId: asset.id, value: asset.url })}
                    >
                      {asset.url ? <img src={asset.url} alt={asset.altText || asset.title} /> : <ImageIcon size={20} aria-hidden />}
                      {active ? <span className="thumb-check"><Check size={14} aria-hidden /></span> : null}
                    </button>
                  );
                })}
                {!assets.length ? <p className="muted">Nog geen afbeeldingen geüpload.</p> : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={() => onApply({ kind: null, assetId: null, value: null })}>
            Thumbnail verwijderen
          </button>
          <div className="cluster">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuleren</button>
            <button type="button" className="btn btn-primary" onClick={() => onApply(draft)} disabled={!draft.kind}>
              Opslaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
