"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { roleLabels } from "@/lib/domain/roles";
import { users } from "@/lib/domain/seed-data";
import type { SessionContext } from "@/lib/domain/types";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type SidebarDemoSwitcherProps = {
  collapsed: boolean;
  context: SessionContext;
  onSwitchUser: (userId: string) => void;
};

export function SidebarDemoSwitcher({ collapsed, context, onSwitchUser }: SidebarDemoSwitcherProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const currentUser = context.user;

  useEffect(() => {
    setOpen(false);
  }, [collapsed]);

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

  function handleSelect(userId: string) {
    onSwitchUser(userId);
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={`sidebar-demo-switcher${collapsed ? " sidebar-demo-switcher--collapsed" : ""}${open ? " open" : ""}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="sidebar-demo-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        title={collapsed ? `${currentUser.name} · ${roleLabels[currentUser.role]}` : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="avatar avatar--switch" aria-hidden>
          {initialsOf(currentUser.name)}
        </span>
        {!collapsed ? (
          <>
            <span className="sidebar-demo-trigger-meta">
              <span className="sidebar-demo-trigger-label">Demo-gebruiker</span>
              <span className="sidebar-demo-trigger-name">{currentUser.name}</span>
            </span>
            <ChevronDown size={16} className="sidebar-demo-trigger-chevron" aria-hidden />
          </>
        ) : null}
      </button>

      <div
        id={menuId}
        className="sidebar-demo-panel"
        role="listbox"
        aria-label="Demo-gebruiker wisselen"
        aria-hidden={!open}
        inert={!open}
      >
        {collapsed ? <p className="sidebar-demo-panel-title">Demo-gebruiker</p> : null}
        <ul className="account-switch-list sidebar-demo-list">
          {users.map((user) => {
            const active = user.id === context.user.id;
            return (
              <li key={user.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`account-switch-item${active ? " active" : ""}`}
                  onClick={() => handleSelect(user.id)}
                >
                  <span className="avatar avatar--switch" aria-hidden>
                    {initialsOf(user.name)}
                  </span>
                  <span className="account-switch-item-meta">
                    <span className="account-switch-item-name">{user.name}</span>
                    <span className="account-switch-item-role">{roleLabels[user.role]}</span>
                  </span>
                  <span className="account-switch-item-marker" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
