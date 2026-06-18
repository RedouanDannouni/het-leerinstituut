"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  ChevronUp,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Home,
  LogOut,
  Menu,
  PanelLeft,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRequireSession, useSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { roleLabels } from "@/lib/domain/roles";
import { users } from "@/lib/domain/seed-data";
import { brandAssets } from "@/lib/brand";
import type { Permission } from "@/lib/domain/permissions";

type NavItem = { href: string; label: string; icon: React.ElementType; permission: Permission };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Hoofdmenu",
    items: [
      { href: "/app/cockpit", label: "Cockpit", icon: Home, permission: "view:cockpit" },
      { href: "/app/projects", label: "Projecten", icon: FolderKanban, permission: "view:projects" },
      { href: "/app/materials", label: "Lesmateriaal", icon: BookOpen, permission: "view:materials" },
      { href: "/app/observations", label: "Observaties", icon: ClipboardCheck, permission: "view:observations" },
      { href: "/app/reports", label: "Rapporten", icon: FileText, permission: "view:reports" },
    ],
  },
  {
    label: "Beheer",
    items: [
      { href: "/app/admin", label: "Beheer", icon: ShieldCheck, permission: "view:admin" },
      { href: "/app/settings", label: "Instellingen", icon: Settings, permission: "view:settings" },
    ],
  },
];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { context, logout, switchUser } = useRequireSession();
  const pathname = usePathname();
  const session = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("hl-sidebar-collapsed") === "1");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("hl-sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!context) {
    return (
      <main id="main" className="page">
        <div className="card">Sessie laden…</div>
      </main>
    );
  }

  const role = context.user.role;

  return (
    <div
      className="app-shell"
      data-collapsed={collapsed ? "true" : "false"}
      data-mobile-open={mobileOpen ? "true" : "false"}
    >
      {mobileOpen ? (
        <button
          type="button"
          className="sidebar-scrim no-print"
          aria-label="Menu sluiten"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside className="sidebar no-print" aria-label="Hoofdnavigatie">
        <div className="sidebar-head">
          <Link href="/app/cockpit" className="brand" aria-label="Het Leerinstituut">
            <img className="brand-logo" src={brandAssets.logo.color} alt="Het Leerinstituut" />
            <img className="brand-icon" src={brandAssets.icon.color} alt="" aria-hidden />
          </Link>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Menu uitklappen" : "Menu inklappen"}
            aria-pressed={collapsed}
            title={collapsed ? "Uitklappen" : "Inklappen"}
          >
            <PanelLeft size={18} aria-hidden />
          </button>
        </div>

        <div className="workspace" title={context.tenant.name}>
          <Building2 size={16} aria-hidden />
          <span className="workspace-name">{context.tenant.name}</span>
        </div>

        <nav className="sidebar-scroll" aria-label="Secties">
          {navGroups.map((group) => {
            const items = group.items.filter((item) => can(role, item.permission));
            if (!items.length) return null;
            return (
              <div className="nav-group" key={group.label}>
                <p className="nav-section-label">{group.label}</p>
                <ul className="nav-list">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          className={`nav-link ${active ? "nav-link-active" : ""}`}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          title={item.label}
                        >
                          <Icon aria-hidden size={20} />
                          <span className="nav-label">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-help" role="note">
            <span className="sidebar-help-icon">
              <Sparkles size={18} aria-hidden />
            </span>
            <div className="sidebar-help-text">
              <strong>Hulp &amp; uitleg</strong>
              <p>Vragen over observaties of rapporten? Hulp staat altijd op dezelfde plek.</p>
            </div>
          </div>

          <details className="account">
            <summary className="account-trigger">
              <span className="avatar" aria-hidden>
                {initialsOf(context.user.name)}
              </span>
              <span className="account-meta">
                <strong>{context.user.name}</strong>
                <span className="muted">{roleLabels[role]}</span>
              </span>
              <ChevronUp className="account-caret" size={16} aria-hidden />
            </summary>
            <div className="account-menu">
              <div className="account-menu-demo">
                <label className="account-menu-label" htmlFor="user-switcher">
                  Demo-gebruiker
                </label>
                <select
                  id="user-switcher"
                  className="select"
                  value={context.user.id}
                  onChange={(event) => switchUser(event.target.value)}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {roleLabels[user.role]}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className="account-menu-item" onClick={session.completeOnboarding}>
                <Sparkles size={16} aria-hidden />
                Onboarding tonen
              </button>
              <button type="button" className="account-menu-item" onClick={logout}>
                <LogOut size={16} aria-hidden />
                Uitloggen
              </button>
            </div>
          </details>
        </div>
      </aside>

      <div className="main">
        <div className="mobile-bar no-print">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu openen"
          >
            <Menu size={20} aria-hidden />
          </button>
          <Link href="/app/cockpit" className="brand" aria-label="Het Leerinstituut">
            <img className="brand-logo brand-logo--mobile" src={brandAssets.logo.color} alt="Het Leerinstituut" />
          </Link>
        </div>
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
