'use client';

import { Box } from '@chakra-ui/react';
import DataTable from '../../../../components/ui/DataTable';
import PageHeader from '../../../../components/ui/PageHeader';
import RevenueChart from '../../../../components/reports/RevenueChart';
import { revenueReports } from '../../../../lib/mockData';
import { formatCurrency } from '../../../../lib/utils';

export default function RevenueReportPage() {
  return (
    <Box>
      <PageHeader title="Revenue Report" subtitle="Monthly revenue vs expenses" />
      <RevenueChart rows={revenueReports} />
      <Box mt={4}>
        <DataTable
          columns={[
            { key: 'month', header: 'Month', render: (row) => row.month },
            { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
            { key: 'expenses', header: 'Expenses', render: (row) => formatCurrency(row.expenses) },
            { key: 'profit', header: 'Profit', render: (row) => formatCurrency(row.profit) },
          ]}
          data={revenueReports}
        />
      </Box>
    </Box>
  );
}
