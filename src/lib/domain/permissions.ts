import { isInstituteStaff } from "./roles";
import type { Role } from "./types";

export type Permission =
  | "view:cockpit"
  | "view:projects"
  | "view:materials"
  | "edit:materials"
  | "edit:lessons"
  | "publish:lessons"
  | "view:paths"
  | "edit:paths"
  | "publish:paths"
  | "assign:paths"
  | "view:observations"
  | "edit:observations"
  | "approve:summary"
  | "view:forms"
  | "view:reports"
  | "edit:reports"
  | "export:reports"
  | "view:admin"
  | "manage:admin"
  | "view:settings";

const matrix: Record<Role, Permission[]> = {
  coach: [
    "view:cockpit",
    "view:projects",
    "view:materials",
    "edit:materials",
    "edit:lessons",
    "publish:lessons",
    "view:paths",
    "edit:paths",
    "publish:paths",
    "assign:paths",
    "view:observations",
    "edit:observations",
    "approve:summary",
    "view:forms",
    "view:reports",
    "edit:reports",
    "export:reports",
    "view:settings",
  ],
  school_leider: [
    "view:cockpit",
    "view:projects",
    "view:materials",
    "view:paths",
    "assign:paths",
    "view:forms",
    "view:reports",
    "export:reports",
    "view:settings",
  ],
  docent: [
    "view:cockpit",
    "view:projects",
    "view:materials",
    "edit:materials",
    "edit:lessons",
    "publish:lessons",
    "view:paths",
    "edit:paths",
    "publish:paths",
    "assign:paths",
    "view:forms",
    "view:settings",
  ],
  admin: [
    "view:cockpit",
    "view:projects",
    "view:materials",
    "edit:materials",
    "edit:lessons",
    "publish:lessons",
    "view:paths",
    "edit:paths",
    "publish:paths",
    "assign:paths",
    "view:observations",
    "view:forms",
    "view:reports",
    "edit:reports",
    "export:reports",
    "view:admin",
    "manage:admin",
    "view:settings",
  ],
  planner: [
    "view:cockpit",
    "view:projects",
    "view:materials",
    "edit:materials",
    "edit:lessons",
    "publish:lessons",
    "view:paths",
    "edit:paths",
    "publish:paths",
    "assign:paths",
    "view:observations",
    "view:forms",
    "view:reports",
    "edit:reports",
    "export:reports",
    "view:admin",
    "view:settings",
  ],
};

export function can(role: Role, permission: Permission) {
  return matrix[role].includes(permission);
}

export function canViewRawObservations(role: Role) {
  return isInstituteStaff(role);
}
