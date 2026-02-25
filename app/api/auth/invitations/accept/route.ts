import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/server/firebaseAdmin';
import {
  enforceRateLimit,
  parseString,
  readJsonBody,
  requireBearerAuth,
  securityErrorResponse,
  validateRequestSchema,
} from '../../../../../lib/server/security';

export const runtime = 'nodejs';

type AcceptInvitationPayload = {
  token: string;
};

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase().trim() : '';
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireBearerAuth(request);
    enforceRateLimit(request, { routeKey: 'auth_invitation_accept', limit: 20, windowMs: 60_000, actor });
    const payload = await readJsonBody<AcceptInvitationPayload>(request);
    const parsed = validateRequestSchema(payload, {
      token: { required: true, parse: (value) => parseString(value), message: 'Invitation token is required.' },
    });
    const token = parsed.token;

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
    return securityErrorResponse(error, 'Failed to accept invitation.');
  }
}
