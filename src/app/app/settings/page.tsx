"use client";

import { useRequireSession } from "@/lib/auth/session";
import { roleLabels } from "@/lib/domain/roles";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Form";

export default function SettingsPage() {
  const { context } = useRequireSession();
  if (!context) return null;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Instellingen & profiel</p>
          <h1>Persoonlijke voorkeuren.</h1>
          <p className="muted">Organisatie-instellingen verschijnen alleen voor rollen met rechten.</p>
        </div>
      </header>
      <div className="grid grid-2">
        <Card>
          <h2>Profiel</h2>
          <div className="stack">
            <Field label="Naam"><Input value={context.user.name} readOnly /></Field>
            <Field label="E-mail"><Input value={context.user.email} readOnly /></Field>
            <Field label="Rol"><Input value={roleLabels[context.user.role]} readOnly /></Field>
          </div>
        </Card>
        <Card>
          <h2>Notificaties</h2>
          <div className="stack">
            <Field label="Observatieherinneringen">
              <Select defaultValue="daily">
                <option value="daily">Dagelijks overzicht</option>
                <option value="weekly">Wekelijks</option>
                <option value="off">Uit</option>
              </Select>
            </Field>
            <Field label="Rapportupdates">
              <Select defaultValue="important">
                <option value="important">Alleen belangrijke updates</option>
                <option value="all">Alle updates</option>
                <option value="off">Uit</option>
              </Select>
            </Field>
            <Button type="button">Voorkeuren opslaan</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
