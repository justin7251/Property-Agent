import { NextRequest, NextResponse } from 'next/server';
import { assertCanAssignRole } from '../../../../../lib/auth/policy';
import type { AppRole } from '../../../../../lib/auth/tenantContext';
import { adminDb } from '../../../../../lib/server/firebaseAdmin';
import { requireServerAuthContext } from '../../../../../lib/server/requestAuth';

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
    const actor = await requireServerAuthContext(request);
    const payload = (await request.json()) as RoleAssignmentPayload;
    const targetUserId = typeof payload.targetUserId === 'string' ? payload.targetUserId.trim() : '';
    const targetRole = parseRole(payload.role);

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required.' }, { status: 400 });
    }
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
    if (!actor.isPlatformSuperadmin && targetCompanyId !== actor.companyId) {
      return NextResponse.json({ error: 'Cross-company role assignment is forbidden.' }, { status: 403 });
    }

    await targetRef.update({
      role: targetRole,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.userId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to assign role.';
    const status = message.includes('Forbidden') ? 403 : message.includes('Missing bearer token') ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
