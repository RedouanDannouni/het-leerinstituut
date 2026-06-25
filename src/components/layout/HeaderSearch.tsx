"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { can } from "@/lib/domain/permissions";
import { appNavGroups } from "@/components/layout/app-nav";
import type { Role } from "@/lib/domain/types";

export function HeaderSearch({ role }: { role: Role }) {
  const dialogId = useId();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return appNavGroups.flatMap((group) =>
      group.items.filter(
        (item) =>
          can(role, item.permission) &&
          (!normalizedQuery || item.label.toLowerCase().includes(normalizedQuery)),
      ),
    );
  }, [query, role]);

  return (
    <>
      <button
        type="button"
        className="header-tool-btn"
        aria-label="Zoeken"
        aria-expanded={open}
        aria-controls={dialogId}
        title="Zoeken (⌘K)"
        onClick={() => setOpen(true)}
      >
        <Search size={18} aria-hidden />
      </button>

      {open && mounted
        ? createPortal(
            <div className="header-search-overlay no-print" onClick={() => setOpen(false)}>
              <div
                id={dialogId}
                className="header-search-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Zoeken"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="header-search-input-wrap">
                  <Search size={18} aria-hidden />
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Zoek menu of pagina…"
                    aria-label="Zoek menu of pagina"
                  />
                  <kbd className="header-search-kbd">Esc</kbd>
                </div>

                <ul className="header-search-results" role="listbox" aria-label="Zoekresultaten">
                  {results.length ? (
                    results.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`header-search-result${active ? " header-search-result--active" : ""}`}
                            role="option"
                            aria-selected={active}
                            onClick={() => setOpen(false)}
                          >
                            <Icon size={18} aria-hidden />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })
                  ) : (
                    <li className="header-search-empty">Geen resultaten voor &ldquo;{query}&rdquo;</li>
                  )}
                </ul>

                <p className="header-search-foot">
                  Zoeken in projecten, observaties en rapporten komt binnenkort.
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
