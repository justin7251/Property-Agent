import { NextRequest, NextResponse } from 'next/server';
import { assertCanReadReports, getInquiryConversionReport, parseReportDateRange } from '../../../../lib/server/reporting';
import { requireServerAuthContext } from '../../../../lib/server/requestAuth';
import { reportErrorStatus } from '../_errorStatus';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const actor = await requireServerAuthContext(request);
    assertCanReadReports(actor);
    const filters = parseReportDateRange(request);
    const data = await getInquiryConversionReport(actor, filters);
    return NextResponse.json({ data, filters });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load inquiry funnel report.';
    const status = reportErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}
