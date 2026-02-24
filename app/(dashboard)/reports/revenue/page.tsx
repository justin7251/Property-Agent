'use client';

import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import DataTable from '../../../../components/ui/DataTable';
import PageHeader from '../../../../components/ui/PageHeader';
import RevenueChart from '../../../../components/reports/RevenueChart';
import { formatCurrency } from '../../../../lib/utils';
import { getRevenueReportsServer } from '../../../../services/firebase';
import type { RevenueReport } from '../../../../types/report';

export default function RevenueReportPage() {
  const [rows, setRows] = useState<RevenueReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const data = await getRevenueReportsServer();
        if (mounted) setRows(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load revenue report.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <PageHeader title="Revenue Report" subtitle="Monthly revenue vs expenses" />
      {error ? (
        <Box mb={4} p={3} borderRadius="md" bg="#fee2e2" color="#991b1b" border="1px solid #fecaca">
          {error}
        </Box>
      ) : null}
      <RevenueChart rows={rows} />
      <Box mt={4}>
        <DataTable
          columns={[
            { key: 'month', header: 'Month', render: (row) => row.month },
            { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
            { key: 'expenses', header: 'Expenses', render: (row) => formatCurrency(row.expenses) },
            { key: 'profit', header: 'Profit', render: (row) => formatCurrency(row.profit) },
          ]}
          data={rows}
        />
      </Box>
    </Box>
  );
}
