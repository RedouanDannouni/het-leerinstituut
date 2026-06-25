"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getFormDefinition } from "./definitions";
import type { FormWindowRow } from "./window-summary";

export type SetWindowResult = { ok: true } | { ok: false; error: string };
export type WindowStatus = "open" | "gesloten";

type StoredWindow = {
  status: WindowStatus;
  opened_by: string;
  opened_at: string | null;
  closed_at: string | null;
  updated_at: string;
};

const LS_KEY = "hli.form-windows";

let cachedUseDb: boolean | null = null;

async function useDb(): Promise<boolean> {
  if (cachedUseDb !== null) return cachedUseDb;
  if (typeof window === "undefined") return false;
  try {
    const supabase = createSupabaseBrowserClient();
    const session = await Promise.race([
      supabase.auth.getSession().then((result) => result.data.session),
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 3000)),
    ]);
    cachedUseDb = Boolean(session?.user);
  } catch {
    cachedUseDb = false;
  }
  return cachedUseDb;
}

function lsRead(): Record<string, StoredWindow> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredWindow>) : {};
  } catch {
    return {};
  }
}

function lsWrite(map: Record<string, StoredWindow>) {
  window.localStorage.setItem(LS_KEY, JSON.stringify(map));
}

function windowKey(tenantId: string, formKey: string) {
  return `${tenantId}:${formKey}`;
}

export async function listFormWindowsForTenant(tenantId: string): Promise<Record<string, WindowStatus>> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("form_windows")
      .select("form_key, status")
      .eq("tenant_id", tenantId);
    const map: Record<string, WindowStatus> = {};
    for (const row of data ?? []) {
      map[row.form_key] = row.status === "open" ? "open" : "gesloten";
    }
    return map;
  }

  const stored = lsRead();
  const map: Record<string, WindowStatus> = {};
  const prefix = `${tenantId}:`;
  for (const [key, value] of Object.entries(stored)) {
    if (!key.startsWith(prefix)) continue;
    map[key.slice(prefix.length)] = value.status;
  }
  return map;
}

export async function listFormWindows(tenantIds: string[]): Promise<FormWindowRow[]> {
  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("form_windows")
      .select("tenant_id, form_key, status")
      .in("tenant_id", tenantIds);
    return data ?? [];
  }

  const stored = lsRead();
  const rows: FormWindowRow[] = [];
  for (const [key, value] of Object.entries(stored)) {
    const separator = key.indexOf(":");
    if (separator < 0) continue;
    const tenantId = key.slice(0, separator);
    if (!tenantIds.includes(tenantId)) continue;
    rows.push({
      tenant_id: tenantId,
      form_key: key.slice(separator + 1),
      status: value.status,
    });
  }
  return rows;
}

export async function isFormWindowOpen(tenantId: string, formKey: string): Promise<boolean> {
  const windows = await listFormWindowsForTenant(tenantId);
  return (windows[formKey] ?? "gesloten") === "open";
}

export async function setFormWindowStatus(params: {
  tenantId: string;
  formKey: string;
  open: boolean;
  userId: string;
}): Promise<SetWindowResult> {
  const def = getFormDefinition(params.formKey);
  if (!def) return { ok: false, error: "Onbekend formulier." };

  const now = new Date().toISOString();

  if (await useDb()) {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Je sessie is verlopen. Log opnieuw in." };

    const row = {
      tenant_id: params.tenantId,
      form_key: params.formKey,
      status: params.open ? "open" : "gesloten",
      opened_by: user.id,
      opened_at: params.open ? now : null,
      closed_at: params.open ? null : now,
      updated_at: now,
    };

    const { error } = await supabase
      .from("form_windows")
      .upsert(row, { onConflict: "tenant_id,form_key" });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const stored = lsRead();
  stored[windowKey(params.tenantId, params.formKey)] = {
    status: params.open ? "open" : "gesloten",
    opened_by: params.userId,
    opened_at: params.open ? now : null,
    closed_at: params.open ? null : now,
    updated_at: now,
  };
  lsWrite(stored);
  return { ok: true };
}
