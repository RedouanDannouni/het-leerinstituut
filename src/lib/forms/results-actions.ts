"use server";

import { can } from "@/lib/domain/permissions";
import { isInstituteStaff } from "@/lib/domain/roles";
import type { Role } from "@/lib/domain/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formsForInstrument } from "./definitions";
import { computeFormResult, type FormResult } from "./results";
import { buildResultsDashboard, type ResultsDashboard, type ResultsFilters } from "./results-dashboard";
import { INSTRUMENTS } from "./types";

const ROW_LIMIT = 1000;

type FormRow = Record<string, string | number | null>;

export type FetchFormResultsResult =
  | { ok: true; results: Record<string, FormResult> }
  | { ok: false; error: string };

export type FetchResultsDashboardResult =
  | { ok: true; dashboard: ResultsDashboard }
  | { ok: false; error: string };

interface TenantAccess {
  ok: true;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}

async function authorizeTenant(tenantId: string): Promise<TenantAccess | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Je sessie is verlopen. Log opnieuw in." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.tenant_id) {
    return { ok: false, error: "Geen profiel gevonden voor dit account." };
  }

  const role = (profile.role === "school_opleider" ? "coach" : profile.role) as Role;
  if (!can(role, "view:forms")) return { ok: false, error: "Geen toegang tot vragenlijsten." };
  if (!isInstituteStaff(role) && profile.tenant_id !== tenantId) {
    return { ok: false, error: "Je hebt geen toegang tot deze schoolomgeving." };
  }

  return { ok: true, supabase };
}

/**
 * Haalt geaggregeerde resultaten op voor alle vragenlijsten van één school.
 * Gebruikt de server-client (sessie-cookies) zodat RLS correct wordt toegepast.
 */
export async function fetchFormResults(tenantId: string): Promise<FetchFormResultsResult> {
  const access = await authorizeTenant(tenantId);
  if (!access.ok) return access;
  const { supabase } = access;

  const allDefs = INSTRUMENTS.flatMap((instrument) => formsForInstrument(instrument.key));
  const entries = await Promise.all(
    allDefs.map(async (def) => {
      const { data, error } = await supabase.from(def.table).select("*").eq("tenant_id", tenantId).limit(ROW_LIMIT);
      if (error) return [def.key, { error: error.message }] as const;
      return [def.key, computeFormResult(def, (data as Record<string, number | null>[]) ?? [])] as const;
    }),
  );

  const failed = entries.find((entry) => "error" in entry[1]);
  if (failed && "error" in failed[1]) {
    return { ok: false, error: failed[1].error };
  }

  return {
    ok: true,
    results: Object.fromEntries(entries) as Record<string, FormResult>,
  };
}

/**
 * Haalt de volledige resultaten-analyse op voor één school en aggregeert die server-side.
 * Alleen geaggregeerde statistiek verlaat de server; ruwe inzendingen blijven achter.
 */
export async function fetchResultsDashboard(
  tenantId: string,
  filters: ResultsFilters = {},
): Promise<FetchResultsDashboardResult> {
  const access = await authorizeTenant(tenantId);
  if (!access.ok) return access;
  const { supabase } = access;

  const allDefs = INSTRUMENTS.flatMap((instrument) => formsForInstrument(instrument.key));
  const entries = await Promise.all(
    allDefs.map(async (def) => {
      const { data, error } = await supabase.from(def.table).select("*").eq("tenant_id", tenantId).limit(ROW_LIMIT);
      if (error) return { ok: false as const, key: def.key, error: error.message };
      return { ok: true as const, key: def.key, rows: (data as FormRow[]) ?? [] };
    }),
  );

  const rowsByForm: Record<string, FormRow[]> = {};
  let truncated = false;
  for (const entry of entries) {
    if (!entry.ok) return { ok: false, error: entry.error };
    rowsByForm[entry.key] = entry.rows;
    if (entry.rows.length >= ROW_LIMIT) truncated = true;
  }

  return { ok: true, dashboard: buildResultsDashboard(rowsByForm, filters, truncated) };
}
