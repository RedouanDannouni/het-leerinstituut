"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { roleLabels } from "@/lib/domain/roles";
import { tenants, users } from "@/lib/domain/seed-data";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Form";

export function LoginForm() {
  const { login } = useSession();
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");

  return (
    <form
      className="card stack"
      onSubmit={(event) => {
        event.preventDefault();
        login(selectedUserId);
      }}
    >
      <Field label="Demo-gebruiker" help="Kies een rol om tenant-isolatie en cockpitverschillen te zien.">
        <Select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
          {users.map((user) => {
            const tenant = tenants.find((item) => item.id === user.tenantId);
            return (
              <option key={user.id} value={user.id}>
                {user.name} · {roleLabels[user.role]} · {tenant?.name}
              </option>
            );
          })}
        </Select>
      </Field>
      <Button type="submit">
        <LogIn aria-hidden size={18} /> Inloggen
      </Button>
      <p className="help-text" aria-live="polite">
        Wachtwoorden zijn in deze demo vervangen door rolkeuze; het datamodel houdt wel rekening met rollen en scholen.
      </p>
    </form>
  );
}
