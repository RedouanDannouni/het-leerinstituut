import { InviteAcceptForm } from "@/components/auth/InviteAcceptForm";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main id="main" className="page">
      <div className="grid grid-2" style={{ alignItems: "center", minHeight: "80vh" }}>
        <section className="stack">
          <p className="eyebrow">Uitnodiging</p>
          <h1>Activeer je toegang.</h1>
          <p className="muted">Controleer je rol en schoolomgeving voordat je de uitnodiging accepteert.</p>
        </section>
        <InviteAcceptForm token={token} />
      </div>
    </main>
  );
}
