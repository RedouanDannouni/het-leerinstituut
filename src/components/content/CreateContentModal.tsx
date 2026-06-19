"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookMarked,
  ClipboardList,
  FileText,
  LayoutGrid,
  ListChecks,
  Route,
  Sparkles,
  X,
} from "lucide-react";
import type { SessionContext } from "@/lib/domain/types";
import { can } from "@/lib/domain/permissions";
import { createLesson, createModule } from "@/lib/lessons/store";
import type { LessonKind } from "@/lib/lessons/types";
import { createPath } from "@/lib/paths/store";

type ContentTypeId = "page" | "quiz" | "path" | "course" | "assignment" | "wiki";

interface ContentTypeDef {
  id: ContentTypeId;
  label: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  badge?: { label: string; tone: "ai" | "new" | "soon" };
  available: boolean;
}

const CONTENT_TYPES: ContentTypeDef[] = [
  {
    id: "page",
    label: "Pagina",
    description: "Een blok-gebaseerde les met tekst, media en interactie.",
    icon: FileText,
    accent: "#1f6feb",
    badge: { label: "AI Powered", tone: "ai" },
    available: true,
  },
  {
    id: "quiz",
    label: "Quiz",
    description: "Becijferde toets met meerkeuze- en kennischeck-blokken.",
    icon: ListChecks,
    accent: "#0e9f6e",
    badge: { label: "AI Powered", tone: "ai" },
    available: true,
  },
  {
    id: "path",
    label: "Leerpad",
    description: "Bundel lessen en modules tot een gestructureerd traject.",
    icon: Route,
    accent: "#7c3aed",
    available: true,
  },
  {
    id: "course",
    label: "Module",
    description: "Een lessenreeks die je als geheel in een leerpad plaatst.",
    icon: LayoutGrid,
    accent: "#f59e0b",
    available: true,
  },
  {
    id: "assignment",
    label: "Opdracht",
    description: "Inlever-opdracht met nakijken. Komt in een volgende fase.",
    icon: ClipboardList,
    accent: "#64748b",
    badge: { label: "Binnenkort", tone: "soon" },
    available: false,
  },
  {
    id: "wiki",
    label: "Wiki",
    description: "Naslagpagina, vrij doorzoekbaar. Komt in een volgende fase.",
    icon: BookMarked,
    accent: "#64748b",
    badge: { label: "Nieuw", tone: "new" },
    available: false,
  },
];

export function CreateContentModal({ context, onClose }: { context: SessionContext; onClose: () => void }) {
  const router = useRouter();
  const tenantId = context.user.tenantId;
  const [busy, setBusy] = useState<ContentTypeId | null>(null);

  const canEditLessons = can(context.user.role, "edit:lessons");
  const canEditPaths = can(context.user.role, "edit:paths");

  const isAllowed = (id: ContentTypeId): boolean => {
    if (id === "path") return canEditPaths;
    return canEditLessons;
  };

  const handleSelect = async (def: ContentTypeDef) => {
    if (!def.available || !isAllowed(def.id) || busy) return;
    setBusy(def.id);
    try {
      switch (def.id) {
        case "page":
        case "quiz":
        case "assignment":
        case "wiki": {
          const lesson = await createLesson(tenantId, { title: "Naamloze les", kind: def.id as LessonKind });
          router.push(`/app/materials/lessons/${lesson.id}`);
          break;
        }
        case "course": {
          const mod = await createModule(tenantId, "Naamloze module");
          router.push(`/app/materials/modules/${mod.id}`);
          break;
        }
        case "path": {
          const path = await createPath(tenantId, { title: "Naamloos leerpad" });
          router.push(`/app/materials/paths/${path.id}`);
          break;
        }
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="modal-overlay no-print" role="dialog" aria-modal="true" aria-label="Nieuwe content maken" onClick={onClose}>
      <div className="modal modal--lg" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">Nieuwe content</p>
            <h2>Wat wil je maken?</h2>
          </div>
          <button type="button" className="icon-btn" aria-label="Sluiten" onClick={onClose}>
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="content-type-grid">
          {CONTENT_TYPES.map((def) => {
            const Icon = def.icon;
            const allowed = def.available && isAllowed(def.id);
            return (
              <button
                key={def.id}
                type="button"
                className="content-type-card"
                disabled={!allowed || busy !== null}
                aria-disabled={!allowed}
                onClick={() => handleSelect(def)}
              >
                <span className="content-type-icon" style={{ background: `${def.accent}1a`, color: def.accent }} aria-hidden>
                  <Icon size={22} />
                </span>
                <span className="content-type-body">
                  <span className="content-type-title">
                    {def.label}
                    {def.badge ? (
                      <span className={`content-type-badge content-type-badge--${def.badge.tone}`}>
                        {def.badge.tone === "ai" ? <Sparkles size={11} aria-hidden /> : null}
                        {def.badge.label}
                      </span>
                    ) : null}
                  </span>
                  <span className="content-type-desc">{def.description}</span>
                </span>
                {busy === def.id ? <span className="content-type-spinner" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
