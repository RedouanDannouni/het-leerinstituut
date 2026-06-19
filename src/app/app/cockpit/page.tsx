"use client";

import { AdminCockpit } from "@/components/cockpits/AdminCockpit";
import { DocentCockpit } from "@/components/cockpits/DocentCockpit";
import { SchoolLeiderCockpit } from "@/components/cockpits/SchoolLeiderCockpit";
import { CoachCockpit } from "@/components/cockpits/CoachCockpit";
import { useRequireSession } from "@/lib/auth/session";
import { roleIntents, roleLabels } from "@/lib/domain/roles";
import { brandAssets } from "@/lib/brand";

export default function CockpitPage() {
  const { context } = useRequireSession();

  if (!context) return null;

  const cockpit = {
    coach: <CoachCockpit context={context} />,
    school_leider: <SchoolLeiderCockpit context={context} />,
    docent: <DocentCockpit context={context} />,
    admin: <AdminCockpit />,
    planner: <AdminCockpit />,
  }[context.user.role];

  return (
    <div className="page">
      <header className="cockpit-hero">
        <div>
          <p className="eyebrow eyebrow-on-dark">{roleLabels[context.user.role]} cockpit</p>
          <h1>Goedemorgen, {context.user.name.split(" ")[0]}.</h1>
          <p>{roleIntents[context.user.role]}</p>
        </div>
        <img className="cockpit-hero-mark" src={brandAssets.icon.white} alt="" aria-hidden />
      </header>
      <div className="cq">{cockpit}</div>
    </div>
  );
}
