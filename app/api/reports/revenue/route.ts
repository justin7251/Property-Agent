import { NextRequest, NextResponse } from 'next/server';
import { assertCanReadReports, getRevenueReport } from '../../../../lib/server/reporting';
import { requireServerAuthContext } from '../../../../lib/server/requestAuth';
import { reportErrorStatus } from '../_errorStatus';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const actor = await requireServerAuthContext(request);
    assertCanReadReports(actor);
    const data = await getRevenueReport(actor);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load revenue report.';
    const status = reportErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}
