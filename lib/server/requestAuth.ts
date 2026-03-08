import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from './firebaseAdmin';
import type { AppRole, PermissionOverrides, TenantContext } from '../auth/tenantContext';

export type ServerAuthContext = TenantContext & {
  email: string;
};

function firstNonEmptyString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function parseRole(value: unknown): AppRole | null {
  if (
    value === 'superadmin' ||
    value === 'owner' ||
    value === 'admin' ||
    value === 'team_lead' ||
    value === 'agent' ||
    value === 'landlord' ||
    value === 'contractor'
  ) {
    return value;
  }
  return null;
}

export async function requireServerAuthContext(request: NextRequest): Promise<ServerAuthContext> {
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!bearer) {
    throw new Error('Missing bearer token.');
  }

  const decoded = await adminAuth().verifyIdToken(bearer);
  const actorUid = decoded.uid;
  const actorEmail = typeof decoded.email === 'string' ? decoded.email.toLowerCase().trim() : '';
  const actorSnap = await adminDb().collection('users').doc(actorUid).get();
  if (!actorSnap.exists) {
    throw new Error('Actor profile not found.');
  }

  const actor = actorSnap.data() as Record<string, unknown>;
  const role = parseRole(actor.role);
  if (!role) throw new Error('Actor role is invalid.');
  // Support legacy user docs and token claims that may store company id under alternate keys.
  const companyId =
    firstNonEmptyString(actor.companyId, actor.company_id, decoded.companyId, decoded.company_id) || 'default';

  return {
    userId: actorUid,
    companyId,
    role,
    email: actorEmail,
    permissions: (actor.permissions && typeof actor.permissions === 'object' ? (actor.permissions as PermissionOverrides) : undefined),
    isPlatformSuperadmin: actor.isPlatformSuperadmin === true || role === 'superadmin',
  };
}
