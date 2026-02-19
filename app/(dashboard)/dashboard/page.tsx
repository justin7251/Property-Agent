'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import PageHeader from '../../../components/ui/PageHeader';
import ProgressRing from '../../../components/ui/ProgressRing';
import { inquiries, properties } from '../../../lib/mockData';

function StatCard({ label, value, percent, color, trackColor }: { label: string; value: string; percent: number; color: string; trackColor: string }) {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4} flex="1">
      <Flex align="center" gap={3}>
        <ProgressRing percent={percent} color={color} trackColor={trackColor} />
        <Box>
          <Text color="gray.500">{label}</Text>
          <Text fontSize="32px" fontWeight="700">{value}</Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default function DashboardPage() {
  const available = properties.filter((p) => p.status === 'available').length;
  return (
    <Box>
      <PageHeader title="Properties Overview" />
      <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={4}>
        <StatCard label="Available Units" value={String(available)} percent={72} color="#3B9EFF" trackColor="#DBEAFE" />
        <StatCard label="Revenue" value="$4.5M" percent={65} color="#22C55E" trackColor="#DCFCE7" />
        <StatCard label="Total Clients" value="8,500" percent={85} color="#3B9EFF" trackColor="#DBEAFE" />
      </Flex>
      <Flex gap={3} direction={{ base: 'column', xl: 'row' }}>
        <Box flex="1.1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4} minH="260px">
          <Text fontWeight="700" mb={2}>Map</Text>
          <Box h="210px" borderRadius="xl" bg="linear-gradient(135deg,#E2E8F0,#CBD5E1)" />
        </Box>
        <Box flex="1.4" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
          <Text fontWeight="700" mb={2}>Recent Inquiries</Text>
          {inquiries.slice(0, 6).map((i) => (
            <Flex key={i.id} py={2} borderTop="1px solid" borderColor="gray.100" justify="space-between">
              <Text>{i.clientName}</Text>
              <Text color="gray.600">{i.propertyTitle}</Text>
              <Text color="gray.500">{i.status}</Text>
            </Flex>
          ))}
        </Box>
      </Flex>
    </Box>
  );
}
