import type { AgentPerformance, InquiryConversionReport, OccupancyReport, PaymentsReport, RevenueReport } from './report';

export type ReportDateRange = {
  from: string | null;
  to: string | null;
};

export type ReportDimensions = {
  agentId: string | null;
  propertyId: string | null;
};

export type ReportFilters = ReportDateRange & ReportDimensions;

export type MaintenanceTurnaroundReport = {
  totalRequests: number;
  completedRequests: number;
  inProgressRequests: number;
  assignedRequests: number;
  newRequests: number;
  averageTurnaroundHours: number;
};

export type AgentPerformanceReportDto = AgentPerformance[];
export type InquiryFunnelReportDto = InquiryConversionReport;
export type OccupancyReportDto = OccupancyReport;
export type PaymentsReportDto = PaymentsReport;
export type MaintenanceReportDto = MaintenanceTurnaroundReport;
export type RevenueReportDto = RevenueReport[];
