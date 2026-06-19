import { AuthAsidePanel } from "@/components/auth/AuthAsidePanel";
import { ResetPasswordForm } from "@/components/auth/PasswordResetForms";

export default function ResetPasswordPage() {
  return (
    <main id="main" className="auth-screen">
      <div className="auth-shell">
        <AuthAsidePanel
          title="Een nieuw"
          accent="wachtwoord."
          description="Kies een sterk wachtwoord dat je nergens anders gebruikt. Daarna kun je direct verder in je schoolomgeving."
        />

        <section className="auth-main">
          <ResetPasswordForm />
        </section>
      </div>
    </main>
  );
}
