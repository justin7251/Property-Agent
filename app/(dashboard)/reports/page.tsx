'use client';

import Link from 'next/link';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import PageHeader from '../../../components/ui/PageHeader';
import ReportSummaryCard from '../../../components/reports/ReportSummaryCard';
import { useReports } from '../../../hooks/useReports';
import { formatCurrency } from '../../../lib/utils';

export default function ReportsPage() {
  const { totalExpenses, totalRevenue, netProfit } = useReports();
  return (
    <Box>
      <PageHeader title="Reports" subtitle="Revenue, expenses, and performance overview" />
      <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={4}>
        <ReportSummaryCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <ReportSummaryCard label="Total Expenses" value={formatCurrency(totalExpenses)} />
        <ReportSummaryCard label="Net Profit" value={formatCurrency(netProfit)} />
        <ReportSummaryCard label="Occupancy Rate" value="92%" />
      </Flex>
      <Flex gap={3}>
        <Link href="/reports/revenue"><Button colorScheme="blue">Revenue Report</Button></Link>
        <Button variant="outline">Agent Performance</Button>
      </Flex>
    </Box>
  );
}
