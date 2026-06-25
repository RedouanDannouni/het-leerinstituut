import { FORM_DEFINITIONS } from "./definitions";

export const TOTAL_FORM_COUNT = FORM_DEFINITIONS.length;

export type FormWindowRow = {
  tenant_id: string;
  form_key: string;
  status: string;
};

/** Aantal open formulieren per school (tenant_id → count). */
export function buildOpenCountMap(rows: FormWindowRow[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const row of rows) {
    if (row.status !== "open") continue;
    map[row.tenant_id] = (map[row.tenant_id] ?? 0) + 1;
  }
  return map;
}

export function openCountForTenant(map: Record<string, number>, tenantId: string): number {
  return map[tenantId] ?? 0;
}

export function sumOpenCounts(map: Record<string, number>, tenantIds: string[]): number {
  return tenantIds.reduce((sum, id) => sum + openCountForTenant(map, id), 0);
}
