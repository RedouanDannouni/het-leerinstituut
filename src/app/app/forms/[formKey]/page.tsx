"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { getFormDefinition } from "@/lib/forms/definitions";
import { QuestionnaireForm } from "@/components/forms/QuestionnaireForm";

export default function FormFillPage({ params }: { params: Promise<{ formKey: string }> }) {
  const { formKey } = use(params);
  const { context } = useRequireSession();
  if (!context) return null;
  if (!can(context.user.role, "view:forms")) notFound();

  const def = getFormDefinition(formKey);
  if (!def || def.access !== "auth") notFound();
  if (def.allowedRoles && !def.allowedRoles.includes(context.user.role)) notFound();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Kwaliteitsmonitor</p>
          <h1>{def.title}</h1>
          <p className="muted">{def.intro}</p>
        </div>
        <Link className="btn btn-ghost" href="/app/forms">
          <ArrowLeft aria-hidden size={16} /> Terug
        </Link>
      </header>
      <QuestionnaireForm
        def={def}
        autofill={{
          email: context.user.email,
          naam: context.user.name,
          schoolnaam: context.tenant.name,
        }}
        doneHref="/app/forms"
      />
    </div>
  );
}
