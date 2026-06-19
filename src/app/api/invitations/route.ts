import { NextResponse } from "next/server";
import { createInviteToken, hashToken, INVITE_TTL_SECONDS } from "@/lib/invitations/token";
import { deleteInvitation, listPendingInvitations, recordInvitation } from "@/lib/invitations/store";
import { renderInvitationEmail } from "@/lib/email/invitation-email";
import { sendEmail } from "@/lib/email/resend";
import { roleLabels } from "@/lib/domain/roles";
import { tenants } from "@/lib/domain/seed-data";
import type { Role, TenantId } from "@/lib/domain/types";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES: Role[] = ["coach", "school_leider", "docent", "admin", "planner"];

export async function GET(request: Request) {
  const tenantId = new URL(request.url).searchParams.get("tenantId") as TenantId | null;
  const invitations = await listPendingInvitations(tenantId ?? undefined);
  if (invitations === null) {
    // Supabase nog niet geconfigureerd: lege lijst, geen fout.
    return NextResponse.json({ configured: false, invitations: [] });
  }
  return NextResponse.json({ configured: true, invitations });
}

interface InviteBody {
  email?: unknown;
  role?: unknown;
  tenantId?: unknown;
  inviterName?: unknown;
}

function resolveBaseUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const origin = request.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function POST(request: Request) {
  let body: InviteBody;
  try {
    body = (await request.json()) as InviteBody;
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body.role as Role;
  const tenantId = body.tenantId as TenantId;
  const inviterName =
    typeof body.inviterName === "string" && body.inviterName.trim().length > 0
      ? body.inviterName.trim()
      : undefined;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Geef een geldig e-mailadres op." }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Onbekende rol." }, { status: 400 });
  }
  const tenant = tenants.find((item) => item.id === tenantId);
  if (!tenant) {
    return NextResponse.json({ error: "Onbekende schoolomgeving." }, { status: 400 });
  }

  const token = createInviteToken({ email, role, tenantId });
  const acceptUrl = `${resolveBaseUrl(request)}/invite/${token}`;
  const expiresAt = new Date(Date.now() + INVITE_TTL_SECONDS * 1000);

  // Eerst (indien geconfigureerd) opslaan in Supabase, zodat we de uitnodiging
  // kunnen volgen en intrekken. Mislukt het opslaan, dan sturen we geen mail.
  const stored = await recordInvitation({
    email,
    role,
    tenantId,
    tokenHash: hashToken(token),
    invitedByName: inviterName,
    expiresAt,
  });

  if (stored && !stored.ok) {
    return NextResponse.json({ error: `Opslaan mislukt: ${stored.error}` }, { status: 502 });
  }

  const { subject, html, text } = renderInvitationEmail({
    recipientEmail: email,
    tenantName: tenant.name,
    roleLabel: roleLabels[role],
    acceptUrl,
    inviterName,
  });

  const result = await sendEmail({ to: email, subject, html, text });

  if (!result.ok) {
    // Mail kon niet verstuurd worden: ruim de opgeslagen rij weer op.
    if (stored && stored.ok) await deleteInvitation(stored.id);
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    id: result.id,
    email,
    persisted: Boolean(stored && stored.ok),
  });
}
