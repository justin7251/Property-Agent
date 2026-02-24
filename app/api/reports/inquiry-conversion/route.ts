import { NextRequest, NextResponse } from 'next/server';
import { assertCanReadReports, getInquiryConversionReport, parseReportDateRange } from '../../../../lib/server/reporting';
import { requireServerAuthContext } from '../../../../lib/server/requestAuth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const actor = await requireServerAuthContext(request);
    assertCanReadReports(actor);
    const filters = parseReportDateRange(request);
    const data = await getInquiryConversionReport(actor, filters);
    return NextResponse.json({ data, filters });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load inquiry conversion report.';
    const status = message.includes('Missing bearer token') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
