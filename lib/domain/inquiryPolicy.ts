import type { InquiryStatus, InquiryStatusHistoryEntry } from '../../types/inquiry';

type LegacyInquiryStatus = 'in_progress' | 'resolved' | 'closed';
type AnyInquiryStatus = InquiryStatus | LegacyInquiryStatus;

const LEGACY_TO_CANONICAL: Record<LegacyInquiryStatus, InquiryStatus> = {
  in_progress: 'approved',
  resolved: 'converted',
  closed: 'converted',
};

const ALLOWED_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  new: ['new', 'approved', 'rejected'],
  approved: ['approved', 'contacted', 'rejected'],
  rejected: ['rejected'],
  contacted: ['contacted', 'converted', 'rejected'],
  converted: ['converted'],
};

export function normalizeInquiryStatus(status: unknown): InquiryStatus {
  if (status === 'new' || status === 'approved' || status === 'rejected' || status === 'contacted' || status === 'converted') {
    return status;
  }
  if (status === 'in_progress' || status === 'resolved' || status === 'closed') {
    return LEGACY_TO_CANONICAL[status];
  }
  throw new Error('Invalid inquiry status.');
}

export function assertInquiryTransition(current: AnyInquiryStatus, next: AnyInquiryStatus): { from: InquiryStatus; to: InquiryStatus } {
  const from = normalizeInquiryStatus(current);
  const to = normalizeInquiryStatus(next);
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid inquiry status transition: ${from} -> ${to}.`);
  }
  return { from, to };
}

export function appendInquiryHistory(
  history: unknown,
  transition: { from: InquiryStatus; to: InquiryStatus },
  actorUserId: string,
  note?: string
): InquiryStatusHistoryEntry[] {
  const current = Array.isArray(history) ? (history as InquiryStatusHistoryEntry[]) : [];
  const entry: InquiryStatusHistoryEntry = {
    from: transition.from,
    to: transition.to,
    at: new Date().toISOString(),
    by: actorUserId,
    ...(note && note.trim() ? { note: note.trim() } : {}),
  };
  return [...current, entry];
}
