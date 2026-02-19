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
