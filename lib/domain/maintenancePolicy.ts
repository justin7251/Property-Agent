import type { AppRole } from '../auth/tenantContext';
import type { MaintenancePriority, MaintenanceStatus, MaintenanceStatusHistoryEntry } from '../../types/maintenance';

const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  new: ['new', 'assigned'],
  assigned: ['assigned', 'in_progress'],
  in_progress: ['in_progress', 'completed'],
  completed: ['completed'],
};

export function normalizeMaintenancePriority(value: unknown): MaintenancePriority {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') return value;
  throw new Error('Invalid maintenance priority.');
}

export function normalizeMaintenanceStatus(value: unknown): MaintenanceStatus {
  if (value === 'new' || value === 'assigned' || value === 'in_progress' || value === 'completed') return value;
  throw new Error('Invalid maintenance status.');
}

export function assertMaintenanceTransition(current: unknown, next: unknown): { from: MaintenanceStatus; to: MaintenanceStatus } {
  const from = normalizeMaintenanceStatus(current);
  const to = normalizeMaintenanceStatus(next);
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid maintenance status transition: ${from} -> ${to}.`);
  }
  return { from, to };
}

export function appendMaintenanceHistory(
  history: unknown,
  transition: { from: MaintenanceStatus; to: MaintenanceStatus },
  actorUserId: string,
  note?: string
): MaintenanceStatusHistoryEntry[] {
  const existing = Array.isArray(history) ? (history as MaintenanceStatusHistoryEntry[]) : [];
  const entry: MaintenanceStatusHistoryEntry = {
    from: transition.from,
    to: transition.to,
    at: new Date().toISOString(),
    by: actorUserId,
    ...(note && note.trim() ? { note: note.trim() } : {}),
  };
  return [...existing, entry];
}

export function canAssignMaintenance(role: AppRole): boolean {
  return role === 'superadmin' || role === 'owner' || role === 'admin' || role === 'team_lead';
}

export function canUpdateAssignedMaintenanceStatus(
  role: AppRole,
  actorUserId: string,
  assignedToUserId: string | undefined,
  transition: { from: MaintenanceStatus; to: MaintenanceStatus }
): boolean {
  if (role === 'superadmin' || role === 'owner' || role === 'admin' || role === 'team_lead') {
    return true;
  }
  if (role !== 'agent' && role !== 'contractor') {
    return false;
  }
  if (!assignedToUserId || assignedToUserId !== actorUserId) {
    return false;
  }
  return (
    (transition.from === 'assigned' && transition.to === 'in_progress') ||
    (transition.from === 'in_progress' && transition.to === 'completed')
  );
}
