'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { useReports } from '../../../hooks/useReports';

function MiniBar({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <Flex h="140px" gap={3} align="end">
      {values.map((v, i) => <Box key={i} flex="1" h={`${(v / max) * 100}%`} borderRadius="8px 8px 0 0" bg={i % 2 ? '#93c5fd' : '#fcd34d'} />)}
    </Flex>
  );
}

export default function ReportsPage() {
  const { revenueReports, agentPerformance, inquiryConversion, occupancy, payments, maintenance, loading, error, totalRevenue } = useReports();
  const salesValues = revenueReports.map((r) => Math.round(r.revenue / 3000));
  const rentalValues = revenueReports.map((r) => Math.round(r.expenses / 3000));

  if (loading) {
    return (
      <Box>
        <Text fontSize="48px" fontWeight="800" mb={4}>Unified Performance Reports</Text>
        <Text color="gray.600">Loading report data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text fontSize="48px" fontWeight="800" mb={4}>Unified Performance Reports</Text>
        <Box p={3} borderRadius="md" bg="#fee2e2" color="#991b1b" border="1px solid #fecaca">
          {error}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Text fontSize="48px" fontWeight="800" mb={4}>Unified Performance Reports</Text>
      <Text fontSize="40px" fontWeight="700" mb={3}>Properties Overview</Text>
      <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={4}>
        {[
          { label: 'Total Revenue', value: `$${Math.round(totalRevenue).toLocaleString()}` },
          { label: 'Occupancy Rate', value: `${occupancy?.occupancyRate ?? 0}%` },
          { label: 'Inquiry Conversion', value: `${inquiryConversion?.conversionRate ?? 0}%` },
          { label: 'Payments Collected', value: `$${Math.round(payments?.collectedAmount ?? 0).toLocaleString()}` },
          { label: 'Maintenance Avg (hrs)', value: `${maintenance?.averageTurnaroundHours ?? 0}` },
        ].map((s) => (
          <Box key={s.label} flex="1" bg="white" border="1px solid" borderColor="#bde8dc" borderRadius="2xl" p={4}>
            <Text color="gray.600">{s.label}</Text>
            <Text fontSize="44px" fontWeight="800">{s.value}</Text>
          </Box>
        ))}
      </Flex>

      <Flex gap={3} direction={{ base: 'column', xl: 'row' }} mb={3}>
        <Box flex="1.6" bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={4}>
          <Text fontSize="40px" fontWeight="700" mb={2}>Revenue Overview</Text>
          <Text color="gray.600" mb={2}>Sales vs Rentals</Text>
          <MiniBar values={salesValues} />
          <MiniBar values={rentalValues} />
        </Box>
        <Box flex="0.9" bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={4}>
          <Text fontSize="40px" fontWeight="700" mb={2}>Property Types</Text>
          <Box w="220px" h="220px" mx="auto" borderRadius="full" bg="conic-gradient(#60a5fa 0 25%,#86efac 25% 55%,#34d399 55% 100%)" position="relative">
            <Box position="absolute" inset="28%" bg="white" borderRadius="full" />
          </Box>
        </Box>
        <Box w={{ base: '100%', xl: '270px' }} bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={3}>
          <Text fontSize="34px" fontWeight="700" mb={2}>Agent Leaderboard</Text>
          {agentPerformance.slice(0, 6).map((a, i) => (
            <Flex key={a.agentId} align="center" justify="space-between" border="1px solid" borderColor="gray.200" borderRadius="xl" p={2} mb={2} bg={i < 2 ? '#fffdf0' : 'white'}>
              <Text fontWeight="700">{i + 1}</Text>
              <Box flex="1" mx={2}>
                <Text fontWeight="700">{a.agentName}</Text>
                <Text fontSize="sm" color="gray.600">${Math.round(a.sales / 1000)} sales</Text>
              </Box>
              <Text>{i + 1}</Text>
            </Flex>
          ))}
        </Box>
      </Flex>
    </Box>
  );
}
