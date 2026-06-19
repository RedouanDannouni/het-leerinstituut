"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/admin";
import { getFormDefinition } from "./definitions";
import { allAnalyseColumns, allRatingColumns, type FormDefinition } from "./types";

export interface FormSubmissionValues {
  meta: Record<string, string>;
  ratings: Record<string, number>;
  analyses: Record<string, string>;
  generalNote?: string;
}

export type SubmitResult = { ok: true; id: string } | { ok: false; error: string };

const NUMBER_META = new Set(["leeftijd", "jaren_onderwijs"]);

type BuildResult = { row: Record<string, unknown> } | { error: string };

function buildRow(def: FormDefinition, values: FormSubmissionValues): BuildResult {
  const row: Record<string, unknown> = {};

  // Meta-velden (alleen bekende kolommen).
  for (const field of def.meta) {
    const raw = (values.meta?.[field.column] ?? "").trim();
    if (!raw) {
      if (field.required) return { error: `Veld "${field.label}" is verplicht.` };
      row[field.column] = null;
      continue;
    }
    if (field.input === "number" || NUMBER_META.has(field.column)) {
      const num = Number.parseInt(raw, 10);
      row[field.column] = Number.isFinite(num) ? num : null;
    } else {
      row[field.column] = raw;
    }
  }

  // Algemene notitie (bijv. empirische_observatie).
  if (def.generalNote) {
    const note = (values.generalNote ?? "").trim();
    row[def.generalNote.column] = note || null;
  }

  // Beoordelingsvragen — moeten compleet en binnen 1-4 zijn.
  for (const column of allRatingColumns(def)) {
    const score = values.ratings?.[column];
    if (score === undefined || score === null) {
      return { error: "Niet alle vragen zijn beantwoord." };
    }
    if (![1, 2, 3, 4].includes(score)) {
      return { error: "Ongeldige score gevonden (alleen 1 t/m 4)." };
    }
    row[column] = score;
  }

  // Open analyse-velden per bouwsteen (alleen lesobservatie coaches).
  for (const column of allAnalyseColumns(def)) {
    const text = (values.analyses?.[column] ?? "").trim();
    row[column] = text || null;
  }

  return { row };
}

export async function submitKwaliteitsmonitorForm(params: {
  formKey: string;
  tenantId?: string;
  values: FormSubmissionValues;
}): Promise<SubmitResult> {
  const def = getFormDefinition(params.formKey);
  if (!def) return { ok: false, error: "Onbekend formulier." };

  const built = buildRow(def, params.values);
  if ("error" in built) return { ok: false, error: built.error };
  const { row } = built;

  if (def.access === "anon") {
    const tenantId = params.tenantId;
    if (!tenantId) return { ok: false, error: "Geen schoolomgeving meegegeven." };

    const service = getServiceClient();
    if (!service) return { ok: false, error: "Serverconfiguratie ontbreekt." };

    const { data: tenant } = await service.from("tenants").select("id, name").eq("id", tenantId).single();
    if (!tenant) return { ok: false, error: "Onbekende schoolomgeving." };

    row.tenant_id = tenantId;
    row.created_by = null;
    if ("schoolnaam" in row && !row.schoolnaam) row.schoolnaam = tenant.name;

    const { data, error } = await service.from(def.table).insert(row).select("id").single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: (data as { id: string }).id };
  }

  // Ingelogde formulieren: via de RLS-server-client, gebonden aan de gebruiker.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Je sessie is verlopen. Log opnieuw in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  row.created_by = user.id;
  row.tenant_id = profile?.tenant_id ?? null;

  const { data, error } = await supabase.from(def.table).insert(row).select("id").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as { id: string }).id };
}
