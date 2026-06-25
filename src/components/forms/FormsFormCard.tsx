"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  Copy,
  Eye,
  GraduationCap,
  Link2,
  Lock,
  LockOpen,
  MessagesSquare,
  User,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FormDefinition } from "@/lib/forms/types";

const FORM_ICONS: Record<string, LucideIcon> = {
  "lesobservatie-coach": Eye,
  zelfevaluatie: UserCheck,
  leerlingfeedback: MessagesSquare,
  "plc-schoolleiding": Building2,
  "plc-docenten": Users,
  "plc-leerlingen": GraduationCap,
};

const VARIANT_LABELS: Record<FormDefinition["variant"], string> = {
  leiding: "Leiding",
  deelnemer: "Deelnemer",
  leerling: "Leerling",
};

function questionCount(def: FormDefinition): number {
  return def.groups.reduce((sum, group) => sum + group.items.length, 0);
}

export function FormsFormCard({
  def,
  tenantId,
  open,
  institute,
  canFill,
  copied,
  pending,
  busyKey,
  onToggle,
  onCopyLink,
}: {
  def: FormDefinition;
  tenantId: string;
  open: boolean;
  institute: boolean;
  canFill: boolean;
  copied: string | null;
  pending: boolean;
  busyKey: string | null;
  onToggle: (def: FormDefinition) => void;
  onCopyLink: (formKey: string) => void;
}) {
  const Icon = FORM_ICONS[def.key] ?? User;
  const isAnon = def.access === "anon";
  const coverClass =
    def.instrument === "plc" ? "form-card__cover--plc" : "form-card__cover--lesobservatie";
  const busy = pending && busyKey === def.key;
  const questions = questionCount(def);

  const primaryAction = institute ? (
    <button
      type="button"
      className="form-card__btn form-card__btn--primary"
      onClick={() => onToggle(def)}
      disabled={busy}
    >
      {busy ? "Bezig…" : open ? "Sluiten voor school" : "Openstellen voor school"}
    </button>
  ) : canFill ? (
    <Link className="form-card__btn form-card__btn--primary" href={`/app/forms/school/${tenantId}/${def.key}`}>
      Invullen
      <ArrowRight aria-hidden size={18} />
    </Link>
  ) : isAnon ? (
    <button type="button" className="form-card__btn form-card__btn--primary" onClick={() => onCopyLink(def.key)}>
      {copied === def.key ? <Check aria-hidden size={18} /> : <Copy aria-hidden size={18} />}
      {copied === def.key ? "Link gekopieerd" : "Kopieer deellink"}
    </button>
  ) : (
    <p className="form-card__locked">
      <User aria-hidden size={15} />
      Wordt ingevuld door {def.respondent.toLowerCase()}
    </p>
  );

  const secondaryAction =
    institute && open && isAnon ? (
      <button
        type="button"
        className="form-card__btn form-card__btn--icon"
        onClick={() => onCopyLink(def.key)}
        aria-label={copied === def.key ? "Deellink gekopieerd" : "Kopieer deellink"}
        title={copied === def.key ? "Gekopieerd" : "Kopieer deellink"}
      >
        {copied === def.key ? <Check aria-hidden size={20} /> : <Link2 aria-hidden size={20} />}
      </button>
    ) : institute && open && canFill ? (
      <Link
        className="form-card__btn form-card__btn--icon"
        href={`/app/forms/school/${tenantId}/${def.key}`}
        aria-label="Zelf invullen"
        title="Zelf invullen"
      >
        <ArrowRight aria-hidden size={20} />
      </Link>
    ) : null;

  return (
    <article className="form-card form-card--profile">
      <div className="form-card__wrapper">
        <div className={`form-card__cover ${coverClass}`} aria-hidden>
          <Icon size={44} strokeWidth={1.25} />
        </div>

        <div className="form-card__content">
          <div className="form-card__head">
            <h3 className="form-card__title">{def.title}</h3>
            <span className={`form-card__status${open ? " form-card__status--open" : ""}`}>
              {open ? <LockOpen aria-hidden size={12} /> : <Lock aria-hidden size={12} />}
              {open ? "Open" : "Gesloten"}
            </span>
          </div>

          <p className="form-card__description">{def.subtitle}</p>

          <p className="form-card__meta">
            <span>{VARIANT_LABELS[def.variant]}</span>
            <span>{questions} vragen</span>
          </p>

          <div className={`form-card__actions${secondaryAction ? "" : " form-card__actions--single"}`}>
            {primaryAction}
            {secondaryAction}
          </div>
        </div>
      </div>
    </article>
  );
}
