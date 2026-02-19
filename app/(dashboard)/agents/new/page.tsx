'use client';

import { Box } from '@chakra-ui/react';
import AgentForm from '../../../../components/agents/AgentForm';
import PageHeader from '../../../../components/ui/PageHeader';

export default function NewAgentPage() {
  return (
    <Box>
      <PageHeader title="Add Agent" subtitle="Create a new agent profile" />
      <AgentForm />
    </Box>
  );
}
