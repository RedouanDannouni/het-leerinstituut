"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, ClipboardCheck, FileText, FolderKanban, HelpCircle, Home, Settings, ShieldCheck } from "lucide-react";
import { useRequireSession, useSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { roleLabels } from "@/lib/domain/roles";
import { users } from "@/lib/domain/seed-data";
import type { Permission } from "@/lib/domain/permissions";
import { Button } from "@/components/ui/Button";

const navItems: { href: string; label: string; icon: React.ElementType; permission: Permission }[] = [
  { href: "/app/cockpit", label: "Cockpit", icon: Home, permission: "view:cockpit" },
  { href: "/app/projects", label: "Projecten", icon: FolderKanban, permission: "view:projects" },
  { href: "/app/materials", label: "Lesmateriaal", icon: BookOpen, permission: "view:materials" },
  { href: "/app/observations", label: "Observaties", icon: ClipboardCheck, permission: "view:observations" },
  { href: "/app/reports", label: "Rapporten", icon: FileText, permission: "view:reports" },
  { href: "/app/admin", label: "Beheer", icon: ShieldCheck, permission: "view:admin" },
  { href: "/app/settings", label: "Instellingen", icon: Settings, permission: "view:settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { context, logout, switchUser } = useRequireSession();
  const pathname = usePathname();
  const session = useSession();

  if (!context) {
    return (
      <main id="main" className="page">
        <div className="card">Sessie laden…</div>
      </main>
    );
  }

  const visibleNav = navItems.filter((item) => can(context.user.role, item.permission));

  return (
    <div className="app-shell">
      <aside className="sidebar no-print" aria-label="Hoofdnavigatie">
        <Link href="/app/cockpit" className="brand">
          <span className="brand-mark">HL</span>
          <span>
            <strong>Het Leerinstituut</strong>
            <br />
            <span className="muted">{context.tenant.name}</span>
          </span>
        </Link>
        <nav>
          <ul className="nav-list">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link className={`nav-link ${active ? "nav-link-active" : ""}`} href={item.href} aria-current={active ? "page" : undefined}>
                    <Icon aria-hidden size={20} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="card stack" style={{ marginTop: "var(--space-8)" }}>
          <div className="cluster">
            <HelpCircle aria-hidden size={18} />
            <strong>Hulp</strong>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            Vragen over observaties of rapporten? Hulp blijft op elke pagina op dezelfde plek.
          </p>
        </div>
      </aside>
      <div className="main">
        <header className="topbar no-print">
          <div>
            <div className="eyebrow">{roleLabels[context.user.role]}</div>
            <strong>{context.user.name}</strong>
            <span className="muted"> · {context.tenant.name}</span>
          </div>
          <div className="cluster">
            <label className="sr-only" htmlFor="user-switcher">Demo gebruiker wisselen</label>
            <select
              id="user-switcher"
              className="select"
              style={{ width: 280 }}
              value={context.user.id}
              onChange={(event) => switchUser(event.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} · {roleLabels[user.role]}
                </option>
              ))}
            </select>
            <Button variant="ghost" onClick={session.completeOnboarding} type="button">
              Onboarding
            </Button>
            <Button variant="secondary" onClick={logout} type="button">
              Uitloggen
            </Button>
          </div>
        </header>
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
