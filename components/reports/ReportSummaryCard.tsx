'use client';

import { Box, Text } from '@chakra-ui/react';

export default function ReportSummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
      <Text color="gray.500" fontSize="sm">{label}</Text>
      <Text fontSize="30px" fontWeight="700">{value}</Text>
    </Box>
  );
}
