import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/server/firebaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
  const now = new Date().toISOString();
  try {
    // Verifies Admin SDK auth initialization.
    await adminAuth().listUsers(1);
    // Verifies Admin SDK Firestore access with a bounded read.
    await adminDb().collection('users').limit(1).get();

    return NextResponse.json({
      ok: true,
      service: 'reporting',
      checkedAt: now,
      checks: {
        adminAuth: 'ok',
        adminFirestore: 'ok',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown reporting health error.';
    return NextResponse.json(
      {
        ok: false,
        service: 'reporting',
        checkedAt: now,
        checks: {
          adminAuth: 'failed',
          adminFirestore: 'failed',
        },
        error: message,
      },
      { status: 500 }
    );
  }
}
