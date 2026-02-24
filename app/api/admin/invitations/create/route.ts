import { NextRequest, NextResponse } from 'next/server';
import { assertCanAssignRole, assertCanPerform } from '../../../../../lib/auth/policy';
import type { AppRole, CompanyRole } from '../../../../../lib/auth/tenantContext';
import { adminDb } from '../../../../../lib/server/firebaseAdmin';
import { requireServerAuthContext } from '../../../../../lib/server/requestAuth';

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

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase().trim() : '';
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireServerAuthContext(request);
    assertCanPerform(actor, 'user.role.assign');

    const payload = (await request.json()) as CreateInvitationPayload;
    const email = normalizeEmail(payload.email);
    const role = parseCompanyRole(payload.role);

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

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
    const message = error instanceof Error ? error.message : 'Failed to create invitation.';
    const status = message.includes('Missing bearer token') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
