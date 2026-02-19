'use client';

import { agentPerformance, revenueReports } from '../lib/mockData';

export function useReports() {
  const totalRevenue = revenueReports.reduce((sum, row) => sum + row.revenue, 0);
  const totalExpenses = revenueReports.reduce((sum, row) => sum + row.expenses, 0);
  const netProfit = revenueReports.reduce((sum, row) => sum + row.profit, 0);
  return { revenueReports, agentPerformance, totalRevenue, totalExpenses, netProfit };
}
