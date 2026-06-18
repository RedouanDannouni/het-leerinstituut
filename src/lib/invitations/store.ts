import { getServiceClient } from "@/lib/supabase/admin";
import type { Role, TenantId } from "@/lib/domain/types";

export interface InvitationRecord {
  id: string;
  email: string;
  role: Role;
  tenant_id: TenantId;
  status: "pending" | "accepted" | "revoked" | "expired";
  invited_by_name: string | null;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export interface RecordInvitationInput {
  email: string;
  role: Role;
  tenantId: TenantId;
  tokenHash: string;
  invitedByName?: string;
  expiresAt: Date;
}

/**
 * Slaat een uitnodiging op in Supabase. Geeft `null` terug als Supabase nog
 * niet is geconfigureerd (dan blijft de mailflow gewoon werken zonder opslag).
 */
export async function recordInvitation(
  input: RecordInvitationInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string } | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      email: input.email,
      role: input.role,
      tenant_id: input.tenantId,
      token_hash: input.tokenHash,
      invited_by_name: input.invitedByName ?? null,
      expires_at: input.expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id as string };
}

/** Verwijdert een uitnodigingsrij (bijv. als de mail niet verstuurd kon worden). */
export async function deleteInvitation(id: string): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase) return;
  await supabase.from("invitations").delete().eq("id", id);
}

/**
 * Markeert een uitnodiging als geaccepteerd op basis van de token-hash.
 * Retourneert de status van de operatie.
 */
export async function markInvitationAccepted(
  tokenHash: string,
): Promise<{ ok: true } | { ok: false; reason: "not_found" | "already_used" | "db_error" } | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("invitations")
    .select("id, status")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) return { ok: false, reason: "db_error" };
  if (!data) return { ok: false, reason: "not_found" };
  if (data.status !== "pending") return { ok: false, reason: "already_used" };

  const { error: updateError } = await supabase
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", data.id);

  if (updateError) return { ok: false, reason: "db_error" };
  return { ok: true };
}

/** Haalt openstaande uitnodigingen op voor een schoolomgeving. */
export async function listPendingInvitations(
  tenantId?: TenantId,
): Promise<InvitationRecord[] | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  let query = supabase
    .from("invitations")
    .select("id, email, role, tenant_id, status, invited_by_name, created_at, expires_at, accepted_at")
    .order("created_at", { ascending: false });

  if (tenantId) query = query.eq("tenant_id", tenantId);

  const { data, error } = await query;
  if (error) return null;
  return (data ?? []) as InvitationRecord[];
}
