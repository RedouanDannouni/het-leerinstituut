"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Check, Eye, EyeOff, ShieldCheck, X } from "lucide-react";
import { brandAssets } from "@/lib/brand";

export interface InviteView {
  email: string;
  roleLabel: string;
  tenantName: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  level: "leeg" | "zwak" | "matig" | "goed" | "sterk";
  checks: { label: string; met: boolean }[];
}

function evaluatePassword(password: string): PasswordStrength {
  const checks = [
    { label: "Minimaal 8 tekens", met: password.length >= 8 },
    { label: "Hoofd- en kleine letter", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Minimaal 1 cijfer", met: /\d/.test(password) },
    { label: "Minimaal 1 symbool", met: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) {
    return { score: 0, label: "Nog geen wachtwoord", level: "leeg", checks };
  }

  let score = checks.filter((check) => check.met).length;
  if (password.length >= 12 && score >= 3) score = 4;

  const level = ([, "zwak", "zwak", "matig", "sterk"] as const)[score] ?? "zwak";
  const labelMap: Record<PasswordStrength["level"], string> = {
    leeg: "Nog geen wachtwoord",
    zwak: "Zwak wachtwoord",
    matig: "Redelijk wachtwoord",
    goed: "Goed wachtwoord",
    sterk: "Sterk wachtwoord",
  };

  return { score, label: labelMap[level], level, checks };
}

export function InviteAcceptForm({ invite, token }: { invite: InviteView | null; token: string }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  if (!invite) {
    return (
      <div className="auth-form">
        <header className="auth-form-head">
          <img className="auth-mobile-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
          <h1>Uitnodiging niet gevonden</h1>
          <p className="muted">De link is ongeldig of verlopen. Vraag een nieuwe uitnodiging aan.</p>
        </header>
        <Link className="btn btn-auth" href="/login">
          Terug naar inloggen
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }
    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Accepteren mislukt.");
        setSubmitting(false);
        return;
      }
      setAccepted(true);
      window.setTimeout(() => router.push("/login"), 900);
    } catch (cause) {
      setError((cause as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form auth-form--wide" onSubmit={handleSubmit}>
      <header className="auth-form-head">
        <img className="auth-mobile-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
        <span className="eyebrow">Uitnodiging</span>
        <h1>Maak je account aan</h1>
        <p className="muted">Controleer je rol en schoolomgeving en stel je wachtwoord in.</p>
      </header>

      <div className="auth-invite-card">
        <div className="auth-invite-row">
          <span className="auth-invite-icon" aria-hidden>
            <Building2 size={18} />
          </span>
          <div className="auth-invite-text">
            <span className="auth-invite-label">Schoolomgeving</span>
            <span className="auth-invite-value">{invite.tenantName}</span>
          </div>
        </div>
        <div className="auth-invite-row">
          <span className="auth-invite-icon" aria-hidden>
            <ShieldCheck size={18} />
          </span>
          <div className="auth-invite-text">
            <span className="auth-invite-label">Jouw rol</span>
            <span className="auth-invite-value">{invite.roleLabel}</span>
          </div>
        </div>
      </div>

      <div className="auth-field-row">
        <div className="field">
          <label className="label" htmlFor="invite-first-name">
            Voornaam
          </label>
          <input
            id="invite-first-name"
            className="input"
            required
            value={firstName}
            placeholder="Bijv. Jamie"
            autoComplete="given-name"
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="invite-last-name">
            Achternaam
          </label>
          <input
            id="invite-last-name"
            className="input"
            required
            value={lastName}
            placeholder="Bijv. de Vries"
            autoComplete="family-name"
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="invite-email">
          E-mailadres
        </label>
        <input id="invite-email" className="input" type="email" value={invite.email} readOnly />
      </div>

      <div className="field">
        <label className="label" htmlFor="invite-password">
          Wachtwoord
        </label>
        <div className="input-password">
          <input
            id="invite-password"
            className="input"
            required
            type={showPassword ? "text" : "password"}
            minLength={8}
            value={password}
            placeholder="Minimaal 8 tekens"
            autoComplete="new-password"
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
        <label className="label" htmlFor="invite-confirm">
          Herhaal wachtwoord
        </label>
        <div className="input-password">
          <input
            id="invite-confirm"
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

      <button type="submit" className="btn btn-auth" disabled={submitting || accepted}>
        {submitting ? "Bezig…" : "Account aanmaken"}
      </button>

      {accepted ? (
        <p className="help-text" aria-live="polite">
          Account aangemaakt. Je gaat naar inloggen…
        </p>
      ) : null}
      {error ? (
        <p className="error-text" aria-live="polite">
          {error}
        </p>
      ) : null}

      <p className="auth-footnote">
        Heb je al een account?{" "}
        <Link className="auth-link" href="/login">
          Inloggen
        </Link>
      </p>
    </form>
  );
}
