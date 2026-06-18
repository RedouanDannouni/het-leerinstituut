"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="card stack"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <Field label="E-mailadres">
        <Input required type="email" placeholder="naam@school.nl" />
      </Field>
      <Button type="submit">Herstellink versturen</Button>
      {sent ? <p aria-live="polite" className="help-text">Als dit adres bekend is, sturen we een herstellink.</p> : null}
      <Link className="app-link" href="/login">Terug naar inloggen</Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [done, setDone] = useState(false);

  return (
    <form
      className="card stack"
      onSubmit={(event) => {
        event.preventDefault();
        setDone(true);
      }}
    >
      <Field label="Nieuw wachtwoord">
        <Input required type="password" minLength={8} />
      </Field>
      <Field label="Herhaal wachtwoord">
        <Input required type="password" minLength={8} />
      </Field>
      <Button type="submit">Wachtwoord opslaan</Button>
      {done ? <p aria-live="polite" className="help-text">Wachtwoord opgeslagen. Je kunt nu inloggen.</p> : null}
    </form>
  );
}
