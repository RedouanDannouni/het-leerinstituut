"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import type { Asset, AssetKind } from "@/lib/lessons/types";
import type { TenantId } from "@/lib/domain/types";
import { listAssets, uploadAsset } from "@/lib/lessons/store";
import { Field, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";

export interface AssetPickerRequest {
  kinds: AssetKind[];
  apply: (asset: Asset) => void;
}

export function AssetPicker({
  tenantId,
  request,
  onClose,
}: {
  tenantId: TenantId;
  request: AssetPickerRequest | null;
  onClose: () => void;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!request) return;
    setError("");
    setAltText("");
    setLoading(true);
    void listAssets(tenantId)
      .then((items) => setAssets(items.filter((asset) => request.kinds.includes(asset.kind))))
      .finally(() => setLoading(false));
  }, [request, tenantId]);

  if (!request) return null;

  const needsAlt = request.kinds.includes("image") && request.kinds.length === 1;

  const handleFile = async (file: File) => {
    const kind = detectKind(file, request.kinds);
    if (needsAlt && !altText.trim()) {
      setError("Alt-tekst is verplicht voordat je een afbeelding uploadt.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const asset = await uploadAsset(tenantId, file, { kind, altText, title: file.name });
      request.apply(asset);
      onClose();
    } catch {
      setError("Uploaden mislukt. Probeer opnieuw.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Mediabibliotheek">
      <div className="modal">
        <div className="modal-head">
          <h2>Media kiezen</h2>
          <button type="button" className="icon-btn" aria-label="Sluiten" onClick={onClose}>
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="modal-body stack">
          <div className="surface stack-sm" style={{ padding: "var(--space-4)" }}>
            <strong>Nieuw uploaden</strong>
            {needsAlt ? (
              <Field label="Alt-tekst (verplicht)" error={error && !altText.trim() ? error : undefined}>
                <Input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Beschrijf de afbeelding" />
              </Field>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = "";
              }}
            />
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload size={16} aria-hidden /> {uploading ? "Bezig…" : "Bestand kiezen"}
            </Button>
            {error && (!needsAlt || altText.trim()) ? <p className="error-text">{error}</p> : null}
          </div>

          <div className="stack-sm">
            <strong>Bibliotheek</strong>
            {loading ? (
              <p className="muted">Laden…</p>
            ) : assets.length ? (
              <div className="asset-grid">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className="asset-tile"
                    onClick={() => {
                      request.apply(asset);
                      onClose();
                    }}
                  >
                    {asset.kind === "image" && asset.url ? (
                      <img src={asset.url} alt={asset.altText || asset.title} />
                    ) : (
                      <span className="asset-tile-kind">{asset.kind}</span>
                    )}
                    <span className="asset-tile-title">{asset.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted">Nog geen media in deze categorie. Upload je eerste bestand hierboven.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function detectKind(file: File, allowed: AssetKind[]): AssetKind {
  const mime = file.type;
  if (mime.startsWith("image/") && allowed.includes("image")) return "image";
  if (mime.startsWith("video/") && allowed.includes("video")) return "video";
  if (mime.startsWith("audio/") && allowed.includes("audio")) return "audio";
  return allowed.includes("file") ? "file" : allowed[0];
}
