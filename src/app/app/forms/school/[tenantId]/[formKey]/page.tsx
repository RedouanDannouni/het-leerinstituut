"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { isInstituteStaff } from "@/lib/domain/roles";
import { tenants } from "@/lib/domain/seed-data";
import { getFormDefinition } from "@/lib/forms/definitions";
import { isFormWindowOpen } from "@/lib/forms/window-store";
import { QuestionnaireForm } from "@/components/forms/QuestionnaireForm";
import { Card } from "@/components/ui/Card";

export default function SchoolFormFillPage({
  params,
}: {
  params: Promise<{ tenantId: string; formKey: string }>;
}) {
  const { tenantId, formKey } = use(params);
  const { context } = useRequireSession();
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const isOpen = await isFormWindowOpen(tenantId, formKey);
      if (active) setOpen(isOpen);
    }
    void load();
    return () => {
      active = false;
    };
  }, [tenantId, formKey]);

  if (!context) return null;
  const role = context.user.role;
  if (!can(role, "view:forms")) notFound();

  const def = getFormDefinition(formKey);
  if (!def || def.access !== "auth") notFound();
  if (def.allowedRoles && !def.allowedRoles.includes(role)) notFound();

  const institute = isInstituteStaff(role);
  if (!institute && context.user.tenantId !== tenantId) notFound();

  const tenant = tenants.find((item) => item.id === tenantId);
  if (!tenant) notFound();

  const backHref = `/app/forms/school/${tenantId}`;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Kwaliteitsmonitor · {tenant.name}</p>
          <h1>{def.title}</h1>
          <p className="muted">{def.intro}</p>
        </div>
        <Link className="btn btn-ghost" href={backHref}>
          <ArrowLeft aria-hidden size={16} /> Terug
        </Link>
      </header>

      {open === false ? (
        <Card>
          <p className="help-text" style={{ margin: 0 }}>
            Dit formulier is op dit moment gesloten voor {tenant.name}. Vraag het Leerinstituut om het open te
            zetten.
          </p>
        </Card>
      ) : (
        <QuestionnaireForm
          def={def}
          tenantId={tenantId}
          autofill={{
            email: context.user.email,
            naam: context.user.name,
            schoolnaam: tenant.name,
          }}
          doneHref={backHref}
        />
      )}
    </div>
  );
}
