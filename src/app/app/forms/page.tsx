"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ClipboardList,
  Clock,
  Copy,
  Eye,
  GraduationCap,
  ListChecks,
  MessagesSquare,
  PlayCircle,
  Users,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { FORM_DEFINITIONS } from "@/lib/forms/definitions";
import { allRatingColumns, type FormDefinition } from "@/lib/forms/types";
import { Badge } from "@/components/ui/Badge";

const FORM_ICONS: Record<string, LucideIcon> = {
  "lesobservatie-coach": Eye,
  zelfevaluatie: UserCheck,
  leerlingfeedback: MessagesSquare,
  "plc-schoolleiding": Building2,
  "plc-docenten": Users,
  "plc-leerlingen": GraduationCap,
};

function questionCount(def: FormDefinition) {
  return allRatingColumns(def).length;
}

function estMinutes(count: number) {
  return Math.max(2, Math.round(count * 0.35));
}

function scaleLabel(def: FormDefinition) {
  return def.scale === "plc" ? "Schaal nooit–altijd" : "Schaal ontwikkel–gevorderd";
}

type DraftProgress = { answered: number; total: number };

export default function FormsIndexPage() {
  const { context } = useRequireSession();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftProgress>>({});

  const role = context?.user.role;
  const tenantId = context?.user.tenantId;

  const authForms = useMemo(
    () =>
      role
        ? FORM_DEFINITIONS.filter(
            (def) => def.access === "auth" && (!def.allowedRoles || def.allowedRoles.includes(role)),
          )
        : [],
    [role],
  );
  const anonForms = useMemo(() => FORM_DEFINITIONS.filter((def) => def.access === "anon"), []);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Bestaande concepten (localStorage) detecteren zodat we "Verdergaan" kunnen tonen.
  useEffect(() => {
    if (authForms.length === 0) return;
    const next: Record<string, DraftProgress> = {};
    for (const def of authForms) {
      try {
        const raw = window.localStorage.getItem(`hli.form-draft.${def.key}.me`);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as { ratings?: Record<string, number> };
        const answered = parsed.ratings
          ? Object.values(parsed.ratings).filter((value) => value != null).length
          : 0;
        if (answered > 0) next[def.key] = { answered, total: questionCount(def) };
      } catch {
        // corrupte draft negeren
      }
    }
    setDrafts(next);
  }, [authForms]);

  if (!context) return null;
  if (!can(context.user.role, "view:forms")) notFound();

  const copyLink = async (formKey: string) => {
    const url = `${origin}/feedback/${tenantId}/${formKey}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(formKey);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Kwaliteitsmonitor</p>
          <h1>Vragenlijsten.</h1>
          <p className="muted">
            De zes formulieren van de Kwaliteitsmonitor. Coaches, leraren en schoolleiders vullen hun formulier hier in;
            leerlingen krijgen een anonieme deellink.
          </p>
        </div>
        <Link className="btn btn-secondary" href="/app/forms/resultaten">
          <BarChart3 aria-hidden size={16} /> Resultaten
        </Link>
      </header>

      <section className="stack">
        <h2 className="eyebrow" style={{ marginBottom: 0 }}>Zelf invullen</h2>
        {authForms.length === 0 ? (
          <div className="card">
            <p className="muted">Er zijn voor jouw rol geen vragenlijsten om zelf in te vullen.</p>
          </div>
        ) : (
          <div className="form-gallery">
            {authForms.map((def) => {
              const Icon = FORM_ICONS[def.key] ?? ClipboardList;
              const count = questionCount(def);
              const draft = drafts[def.key];
              const pct = draft ? Math.round((draft.answered / Math.max(1, draft.total)) * 100) : 0;
              return (
                <article key={def.key} className="form-tile">
                  <div className="form-tile__top">
                    <span className="form-tile__icon">
                      <Icon aria-hidden size={22} />
                    </span>
                    <Badge tone="info">{def.respondent}</Badge>
                  </div>
                  <div className="form-tile__body">
                    <h3 className="form-tile__title">{def.title}</h3>
                    <p className="form-tile__sub">{def.subtitle}</p>
                  </div>
                  <div className="form-tile__chips">
                    <span className="form-chip">
                      <ListChecks aria-hidden size={13} /> {count} vragen
                    </span>
                    <span className="form-chip">
                      <Clock aria-hidden size={13} /> ± {estMinutes(count)} min
                    </span>
                    <span className="form-chip">{scaleLabel(def)}</span>
                  </div>
                  {draft ? (
                    <div className="form-tile__resume">
                      <PlayCircle aria-hidden size={16} />
                      <span>Concept: {draft.answered}/{draft.total}</span>
                      <span className="form-tile__resume-bar">
                        <span style={{ width: `${pct}%` }} />
                      </span>
                    </div>
                  ) : null}
                  <div className="form-tile__foot">
                    <Link className="btn btn-primary" href={`/app/forms/${def.key}`}>
                      {draft ? "Verdergaan" : "Invullen"} <ArrowRight aria-hidden size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="stack">
        <h2 className="eyebrow" style={{ marginBottom: 0 }}>Anonieme leerling-links</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Deel deze links met leerlingen. Ze kunnen invullen zonder in te loggen; antwoorden komen binnen voor{" "}
          <strong>{context.tenant.name}</strong>.
        </p>
        <div className="form-gallery">
          {anonForms.map((def) => {
            const Icon = FORM_ICONS[def.key] ?? ClipboardList;
            const count = questionCount(def);
            const url = `${origin}/feedback/${tenantId}/${def.key}`;
            return (
              <article key={def.key} className="form-tile form-tile--anon">
                <div className="form-tile__top">
                  <span className="form-tile__icon">
                    <Icon aria-hidden size={22} />
                  </span>
                  <Badge tone="neutral">Anoniem</Badge>
                </div>
                <div className="form-tile__body">
                  <h3 className="form-tile__title">{def.title}</h3>
                  <p className="form-tile__sub">{def.subtitle}</p>
                </div>
                <div className="form-tile__chips">
                  <span className="form-chip">
                    <ListChecks aria-hidden size={13} /> {count} vragen
                  </span>
                  <span className="form-chip">
                    <Clock aria-hidden size={13} /> ± {estMinutes(count)} min
                  </span>
                </div>
                <div className="form-link-box" title={url}>
                  {url || "Deellink laden…"}
                </div>
                <div className="form-tile__foot">
                  <button type="button" className="btn btn-secondary" onClick={() => copyLink(def.key)}>
                    {copied === def.key ? <Check aria-hidden size={16} /> : <Copy aria-hidden size={16} />}
                    {copied === def.key ? "Gekopieerd" : "Kopieer link"}
                  </button>
                  <Link className="btn btn-ghost" href={`/feedback/${tenantId}/${def.key}`} target="_blank">
                    Voorbeeld
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
