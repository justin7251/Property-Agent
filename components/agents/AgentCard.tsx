'use client';

import Link from 'next/link';
import { Box, Button, Text } from '@chakra-ui/react';
import type { Agent } from '../../types/agent';
import InitialsAvatar from '../ui/InitialsAvatar';

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
      <InitialsAvatar name={agent.name} />
      <Text mt={2} fontWeight="700">{agent.name}</Text>
      <Text color="gray.600" fontSize="sm">{agent.email}</Text>
      <Text mt={2} fontSize="sm">Sales: ${agent.totalSales.toLocaleString()}</Text>
      <Text fontSize="sm">Active Listings: {agent.activeListings}</Text>
      <Text fontSize="sm">Closed Deals: {agent.closedDeals}</Text>
      <Link href={`/agents/${agent.id}`}>
        <Button mt={3} size="sm" variant="outline">View</Button>
      </Link>
    </Box>
  );
}
