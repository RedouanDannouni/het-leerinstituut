"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { consumeMaterialsFlash } from "@/lib/lessons/flash";
import { LessonsOverview } from "@/components/lessons/LessonsOverview";

export default function MaterialsPage() {
  const { context } = useRequireSession();
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const message = consumeMaterialsFlash();
    if (message) setFlash(message);
  }, []);

  useEffect(() => {
    if (!flash) return undefined;
    const timer = window.setTimeout(() => setFlash(null), 5000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  if (!context) return null;

  return (
    <div className="page materials-page">
      {flash ? (
        <div className="flash-banner" role="status" aria-live="polite">
          <CheckCircle2 size={18} aria-hidden />
          <span>{flash}</span>
          <button type="button" className="flash-banner-dismiss" aria-label="Melding sluiten" onClick={() => setFlash(null)}>
            <X size={16} aria-hidden />
          </button>
        </div>
      ) : null}
      <LessonsOverview context={context} />
    </div>
  );
}
