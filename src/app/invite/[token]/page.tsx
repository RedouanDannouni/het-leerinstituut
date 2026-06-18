import { InviteAcceptForm, type InviteView } from "@/components/auth/InviteAcceptForm";
import { OnboardingCarousel } from "@/components/auth/OnboardingCarousel";
import { verifyInviteToken } from "@/lib/invitations/token";
import { roleLabels } from "@/lib/domain/roles";
import { invitations, tenants } from "@/lib/domain/seed-data";

function resolveInvite(token: string): InviteView | null {
  const verified = verifyInviteToken(token);
  if (verified.ok) {
    const tenant = tenants.find((item) => item.id === verified.payload.tenantId);
    return {
      email: verified.payload.email,
      roleLabel: roleLabels[verified.payload.role],
      tenantName: tenant?.name ?? "je schoolomgeving",
    };
  }

  // Terugvaloptie voor de oude demo-uitnodiging uit de seed-data.
  const legacy = invitations.find((item) => item.token === token);
  if (legacy) {
    const tenant = tenants.find((item) => item.id === legacy.tenantId);
    return {
      email: legacy.email,
      roleLabel: roleLabels[legacy.role],
      tenantName: tenant?.name ?? "je schoolomgeving",
    };
  }

  return null;
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = resolveInvite(token);

  return (
    <main id="main" className="auth-screen">
      <div className="auth-shell auth-shell--invite">
        <section className="auth-main">
          <InviteAcceptForm invite={invite} token={token} />
        </section>

        <OnboardingCarousel />
      </div>
    </main>
  );
}
