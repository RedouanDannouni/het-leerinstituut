"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Building2, LayoutGrid, List, Search } from "lucide-react";
import { useRequireSession } from "@/lib/auth/session";
import { can } from "@/lib/domain/permissions";
import { isInstituteStaff } from "@/lib/domain/roles";
import { tenants } from "@/lib/domain/seed-data";
import {
  buildOpenCountMap,
  openCountForTenant,
  sumOpenCounts,
  TOTAL_FORM_COUNT,
} from "@/lib/forms/window-summary";
import { listFormWindows } from "@/lib/forms/window-store";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Form";
import { FormsSchoolCard } from "@/components/forms/FormsSchoolCard";

type SortKey = "title" | "status" | "open";
type ViewMode = "grid" | "list";
type StatusFilter = "all" | "active" | "setup";
type FormsFilter = "all" | "has_open" | "all_closed";

const ALL_SCHOOLS = tenants.filter((tenant) => tenant.id !== "instituut");
const SCHOOL_IDS = ALL_SCHOOLS.map((school) => school.id);

export default function FormsIndexPage() {
  const { context } = useRequireSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("title");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [formsFilter, setFormsFilter] = useState<FormsFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [openCounts, setOpenCounts] = useState<Record<string, number>>({});
  const [windowsLoading, setWindowsLoading] = useState(true);

  const role = context?.user.role;
  const tenantId = context?.user.tenantId;
  const institute = role ? isInstituteStaff(role) : false;

  // Schoolgebruikers slaan de kiezer over: zij werken altijd binnen hun eigen school.
  useEffect(() => {
    if (role && !institute && tenantId) {
      router.replace(`/app/forms/school/${tenantId}`);
    }
  }, [role, institute, tenantId, router]);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await listFormWindows(SCHOOL_IDS);
      if (!active) return;
      setOpenCounts(buildOpenCountMap(data));
      setWindowsLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const regions = useMemo(() => {
    const set = new Set<string>();
    ALL_SCHOOLS.forEach((school) => set.add(school.region));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "nl"));
  }, []);

  const hasActiveFilters =
    query.trim().length > 0 ||
    region !== "all" ||
    status !== "all" ||
    formsFilter !== "all";

  const visibleSchools = useMemo(() => {
    let result = ALL_SCHOOLS.filter((school) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        school.name.toLowerCase().includes(q) ||
        school.region.toLowerCase().includes(q);
      const matchesRegion = region === "all" || school.region === region;
      const matchesStatus = status === "all" || school.status === status;
      const open = openCountForTenant(openCounts, school.id);
      const matchesForms =
        windowsLoading ||
        formsFilter === "all" ||
        (formsFilter === "has_open" && open > 0) ||
        (formsFilter === "all_closed" && open === 0);
      return matchesQuery && matchesRegion && matchesStatus && matchesForms;
    });

    result = [...result].sort((a, b) => {
      if (sort === "open") {
        const diff = openCountForTenant(openCounts, b.id) - openCountForTenant(openCounts, a.id);
        return diff !== 0 ? diff : a.name.localeCompare(b.name, "nl");
      }
      if (sort === "status") {
        const order = { active: 0, setup: 1, paused: 2 } as const;
        const diff = order[a.status] - order[b.status];
        return diff !== 0 ? diff : a.name.localeCompare(b.name, "nl");
      }
      return a.name.localeCompare(b.name, "nl");
    });

    return result;
  }, [query, region, status, formsFilter, sort, openCounts, windowsLoading]);

  const schoolCountLabel = useMemo(() => {
    const totalSchools = ALL_SCHOOLS.length;
    const visibleCount = visibleSchools.length;
    const schoolNoun = totalSchools === 1 ? "school" : "scholen";

    const schoolPart =
      visibleCount !== totalSchools || hasActiveFilters
        ? `${visibleCount} van ${totalSchools} ${schoolNoun}`
        : `${totalSchools} ${schoolNoun}`;

    if (windowsLoading) return schoolPart;

    const visibleIds = visibleSchools.map((school) => school.id);
    const openInView = sumOpenCounts(openCounts, visibleIds);
    const openEverywhere = sumOpenCounts(openCounts, SCHOOL_IDS);
    const formNoun = openInView === 1 ? "formulier" : "formulieren";

    if (hasActiveFilters) {
      const maxInView = visibleCount * TOTAL_FORM_COUNT;
      return `${schoolPart} · ${openInView} van ${maxInView} ${formNoun} open`;
    }

    return `${schoolPart} · ${openEverywhere} ${formNoun} open`;
  }, [visibleSchools, hasActiveFilters, windowsLoading, openCounts]);

  if (!context) return null;
  if (!can(context.user.role, "view:forms")) notFound();
  if (!institute) return null;

  return (
    <div className="page materials-page forms-page">
      <div className="stack forms-stack">
        <header className="materials-header">
          <div className="materials-header__title">
            <p className="eyebrow">Kwaliteitsmonitor</p>
            <div className="materials-header__heading">
              <h1>Kies een school</h1>
              <span className="materials-header__count">{schoolCountLabel}</span>
            </div>
            <p className="muted forms-header-lead">
              Je zet de vragenlijsten per school uit. Kies eerst een school; daarna open of sluit je de zes
              formulieren van de twee instrumenten (Lesobservaties en PLC-scan).
            </p>
          </div>

          <div className="materials-header__controls">
            <label className="materials-header__search">
              <Search className="icon" size={17} aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Zoek op schoolnaam of regio…"
                aria-label="Zoeken"
              />
            </label>

            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              aria-label="Sorteren"
              className="materials-header__control materials-header__select"
            >
              <option value="title">Schoolnaam (A–Z)</option>
              <option value="status">Status</option>
              <option value="open">Meeste open</option>
            </Select>

            <Select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              aria-label="Regio"
              className="materials-header__control materials-header__select"
            >
              <option value="all">Alle regio&apos;s</option>
              {regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              aria-label="Status"
              className="materials-header__control materials-header__select"
            >
              <option value="all">Alle statussen</option>
              <option value="active">Actief</option>
              <option value="setup">In opstart</option>
            </Select>

            <Select
              value={formsFilter}
              onChange={(event) => setFormsFilter(event.target.value as FormsFilter)}
              aria-label="Formulieren"
              className="materials-header__control materials-header__select"
            >
              <option value="all">Alle formulieren</option>
              <option value="has_open">Heeft open formulieren</option>
              <option value="all_closed">Alles gesloten</option>
            </Select>

            <div className="materials-header__toggle" role="group" aria-label="Weergave">
              <button
                type="button"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={16} aria-hidden />
                Grid
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
              >
                <List size={16} aria-hidden />
                Lijst
              </button>
            </div>
          </div>
        </header>

        {visibleSchools.length ? (
          <div className={`course-grid${viewMode === "list" ? " course-grid--list" : ""}`}>
            {visibleSchools.map((school) => (
              <FormsSchoolCard
                key={school.id}
                school={school}
                view={viewMode}
                openCount={windowsLoading ? null : openCountForTenant(openCounts, school.id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="lesson-empty">
              <span className="lesson-empty-icon" aria-hidden>
                <Building2 size={26} />
              </span>
              <h3>Geen scholen gevonden</h3>
              <p className="muted">Pas je zoekterm of filters aan om een school te vinden.</p>
            </div>
          </Card>
        )}

        <aside className="forms-notice">
          <Building2 aria-hidden size={18} />
          <p>
            Je beheert nu vanuit <strong>{context.tenant.name}</strong>. Wat je openzet, wordt zichtbaar voor de
            betreffende school; leerlingen vullen anoniem in via een deellink.
          </p>
        </aside>
      </div>
    </div>
  );
}
