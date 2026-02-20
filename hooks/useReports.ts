'use client';

import { useEffect, useMemo, useState } from 'react';
import { agentPerformance as seededAgentPerformance, revenueReports as seededRevenueReports } from '../lib/mockData';
import type { AgentPerformance, RevenueReport } from '../types/report';
import { seedDatabaseIfEmpty, subscribeAgentPerformance, subscribeRevenueReports } from '../services/firebase';

export function useReports() {
  const [revenueReports, setRevenueReports] = useState<RevenueReport[]>(seededRevenueReports);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>(seededAgentPerformance);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeRevenue: (() => void) | null = null;
    let unsubscribePerformance: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        await seedDatabaseIfEmpty();
        unsubscribeRevenue = subscribeRevenueReports((rows) => {
          if (!mounted) return;
          setRevenueReports(rows);
        });
        unsubscribePerformance = subscribeAgentPerformance((rows) => {
          if (!mounted) return;
          setAgentPerformance(rows);
          setLoading(false);
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load reports');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (unsubscribeRevenue) unsubscribeRevenue();
      if (unsubscribePerformance) unsubscribePerformance();
    };
  }, []);

  const totalRevenue = useMemo(() => revenueReports.reduce((sum, row) => sum + row.revenue, 0), [revenueReports]);
  const totalExpenses = useMemo(() => revenueReports.reduce((sum, row) => sum + row.expenses, 0), [revenueReports]);
  const netProfit = useMemo(() => revenueReports.reduce((sum, row) => sum + row.profit, 0), [revenueReports]);

  return { revenueReports, agentPerformance, totalRevenue, totalExpenses, netProfit, loading, error };
}
