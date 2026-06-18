import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main id="main" className="page">
      <div className="grid grid-2" style={{ alignItems: "center", minHeight: "80vh" }}>
        <section className="stack">
          <p className="eyebrow">Inloggen & toegang</p>
          <h1>Welkom terug.</h1>
          <p className="muted">
            Start direct in de cockpit die past bij je rol. Scholen zijn gescheiden omgevingen; data wordt alleen binnen de juiste context getoond.
          </p>
          <div className="cluster">
            <Link className="app-link" href="/forgot-password">Wachtwoord vergeten</Link>
            <Link className="app-link" href="/invite/welkom-noord">Uitnodiging accepteren</Link>
          </div>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
