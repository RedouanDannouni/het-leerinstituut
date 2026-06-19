import { AuthAsidePanel } from "@/components/auth/AuthAsidePanel";
import { LoginForm } from "@/components/auth/LoginForm";

export default function HomePage() {
  return (
    <main id="main" className="auth-screen">
      <div className="auth-shell">
        <AuthAsidePanel />

        <section className="auth-main">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
