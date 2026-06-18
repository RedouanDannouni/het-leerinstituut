import Link from "next/link";
import { KpiCard } from "@/components/blocks/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { auditEvents, reportTemplates, tenants, users } from "@/lib/domain/seed-data";

export function AdminCockpit() {
  return (
    <div className="stack">
      <div className="grid grid-4">
        <KpiCard metric={{ label: "Omgevingen", value: String(tenants.length - 1), context: "Scholen actief of in setup", trend: "stable" }} />
        <KpiCard metric={{ label: "Gebruikers", value: String(users.length), context: "Over alle omgevingen", trend: "up" }} />
        <KpiCard metric={{ label: "Templates", value: String(reportTemplates.length), context: "Rapportage en observatie", trend: "stable" }} />
        <KpiCard metric={{ label: "Audit events", value: String(auditEvents.length), context: "Exports en goedkeuringen", trend: "up" }} />
      </div>
      <div className="grid grid-3">
        {[
          ["Scholen beheren", "/app/admin/schools", "Omgevingen aanmaken en status controleren."],
          ["Gebruikers & rechten", "/app/admin/users", "Uitnodigen, rollen toekennen en toegang bewaken."],
          ["Templates", "/app/admin/templates", "Formulieren en rapportblokken beheren."],
        ].map(([title, href, description]) => (
          <Card key={href}>
            <Badge tone="info">Admin</Badge>
            <h2 style={{ marginTop: "var(--space-3)" }}>{title}</h2>
            <p className="muted">{description}</p>
            <Link className="btn btn-secondary" href={href}>Openen</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
