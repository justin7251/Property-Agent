'use client';

import { useParams } from 'next/navigation';
import { Box, Text } from '@chakra-ui/react';
import PageHeader from '../../../../components/ui/PageHeader';
import { agents, inquiries, properties } from '../../../../lib/mockData';

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  if (!params?.id) return <Text>Agent not found.</Text>;
  const agent = agents.find((item) => item.id === params.id);
  if (!agent) return <Text>Agent not found.</Text>;

  const assignedProperties = properties.filter((item) => item.agentId === agent.id);
  const assignedInquiries = inquiries.filter((item) => item.agentId === agent.id);

  return (
    <Box>
      <PageHeader title={agent.name} subtitle={agent.email} />
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4} mb={4}>
        <Text>Phone: {agent.phone}</Text>
        <Text>Joined: {agent.joinedAt}</Text>
        <Text>Total Sales: ${agent.totalSales.toLocaleString()}</Text>
        <Text>Active Listings: {agent.activeListings}</Text>
        <Text>Closed Deals: {agent.closedDeals}</Text>
      </Box>
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4} mb={4}>
        <Text fontWeight="700">Assigned Properties</Text>
        {assignedProperties.map((item) => <Text key={item.id}>{item.title}</Text>)}
      </Box>
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
        <Text fontWeight="700">Handled Inquiries</Text>
        {assignedInquiries.map((item) => <Text key={item.id}>{item.clientName} - {item.status}</Text>)}
      </Box>
    </Box>
  );
}
