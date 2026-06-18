import { NextResponse } from "next/server";
import { hashToken, verifyInviteToken } from "@/lib/invitations/token";
import { markInvitationAccepted } from "@/lib/invitations/store";
import { createInvitedUser } from "@/lib/supabase/auth-server";

export const runtime = "nodejs";

interface AcceptBody {
  token?: unknown;
  name?: unknown;
  password?: unknown;
}

export async function POST(request: Request) {
  let body: AcceptBody;
  try {
    body = (await request.json()) as AcceptBody;
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const fullName = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const verified = verifyInviteToken(token);
  if (!verified.ok) {
    const message =
      verified.reason === "expired" ? "Deze uitnodiging is verlopen." : "Ongeldige uitnodiging.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Wachtwoord moet minimaal 8 tekens zijn." }, { status: 400 });
  }

  // Maak het echte account aan in auth.users (profiel volgt via DB-trigger).
  const created = await createInvitedUser({
    email: verified.payload.email,
    password,
    fullName,
    role: verified.payload.role,
    tenantId: verified.payload.tenantId,
  });

  if (!created.ok) {
    if (created.code === "exists") {
      return NextResponse.json(
        { error: "Er bestaat al een account met dit e-mailadres. Log in of herstel je wachtwoord." },
        { status: 409 },
      );
    }
    if (created.code === "config") {
      return NextResponse.json(
        { error: "Supabase is nog niet geconfigureerd voor accountaanmaak." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: created.error }, { status: 502 });
  }

  // Markeer de uitnodiging als geaccepteerd (best-effort; faalt nooit de flow).
  await markInvitationAccepted(hashToken(token));

  return NextResponse.json({
    ok: true,
    email: verified.payload.email,
    confirmed: created.confirmed,
  });
}
