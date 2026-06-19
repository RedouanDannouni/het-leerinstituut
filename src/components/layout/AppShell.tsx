"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { AppHeaderToolbar } from "@/components/layout/AppHeaderToolbar";
import { appNavGroups } from "@/components/layout/app-nav";
import { can } from "@/lib/domain/permissions";
import { brandAssets } from "@/lib/brand";
import type { Permission } from "@/lib/domain/permissions";

type NavItem = { href: string; label: string; icon: React.ElementType; permission: Permission };

const navGroups: { label: string; items: NavItem[] }[] = appNavGroups;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { context, logout, switchUser } = useRequireSession();
  const pathname = usePathname();
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
            className="sidebar-toggle expand-btn"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Menu uitklappen" : "Menu inklappen"}
            aria-pressed={collapsed}
            title={collapsed ? "Uitklappen" : "Inklappen"}
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
        </div>

        <nav className="sidebar-scroll sidebar-links" aria-label="Secties">
          {navGroups.map((group) => {
            const items = group.items.filter((item) => can(role, item.permission));
            if (!items.length) return null;
            return (
              <div className="nav-group" key={group.label}>
                {!collapsed ? <p className="nav-section-label">{group.label}</p> : null}
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
                          <Icon aria-hidden size={18} strokeWidth={2.1} />
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
      </aside>

      <div className="main">
        <header className="app-header no-print">
          <div className="app-header-inner">
            <AppHeaderToolbar
              context={context}
              onLogout={logout}
              onSwitchUser={switchUser}
              canViewSettings={can(role, "view:settings")}
            />
          </div>
        </header>
        <div className="mobile-bar no-print">
          <div className="mobile-bar-start">
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
          <AppHeaderToolbar
            context={context}
            onLogout={logout}
            onSwitchUser={switchUser}
            canViewSettings={can(role, "view:settings")}
          />
        </div>
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
