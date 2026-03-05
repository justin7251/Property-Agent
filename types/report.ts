export interface RevenueReport {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  sales: number;
  inquiries: number;
  closedDeals: number;
}

export interface InquiryConversionReport {
  total: number;
  converted: number;
  rejected: number;
  conversionRate: number;
  byStatus: Record<'new' | 'approved' | 'rejected' | 'contacted' | 'converted', number>;
}

export interface OccupancyReport {
  totalProperties: number;
  occupiedProperties: number;
  availableProperties: number;
  occupancyRate: number;
}

export interface PaymentsReport {
  totalPayments: number;
  paidCount: number;
  unpaidCount: number;
  lateCount: number;
  collectedAmount: number;
  outstandingAmount: number;
  lateAmount: number;
}

export interface MaintenanceTurnaroundReport {
  totalRequests: number;
  completedRequests: number;
  inProgressRequests: number;
  assignedRequests: number;
  newRequests: number;
  averageTurnaroundHours: number;
}
