'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AgentPerformance, InquiryConversionReport, MaintenanceTurnaroundReport, OccupancyReport, PaymentsReport, RevenueReport } from '../types/report';
import {
  getAgentPerformanceServer,
  getInquiryConversionClient,
  getInquiryConversionServer,
  getMaintenanceTurnaroundClient,
  getMaintenanceTurnaroundServer,
  getOccupancyClient,
  getOccupancyServer,
  getPaymentsClient,
  getPaymentsServer,
  getRevenueReports,
  getRevenueReportsServer,
} from '../services/firebase';

export function useReports() {
  const [revenueReports, setRevenueReports] = useState<RevenueReport[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [inquiryConversion, setInquiryConversion] = useState<InquiryConversionReport | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyReport | null>(null);
  const [payments, setPayments] = useState<PaymentsReport | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceTurnaroundReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'server' | 'client_fallback'>('server');

  useEffect(() => {
    let mounted = true;

    (async () => {
      const now = new Date();
      const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 90)).toISOString();
      const to = now.toISOString();

      async function loadViaServer() {
        const [revenue, agents, conversion, occupancyData, paymentsData, maintenanceData] = await Promise.all([
          getRevenueReportsServer(),
          getAgentPerformanceServer(from, to),
          getInquiryConversionServer(from, to),
          getOccupancyServer(),
          getPaymentsServer(from, to),
          getMaintenanceTurnaroundServer(from, to),
        ]);
        return { revenue, agents, conversion, occupancyData, paymentsData, maintenanceData };
      }

      async function loadViaClientFallback() {
        const [revenue, agents, conversion, occupancyData, paymentsData, maintenanceData] = await Promise.all([
          getRevenueReports(),
          getAgentPerformance(),
          getInquiryConversionClient(from, to),
          getOccupancyClient(),
          getPaymentsClient(from, to),
          getMaintenanceTurnaroundClient(from, to),
        ]);
        return { revenue, agents, conversion, occupancyData, paymentsData, maintenanceData };
      }

      try {
        const source = await loadViaServer();
        if (!mounted) return;
        setRevenueReports(source.revenue);
        setAgentPerformance(source.agents);
        setInquiryConversion(source.conversion);
        setOccupancy(source.occupancyData);
        setPayments(source.paymentsData);
        setMaintenance(source.maintenanceData);
        setDataSource('server');
        setLoading(false);
      } catch (serverError) {
        // Local-dev fallback when admin credentials are unavailable for server report routes.
        try {
          const source = await loadViaClientFallback();
          if (!mounted) return;
          setRevenueReports(source.revenue);
          setAgentPerformance(source.agents);
          setInquiryConversion(source.conversion);
          setOccupancy(source.occupancyData);
          setPayments(source.paymentsData);
          setMaintenance(source.maintenanceData);
          setDataSource('client_fallback');
          setLoading(false);
        } catch (fallbackError) {
          if (!mounted) return;
          const primary = serverError instanceof Error ? serverError.message : 'Failed to load reports';
          const secondary = fallbackError instanceof Error ? fallbackError.message : 'Fallback reports load failed';
          setError(`${primary} (fallback failed: ${secondary})`);
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const totalRevenue = useMemo(() => revenueReports.reduce((sum, row) => sum + row.revenue, 0), [revenueReports]);
  const totalExpenses = useMemo(() => revenueReports.reduce((sum, row) => sum + row.expenses, 0), [revenueReports]);
  const netProfit = useMemo(() => revenueReports.reduce((sum, row) => sum + row.profit, 0), [revenueReports]);

  return {
    revenueReports,
    agentPerformance,
    inquiryConversion,
    occupancy,
    payments,
    maintenance,
    totalRevenue,
    totalExpenses,
    netProfit,
    loading,
    error,
    dataSource,
  };
}
