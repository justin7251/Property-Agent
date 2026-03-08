export type CompanyRole = 'owner' | 'admin' | 'team_lead' | 'agent' | 'landlord' | 'contractor';
export type PlatformRole = 'superadmin';
export type AppRole = CompanyRole | PlatformRole;
export type PermissionOverrides = Record<string, boolean>;

export type TenantContext = {
  userId: string;
  companyId: string;
  role: AppRole;
  permissions?: PermissionOverrides;
  isPlatformSuperadmin?: boolean;
};

export function normalizeCompanyId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function requireTenantCompanyId(value: unknown): string {
  const companyId = normalizeCompanyId(value);
  if (!companyId) {
    throw new Error('Tenant context missing companyId.');
  }
  return companyId;
}

export function withCompanyScope<T extends Record<string, unknown>>(data: T, companyId: string): T & { companyId: string } {
  return { ...data, companyId };
}
