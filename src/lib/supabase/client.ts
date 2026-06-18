import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase-client voor de browser. Gebruikt de publieke publishable/anon
 * sleutel en respecteert RLS. Veilig om in client components te gebruiken.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
