import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/admin";
import { getFormDefinition } from "@/lib/forms/definitions";
import { QuestionnaireForm } from "@/components/forms/QuestionnaireForm";

export default async function AnonFeedbackPage({
  params,
}: {
  params: Promise<{ tenant: string; formKey: string }>;
}) {
  const { tenant, formKey } = await params;

  const def = getFormDefinition(formKey);
  if (!def || def.access !== "anon") notFound();

  const service = getServiceClient();
  if (!service) notFound();
  const { data: tenantRow } = await service.from("tenants").select("name").eq("id", tenant).single();
  if (!tenantRow) notFound();

  const { data: windowRow } = await service
    .from("form_windows")
    .select("status")
    .eq("tenant_id", tenant)
    .eq("form_key", formKey)
    .maybeSingle();
  const isOpen = windowRow?.status === "open";

  return (
    <main id="main" className="public-form-screen">
      <div className="public-form-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">{tenantRow.name}</p>
            <h1>{def.title}</h1>
            <p className="muted">{def.intro}</p>
          </div>
        </header>
        {isOpen ? (
          <QuestionnaireForm def={def} tenantId={tenant} autofill={{ schoolnaam: tenantRow.name }} />
        ) : (
          <div className="surface" style={{ padding: "var(--space-4)" }}>
            <h2>Deze vragenlijst is gesloten.</h2>
            <p className="muted">
              De vragenlijst is op dit moment niet beschikbaar. Neem contact op met je school als je denkt dat dit
              een vergissing is.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
