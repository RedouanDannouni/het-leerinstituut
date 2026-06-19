"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FORM_DEFINITIONS } from "@/lib/forms/definitions";
import { allRatingColumns, type FormDefinition } from "@/lib/forms/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface FormResult {
  count: number;
  overall: number | null;
  groups: { label: string; avg: number | null; n: number }[];
}

type Row = Record<string, number | null>;

function average(rows: Row[], columns: string[]): number | null {
  let sum = 0;
  let n = 0;
  for (const row of rows) {
    for (const column of columns) {
      const value = row[column];
      if (typeof value === "number") {
        sum += value;
        n += 1;
      }
    }
  }
  return n ? Number((sum / n).toFixed(2)) : null;
}

function computeResult(def: FormDefinition, rows: Row[]): FormResult {
  return {
    count: rows.length,
    overall: average(rows, allRatingColumns(def)),
    groups: def.groups.map((group) => {
      const cols = group.items.map((item) => item.column);
      return { label: group.label, avg: average(rows, cols), n: rows.length };
    }),
  };
}

export default function FormResultsPage() {
  const { context } = useRequireSession();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [results, setResults] = useState<Record<string, FormResult>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const entries = await Promise.all(
        FORM_DEFINITIONS.map(async (def) => {
          const { data } = await supabase.from(def.table).select("*").limit(1000);
          return [def.key, computeResult(def, (data as Row[]) ?? [])] as const;
        }),
      );
      if (!active) return;
      setResults(Object.fromEntries(entries));
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [supabase]);

  if (!context) return null;
  if (!can(context.user.role, "view:forms")) notFound();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Kwaliteitsmonitor</p>
          <h1>Resultaten.</h1>
          <p className="muted">
            Aantal ingevulde formulieren en gemiddelde scores per bouwsteen voor {context.tenant.name}.
          </p>
        </div>
        <Link className="btn btn-ghost" href="/app/forms">
          <ArrowLeft aria-hidden size={16} /> Terug
        </Link>
      </header>

      {loading ? (
        <Card>
          <p className="muted">Resultaten laden…</p>
        </Card>
      ) : (
        <div className="grid grid-2">
          {FORM_DEFINITIONS.map((def) => {
            const result = results[def.key];
            if (!result) return null;
            return (
              <Card key={def.key}>
                <div className="card-header">
                  <div>
                    <h2>{def.title}</h2>
                    <p className="muted">{def.respondent}</p>
                  </div>
                  <Badge tone={result.count ? "success" : "neutral"}>{result.count} reacties</Badge>
                </div>
                {result.count === 0 ? (
                  <p className="help-text">Nog geen reacties binnengekomen.</p>
                ) : (
                  <div className="stack">
                    <p>
                      <strong>Gemiddelde score: {result.overall ?? "—"}/4</strong>
                    </p>
                    <div className="stack" style={{ gap: "var(--space-2)" }}>
                      {result.groups.map((group) => (
                        <div key={group.label} className="cluster" style={{ justifyContent: "space-between" }}>
                          <span className="help-text" style={{ margin: 0 }}>{group.label}</span>
                          <strong>{group.avg ?? "—"}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
