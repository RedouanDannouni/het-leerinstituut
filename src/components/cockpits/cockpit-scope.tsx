"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { getSchool, plannerSchools, type PlannerScope, type PlannerStatus } from "@/lib/domain/planner";
import type { Role } from "@/lib/domain/types";

const PANEL_WIDTH = 320;

const statusDot: Record<PlannerStatus, string> = {
  "op koers": "var(--color-success)",
  aandacht: "var(--color-warning)",
  vertraagd: "var(--color-danger)",
};

/** Rollen die de portfolio-/sturingscockpit met scope-filter krijgen. */
export const SCOPE_COCKPIT_ROLES: Role[] = ["planner", "admin"];

interface CockpitScopeState {
  scope: PlannerScope;
  setScope: (scope: PlannerScope) => void;
}

const CockpitScopeContext = createContext<CockpitScopeState | null>(null);

export function CockpitScopeProvider({ children }: { children: ReactNode }) {
  const [scope, setScope] = useState<PlannerScope>("all");
  return <CockpitScopeContext.Provider value={{ scope, setScope }}>{children}</CockpitScopeContext.Provider>;
}

export function useCockpitScope(): CockpitScopeState {
  const value = useContext(CockpitScopeContext);
  if (!value) {
    throw new Error("useCockpitScope must be used within a CockpitScopeProvider");
  }
  return value;
}

function useFloatingDropdown(open: boolean, triggerRef: React.RefObject<HTMLButtonElement | null>) {
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - 24);
      const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);

      setStyle({
        position: "fixed",
        top: rect.bottom + 10,
        left,
        width,
        zIndex: 120,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, triggerRef]);

  return { mounted, style };
}

/**
 * Filterknop voor de header-toolbar. Herschaalt de sturingscockpit tussen
 * portfolio (alle scholen) en inzoom (één school).
 */
export function CockpitScopeFilter({ role }: { role: Role }) {
  const scopeState = useContext(CockpitScopeContext);
  const scope: PlannerScope = scopeState?.scope ?? "all";
  const pathname = usePathname();
  const menuId = useId();
  const searchId = useId();
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusIdx, setFocusIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { mounted, style: panelStyle } = useFloatingDropdown(open, triggerRef);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  const filteredSchools = useMemo(() => {
    if (!isSearching) return plannerSchools;
    const needle = trimmedQuery.toLowerCase();
    return plannerSchools.filter(
      (school) =>
        school.naam.toLowerCase().includes(needle) ||
        school.fase.toLowerCase().includes(needle) ||
        school.id.toLowerCase().includes(needle),
    );
  }, [isSearching, trimmedQuery]);

  const options = useMemo<PlannerScope[]>(
    () => ["all", ...filteredSchools.map((school) => school.id)],
    [filteredSchools],
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
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

  useEffect(() => {
    if (!open) {
      setQuery("");
      setFocusIdx(0);
      setListOpen(false);
      return;
    }
    // Start dichtgeklapt en klap één frame later open → de chevron draait en de
    // lijst vouwt zichtbaar uit (het "openklappen"-effect).
    const frame = window.requestAnimationFrame(() => {
      setListOpen(true);
      searchRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const selectedIdx = options.indexOf(scope);
    setFocusIdx(selectedIdx >= 0 ? selectedIdx : 0);
  }, [open, options, scope]);

  useEffect(() => {
    setFocusIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLElement>(`[data-option-idx="${focusIdx}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [focusIdx, open]);

  if (!scopeState) return null;
  if (pathname !== "/app/cockpit") return null;
  if (!SCOPE_COCKPIT_ROLES.includes(role)) return null;

  const { setScope } = scopeState;
  const activeSchool = getSchool(scope);

  function choose(next: PlannerScope) {
    setScope(next);
    setOpen(false);
  }

  function handlePanelKeyDown(event: React.KeyboardEvent) {
    if (!open || options.length === 0) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusIdx((idx) => Math.min(idx + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusIdx((idx) => Math.max(idx - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        choose(options[focusIdx] ?? "all");
        break;
      default:
        break;
    }
  }

  function renderSchoolOption(school: (typeof plannerSchools)[number], optionIdx: number) {
    const selected = scope === school.id;
    return (
      <button
        type="button"
        key={school.id}
        role="option"
        data-option-idx={optionIdx}
        aria-selected={selected}
        className={`cockpit-scope-option${selected ? " is-selected" : ""}${focusIdx === optionIdx ? " is-focused" : ""}`}
        onClick={() => choose(school.id)}
        onMouseEnter={() => setFocusIdx(optionIdx)}
      >
        <span
          className="cockpit-scope-option-dot"
          style={{ background: statusDot[school.status] }}
          aria-hidden
        />
        <span className="cockpit-scope-option-label">
          <span className="cockpit-scope-option-name">{school.naam}</span>
          <span className="cockpit-scope-option-meta">{school.fase}</span>
        </span>
        {selected ? <Check size={14} aria-hidden /> : null}
      </button>
    );
  }

  const dropdown = (
    <div
      id={menuId}
      ref={panelRef}
      className="cockpit-scope-dropdown"
      style={panelStyle}
      onKeyDown={handlePanelKeyDown}
    >
      <button
        type="button"
        className={`cockpit-scope-combo${listOpen ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={listOpen}
        aria-controls={`${menuId}-list`}
        onClick={() => setListOpen((value) => !value)}
      >
        <span
          className={`cockpit-scope-combo-dot${activeSchool ? "" : " cockpit-scope-combo-dot--portfolio"}`}
          style={activeSchool ? { background: statusDot[activeSchool.status] } : undefined}
          aria-hidden
        />
        <span className="cockpit-scope-combo-value">
          <span className="cockpit-scope-combo-name">{activeSchool ? activeSchool.naam : "Alle scholen"}</span>
          <span className="cockpit-scope-combo-meta">{activeSchool ? activeSchool.fase : "Portfolio-overzicht"}</span>
        </span>
        <ChevronDown size={16} className="cockpit-scope-combo-chevron" aria-hidden />
      </button>

      <div className="cockpit-scope-collapse">
        <div className="cockpit-scope-collapse-inner">
          <div className="cockpit-scope-dropdown-search">
            <Search size={15} aria-hidden />
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              className="cockpit-scope-dropdown-search-input"
              placeholder={`Zoek school (${plannerSchools.length})…`}
              value={query}
              autoComplete="off"
              spellCheck={false}
              aria-controls={`${menuId}-list`}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div
            id={`${menuId}-list`}
            className="cockpit-scope-dropdown-options"
            role="listbox"
            aria-label="Scholen filteren"
          >
            <button
              type="button"
              role="option"
              data-option-idx={0}
              aria-selected={scope === "all"}
              className={`cockpit-scope-option${scope === "all" ? " is-selected" : ""}${focusIdx === 0 ? " is-focused" : ""}`}
              onClick={() => choose("all")}
              onMouseEnter={() => setFocusIdx(0)}
            >
              <span className="cockpit-scope-option-dot cockpit-scope-option-dot--portfolio" aria-hidden />
              <span className="cockpit-scope-option-label">
                <span className="cockpit-scope-option-name">Alle scholen</span>
                <span className="cockpit-scope-option-meta">Portfolio-overzicht</span>
              </span>
              {scope === "all" ? <Check size={14} aria-hidden /> : null}
            </button>

            <div className="cockpit-scope-list" ref={listRef}>
              <p className="cockpit-scope-list-label">Scholen</p>
              {filteredSchools.length === 0 ? (
                <p className="cockpit-scope-empty">Geen scholen voor &ldquo;{trimmedQuery}&rdquo;</p>
              ) : (
                filteredSchools.map((school, index) => renderSchoolOption(school, index + 1))
              )}
            </div>
          </div>

          {isSearching ? (
            <p className="cockpit-scope-foot muted">
              {filteredSchools.length} van {plannerSchools.length} scholen
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`header-popover cockpit-scope${open ? " open" : ""}`} ref={rootRef}>
        <button
          type="button"
          ref={triggerRef}
          className={`header-tool-btn cockpit-scope-trigger${activeSchool ? " is-active" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={activeSchool ? `Filter: ${activeSchool.naam}` : "Filter: alle scholen"}
          title="Scholen filteren"
          onClick={() => setOpen((value) => !value)}
        >
          <SlidersHorizontal size={18} aria-hidden />
          {activeSchool ? <span className="cockpit-scope-dot" aria-hidden /> : null}
        </button>
      </div>

      {open && mounted ? createPortal(dropdown, document.body) : null}
    </>
  );
}
