import type { Role } from "./types";

export const roleLabels: Record<Role, string> = {
  coach: "Coach",
  school_leider: "Schoolleider",
  docent: "Docent",
  admin: "Admin",
  planner: "Planner",
};

export const roleIntents: Record<Role, string> = {
  coach: "Snel zien welke observaties vandaag aandacht vragen.",
  school_leider: "Voortgang en gespreksonderwerpen sturen zonder ruwe observatiedata.",
  docent: "Eigen materiaal, feedback en afspraken ontwikkelgericht volgen.",
  admin: "Stuur en bewaak de trajecten over alle scholen heen.",
  planner: "Stuur je trajecten — zie waar het schuurt en waar je heen moet.",
};

/**
 * Instituutsrollen werken cross-tenant: zij begeleiden/plannen over álle scholen
 * heen en zijn niet aan één schoolomgeving gebonden. School_leider en docent zijn
 * juist strikt aan hun eigen school gekoppeld.
 *
 * Dit is de UI-/domeinspiegel van de database-helper `public.is_institute_staff()`
 * (zie de RLS-migratie). De database blijft de waarheid via RLS.
 */
export const instituteRoles: Role[] = ["coach", "planner", "admin"];

export function isInstituteStaff(role: Role): boolean {
  return instituteRoles.includes(role);
}
