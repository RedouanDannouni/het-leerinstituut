"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, ClipboardCheck, Plus, Search } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { canViewRawObservations } from "@/lib/domain/permissions";
import { getProjectTitle, getTeacherName, getVisibleObservations } from "@/lib/domain/selectors";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type StatusKey = "all" | "draft" | "planned" | "completed";

const statusMeta: Record<Exclude<StatusKey, "all">, { label: string; tone: "warning" | "info" | "success" }> = {
  draft: { label: "Concept", tone: "warning" },
  planned: { label: "Gepland", tone: "info" },
  completed: { label: "Afgerond", tone: "success" },
};

const filters: { key: StatusKey; label: string }[] = [
  { key: "all", label: "Alles" },
  { key: "draft", label: "Concept" },
  { key: "planned", label: "Gepland" },
  { key: "completed", label: "Afgerond" },
];

export default function ObservationsPage() {
  const { context } = useRequireSession();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusKey>("all");

  const observations = useMemo(() => (context ? getVisibleObservations(context) : []), [context]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return observations.filter((observation) => {
      if (status !== "all" && observation.status !== status) return false;
      if (!term) return true;
      return (
        observation.lessonTitle.toLowerCase().includes(term) ||
        getTeacherName(observation.teacherId).toLowerCase().includes(term) ||
        observation.subject.toLowerCase().includes(term)
      );
    });
  }, [observations, query, status]);

  if (!context) return null;

  if (!canViewRawObservations(context.user.role)) {
    return (
      <div className="page">
        <Card>
          <h1>Observaties zijn afgeschermd.</h1>
          <p className="muted">Deze rol ziet geen ruwe observatiedata. Gebruik rapporten voor samenvatting, trend en afspraken.</p>
          <Link className="btn btn-primary" href="/app/reports">Naar rapporten</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Lesbezoek</p>
          <h1>Observatieformulieren.</h1>
          <p className="muted">Concepten, geplande bezoeken en afgeronde observaties binnen jouw schoolomgeving.</p>
        </div>
        <Link className="btn btn-primary" href="/app/observations/new">
          <Plus aria-hidden size={18} /> Nieuw lesbezoek
        </Link>
      </header>

      <div className="toolbar">
        <div className="search">
          <Search aria-hidden size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op les, docent of vak…"
            aria-label="Observaties zoeken"
          />
        </div>
        <div className="filter-pills" role="group" aria-label="Filter op status">
          {filters.map((filter) => {
            const count =
              filter.key === "all"
                ? observations.length
                : observations.filter((observation) => observation.status === filter.key).length;
            return (
              <button
                key={filter.key}
                type="button"
                className="filter-pill"
                aria-pressed={status === filter.key}
                onClick={() => setStatus(filter.key)}
              >
                {filter.label}
                <span className="filter-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length ? (
        <div className="list">
          {filtered.map((observation) => {
            const meta = statusMeta[observation.status];
            return (
              <Link key={observation.id} className="list-row" href={`/app/observations/${observation.id}`}>
                <span className="list-row-icon" data-tone={meta.tone} aria-hidden>
                  <ClipboardCheck size={22} />
                </span>
                <div className="list-row-body">
                  <p className="list-row-title">{observation.lessonTitle}</p>
                  <p className="list-row-meta">
                    {getTeacherName(observation.teacherId)} · {observation.subject} · {getProjectTitle(observation.projectId)}
                  </p>
                </div>
                <div className="list-row-trail">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <ChevronRight className="list-row-chevron" aria-hidden size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="muted" style={{ margin: 0 }}>
            Geen observaties gevonden voor deze filter. Pas je zoekopdracht aan of start een nieuw lesbezoek.
          </p>
        </Card>
      )}
    </div>
  );
}
