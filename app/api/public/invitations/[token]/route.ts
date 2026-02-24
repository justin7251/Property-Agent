import { NextRequest, NextResponse } from 'next/server';
import type { CompanyRole } from '../../../../../lib/auth/tenantContext';
import { adminDb } from '../../../../../lib/server/firebaseAdmin';

export const runtime = 'nodejs';

function parseCompanyRole(value: unknown): CompanyRole | null {
  if (value === 'owner' || value === 'admin' || value === 'team_lead' || value === 'agent' || value === 'landlord' || value === 'contractor') {
    return value;
  }
  return null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    if (!token?.trim()) {
      return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });
    }

    const invitationSnap = await adminDb().collection('invitations').doc(token.trim()).get();
    if (!invitationSnap.exists) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }
    const data = invitationSnap.data() as Record<string, unknown>;
    if (data.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation is no longer valid.' }, { status: 410 });
    }
    const role = parseCompanyRole(data.role);
    if (!role) {
      return NextResponse.json({ error: 'Invitation role is invalid.' }, { status: 400 });
    }

    return NextResponse.json({
      id: invitationSnap.id,
      companyId: typeof data.companyId === 'string' ? data.companyId : '',
      email: typeof data.email === 'string' ? data.email : '',
      role,
      status: 'pending',
      invitedBy: typeof data.invitedBy === 'string' ? data.invitedBy : '',
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read invitation.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
