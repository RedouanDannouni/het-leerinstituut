"use client";

import { use, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { isInstituteStaff } from "@/lib/domain/roles";
import { tenants } from "@/lib/domain/seed-data";
import { formsForInstrument } from "@/lib/forms/definitions";
import { INSTRUMENTS, type FormDefinition } from "@/lib/forms/types";
import { listFormWindowsForTenant, setFormWindowStatus } from "@/lib/forms/window-store";
import { Card } from "@/components/ui/Card";
import { FormsFormCard } from "@/components/forms/FormsFormCard";

type WindowMap = Record<string, "open" | "gesloten">;

export default function SchoolFormsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params);
  const { context } = useRequireSession();

  const [windows, setWindows] = useState<WindowMap>({});
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      const map = await listFormWindowsForTenant(tenantId);
      if (!active) return;
      setWindows(map);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [tenantId]);

  const openCount = useMemo(() => {
    const isWindowOpen = (key: string) => (windows[key] ?? "gesloten") === "open";
    return INSTRUMENTS.flatMap((instrument) => formsForInstrument(instrument.key)).filter((def) =>
      isWindowOpen(def.key),
    ).length;
  }, [windows]);

  if (!context) return null;
  const role = context.user.role;
  const userId = context.user.id;
  if (!can(role, "view:forms")) notFound();

  const institute = isInstituteStaff(role);
  if (!institute && context.user.tenantId !== tenantId) notFound();

  const tenant = tenants.find((item) => item.id === tenantId);
  if (!tenant) notFound();

  const statusOf = (key: string): "open" | "gesloten" => windows[key] ?? "gesloten";
  const isOpen = (key: string) => statusOf(key) === "open";
  const canFill = (def: FormDefinition) =>
    def.access === "auth" && (!def.allowedRoles || def.allowedRoles.includes(role));

  const toggle = (def: FormDefinition) => {
    const next = !isOpen(def.key);
    setBusyKey(def.key);
    setError(null);
    startTransition(async () => {
      const result = await setFormWindowStatus({
        tenantId,
        formKey: def.key,
        open: next,
        userId,
      });
      setBusyKey(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setWindows((current) => ({ ...current, [def.key]: next ? "open" : "gesloten" }));
    });
  };

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

  const formCountLabel = institute
    ? `${openCount} van 6 open`
    : `${openCount} ${openCount === 1 ? "formulier" : "formulieren"} open`;

  return (
    <div className="page materials-page forms-page">
      <div className="stack forms-stack">
        <header className="materials-header">
          <div className="materials-header__title">
            <p className="eyebrow">Kwaliteitsmonitor · {tenant.name}</p>
            <div className="materials-header__heading">
              <h1>Vragenlijsten</h1>
              <span className="materials-header__count">{formCountLabel}</span>
            </div>
            <p className="muted forms-header-lead">
              {institute
                ? "Open of sluit per formulier. Wat openstaat, is direct invulbaar voor de school en (voor leerlingen) via de deellink."
                : "De vragenlijsten die voor jouw school zijn opengezet."}
            </p>
          </div>

          <div className="materials-header__controls forms-header-actions">
            <Link className="materials-header__control" href={`/app/forms/school/${tenantId}/resultaten`}>
              <BarChart3 aria-hidden size={16} /> Resultaten
            </Link>
            {institute ? (
              <Link className="materials-header__control" href="/app/forms">
                <ArrowLeft aria-hidden size={16} /> Andere school
              </Link>
            ) : null}
          </div>
        </header>

        {error ? (
          <Card>
            <p className="error-text" style={{ margin: 0 }}>{error}</p>
          </Card>
        ) : null}

        {loading ? (
          <Card>
            <p className="muted">Formulieren laden…</p>
          </Card>
        ) : (
          INSTRUMENTS.map((instrument) => {
            const defs = formsForInstrument(instrument.key);
            const visible = institute ? defs : defs.filter((def) => isOpen(def.key));
            return (
              <section className="forms-section" key={instrument.key}>
                <header className="forms-section__head">
                  <h2>{instrument.label}</h2>
                  <p className="muted">{instrument.description}</p>
                </header>
                {visible.length === 0 ? (
                  <Card>
                    <p className="help-text" style={{ margin: 0 }}>
                      Nog geen formulieren van dit instrument opengezet voor jouw school.
                    </p>
                  </Card>
                ) : (
                  <div className="course-grid course-grid--profile">
                    {visible.map((def) => (
                      <FormsFormCard
                        key={def.key}
                        def={def}
                        tenantId={tenantId}
                        open={isOpen(def.key)}
                        institute={institute}
                        canFill={canFill(def)}
                        copied={copied}
                        pending={pending}
                        busyKey={busyKey}
                        onToggle={toggle}
                        onCopyLink={copyLink}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
