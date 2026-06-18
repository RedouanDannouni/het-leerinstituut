"use client";

import { useMemo, useState } from "react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { getProjectTitle, getVisibleMaterials } from "@/lib/domain/selectors";
import type { LessonMaterial, MaterialType } from "@/lib/domain/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";

export default function MaterialsPage() {
  const { context } = useRequireSession();
  const [created, setCreated] = useState<LessonMaterial[]>([]);
  const [type, setType] = useState<MaterialType>("text");

  const visible = useMemo(() => (context ? [...created, ...getVisibleMaterials(context)] : []), [context, created]);
  if (!context) return null;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Lessen / lesmateriaal</p>
          <h1>Materiaal bekijken en toevoegen.</h1>
          <p className="muted">Tekst, video, audio en bestanden blijven gekoppeld aan de juiste school en projecten.</p>
        </div>
      </header>
      <div className="grid grid-2">
        <div className="stack">
          {visible.map((material) => (
            <Card key={material.id}>
              <div className="cluster" style={{ justifyContent: "space-between" }}>
                <Badge tone="info">{material.type}</Badge>
                <span className="muted">{getProjectTitle(material.projectId)}</span>
              </div>
              <h2 style={{ marginTop: "var(--space-3)" }}>{material.title}</h2>
              <p className="muted">{material.description}</p>
            </Card>
          ))}
        </div>
        {can(context.user.role, "edit:materials") ? (
          <form
            className="card stack"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              setCreated((items) => [
                {
                  id: `local-material-${Date.now()}`,
                  tenantId: context.user.tenantId,
                  ownerId: context.user.id,
                  projectId: String(form.get("projectId")),
                  title: String(form.get("title")),
                  description: String(form.get("description")),
                  type,
                  updatedAt: new Date().toISOString(),
                  sharedWithRole: ["docent", "school_opleider"],
                },
                ...items,
              ]);
              event.currentTarget.reset();
            }}
          >
            <h2>Nieuw materiaal</h2>
            <Field label="Titel">
              <Input name="title" required placeholder="Bijv. Exit-ticket rekenen" />
            </Field>
            <Field label="Type">
              <Select value={type} onChange={(event) => setType(event.target.value as MaterialType)}>
                <option value="text">Tekst</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="file">Bestand</option>
              </Select>
            </Field>
            <input type="hidden" name="projectId" value="p-noord-kwaliteit" />
            <Field label="Omschrijving">
              <Textarea name="description" required />
            </Field>
            <Button type="submit">Materiaal toevoegen</Button>
          </form>
        ) : (
          <Card>
            <h2>Alleen bekijken</h2>
            <p className="muted">Je rol mag materiaal bekijken, maar niet aanpassen.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
