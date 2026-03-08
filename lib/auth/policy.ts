import type { AppRole, TenantContext } from './tenantContext';

export type PolicyAction =
  | 'property.read'
  | 'property.write'
  | 'inquiry.read'
  | 'inquiry.write'
  | 'agent.read'
  | 'agent.write'
  | 'landlord.read'
  | 'landlord.write'
  | 'report.read'
  | 'notification.read'
  | 'company.settings.update'
  | 'user.role.assign'
  | 'maintenance.assign'
  | 'maintenance.read.assigned'
  | 'maintenance.update.assigned_status'
  | 'contact.read.maintenance_related';

type PolicyOptions = {
  assignedToUserId?: string;
  requestedFields?: string[];
};

const CONTRACTOR_CONTACT_FIELDS = new Set(['tenantName', 'tenantPhone', 'landlordName', 'landlordPhone']);

const ROLE_PERMISSIONS: Record<AppRole, PolicyAction[]> = {
  superadmin: [
    'property.read',
    'property.write',
    'inquiry.read',
    'inquiry.write',
    'agent.read',
    'agent.write',
    'landlord.read',
    'landlord.write',
    'report.read',
    'notification.read',
    'company.settings.update',
    'user.role.assign',
    'maintenance.assign',
    'maintenance.read.assigned',
    'maintenance.update.assigned_status',
    'contact.read.maintenance_related',
  ],
  owner: [
    'property.read',
    'property.write',
    'inquiry.read',
    'inquiry.write',
    'agent.read',
    'agent.write',
    'landlord.read',
    'landlord.write',
    'report.read',
    'notification.read',
    'company.settings.update',
    'user.role.assign',
    'maintenance.assign',
    'maintenance.read.assigned',
    'maintenance.update.assigned_status',
    'contact.read.maintenance_related',
  ],
  admin: [
    'property.read',
    'property.write',
    'inquiry.read',
    'inquiry.write',
    'agent.read',
    'agent.write',
    'landlord.read',
    'landlord.write',
    'report.read',
    'notification.read',
    'company.settings.update',
    'user.role.assign',
    'maintenance.assign',
    'maintenance.read.assigned',
    'maintenance.update.assigned_status',
    'contact.read.maintenance_related',
  ],
  team_lead: [
    'property.read',
    'property.write',
    'inquiry.read',
    'inquiry.write',
    'agent.read',
    'maintenance.assign',
    'report.read',
    'notification.read',
    'maintenance.read.assigned',
    'maintenance.update.assigned_status',
    'contact.read.maintenance_related',
  ],
  agent: [
    'property.read',
    'property.write',
    'inquiry.read',
    'inquiry.write',
    'notification.read',
    'maintenance.read.assigned',
    'maintenance.update.assigned_status',
    'contact.read.maintenance_related',
  ],
  landlord: ['property.read', 'inquiry.read', 'landlord.read', 'notification.read', 'maintenance.read.assigned', 'contact.read.maintenance_related'],
  contractor: ['notification.read', 'maintenance.read.assigned', 'maintenance.update.assigned_status', 'contact.read.maintenance_related'],
};

function hasActionPermission(context: TenantContext, action: PolicyAction): boolean {
  if (context.isPlatformSuperadmin || context.role === 'superadmin') return true;

  if (context.permissions && context.permissions[action] === true) return true;
  if (context.permissions && context.permissions[action] === false) return false;

  const granted = ROLE_PERMISSIONS[context.role] || [];
  return granted.includes(action);
}

function contractorAssignmentCheck(context: TenantContext, options: PolicyOptions): boolean {
  if (context.role !== 'contractor') return true;
  if (!options.assignedToUserId) return false;
  return options.assignedToUserId === context.userId;
}

function contractorContactFieldCheck(context: TenantContext, options: PolicyOptions): boolean {
  if (context.role !== 'contractor') return true;
  if (!options.requestedFields || options.requestedFields.length === 0) return false;
  return options.requestedFields.every((field) => CONTRACTOR_CONTACT_FIELDS.has(field));
}

export function canPerform(context: TenantContext, action: PolicyAction, options: PolicyOptions = {}): boolean {
  if (!hasActionPermission(context, action)) return false;

  if (action === 'maintenance.read.assigned' || action === 'maintenance.update.assigned_status') {
    return contractorAssignmentCheck(context, options);
  }

  if (action === 'contact.read.maintenance_related') {
    return contractorAssignmentCheck(context, options) && contractorContactFieldCheck(context, options);
  }

  return true;
}

export function assertCanPerform(context: TenantContext, action: PolicyAction, options: PolicyOptions = {}): void {
  if (!canPerform(context, action, options)) {
    throw new Error(`Forbidden: missing permission for ${action}.`);
  }
}

export function canAssignRole(actorRole: AppRole, targetRole: AppRole): boolean {
  if (actorRole === 'superadmin') return true;
  if (targetRole === 'superadmin') return false;

  if (actorRole === 'owner') {
    return targetRole === 'admin' || targetRole === 'team_lead' || targetRole === 'agent' || targetRole === 'landlord' || targetRole === 'contractor';
  }
  if (actorRole === 'admin') {
    return targetRole === 'team_lead' || targetRole === 'agent' || targetRole === 'landlord' || targetRole === 'contractor';
  }
  if (actorRole === 'team_lead') {
    return targetRole === 'agent' || targetRole === 'landlord' || targetRole === 'contractor';
  }
  return false;
}

export function assertCanAssignRole(context: TenantContext, targetRole: AppRole): void {
  if (!canAssignRole(context.role, targetRole)) {
    throw new Error(`Forbidden: cannot assign role ${targetRole}.`);
  }
}

export function filterMaintenanceContactFields(
  context: TenantContext,
  contact: Record<string, unknown>,
  options: PolicyOptions
): Record<string, unknown> {
  assertCanPerform(context, 'contact.read.maintenance_related', options);
  if (context.isPlatformSuperadmin || context.role === 'superadmin' || context.role !== 'contractor') {
    return { ...contact };
  }

  const filtered: Record<string, unknown> = {};
  for (const field of CONTRACTOR_CONTACT_FIELDS) {
    if (field in contact) {
      filtered[field] = contact[field];
    }
  }
  return filtered;
}
