"use client";

import { notFound } from "next/navigation";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { tenants } from "@/lib/domain/seed-data";
import { Badge, statusTone } from "@/components/ui/Badge";

export default function AdminSchoolsPage() {
  const { context } = useRequireSession();
  if (!context) return null;
  if (!can(context.user.role, "view:admin")) notFound();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Beheer</p>
          <h1>Scholen / omgevingen.</h1>
        </div>
      </header>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Naam</th><th>Regio</th><th>Status</th><th>Leerlingen</th></tr>
          </thead>
          <tbody>
            {tenants.filter((tenant) => tenant.id !== "instituut").map((tenant) => (
              <tr key={tenant.id}>
                <td><strong>{tenant.name}</strong></td>
                <td>{tenant.region}</td>
                <td><Badge tone={statusTone(tenant.status)}>{tenant.status}</Badge></td>
                <td>{tenant.learnerCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
