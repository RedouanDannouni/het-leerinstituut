import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getServiceClient } from "@/lib/supabase/admin";
import { FORM_DEFINITIONS } from "@/lib/forms/definitions";
import { Card } from "@/components/ui/Card";

export default async function FeedbackLandingPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  const service = getServiceClient();
  if (!service) notFound();
  const { data: tenantRow } = await service.from("tenants").select("name").eq("id", tenant).single();
  if (!tenantRow) notFound();

  const { data: openWindows } = await service
    .from("form_windows")
    .select("form_key")
    .eq("tenant_id", tenant)
    .eq("status", "open");
  const openKeys = new Set((openWindows ?? []).map((row) => row.form_key));

  const anonForms = FORM_DEFINITIONS.filter((def) => def.access === "anon" && openKeys.has(def.key));

  return (
    <main id="main" className="public-form-screen">
      <div className="public-form-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">{tenantRow.name}</p>
            <h1>Vragenlijsten.</h1>
            <p className="muted">Kies de vragenlijst die je wilt invullen. Je hoeft niet in te loggen.</p>
          </div>
        </header>
        <div className="stack">
          {anonForms.length === 0 ? (
            <Card>
              <p className="muted" style={{ margin: 0 }}>
                Er staan op dit moment geen vragenlijsten open voor deze school.
              </p>
            </Card>
          ) : null}
          {anonForms.map((def) => (
            <Card key={def.key}>
              <div className="card-header">
                <div>
                  <h2>{def.title}</h2>
                  <p className="muted">{def.subtitle}</p>
                </div>
              </div>
              <Link className="btn btn-primary" href={`/feedback/${tenant}/${def.key}`}>
                Invullen <ArrowRight aria-hidden size={16} />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
