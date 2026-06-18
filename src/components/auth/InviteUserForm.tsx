"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { roleLabels } from "@/lib/domain/roles";
import type { Role, Tenant, TenantId } from "@/lib/domain/types";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export function InviteUserForm({
  tenants,
  defaultTenantId,
  inviterName,
  onSent,
}: {
  tenants: Tenant[];
  defaultTenantId: TenantId;
  inviterName?: string;
  onSent?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("docent");
  const [tenantId, setTenantId] = useState<TenantId>(defaultTenantId);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, tenantId, inviterName }),
      });
      const data = (await response.json()) as { ok?: boolean; email?: string; error?: string };
      if (!response.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? "Versturen mislukt." });
        return;
      }
      setStatus({ kind: "sent", email: data.email ?? email });
      setEmail("");
      onSent?.();
    } catch (cause) {
      setStatus({ kind: "error", message: (cause as Error).message });
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <div>
        <span className="badge badge-info">Uitnodigen</span>
        <h2 style={{ margin: "12px 0 0 0" }}>Nieuwe gebruiker uitnodigen</h2>
        <p className="muted" style={{ margin: "4px 0 0 0" }}>
          Er gaat een e-mail met een persoonlijke uitnodigingslink naar het opgegeven adres.
        </p>
      </div>
      <Field label="E-mailadres">
        <Input
          required
          type="email"
          value={email}
          placeholder="naam@school.nl"
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <div className="grid grid-2">
        <Field label="Rol">
          <Select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            {(Object.keys(roleLabels) as Role[]).map((value) => (
              <option key={value} value={value}>
                {roleLabels[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Schoolomgeving">
          <Select value={tenantId} onChange={(event) => setTenantId(event.target.value as TenantId)}>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Button type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Versturen…" : "Uitnodiging versturen"}
      </Button>
      {status.kind === "sent" ? (
        <p className="help-text" aria-live="polite">
          Uitnodiging verstuurd naar <strong>{status.email}</strong>.
        </p>
      ) : null}
      {status.kind === "error" ? (
        <p className="error-text" aria-live="polite">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
