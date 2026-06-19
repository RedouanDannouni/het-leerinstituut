"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff, MailCheck, X } from "lucide-react";
import { brandAssets } from "@/lib/brand";
import { evaluatePassword } from "@/lib/auth/password";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo });

    // We tonen bewust altijd dezelfde bevestiging, ook als het adres onbekend is,
    // zodat we niet lekken welke e-mailadressen een account hebben. Alleen echte
    // configuratie-/netwerkfouten melden we generiek.
    if (resetError && /not configured|fetch|network/i.test(resetError.message)) {
      setError("Er ging iets mis bij het versturen. Probeer het later opnieuw.");
      setSubmitting(false);
      return;
    }

    setSent(true);
    setSubmitting(false);
  }

  if (sent) {
    return (
      <div className="auth-form" aria-live="polite">
        <header className="auth-form-head">
          <img className="auth-mobile-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
          <span className="auth-success-icon" aria-hidden>
            <MailCheck size={26} />
          </span>
          <h1>Controleer je inbox</h1>
          <p className="muted">
            Als <strong>{email.trim().toLowerCase()}</strong> bij ons bekend is, ontvang je binnen
            enkele minuten een e-mail met een link om een nieuw wachtwoord te kiezen. Kijk ook even
            in je spammap.
          </p>
        </header>

        <button
          type="button"
          className="auth-link auth-link--button"
          onClick={() => {
            setSent(false);
            setError(null);
          }}
        >
          Geen e-mail ontvangen? Probeer een ander adres
        </button>

        <Link className="btn btn-auth" href="/">
          Terug naar inloggen
        </Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <header className="auth-form-head">
        <img className="auth-mobile-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
        <span className="eyebrow">Toegang herstellen</span>
        <h1>Wachtwoord vergeten?</h1>
        <p className="muted">
          Vul je e-mailadres in. We sturen je een persoonlijke link om een nieuw wachtwoord te
          kiezen.
        </p>
      </header>

      <div className="field">
        <label className="label" htmlFor="forgot-email">
          E-mailadres
        </label>
        <input
          id="forgot-email"
          className="input"
          type="email"
          autoComplete="email"
          placeholder="jij@school.nl"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoFocus
        />
      </div>

      {error ? (
        <p className="error-text" aria-live="polite">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-auth" disabled={submitting}>
        {submitting ? "Bezig met versturen…" : "Herstellink versturen"}
      </button>

      <Link className="auth-back-link" href="/">
        <ArrowLeft size={16} aria-hidden />
        Terug naar inloggen
      </Link>
    </form>
  );
}

type ResetState = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [state, setState] = useState<ResetState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // De herstellink levert (via /auth/callback) een geldige sessie op. We checken
  // die hier en luisteren naar het PASSWORD_RECOVERY-event als de gebruiker
  // rechtstreeks vanuit de e-maillink binnenkomt.
  useEffect(() => {
    let active = true;

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      setState(session ? "ready" : "invalid");
    }
    void check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setState("ready");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }
    if (password !== confirmPassword) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || "Het wachtwoord opslaan is mislukt. Vraag een nieuwe link aan.");
      setSubmitting(false);
      return;
    }

    setDone(true);
    // Volledige navigatie zodat de SessionProvider de nieuwe sessie oppikt en de
    // gebruiker direct in de cockpit belandt.
    window.setTimeout(() => window.location.assign("/app/cockpit"), 1200);
  }

  if (state === "checking") {
    return (
      <div className="auth-form" aria-busy="true">
        <header className="auth-form-head">
          <img className="auth-mobile-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
          <h1>Even geduld…</h1>
          <p className="muted">We controleren je herstellink.</p>
        </header>
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="auth-form">
        <header className="auth-form-head">
          <img className="auth-mobile-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
          <h1>Link verlopen of ongeldig</h1>
          <p className="muted">
            Deze herstellink werkt niet meer. Vraag een nieuwe link aan en probeer het opnieuw.
          </p>
        </header>
        <Link className="btn btn-auth" href="/forgot-password">
          Nieuwe link aanvragen
        </Link>
        <Link className="auth-back-link" href="/">
          <ArrowLeft size={16} aria-hidden />
          Terug naar inloggen
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-form" aria-live="polite">
        <header className="auth-form-head">
          <img className="auth-mobile-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
          <span className="auth-success-icon" aria-hidden>
            <Check size={26} />
          </span>
          <h1>Wachtwoord opgeslagen</h1>
          <p className="muted">Je nieuwe wachtwoord is actief. Je gaat door naar de cockpit…</p>
        </header>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <header className="auth-form-head">
        <img className="auth-mobile-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
        <span className="eyebrow">Toegang herstellen</span>
        <h1>Kies een nieuw wachtwoord</h1>
        <p className="muted">Gebruik minimaal acht tekens. Daarna log je direct in.</p>
      </header>

      <div className="field">
        <label className="label" htmlFor="reset-password">
          Nieuw wachtwoord
        </label>
        <div className="input-password">
          <input
            id="reset-password"
            className="input"
            required
            type={showPassword ? "text" : "password"}
            minLength={8}
            value={password}
            placeholder="Minimaal 8 tekens"
            autoComplete="new-password"
            autoFocus
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="input-password-toggle"
            aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        </div>

        {password ? (
          <div className="pw-strength" data-level={strength.level}>
            <div className="pw-strength-meter" aria-hidden>
              {[1, 2, 3, 4].map((segment) => (
                <span key={segment} className={`pw-strength-seg${segment <= strength.score ? " is-on" : ""}`} />
              ))}
            </div>
            <span className="pw-strength-label">{strength.label}</span>
          </div>
        ) : null}

        <ul className="pw-checklist">
          {strength.checks.map((check) => (
            <li key={check.label} className={check.met ? "is-met" : ""}>
              {check.met ? <Check size={14} aria-hidden /> : <X size={14} aria-hidden />}
              {check.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="field">
        <label className="label" htmlFor="reset-confirm">
          Herhaal wachtwoord
        </label>
        <div className="input-password">
          <input
            id="reset-confirm"
            className="input"
            required
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            placeholder="Typ je wachtwoord nogmaals"
            autoComplete="new-password"
            aria-invalid={passwordsMismatch}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <button
            type="button"
            className="input-password-toggle"
            aria-label={showConfirm ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
            aria-pressed={showConfirm}
            onClick={() => setShowConfirm((value) => !value)}
          >
            {showConfirm ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        </div>
        {passwordsMismatch ? (
          <span className="error-text">De wachtwoorden komen niet overeen.</span>
        ) : passwordsMatch ? (
          <span className="help-text help-text--ok">
            <Check size={14} aria-hidden /> Wachtwoorden komen overeen
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="error-text" aria-live="polite">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-auth" disabled={submitting}>
        {submitting ? "Bezig met opslaan…" : "Wachtwoord opslaan"}
      </button>
    </form>
  );
}
