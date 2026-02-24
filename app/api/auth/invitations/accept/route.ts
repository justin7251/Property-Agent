import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/server/firebaseAdmin';
import { requireServerAuthContext } from '../../../../../lib/server/requestAuth';

export const runtime = 'nodejs';

type AcceptInvitationPayload = {
  token: string;
};

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase().trim() : '';
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireServerAuthContext(request);
    const payload = (await request.json()) as AcceptInvitationPayload;
    const token = typeof payload.token === 'string' ? payload.token.trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });
    }

    const invitationRef = adminDb().collection('invitations').doc(token);
    const invitationSnap = await invitationRef.get();
    if (!invitationSnap.exists) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    const invitation = invitationSnap.data() as Record<string, unknown>;
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation is no longer valid.' }, { status: 410 });
    }

    const invitationEmail = normalizeEmail(invitation.email);
    if (!invitationEmail || actor.email !== invitationEmail) {
      return NextResponse.json({ error: 'Invitation email does not match authenticated user.' }, { status: 403 });
    }

    const invitationCompanyId = typeof invitation.companyId === 'string' ? invitation.companyId : '';
    const actorRef = adminDb().collection('users').doc(actor.userId);
    const actorSnap = await actorRef.get();
    if (!actorSnap.exists) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    // Enforce company binding from invitation at acceptance time.
    await actorRef.set(
      {
        companyId: invitationCompanyId,
        role: invitation.role,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await invitationRef.update({
      status: 'accepted',
      acceptedBy: actor.userId,
      acceptedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept invitation.';
    const status = message.includes('Missing bearer token') ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
