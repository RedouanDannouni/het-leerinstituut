"use client";

import Link from "next/link";
import { useRequireSession } from "@/lib/auth/session";
import { roleLabels } from "@/lib/domain/roles";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const steps = {
  coach: ["Controleer je open observaties.", "Start of herstel een conceptformulier.", "Keur een AI-concept pas goed na eigen bewerking."],
  school_leider: ["Bekijk voortgang op hoofdlijnen.", "Gebruik gespreksonderwerpen als agenda.", "Download een rapport zonder ruwe observatiedata."],
  docent: ["Bekijk je eigen materiaal.", "Lees feedback als ontwikkelinput.", "Leg afspraken vast voor de volgende les."],
  admin: ["Controleer scholen en statussen.", "Nodig gebruikers uit met de juiste rol.", "Bekijk auditlog bij exports en wijzigingen."],
  planner: ["Overzie trajecten over alle scholen.", "Plan inzet en koppel coaches aan scholen.", "Bewaak voortgang en knelpunten centraal."],
};

export default function OnboardingPage() {
  const { context, completeOnboarding } = useRequireSession();
  if (!context) return null;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Eerste stap</p>
          <h1>Welkom in je {roleLabels[context.user.role].toLowerCase()}-omgeving.</h1>
          <p className="muted">Kort, overslaanbaar en gericht op de eerste zinvolle actie.</p>
        </div>
      </header>
      <div className="grid grid-3">
        {steps[context.user.role].map((step, index) => (
          <Card key={step}>
            <span className="badge badge-info">Stap {index + 1}</span>
            <h2 style={{ marginTop: "var(--space-3)" }}>{step}</h2>
          </Card>
        ))}
      </div>
      <div className="cluster" style={{ marginTop: "var(--space-6)" }}>
        <Button type="button" onClick={completeOnboarding}>Naar mijn cockpit</Button>
        <Link className="btn btn-secondary" href="/app/cockpit">Overslaan</Link>
      </div>
    </div>
  );
}
