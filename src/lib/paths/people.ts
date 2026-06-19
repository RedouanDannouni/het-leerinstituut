"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { users as seedUsers } from "@/lib/domain/seed-data";
import type { Role, TenantId } from "@/lib/domain/types";

export interface Person {
  id: string;
  name: string;
  email: string;
  role: Role;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

export function personInitials(person: Person): string {
  return initials(person.name);
}

/** Profielen binnen de tenant. DB-profiles wanneer ingelogd, anders seed-data. */
export async function listPeople(tenantId: TenantId): Promise<Person[]> {
  if (typeof window !== "undefined") {
    try {
      const supabase = createSupabaseBrowserClient();
      const session = await Promise.race([
        supabase.auth.getSession().then((result) => result.data.session),
        new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 3000)),
      ]);
      if (session?.user) {
        const { data, error } = await supabase.from("profiles").select("id, email, full_name, role").eq("tenant_id", tenantId);
        if (!error && data) {
          return data.map((row) => ({
            id: row.id,
            name: row.full_name ?? row.email ?? "Gebruiker",
            email: row.email ?? "",
            role: row.role as Role,
          }));
        }
      }
    } catch {
      // val terug op seed-data
    }
  }
  return seedUsers
    .filter((u) => u.tenantId === tenantId)
    .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
}
