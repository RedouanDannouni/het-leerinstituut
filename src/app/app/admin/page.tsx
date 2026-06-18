"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { Card } from "@/components/ui/Card";

export default function AdminPage() {
  const { context } = useRequireSession();
  if (!context) return null;
  if (!can(context.user.role, "view:admin")) notFound();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Beheer</p>
          <h1>Omgevingen, gebruikers en templates.</h1>
          <p className="muted">Admin-acties blijven auditeerbaar en tenant-bewust.</p>
        </div>
      </header>
      <div className="grid grid-4">
        {[
          ["Scholen", "/app/admin/schools"],
          ["Gebruikers", "/app/admin/users"],
          ["Templates", "/app/admin/templates"],
          ["Auditlog", "/app/admin/audit-log"],
        ].map(([title, href]) => (
          <Card key={href}>
            <h2>{title}</h2>
            <Link className="btn btn-secondary" href={href}>Open {title}</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
