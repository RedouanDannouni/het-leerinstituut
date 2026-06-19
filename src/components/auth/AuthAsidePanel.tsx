"use client";

import { useRef, type ReactNode } from "react";
import { AuthAsideShader } from "@/components/auth/AuthAsideShader";
import { AuthBrandArt } from "@/components/auth/AuthBrandArt";
import { brandAssets } from "@/lib/brand";

export interface AuthAsidePanelProps {
  title?: string;
  accent?: string;
  description?: string;
  /** Optionele decoratieve illustratie tussen het logo en de copy. */
  illustration?: ReactNode;
}

export function AuthAsidePanel({
  title = "Samen bouwen aan",
  accent = "beter onderwijs.",
  description = "Het digitale gereedschap voor schoolleiders en hun teams — van observatie naar gesprek en concrete vervolgstap.",
  illustration,
}: AuthAsidePanelProps = {}) {
  const asideRef = useRef<HTMLElement>(null);

  return (
    <aside ref={asideRef} className="auth-aside">
      <AuthAsideShader containerRef={asideRef} />
      <img className="auth-brand-logo" src={brandAssets.logo.white} alt="Het Leerinstituut" />
      <AuthBrandArt />
      {illustration ? <div className="auth-aside-illustration">{illustration}</div> : null}
      <div className="auth-aside-copy">
        <h2>
          {title} <span className="auth-accent">{accent}</span>
        </h2>
        <p>{description}</p>
      </div>
    </aside>
  );
}
