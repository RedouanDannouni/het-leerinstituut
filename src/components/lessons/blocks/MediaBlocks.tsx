"use client";

import { FileDown, ImageIcon, Music, Upload } from "lucide-react";
import type {
  AttachmentBlock,
  AudioBlock,
  CodeBlock,
  EmbedBlock,
  ImageBlock,
  VideoBlock,
  VideoSource,
} from "@/lib/lessons/types";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import type { BlockEditorProps, BlockStudentProps } from "./shared";

/** Zet YouTube/Vimeo-links om naar een embed-URL. */
export function toEmbedUrl(url: string, source: VideoSource): string {
  if (!url) return "";
  if (source === "youtube") {
    const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }
  if (source === "vimeo") {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
  }
  return url;
}

/* ---------------- Image ---------------- */
export function ImageEditor({ block, onChange, onRequestAsset }: BlockEditorProps<ImageBlock>) {
  return (
    <div className="stack-sm">
      {block.url ? (
        <img className="block-media-preview" src={block.url} alt={block.alt || "Voorbeeld"} />
      ) : (
        <button
          type="button"
          className="media-dropzone"
          onClick={() => onRequestAsset?.(["image"], (asset) => onChange({ ...block, url: asset.url ?? "", assetId: asset.id, alt: asset.altText || block.alt }))}
        >
          <ImageIcon size={22} aria-hidden />
          <span>Afbeelding kiezen of uploaden</span>
        </button>
      )}
      <Field label="Alt-tekst (verplicht)" help="Beschrijf de afbeelding voor wie hem niet ziet.">
        <Input value={block.alt} onChange={(event) => onChange({ ...block, alt: event.target.value })} placeholder="Bijv. Grafiek van temperatuur per maand" />
      </Field>
      <Field label="Bijschrift (optioneel)">
        <Input value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} />
      </Field>
      {block.url ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onRequestAsset?.(["image"], (asset) => onChange({ ...block, url: asset.url ?? "", assetId: asset.id, alt: asset.altText || block.alt }))}
        >
          <Upload size={15} aria-hidden /> Andere afbeelding
        </button>
      ) : null}
    </div>
  );
}
export function ImageStudent({ block }: BlockStudentProps<ImageBlock>) {
  if (!block.url) return null;
  return (
    <figure className="lesson-figure">
      <img src={block.url} alt={block.alt} />
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  );
}

/* ---------------- Video ---------------- */
export function VideoEditor({ block, onChange, onRequestAsset }: BlockEditorProps<VideoBlock>) {
  return (
    <div className="stack-sm">
      <div className="block-inline-controls">
        <Select
          value={block.source}
          onChange={(event) => onChange({ ...block, source: event.target.value as VideoSource })}
          aria-label="Videobron"
          style={{ maxWidth: 140 }}
        >
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
          <option value="upload">Upload</option>
        </Select>
        {block.source === "upload" ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onRequestAsset?.(["video"], (asset) => onChange({ ...block, url: asset.url ?? "" }))}
          >
            <Upload size={15} aria-hidden /> Video uploaden
          </button>
        ) : (
          <Input value={block.url} onChange={(event) => onChange({ ...block, url: event.target.value })} placeholder="Plak de video-link" />
        )}
      </div>
      <Field label="Titel">
        <Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
      </Field>
      <Field label="Ondertiteling / captions-URL (verplicht)" help="Link naar een .vtt-bestand of beschrijf waar ondertiteling staat.">
        <Input value={block.captionsUrl} onChange={(event) => onChange({ ...block, captionsUrl: event.target.value })} />
      </Field>
      {block.url ? <VideoStudent block={block} /> : null}
    </div>
  );
}
export function VideoStudent({ block }: BlockStudentProps<VideoBlock>) {
  if (!block.url) return null;
  if (block.source === "upload") {
    return (
      <video className="lesson-video" controls src={block.url}>
        {block.captionsUrl ? <track kind="captions" src={block.captionsUrl} default /> : null}
      </video>
    );
  }
  return (
    <div className="lesson-embed">
      <iframe
        src={toEmbedUrl(block.url, block.source)}
        title={block.title || "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

/* ---------------- Audio ---------------- */
export function AudioEditor({ block, onChange, onRequestAsset }: BlockEditorProps<AudioBlock>) {
  return (
    <div className="stack-sm">
      <div className="block-inline-controls">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onRequestAsset?.(["audio"], (asset) => onChange({ ...block, url: asset.url ?? "" }))}
        >
          <Music size={15} aria-hidden /> Audio kiezen
        </button>
        <Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} placeholder="Titel" />
      </div>
      <Field label="Transcript (verplicht)" help="Tekstversie van de audio voor toegankelijkheid.">
        <Textarea value={block.transcript} onChange={(event) => onChange({ ...block, transcript: event.target.value })} />
      </Field>
      {block.url ? <audio className="lesson-audio" controls src={block.url} /> : null}
    </div>
  );
}
export function AudioStudent({ block }: BlockStudentProps<AudioBlock>) {
  if (!block.url) return null;
  return (
    <div className="stack-sm">
      {block.title ? <strong>{block.title}</strong> : null}
      <audio className="lesson-audio" controls src={block.url} />
      {block.transcript ? (
        <details className="lesson-transcript">
          <summary>Transcript</summary>
          <p>{block.transcript}</p>
        </details>
      ) : null}
    </div>
  );
}

/* ---------------- Embed ---------------- */
export function EmbedEditor({ block, onChange }: BlockEditorProps<EmbedBlock>) {
  return (
    <div className="stack-sm">
      <Field label="Embed-URL">
        <Input value={block.url} onChange={(event) => onChange({ ...block, url: event.target.value })} placeholder="https://…" />
      </Field>
      <Field label="Titel (verplicht)" help="Korte omschrijving van wat er ingesloten wordt.">
        <Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
      </Field>
      {block.url ? <EmbedStudent block={block} /> : null}
    </div>
  );
}
export function EmbedStudent({ block }: BlockStudentProps<EmbedBlock>) {
  if (!block.url) return null;
  return (
    <div className="lesson-embed">
      <iframe src={block.url} title={block.title || "Ingesloten inhoud"} allowFullScreen />
    </div>
  );
}

/* ---------------- Code ---------------- */
export function CodeEditor({ block, onChange }: BlockEditorProps<CodeBlock>) {
  return (
    <div className="stack-sm">
      <Input
        value={block.language}
        onChange={(event) => onChange({ ...block, language: event.target.value })}
        placeholder="Taal (bijv. python)"
        style={{ maxWidth: 200 }}
      />
      <Textarea
        className="code-textarea"
        value={block.code}
        onChange={(event) => onChange({ ...block, code: event.target.value })}
        placeholder="Plak hier je code…"
        rows={6}
      />
    </div>
  );
}
export function CodeStudent({ block }: BlockStudentProps<CodeBlock>) {
  return (
    <pre className="lesson-code" data-language={block.language}>
      <code>{block.code}</code>
    </pre>
  );
}

/* ---------------- Attachment ---------------- */
export function AttachmentEditor({ block, onChange, onRequestAsset }: BlockEditorProps<AttachmentBlock>) {
  return (
    <div className="stack-sm">
      <div className="block-inline-controls">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onRequestAsset?.(["file", "image", "audio", "video"], (asset) => onChange({ ...block, url: asset.url ?? "", assetId: asset.id, label: block.label || asset.title }))}
        >
          <Upload size={15} aria-hidden /> Bestand kiezen
        </button>
        <Input value={block.label} onChange={(event) => onChange({ ...block, label: event.target.value })} placeholder="Label" />
      </div>
      {block.url ? <span className="muted">Gekoppeld bestand klaar.</span> : null}
    </div>
  );
}
export function AttachmentStudent({ block }: BlockStudentProps<AttachmentBlock>) {
  if (!block.url) return null;
  return (
    <a className="lesson-attachment" href={block.url} target="_blank" rel="noreferrer" download>
      <FileDown size={18} aria-hidden />
      <span>{block.label || "Download"}</span>
    </a>
  );
}
