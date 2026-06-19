import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Auth-callback voor links uit Supabase-mails (wachtwoordherstel, e-mailbevestiging).
 * De link bevat een PKCE-`code` die we hier inwisselen voor een sessie. Daarna
 * sturen we de gebruiker door naar `next` (bijv. /reset-password). Bij een
 * verlopen of ongeldige link belandt de gebruiker terug bij /forgot-password.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Alleen interne, relatieve paden toestaan als bestemming.
  const nextParam = searchParams.get("next") ?? "/reset-password";
  const next = nextParam.startsWith("/") ? nextParam : "/reset-password";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/forgot-password?error=expired`);
}
