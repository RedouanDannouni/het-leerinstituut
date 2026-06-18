"use client";

import { AdminCockpit } from "@/components/cockpits/AdminCockpit";
import { DocentCockpit } from "@/components/cockpits/DocentCockpit";
import { SchoolLeiderCockpit } from "@/components/cockpits/SchoolLeiderCockpit";
import { SchoolOpleiderCockpit } from "@/components/cockpits/SchoolOpleiderCockpit";
import { useRequireSession } from "@/lib/auth/session";
import { roleIntents, roleLabels } from "@/lib/domain/roles";

export default function CockpitPage() {
  const { context } = useRequireSession();

  if (!context) return null;

  const cockpit = {
    school_opleider: <SchoolOpleiderCockpit context={context} />,
    school_leider: <SchoolLeiderCockpit context={context} />,
    docent: <DocentCockpit context={context} />,
    admin: <AdminCockpit />,
  }[context.user.role];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">{roleLabels[context.user.role]} cockpit</p>
          <h1>Goedemorgen, {context.user.name.split(" ")[0]}.</h1>
          <p className="muted">{roleIntents[context.user.role]}</p>
        </div>
      </header>
      {cockpit}
    </div>
  );
}
