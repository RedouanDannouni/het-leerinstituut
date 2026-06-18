"use client";

import { notFound } from "next/navigation";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { roleLabels } from "@/lib/domain/roles";
import { tenants, users } from "@/lib/domain/seed-data";
import { Badge } from "@/components/ui/Badge";

export default function AdminUsersPage() {
  const { context } = useRequireSession();
  if (!context) return null;
  if (!can(context.user.role, "view:admin")) notFound();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Beheer</p>
          <h1>Gebruikers & rechten.</h1>
          <p className="muted">Rollen zijn expliciet; toegang loopt via de schoolomgeving.</p>
        </div>
      </header>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Gebruiker</th><th>Rol</th><th>Omgeving</th><th>Status</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong><br /><span className="muted">{user.email}</span></td>
                <td><Badge tone="info">{roleLabels[user.role]}</Badge></td>
                <td>{tenants.find((tenant) => tenant.id === user.tenantId)?.name}</td>
                <td><Badge tone="success">actief</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
