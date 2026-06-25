"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bell, CircleHelp, Sparkles } from "lucide-react";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { CockpitScopeFilter } from "@/components/cockpits/cockpit-scope";
import { useSession } from "@/lib/auth/session";
import type { SessionContext } from "@/lib/domain/types";

type AppHeaderToolbarProps = {
  context: SessionContext;
  onLogout: () => void;
  canViewSettings: boolean;
};

function usePopover() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return { open, setOpen, rootRef, triggerRef };
}

function HeaderNotifications() {
  const menuId = useId();
  const { open, setOpen, rootRef, triggerRef } = usePopover();

  return (
    <div className={`header-popover${open ? " open" : ""}`} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="header-tool-btn"
        aria-label="Meldingen"
        aria-expanded={open}
        aria-controls={menuId}
        title="Meldingen"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={18} aria-hidden />
      </button>

      <div
        id={menuId}
        className="header-popover-panel"
        role="dialog"
        aria-label="Meldingen"
        aria-hidden={!open}
        inert={!open}
      >
        <p className="header-popover-title">Meldingen</p>
        <p className="header-popover-empty">Geen nieuwe meldingen.</p>
        <p className="header-popover-note muted">Meldingen over observaties en rapporten komen binnenkort.</p>
      </div>
    </div>
  );
}

function HeaderHelp({ onShowOnboarding }: { onShowOnboarding: () => void }) {
  const menuId = useId();
  const { open, setOpen, rootRef, triggerRef } = usePopover();

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className={`header-popover${open ? " open" : ""}`} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="header-tool-btn"
        aria-label="Hulp"
        aria-expanded={open}
        aria-controls={menuId}
        title="Hulp"
        onClick={() => setOpen((value) => !value)}
      >
        <CircleHelp size={18} aria-hidden />
      </button>

      <div
        id={menuId}
        className="header-popover-panel"
        role="menu"
        aria-label="Hulp"
        aria-hidden={!open}
        inert={!open}
      >
        <button
          type="button"
          role="menuitem"
          className="account-dropdown-action"
          onClick={() => {
            onShowOnboarding();
            closeMenu();
          }}
        >
          <Sparkles size={18} aria-hidden />
          <span>Onboarding tonen</span>
        </button>
        <button type="button" role="menuitem" className="account-dropdown-action" disabled>
          <CircleHelp size={18} aria-hidden />
          <span>Hulp &amp; uitleg</span>
        </button>
        <p className="header-popover-note muted">Uitgebreid helpcentrum komt binnenkort.</p>
      </div>
    </div>
  );
}

export function AppHeaderToolbar({
  context,
  onLogout,
  canViewSettings,
}: AppHeaderToolbarProps) {
  const session = useSession();

  return (
    <div className="app-header-actions">
      <CockpitScopeFilter role={context.user.role} />
      <HeaderSearch role={context.user.role} />
      <HeaderNotifications />
      <HeaderHelp onShowOnboarding={session.completeOnboarding} />
      <AccountMenu
        context={context}
        onLogout={onLogout}
        canViewSettings={canViewSettings}
      />
    </div>
  );
}
