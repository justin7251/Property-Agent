'use client';

import Link from 'next/link';
import { Box, Button, Input } from '@chakra-ui/react';
import AgentCard from '../../../components/agents/AgentCard';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { useAgents } from '../../../hooks/useAgents';

export default function AgentsPage() {
  const { filtered, query, setQuery } = useAgents();
  return (
    <Box>
      <PageHeader title="Agents" action={<Link href="/agents/new"><Button colorScheme="blue">Add Agent</Button></Link>} />
      <Input mb={4} maxW="340px" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search agents..." />
      {filtered.length === 0 ? (
        <EmptyState title="No agents" description="No agents found." />
      ) : (
        <Box display="grid" gap={3} gridTemplateColumns={{ base: '1fr', md: 'repeat(2,minmax(0,1fr))', xl: 'repeat(3,minmax(0,1fr))' }}>
          {filtered.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
        </Box>
      )}
    </Box>
  );
}
