"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { auditEvents, users } from "@/lib/domain/seed-data";
import { readClientAuditEvents } from "@/lib/domain/audit";
import type { AuditEvent } from "@/lib/domain/types";

export default function AdminAuditPage() {
  const { context } = useRequireSession();
  const [clientEvents, setClientEvents] = useState<AuditEvent[]>([]);

  useEffect(() => setClientEvents(readClientAuditEvents()), []);
  if (!context) return null;
  if (!can(context.user.role, "view:admin")) notFound();

  const events = [...clientEvents, ...auditEvents];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Beheer</p>
          <h1>Auditlog.</h1>
          <p className="muted">Exports, goedkeuringen en wijzigingen zijn terug te zien.</p>
        </div>
      </header>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Tijd</th><th>Actor</th><th>Actie</th><th>Doel</th></tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.createdAt).toLocaleString("nl-NL")}</td>
                <td>{users.find((user) => user.id === event.actorId)?.name ?? event.actorId}</td>
                <td>{event.action}</td>
                <td>{event.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
