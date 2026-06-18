"use client";

import { useRef } from "react";
import { AuthAsideShader } from "@/components/auth/AuthAsideShader";
import { AuthBrandArt } from "@/components/auth/AuthBrandArt";
import { brandAssets } from "@/lib/brand";

export interface AuthAsidePanelProps {
  title?: string;
  accent?: string;
  description?: string;
}

export function AuthAsidePanel({
  title = "Samen bouwen aan",
  accent = "beter onderwijs.",
  description = "Het digitale gereedschap voor schoolleiders en hun teams — van observatie naar gesprek en concrete vervolgstap.",
}: AuthAsidePanelProps = {}) {
  const asideRef = useRef<HTMLElement>(null);

  return (
    <aside ref={asideRef} className="auth-aside">
      <AuthAsideShader containerRef={asideRef} />
      <img className="auth-brand-logo" src={brandAssets.logo.white} alt="Het Leerinstituut" />
      <AuthBrandArt />
      <div className="auth-aside-copy">
        <h2>
          {title} <span className="auth-accent">{accent}</span>
        </h2>
        <p>{description}</p>
      </div>
    </aside>
  );
}
