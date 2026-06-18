"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { invitations, tenants } from "@/lib/domain/seed-data";
import { roleLabels } from "@/lib/domain/roles";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";

export function InviteAcceptForm({ token }: { token: string }) {
  const router = useRouter();
  const invite = invitations.find((item) => item.token === token);
  const [accepted, setAccepted] = useState(false);

  if (!invite) {
    return (
      <div className="card stack">
        <h2>Uitnodiging niet gevonden</h2>
        <p className="muted">Controleer de link of vraag een nieuwe uitnodiging aan.</p>
      </div>
    );
  }

  const tenant = tenants.find((item) => item.id === invite.tenantId);

  return (
    <form
      className="card stack"
      onSubmit={(event) => {
        event.preventDefault();
        setAccepted(true);
        window.setTimeout(() => router.push("/login"), 700);
      }}
    >
      <span className="badge badge-info">Uitnodiging</span>
      <h2>{tenant?.name}</h2>
      <p className="muted">
        Je wordt toegevoegd als <strong>{roleLabels[invite.role]}</strong>. Je ziet straks alleen gegevens binnen deze schoolomgeving.
      </p>
      <Field label="E-mailadres">
        <Input value={invite.email} readOnly />
      </Field>
      <Field label="Naam">
        <Input required placeholder="Vul je naam in" />
      </Field>
      <Field label="Wachtwoord">
        <Input required type="password" minLength={8} placeholder="Minimaal 8 tekens" />
      </Field>
      <Button type="submit">Uitnodiging accepteren</Button>
      {accepted ? <p className="help-text" aria-live="polite">Account aangemaakt. Je gaat naar inloggen…</p> : null}
    </form>
  );
}
