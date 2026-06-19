import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderKanban,
  Home,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Permission } from "@/lib/domain/permissions";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
};

export type AppNavGroup = {
  label: string;
  items: AppNavItem[];
};

export const appNavGroups: AppNavGroup[] = [
  {
    label: "Hoofdmenu",
    items: [
      { href: "/app/cockpit", label: "Cockpit", icon: Home, permission: "view:cockpit" },
      { href: "/app/projects", label: "Projecten", icon: FolderKanban, permission: "view:projects" },
      { href: "/app/materials", label: "Lesmateriaal", icon: BookOpen, permission: "view:materials" },
      { href: "/app/observations", label: "Observaties", icon: ClipboardCheck, permission: "view:observations" },
      { href: "/app/forms", label: "Vragenlijsten", icon: ClipboardList, permission: "view:forms" },
      { href: "/app/reports", label: "Rapporten", icon: FileText, permission: "view:reports" },
    ],
  },
  {
    label: "Beheer",
    items: [{ href: "/app/admin", label: "Beheer", icon: ShieldCheck, permission: "view:admin" }],
  },
];
