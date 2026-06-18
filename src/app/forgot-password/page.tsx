import { ForgotPasswordForm } from "@/components/auth/PasswordResetForms";

export default function ForgotPasswordPage() {
  return (
    <main id="main" className="page">
      <section className="stack" style={{ maxWidth: 560, margin: "8vh auto" }}>
        <p className="eyebrow">Toegang herstellen</p>
        <h1>Wachtwoord vergeten?</h1>
        <p className="muted">We sturen een veilige herstellink als het e-mailadres bekend is.</p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
