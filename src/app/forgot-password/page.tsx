import { AuthAsidePanel } from "@/components/auth/AuthAsidePanel";
import { AuthForgotArt } from "@/components/auth/AuthForgotArt";
import { ForgotPasswordForm } from "@/components/auth/PasswordResetForms";

export default function ForgotPasswordPage() {
  return (
    <main id="main" className="auth-screen">
      <div className="auth-shell">
        <AuthAsidePanel
          title="Veilig toegang"
          accent="herstellen."
          description="Vul je school-e-mailadres in. We sturen je een persoonlijke link om een nieuw wachtwoord te kiezen — zonder dat je iemand hoeft te bellen."
          illustration={<AuthForgotArt />}
        />

        <section className="auth-main">
          <ForgotPasswordForm />
        </section>
      </div>
    </main>
  );
}
