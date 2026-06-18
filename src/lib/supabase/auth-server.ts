import { createClient } from "@supabase/supabase-js";
import { getServiceClient } from "@/lib/supabase/admin";
import type { Role, TenantId } from "@/lib/domain/types";

export interface CreateInvitedUserInput {
  email: string;
  password: string;
  fullName?: string;
  role: Role;
  tenantId: TenantId;
}

export type CreateUserResult =
  | { ok: true; userId: string; confirmed: boolean }
  | { ok: false; code: "exists" | "config" | "auth_error"; error: string };

function userMetadata(input: CreateInvitedUserInput) {
  return {
    full_name: input.fullName ?? "",
    role: input.role,
    tenant_id: input.tenantId,
  };
}

/**
 * Maakt een echte gebruiker aan in `auth.users`. De `handle_new_user`-trigger
 * maakt het bijbehorende profiel automatisch aan op basis van de metadata.
 *
 * - Met service-role sleutel: `admin.createUser` met direct bevestigd e-mailadres
 *   (de uitnodiging zelf is de verificatie).
 * - Zonder service-role sleutel: terugval op `signUp` met de publieke sleutel,
 *   zodat de gebruiker alsnog in `auth.users` belandt.
 */
export async function createInvitedUser(input: CreateInvitedUserInput): Promise<CreateUserResult> {
  const service = getServiceClient();

  if (service) {
    const { data, error } = await service.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: userMetadata(input),
    });
    if (error) {
      const exists = /already|exist|registered/i.test(error.message);
      return { ok: false, code: exists ? "exists" : "auth_error", error: error.message };
    }
    return { ok: true, userId: data.user.id, confirmed: true };
  }

  // Terugval zonder service-role: signUp met de publieke sleutel.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { ok: false, code: "config", error: "Supabase is niet geconfigureerd." };
  }

  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: userMetadata(input) },
  });
  if (error) {
    const exists = /already|exist|registered/i.test(error.message);
    return { ok: false, code: exists ? "exists" : "auth_error", error: error.message };
  }
  if (!data.user) {
    return { ok: false, code: "auth_error", error: "Geen gebruiker aangemaakt." };
  }
  return { ok: true, userId: data.user.id, confirmed: Boolean(data.session) };
}
