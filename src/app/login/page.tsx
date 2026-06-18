import { AuthBrandArt } from "@/components/auth/AuthBrandArt";
import { LoginForm } from "@/components/auth/LoginForm";
import { brandAssets } from "@/lib/brand";

export default function LoginPage() {
  return (
    <main id="main" className="auth-screen">
      <div className="auth-shell">
        <aside className="auth-aside">
          <img className="auth-brand-logo" src={brandAssets.logo.white} alt="Het Leerinstituut" />
          <AuthBrandArt />
          <div className="auth-aside-copy">
            <h2>
              Samen bouwen aan <span className="auth-accent">beter onderwijs.</span>
            </h2>
            <p>
              Eén platform voor lessen, leerlingen en inzicht — voor elke vestiging van Het
              Leerinstituut.
            </p>
          </div>
        </aside>

        <section className="auth-main">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
