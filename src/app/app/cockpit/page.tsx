"use client";

import { DocentCockpit } from "@/components/cockpits/DocentCockpit";
import { SchoolLeiderCockpit } from "@/components/cockpits/SchoolLeiderCockpit";
import { CoachCockpit } from "@/components/cockpits/CoachCockpit";
import { PlannerCockpit } from "@/components/cockpits/PlannerCockpit";
import { AppHeaderToolbar } from "@/components/layout/AppHeaderToolbar";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { roleIntents, roleLabels } from "@/lib/domain/roles";
import { brandAssets } from "@/lib/brand";

export default function CockpitPage() {
  const { context, logout } = useRequireSession();

  if (!context) return null;

  const cockpit = {
    coach: <CoachCockpit context={context} />,
    school_leider: <SchoolLeiderCockpit context={context} />,
    docent: <DocentCockpit context={context} />,
    admin: <PlannerCockpit context={context} />,
    planner: <PlannerCockpit context={context} />,
  }[context.user.role];

  return (
    <div className="page">
      <header className="cockpit-hero">
        <div className="cockpit-hero-surface" aria-hidden>
          <img className="cockpit-hero-mark" src={brandAssets.icon.white} alt="" />
        </div>
        <div className="cockpit-hero-row">
          <div className="cockpit-hero-content">
            <p className="eyebrow eyebrow-on-dark">{roleLabels[context.user.role]} cockpit</p>
            <h1>Goedemorgen, {context.user.name.split(" ")[0]}.</h1>
            <p>{roleIntents[context.user.role]}</p>
          </div>
          <div className="cockpit-hero-toolbar no-print">
            <AppHeaderToolbar
              context={context}
              onLogout={logout}
              canViewSettings={can(context.user.role, "view:settings")}
            />
          </div>
        </div>
      </header>
      <div className="cq">{cockpit}</div>
    </div>
  );
}
