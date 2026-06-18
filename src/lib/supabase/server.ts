import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase-client voor servercode (RSC, route handlers, server actions).
 * Gebruikt de publishable/anon sleutel en de sessie-cookies, dus alle queries
 * respecteren RLS in de context van de ingelogde gebruiker.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll vanuit een Server Component kan worden genegeerd wanneer
            // er middleware is die de sessie ververst.
          }
        },
      },
    },
  );
}
