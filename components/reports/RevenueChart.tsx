'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { RevenueReport } from '../../types/report';

export default function RevenueChart({ rows }: { rows: RevenueReport[] }) {
  const max = Math.max(...rows.map((r) => Math.max(r.revenue, r.expenses)));
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
      <Text fontWeight="700" mb={3}>Revenue vs Expenses</Text>
      <Flex gap={2} h="220px" align="end">
        {rows.map((row) => (
          <Box key={row.month} flex="1">
            <Flex h="180px" align="end" gap={1}>
              <Box w="50%" h={`${(row.revenue / max) * 100}%`} bg="#60A5FA" borderRadius="4px 4px 0 0" />
              <Box w="50%" h={`${(row.expenses / max) * 100}%`} bg="#F59E0B" borderRadius="4px 4px 0 0" />
            </Flex>
            <Text textAlign="center" mt={2} fontSize="12px" color="gray.500">{row.month}</Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
