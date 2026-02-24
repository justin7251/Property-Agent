import { NextRequest, NextResponse } from 'next/server';
import { assertCanPerform } from '../../../../lib/auth/policy';
import { adminDb } from '../../../../lib/server/firebaseAdmin';
import { sanitizeUserPatch } from '../../../../lib/server/importValidation.mjs';
import { requireServerAuthContext } from '../../../../lib/server/requestAuth';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireServerAuthContext(request);
    assertCanPerform(actor, 'user.role.assign');
    const { id } = await context.params;
    const userId = typeof id === 'string' ? id.trim() : '';
    if (!userId) {
      return NextResponse.json({ error: 'User id is required.' }, { status: 400 });
    }

    const payload = await request.json();
    const patch = sanitizeUserPatch(payload);
    if (!patch.ok) {
      return NextResponse.json({ error: patch.error }, { status: 400 });
    }

    const ref = adminDb().collection('users').doc(userId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    const current = snap.data() as Record<string, unknown>;
    if (!actor.isPlatformSuperadmin && current.companyId !== actor.companyId) {
      return NextResponse.json({ error: 'Cross-company update is forbidden.' }, { status: 403 });
    }

    await ref.update({
      ...patch.value,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.userId,
      source: 'api_patch',
    });

    return NextResponse.json({ ok: true, userId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user.';
    const status = message.includes('Missing bearer token') ? 401 : message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

