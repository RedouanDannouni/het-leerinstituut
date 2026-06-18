import type { Role } from "./types";

export type Permission =
  | "view:cockpit"
  | "view:projects"
  | "view:materials"
  | "edit:materials"
  | "view:observations"
  | "edit:observations"
  | "approve:summary"
  | "view:reports"
  | "edit:reports"
  | "export:reports"
  | "view:admin"
  | "manage:admin"
  | "view:settings";

const matrix: Record<Role, Permission[]> = {
  school_opleider: [
    "view:cockpit",
    "view:projects",
    "view:materials",
    "edit:materials",
    "view:observations",
    "edit:observations",
    "approve:summary",
    "view:reports",
    "edit:reports",
    "export:reports",
    "view:settings",
  ],
  school_leider: ["view:cockpit", "view:projects", "view:materials", "view:reports", "export:reports", "view:settings"],
  docent: ["view:cockpit", "view:projects", "view:materials", "edit:materials", "view:settings"],
  admin: [
    "view:cockpit",
    "view:projects",
    "view:materials",
    "view:observations",
    "view:reports",
    "edit:reports",
    "export:reports",
    "view:admin",
    "manage:admin",
    "view:settings",
  ],
};

export function can(role: Role, permission: Permission) {
  return matrix[role].includes(permission);
}

export function canViewRawObservations(role: Role) {
  return role === "school_opleider" || role === "admin";
}
