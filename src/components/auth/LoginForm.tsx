"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth/session";
import { brandAssets } from "@/lib/brand";
import { roleLabels } from "@/lib/domain/roles";
import { tenants, users } from "@/lib/domain/seed-data";

function MicrosoftMark() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 48 48">
      <path fill="#ffc107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#ff3d00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4caf50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976d2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C41.4 35.9 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function LoginForm() {
  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const match = users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) {
      setError("Geen account gevonden voor dit e-mailadres. Kies een demo-account hieronder.");
      return;
    }
    setError(null);
    login(match.id);
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
        <input
          id="auth-password"
          className="input"
          type="password"
          autoComplete="current-password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
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

      <button type="submit" className="btn btn-auth">
        Inloggen
      </button>

      <div className="auth-divider">OF</div>

      <div className="auth-social">
        <button type="button" className="btn btn-secondary" onClick={() => login(users[0]?.id ?? "")}>
          <MicrosoftMark /> Microsoft
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => login(users[0]?.id ?? "")}>
          <GoogleMark /> Google
        </button>
      </div>

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
