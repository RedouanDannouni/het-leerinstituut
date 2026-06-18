import type { AuditEvent, SessionContext } from "./types";

const auditKey = "hli.audit-events";

export function readClientAuditEvents(): AuditEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(auditKey) ?? "[]") as AuditEvent[];
  } catch {
    return [];
  }
}

export function appendClientAuditEvent(context: SessionContext, action: string, target: string) {
  if (typeof window === "undefined") return;
  const next: AuditEvent = {
    id: `audit-${Date.now()}`,
    tenantId: context.user.tenantId,
    actorId: context.user.id,
    action,
    target,
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(auditKey, JSON.stringify([next, ...readClientAuditEvents()]));
}
