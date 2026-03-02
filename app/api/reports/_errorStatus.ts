import { reportErrorStatus as sharedReportErrorStatus } from '../../../lib/server/reportErrorStatus.mjs';

export function reportErrorStatus(message: string): number {
  return sharedReportErrorStatus(message);
}
