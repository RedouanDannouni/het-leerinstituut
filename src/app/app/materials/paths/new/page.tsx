"use client";

import { useEffect, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { createPath } from "@/lib/paths/store";
import { Card } from "@/components/ui/Card";

export default function NewPathPage() {
  const { context } = useRequireSession();
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (!context || started.current) return;
    if (!can(context.user.role, "edit:paths")) return;
    started.current = true;
    void createPath(context.user.tenantId, { title: "Naamloos leerpad" }).then((path) => {
      router.replace(`/app/materials/paths/${path.id}`);
    });
  }, [context, router]);

  if (!context) return null;
  if (!can(context.user.role, "edit:paths")) notFound();

  return (
    <div className="page page--wide">
      <Card>Nieuw leerpad aanmaken…</Card>
    </div>
  );
}
