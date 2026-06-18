"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { roleLabels } from "@/lib/domain/roles";
import type { Role, TenantId } from "@/lib/domain/types";

interface InvitationRow {
  id: string;
  email: string;
  role: Role;
  status: "pending" | "accepted" | "revoked" | "expired";
  invited_by_name: string | null;
  created_at: string;
  expires_at: string;
}

const statusTone: Record<InvitationRow["status"], "info" | "success" | "warning" | "danger"> = {
  pending: "info",
  accepted: "success",
  revoked: "danger",
  expired: "warning",
};

const statusLabel: Record<InvitationRow["status"], string> = {
  pending: "openstaand",
  accepted: "geaccepteerd",
  revoked: "ingetrokken",
  expired: "verlopen",
};

export function PendingInvitationsList({
  tenantId,
  refreshKey,
}: {
  tenantId: TenantId;
  refreshKey: number;
}) {
  const [rows, setRows] = useState<InvitationRow[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/invitations?tenantId=${encodeURIComponent(tenantId)}`);
      const data = (await response.json()) as { configured?: boolean; invitations?: InvitationRow[] };
      setConfigured(data.configured !== false);
      setRows(data.invitations ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (!configured) {
    return (
      <div className="card stack">
        <h2 style={{ margin: 0 }}>Uitnodigingen</h2>
        <p className="muted" style={{ margin: 0 }}>
          Supabase is nog niet gekoppeld (service-role sleutel ontbreekt). Uitnodigingen worden
          wel verstuurd, maar nog niet opgeslagen.
        </p>
      </div>
    );
  }

  return (
    <div className="card stack">
      <h2 style={{ margin: 0 }}>Uitnodigingen</h2>
      {loading && rows.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>Laden…</p>
      ) : rows.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>Nog geen uitnodigingen voor deze omgeving.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>E-mail</th><th>Rol</th><th>Status</th><th>Verstuurd</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.email}</td>
                  <td>{roleLabels[row.role]}</td>
                  <td><Badge tone={statusTone[row.status]}>{statusLabel[row.status]}</Badge></td>
                  <td>{new Date(row.created_at).toLocaleDateString("nl-NL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
