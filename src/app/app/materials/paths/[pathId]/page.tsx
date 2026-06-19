"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { PathWizard } from "@/components/paths/PathWizard";

export default function PathBuilderPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = use(params);
  const { context } = useRequireSession();

  if (!context) return null;
  if (!can(context.user.role, "edit:paths")) notFound();

  return (
    <div className="page page--wide">
      <PathWizard pathId={pathId} context={context} />
    </div>
  );
}
