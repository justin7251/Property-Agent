import { NextRequest, NextResponse } from 'next/server';
import { assertCanAssignRole, assertCanPerform } from '../../../../../lib/auth/policy';
import type { AppRole, CompanyRole } from '../../../../../lib/auth/tenantContext';
import { adminDb } from '../../../../../lib/server/firebaseAdmin';
import {
  enforceRateLimit,
  parseEmail,
  readJsonBody,
  requireBearerAuth,
  securityErrorResponse,
  validateRequestSchema,
} from '../../../../../lib/server/security';

export const runtime = 'nodejs';

type CreateInvitationPayload = {
  email: string;
  role: CompanyRole;
};

function parseCompanyRole(value: unknown): CompanyRole | null {
  if (value === 'owner' || value === 'admin' || value === 'team_lead' || value === 'agent' || value === 'landlord' || value === 'contractor') {
    return value;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireBearerAuth(request);
    assertCanPerform(actor, 'user.role.assign');
    enforceRateLimit(request, { routeKey: 'admin_invite_create', limit: 15, windowMs: 60_000, actor });

    const payload = await readJsonBody<CreateInvitationPayload>(request);
    const parsed = validateRequestSchema(payload, {
      email: { required: true, parse: (value) => parseEmail(value), message: 'Valid email is required.' },
      role: { required: true, parse: (value) => parseCompanyRole(value), message: 'Invalid role.' },
    });
    const email = parsed.email;
    const role = parsed.role;

    assertCanAssignRole(actor, role as AppRole);

    const usersSameEmail = await adminDb().collection('users').where('email', '==', email).get();
    const hasSameCompanyUser = usersSameEmail.docs.some((entry) => (entry.data() as Record<string, unknown>).companyId === actor.companyId);
    if (hasSameCompanyUser) {
      return NextResponse.json({ error: 'User already exists in this company.' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const invitationRef = await adminDb().collection('invitations').add({
      companyId: actor.companyId,
      email,
      role,
      status: 'pending',
      invitedBy: actor.userId,
      createdAt: now,
      updatedAt: now,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const inviteUrl = `${appUrl}/invite/${invitationRef.id}`;

    return NextResponse.json({
      ok: true,
      invitationId: invitationRef.id,
      inviteUrl,
    });
  } catch (error) {
    return securityErrorResponse(error, 'Failed to create invitation.');
  }
}
