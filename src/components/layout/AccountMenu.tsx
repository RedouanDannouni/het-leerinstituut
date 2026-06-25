"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { useEffect, useId, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarClock,
  Eye,
  FileCheck,
  FileText,
  Gauge,
  Layers,
  LogOut,
  Mail,
  Moon,
  Route,
  School,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import { GrowthDonut } from "@/components/blocks/GrowthDonut";
import { roleLabels } from "@/lib/domain/roles";
import { getProfileSummary, type ProfileIcon } from "@/lib/domain/selectors";
import { useTheme } from "@/lib/theme/useTheme";
import type { SessionContext } from "@/lib/domain/types";

const STAT_ICONS: Record<ProfileIcon, ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  school: School,
  route: Route,
  alert: AlertCircle,
  gauge: Gauge,
  eye: Eye,
  fileCheck: FileCheck,
  fileText: FileText,
  layers: Layers,
  building: Building2,
  users: Users,
  mail: Mail,
  calendar: CalendarClock,
};

const DONUT_PALETTE = ["#e08a6b", "#ffd000", "#38c9a6", "#0e6a8c", "#7a5cff"];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type AccountMenuProps = {
  context: SessionContext;
  onLogout: () => void;
  canViewSettings: boolean;
};

export function AccountMenu({ context, onLogout, canViewSettings }: AccountMenuProps) {
  const { isDark, toggleTheme } = useTheme();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"actions" | "profile">("actions");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const profile = getProfileSummary(context);

  useEffect(() => {
    if (!open) {
      setView("actions");
    }
  }, [open]);

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

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className={`account-dropdown${open ? " open" : ""}`} ref={rootRef}>
      <button
        type="button"
        id={`${menuId}-trigger`}
        ref={triggerRef}
        className="account-dropdown-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={`${menuId}-menu`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="avatar avatar--header" aria-hidden>
          {initialsOf(context.user.name)}
        </span>
        <span className="sr-only">{context.user.name}</span>
      </button>

      <div
        id={`${menuId}-menu`}
        className="account-dropdown-panel"
        role="menu"
        aria-labelledby={`${menuId}-trigger`}
        aria-hidden={!open}
        inert={!open}
      >
        {view === "profile" ? (
          <div className="account-profile">
            <button
              type="button"
              className="account-profile-back"
              aria-label="Terug"
              onClick={() => setView("actions")}
            >
              <ArrowLeft size={16} aria-hidden />
            </button>
            <div className="account-dropdown-head">
              <span className="avatar" aria-hidden>
                {initialsOf(context.user.name)}
              </span>
              <div className="account-dropdown-head-meta">
                <strong>{context.user.name}</strong>
                <span className="muted">
                  {roleLabels[context.user.role]} · {profile.scope}
                </span>
              </div>
            </div>
            <p className="account-profile-email">{context.user.email}</p>
            {profile.chart && profile.chart.segments.some((segment) => segment.value > 0) ? (
              <div className="account-profile-chart">
                <GrowthDonut
                  segments={profile.chart.segments.map((segment, index) => ({
                    ...segment,
                    color: DONUT_PALETTE[index % DONUT_PALETTE.length],
                  }))}
                  centerValue={profile.chart.centerValue}
                  centerLabel={profile.chart.centerLabel}
                />
              </div>
            ) : null}
            {profile.stats.length > 0 ? (
              <div className="account-profile-stats">
                {profile.stats.map((stat) => {
                  const Icon = STAT_ICONS[stat.icon];
                  return (
                    <div className="account-profile-stat" key={stat.label}>
                      <span className="account-profile-stat-icon" aria-hidden>
                        <Icon size={16} />
                      </span>
                      <span className="account-profile-stat-value">{stat.value}</span>
                      <span className="account-profile-stat-label">{stat.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <button
              type="button"
              className="account-dropdown-head account-dropdown-head--button"
              onClick={() => setView("profile")}
            >
              <span className="avatar" aria-hidden>
                {initialsOf(context.user.name)}
              </span>
              <div className="account-dropdown-head-meta">
                <strong>{context.user.name}</strong>
                <span className="muted">{roleLabels[context.user.role]}</span>
              </div>
            </button>

            <hr className="account-dropdown-divider" />

            {canViewSettings ? (
              <>
                <div className="account-dropdown-section">
                  <Link href="/app/settings" role="menuitem" className="account-dropdown-action" onClick={closeMenu}>
                    <Settings size={18} aria-hidden />
                    <span>Instellingen</span>
                  </Link>
                </div>
                <hr className="account-dropdown-divider" />
              </>
            ) : null}

            <div className="account-dropdown-section">
              <div
                className="theme-toggle-row"
                role="switch"
                aria-checked={isDark}
                tabIndex={open ? 0 : -1}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest(".toggle-switch")) return;
                  toggleTheme();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleTheme();
                  }
                }}
              >
                <Moon size={18} aria-hidden className="theme-toggle-row__icon theme-toggle-row__icon--moon" />
                <Sun size={18} aria-hidden className="theme-toggle-row__icon theme-toggle-row__icon--sun" />
                <span className="theme-toggle-row__label">Donkere modus</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={isDark} onChange={toggleTheme} aria-label="Donkere modus" />
                  <span className="toggle-switch__track" aria-hidden />
                  <span className="toggle-switch__knob" aria-hidden />
                </label>
              </div>
            </div>

            <hr className="account-dropdown-divider" />

            <div className="account-dropdown-section">
              <button
                type="button"
                role="menuitem"
                className="account-dropdown-action account-dropdown-action--danger"
                onClick={() => {
                  onLogout();
                  closeMenu();
                }}
              >
                <LogOut size={18} aria-hidden />
                <span>Uitloggen</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
