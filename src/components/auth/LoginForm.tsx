"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/lib/auth/session";
import { brandAssets } from "@/lib/brand";
import { roleLabels } from "@/lib/domain/roles";
import { tenants, users } from "@/lib/domain/seed-data";

export function LoginForm() {
  const { login, loginWithSupabase } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();

    // Demo-accounts (seed-data) blijven werken zonder wachtwoord.
    const demoMatch = users.find((user) => user.email.toLowerCase() === trimmed);
    if (demoMatch) {
      setError(null);
      login(demoMatch.id);
      return;
    }

    // Echte accounts loggen in via Supabase Auth.
    setError(null);
    setSubmitting(true);
    const result = await loginWithSupabase(trimmed, password);
    if (!result.ok) {
      const friendly = /invalid login credentials/i.test(result.error)
        ? "Onjuist e-mailadres of wachtwoord."
        : result.error;
      setError(friendly);
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <header className="auth-form-head">
        <img className="auth-mobile-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
        <h1>Inloggen</h1>
        <p className="muted">Welkom terug! Vul hieronder je gegevens in.</p>
      </header>

      <div className="field">
        <label className="label" htmlFor="auth-email">
          E-mailadres
        </label>
        <input
          id="auth-email"
          className="input"
          type="email"
          autoComplete="email"
          placeholder="jij@school.nl"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="field">
        <div className="auth-label-row">
          <label className="label" htmlFor="auth-password">
            Wachtwoord
          </label>
          <Link className="auth-link" href="/forgot-password">
            Wachtwoord vergeten?
          </Link>
        </div>
        <div className="input-password">
          <input
            id="auth-password"
            className="input"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Wachtwoord"
            value={password}
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
      </div>

      <label className="auth-checkbox">
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
        Ingelogd blijven
      </label>

      {error ? (
        <p className="error-text" aria-live="polite">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-auth" disabled={submitting}>
        {submitting ? "Bezig met inloggen…" : "Inloggen"}
      </button>

      <details className="auth-demo">
        <summary>Demo-account kiezen</summary>
        <select
          className="select"
          defaultValue=""
          onChange={(event) => {
            const user = users.find((item) => item.id === event.target.value);
            if (user) setEmail(user.email);
          }}
        >
          <option value="" disabled>
            Kies een rol om snel in te vullen…
          </option>
          {users.map((user) => {
            const tenant = tenants.find((item) => item.id === user.tenantId);
            return (
              <option key={user.id} value={user.id}>
                {user.name} · {roleLabels[user.role]} · {tenant?.name}
              </option>
            );
          })}
        </select>
        <p className="help-text">
          Het wachtwoord is in deze demo niet vereist; rolkeuze bepaalt de cockpit en tenant-isolatie.
        </p>
      </details>

      <p className="auth-footnote">
        Nog geen account?{" "}
        <Link className="auth-link" href="/invite/welkom-noord">
          Uitnodiging accepteren
        </Link>
      </p>
    </form>
  );
}
