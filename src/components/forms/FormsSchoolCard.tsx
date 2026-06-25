import Link from "next/link";
import { ArrowRight, Layers, LockOpen, MapPin, School } from "lucide-react";
import type { Tenant } from "@/lib/domain/types";
import { TOTAL_FORM_COUNT } from "@/lib/forms/window-summary";
import { INSTRUMENTS } from "@/lib/forms/types";

const instrumentCount = INSTRUMENTS.length;

type ViewMode = "grid" | "list";

function schoolDescription(school: Tenant): string {
  const learners = school.learnerCount.toLocaleString("nl-NL");
  const learnerLabel = school.learnerCount === 1 ? "leerling" : "leerlingen";
  return `${learners} ${learnerLabel} in ${school.region}. Beheer de vragenlijsten voor Lesobservaties en PLC-scan.`;
}

function openFormsLabel(openCount: number | null): string {
  if (openCount === null) return "…";
  return `${openCount}/${TOTAL_FORM_COUNT}`;
}

export function FormsSchoolCard({
  school,
  view = "grid",
  openCount = null,
}: {
  school: Tenant;
  view?: ViewMode;
  openCount?: number | null;
}) {
  const href = `/app/forms/school/${school.id}`;
  const isActive = school.status === "active";
  const hasOpenForms = openCount !== null && openCount > 0;
  const coverTone = isActive ? "school-card__cover--active" : "school-card__cover--setup";

  const cover = (
    <Link href={href} className={`school-card__cover ${coverTone}`} aria-label={school.name}>
      <span className="school-card__cover-icon" aria-hidden>
        <School size={view === "list" ? 28 : 44} strokeWidth={1.25} />
      </span>
    </Link>
  );

  const title = (
    <div className="school-card__name-row">
      <Link href={href} className="school-card__name">
        {school.name}
      </Link>
      {isActive ? (
        <span className="school-card__verified" aria-label="Actieve school">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <circle cx="10" cy="10" r="10" fill="currentColor" />
            <path
              d="M6 10.5L8.5 13L14 7.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : (
        <span className="school-card__status-pill">In opstart</span>
      )}
    </div>
  );

  const description = <p className="school-card__description">{schoolDescription(school)}</p>;

  const meta = (
    <div className="school-card__meta">
      <span className="school-card__chip">
        <MapPin size={16} aria-hidden />
        {school.region}
      </span>
      <span className="school-card__chip">
        <Layers size={16} aria-hidden />
        {instrumentCount} instrumenten
      </span>
      <span className={`school-card__chip${hasOpenForms ? " school-card__chip--open" : ""}`}>
        <LockOpen size={16} aria-hidden />
        {openFormsLabel(openCount)} open
      </span>
    </div>
  );

  const arrow = (
    <Link href={href} className="school-card__arrow" aria-label={`Formulieren voor ${school.name}`}>
      <ArrowRight size={18} aria-hidden />
    </Link>
  );

  if (view === "list") {
    return (
      <article className="school-card school-card--list">
        {cover}
        <div className="school-card__content">
          {title}
          {description}
          <div className="school-card__footer">{meta}</div>
        </div>
        {arrow}
      </article>
    );
  }

  return (
    <article className="school-card">
      {cover}
      <div className="school-card__content">
        {title}
        {description}
        <div className="school-card__footer">
          {meta}
          {arrow}
        </div>
      </div>
    </article>
  );
}
