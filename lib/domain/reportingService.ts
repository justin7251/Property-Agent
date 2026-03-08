import type { NextRequest } from 'next/server';
import { normalizeInquiryStatus } from './inquiryPolicy';
import { assertCanPerform } from '../auth/policy';
import { adminDb } from '../server/firebaseAdmin';
import type { ServerAuthContext } from '../server/requestAuth';
import type { AgentPerformance, InquiryConversionReport, OccupancyReport, PaymentsReport, RevenueReport } from '../../types/report';
import type { MaintenanceTurnaroundReport, ReportFilters } from '../../types/reporting';

type InquiryDoc = {
  id: string;
  agentId?: string;
  propertyId?: string;
  date?: string;
  createdAt?: string;
  status?: unknown;
};

type AgentDoc = {
  id: string;
  name?: string;
  totalSales?: unknown;
  closedDeals?: unknown;
};

function parseFiniteNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function parseIsoDate(value: string): number | null {
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

function getDateFromDoc(doc: Record<string, unknown>): string | null {
  const value = doc.date ?? doc.createdAt ?? doc.updatedAt ?? doc.paidAt ?? doc.dueDate ?? doc.completedAt;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function inRange(value: string | null, filters: ReportFilters): boolean {
  if (!value) return filters.from === null && filters.to === null;
  const current = parseIsoDate(value);
  if (current === null) return false;

  if (filters.from) {
    const min = parseIsoDate(filters.from);
    if (min !== null && current < min) return false;
  }
  if (filters.to) {
    const max = parseIsoDate(filters.to);
    if (max !== null && current > max) return false;
  }
  return true;
}

export function parseReportFilters(request: NextRequest): ReportFilters {
  const from = request.nextUrl.searchParams.get('from')?.trim() || null;
  const to = request.nextUrl.searchParams.get('to')?.trim() || null;
  const agentId = request.nextUrl.searchParams.get('agentId')?.trim() || null;
  const propertyId = request.nextUrl.searchParams.get('propertyId')?.trim() || null;

  const fromMs = from ? parseIsoDate(from) : null;
  const toMs = to ? parseIsoDate(to) : null;
  if (from && fromMs === null) throw new Error('Invalid `from` date. Use ISO format.');
  if (to && toMs === null) throw new Error('Invalid `to` date. Use ISO format.');
  if (fromMs !== null && toMs !== null && fromMs > toMs) throw new Error('Invalid date range: `from` must be before `to`.');
  if (fromMs !== null && toMs !== null) {
    const days = (toMs - fromMs) / (1000 * 60 * 60 * 24);
    if (days > 366) throw new Error('Date range too large. Maximum is 366 days.');
  }

  return { from, to, agentId, propertyId };
}

export function assertCanReadReports(actor: ServerAuthContext): void {
  assertCanPerform(actor, 'report.read');
}

export async function getAgentPerformanceReport(actor: ServerAuthContext, filters: ReportFilters): Promise<AgentPerformance[]> {
  const [agentsSnap, inquiriesSnap] = await Promise.all([
    adminDb().collection('agents').where('companyId', '==', actor.companyId).get(),
    adminDb().collection('inquiries').where('companyId', '==', actor.companyId).get(),
  ]);

  const inquiries = inquiriesSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }) as InquiryDoc)
    .filter((entry) => inRange(entry.date || entry.createdAt || null, filters))
    .filter((entry) => (filters.agentId ? entry.agentId === filters.agentId : true))
    .filter((entry) => (filters.propertyId ? entry.propertyId === filters.propertyId : true));

  const inquiryCountByAgent = new Map<string, number>();
  for (const inquiry of inquiries) {
    const agentId = typeof inquiry.agentId === 'string' ? inquiry.agentId : '';
    if (!agentId) continue;
    inquiryCountByAgent.set(agentId, (inquiryCountByAgent.get(agentId) || 0) + 1);
  }

  const result = agentsSnap.docs
    .map((doc) => {
      const data = { id: doc.id, ...(doc.data() as Record<string, unknown>) } as AgentDoc;
      const sales = parseFiniteNumber(data.totalSales);
      const closedDeals = parseFiniteNumber(data.closedDeals);
      return {
        agentId: data.id,
        agentName: typeof data.name === 'string' ? data.name : 'Unknown Agent',
        sales,
        inquiries: inquiryCountByAgent.get(data.id) || 0,
        closedDeals,
      } satisfies AgentPerformance;
    })
    .filter((entry) => (filters.agentId ? entry.agentId === filters.agentId : true));

  result.sort((a, b) => b.sales - a.sales);
  return result;
}

export async function getInquiryFunnelReport(actor: ServerAuthContext, filters: ReportFilters): Promise<InquiryConversionReport> {
  const inquiriesSnap = await adminDb().collection('inquiries').where('companyId', '==', actor.companyId).get();
  const byStatus: InquiryConversionReport['byStatus'] = {
    new: 0,
    approved: 0,
    rejected: 0,
    contacted: 0,
    converted: 0,
  };

  let total = 0;
  for (const doc of inquiriesSnap.docs) {
    const data = doc.data() as Record<string, unknown>;
    if (!inRange(getDateFromDoc(data), filters)) continue;
    if (filters.agentId && data.agentId !== filters.agentId) continue;
    if (filters.propertyId && data.propertyId !== filters.propertyId) continue;
    total += 1;
    const status = normalizeInquiryStatus(data.status);
    byStatus[status] += 1;
  }

  const converted = byStatus.converted;
  const rejected = byStatus.rejected;
  return {
    total,
    converted,
    rejected,
    conversionRate: total > 0 ? Number(((converted / total) * 100).toFixed(2)) : 0,
    byStatus,
  };
}

export async function getOccupancyReport(actor: ServerAuthContext, filters: ReportFilters): Promise<OccupancyReport> {
  const propertiesSnap = await adminDb().collection('properties').where('companyId', '==', actor.companyId).get();
  let occupied = 0;
  let available = 0;
  let total = 0;
  for (const doc of propertiesSnap.docs) {
    const data = doc.data() as Record<string, unknown>;
    if (filters.propertyId && doc.id !== filters.propertyId) continue;
    total += 1;
    const status = typeof data.status === 'string' ? data.status : '';
    if (status === 'rented') occupied += 1;
    if (status === 'available') available += 1;
  }

  return {
    totalProperties: total,
    occupiedProperties: occupied,
    availableProperties: available,
    occupancyRate: total > 0 ? Number(((occupied / total) * 100).toFixed(2)) : 0,
  };
}

export async function getPaymentsReport(actor: ServerAuthContext, filters: ReportFilters): Promise<PaymentsReport> {
  const paymentsSnap = await adminDb().collection('payments').where('companyId', '==', actor.companyId).get();
  let paidCount = 0;
  let unpaidCount = 0;
  let lateCount = 0;
  let collectedAmount = 0;
  let outstandingAmount = 0;
  let lateAmount = 0;
  let total = 0;

  for (const doc of paymentsSnap.docs) {
    const data = doc.data() as Record<string, unknown>;
    if (!inRange(getDateFromDoc(data), filters)) continue;
    if (filters.propertyId && data.propertyId !== filters.propertyId) continue;
    total += 1;
    const status = typeof data.status === 'string' ? data.status : 'unpaid';
    const amount = parseFiniteNumber(data.amount);
    if (status === 'paid') {
      paidCount += 1;
      collectedAmount += amount;
    } else if (status === 'late') {
      lateCount += 1;
      lateAmount += amount;
      outstandingAmount += amount;
    } else {
      unpaidCount += 1;
      outstandingAmount += amount;
    }
  }

  return {
    totalPayments: total,
    paidCount,
    unpaidCount,
    lateCount,
    collectedAmount,
    outstandingAmount,
    lateAmount,
  };
}

export async function getMaintenanceTurnaroundReport(actor: ServerAuthContext, filters: ReportFilters): Promise<MaintenanceTurnaroundReport> {
  const snap = await adminDb().collection('maintenance_requests').where('companyId', '==', actor.companyId).get();
  let total = 0;
  let completed = 0;
  let inProgress = 0;
  let assigned = 0;
  let created = 0;
  let totalTurnaroundHours = 0;

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    if (!inRange(getDateFromDoc(data), filters)) continue;
    if (filters.propertyId && data.propertyId !== filters.propertyId) continue;
    if (filters.agentId && data.assignedToUserId !== filters.agentId) continue;
    total += 1;
    const status = typeof data.status === 'string' ? data.status : 'new';
    if (status === 'completed') completed += 1;
    if (status === 'in_progress') inProgress += 1;
    if (status === 'assigned') assigned += 1;
    if (status === 'new') created += 1;

    if (status === 'completed' && typeof data.createdAt === 'string' && typeof data.completedAt === 'string') {
      const start = parseIsoDate(data.createdAt);
      const end = parseIsoDate(data.completedAt);
      if (start !== null && end !== null && end >= start) {
        totalTurnaroundHours += (end - start) / (1000 * 60 * 60);
      }
    }
  }

  return {
    totalRequests: total,
    completedRequests: completed,
    inProgressRequests: inProgress,
    assignedRequests: assigned,
    newRequests: created,
    averageTurnaroundHours: completed > 0 ? Number((totalTurnaroundHours / completed).toFixed(2)) : 0,
  };
}

export async function getRevenueReport(actor: ServerAuthContext): Promise<RevenueReport[]> {
  const snap = await adminDb().collection('revenueReports').where('companyId', '==', actor.companyId).get();
  return snap.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    const revenue = parseFiniteNumber(data.revenue);
    const expenses = parseFiniteNumber(data.expenses);
    const profit = parseFiniteNumber(data.profit) || revenue - expenses;
    return {
      month: typeof data.month === 'string' ? data.month : doc.id,
      revenue,
      expenses,
      profit,
    };
  });
}
