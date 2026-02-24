import { NextRequest, NextResponse } from 'next/server';
import { assertCanPerform } from '../../../../lib/auth/policy';
import { adminDb } from '../../../../lib/server/firebaseAdmin';
import { requireServerAuthContext } from '../../../../lib/server/requestAuth';
import { sanitizePropertyPatch } from '../../../../lib/server/importValidation.mjs';

export const runtime = 'nodejs';

async function assertCompanyRecord(path: string, id: string, companyId: string): Promise<void> {
  const snap = await adminDb().collection(path).doc(id).get();
  if (!snap.exists) throw new Error(`${path} record not found.`);
  const data = snap.data() as Record<string, unknown>;
  if ((data.companyId as string) !== companyId) throw new Error('Cross-company reference is forbidden.');
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireServerAuthContext(request);
    assertCanPerform(actor, 'property.write');
    const { id } = await context.params;
    const propertyId = typeof id === 'string' ? id.trim() : '';
    if (!propertyId) {
      return NextResponse.json({ error: 'Property id is required.' }, { status: 400 });
    }

    const payload = await request.json();
    const patch = sanitizePropertyPatch(payload);
    if (!patch.ok) {
      return NextResponse.json({ error: patch.error }, { status: 400 });
    }

    const ref = adminDb().collection('properties').doc(propertyId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
    const current = snap.data() as Record<string, unknown>;
    if (!actor.isPlatformSuperadmin && current.companyId !== actor.companyId) {
      return NextResponse.json({ error: 'Cross-company update is forbidden.' }, { status: 403 });
    }

    if (typeof patch.value.agentId === 'string') {
      await assertCompanyRecord('agents', patch.value.agentId, actor.companyId);
    }
    if (typeof patch.value.landlordId === 'string') {
      await assertCompanyRecord('landlords', patch.value.landlordId, actor.companyId);
    }

    await ref.update({
      ...patch.value,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.userId,
      source: 'api_patch',
    });

    return NextResponse.json({ ok: true, propertyId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update property.';
    const status = message.includes('Missing bearer token') ? 401 : message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

