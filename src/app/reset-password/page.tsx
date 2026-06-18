import { ResetPasswordForm } from "@/components/auth/PasswordResetForms";

export default function ResetPasswordPage() {
  return (
    <main id="main" className="page">
      <section className="stack" style={{ maxWidth: 560, margin: "8vh auto" }}>
        <p className="eyebrow">Toegang herstellen</p>
        <h1>Kies een nieuw wachtwoord.</h1>
        <p className="muted">Gebruik minimaal acht tekens. In productie komt hier beleid voor MFA en sessiebeheer bij.</p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
