import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client met de service-role sleutel. Omzeilt RLS en is
 * uitsluitend bedoeld voor vertrouwde servercode (API routes / server actions).
 *
 * Geef NOOIT de service-role sleutel door aan de browser. Deze functie geeft
 * `null` terug als de omgeving niet is geconfigureerd, zodat aanroepers daar
 * netjes op kunnen terugvallen.
 */
export function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
