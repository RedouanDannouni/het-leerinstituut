"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFormDefinition } from "./definitions";

export type SetWindowResult = { ok: true } | { ok: false; error: string };

/**
 * Opent of sluit één Kwaliteitsmonitor-formulier voor één school.
 * Alleen instituutsstaf (admin/planner/coach) mag dit; de RLS-policy
 * `manage form_windows` dwingt dit ook in de database af.
 */
export async function setFormWindowStatus(params: {
  tenantId: string;
  formKey: string;
  open: boolean;
}): Promise<SetWindowResult> {
  const def = getFormDefinition(params.formKey);
  if (!def) return { ok: false, error: "Onbekend formulier." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Je sessie is verlopen. Log opnieuw in." };

  const now = new Date().toISOString();
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

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
