import { NextRequest, NextResponse } from 'next/server';
import { assertCanAssignRole } from '../../../../../lib/auth/policy';
import type { AppRole } from '../../../../../lib/auth/tenantContext';
import { adminDb } from '../../../../../lib/server/firebaseAdmin';
import {
  enforceRateLimit,
  parseString,
  readJsonBody,
  requireBearerAuth,
  requireTenantScope,
  securityErrorResponse,
  validateRequestSchema,
} from '../../../../../lib/server/security';

export const runtime = 'nodejs';

type RoleAssignmentPayload = {
  targetUserId: string;
  role: AppRole;
};

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

export async function POST(request: NextRequest) {
  try {
    const actor = await requireBearerAuth(request);
    enforceRateLimit(request, { routeKey: 'admin_user_role_assign', limit: 25, windowMs: 60_000, actor });
    const payload = await readJsonBody<RoleAssignmentPayload>(request);
    const parsed = validateRequestSchema(payload, {
      targetUserId: { required: true, parse: (value) => parseString(value), message: 'targetUserId is required.' },
      role: { required: true, parse: (value) => parseRole(value), message: 'Invalid target role.' },
    });
    const targetUserId = parsed.targetUserId;
    const targetRole = parsed.role;
    if (!targetRole || targetRole === 'superadmin') {
      return NextResponse.json({ error: 'Invalid target role.' }, { status: 400 });
    }

    // Enforce hierarchy server-side.
    assertCanAssignRole(actor, targetRole);

    const targetRef = adminDb().collection('users').doc(targetUserId);
    const targetSnap = await targetRef.get();
    if (!targetSnap.exists) {
      return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    const targetData = targetSnap.data() as Record<string, unknown>;
    const targetCompanyId = typeof targetData.companyId === 'string' ? targetData.companyId : '';
    requireTenantScope(actor, targetCompanyId, 'Cross-company role assignment is forbidden.');

    await targetRef.update({
      role: targetRole,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.userId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return securityErrorResponse(error, 'Failed to assign role.');
  }
}
