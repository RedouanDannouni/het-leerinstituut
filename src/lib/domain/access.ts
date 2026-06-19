import { isInstituteStaff } from "./roles";
import { tenants } from "./seed-data";
import type { SessionContext, TenantId, User } from "./types";

export function getTenantForUser(user: User) {
  const tenant = tenants.find((item) => item.id === user.tenantId);
  if (!tenant) {
    throw new Error(`Tenant not found for user ${user.id}`);
  }
  return tenant;
}

export function createSessionContext(user: User): SessionContext {
  return { user, tenant: getTenantForUser(user) };
}

export function canAccessTenant(context: SessionContext, tenantId: TenantId) {
  return isInstituteStaff(context.user.role) || context.user.tenantId === tenantId;
}

export function assertTenantAccess(context: SessionContext, tenantId: TenantId) {
  if (!canAccessTenant(context, tenantId)) {
    throw new Error("Geen toegang tot deze schoolomgeving.");
  }
}
