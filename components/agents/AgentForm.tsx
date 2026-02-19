'use client';

import { Box, Button, Input, Text } from '@chakra-ui/react';

export default function AgentForm() {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={5}>
      <Text mb={1}>Name</Text>
      <Input mb={3} placeholder="Agent name" />
      <Text mb={1}>Email</Text>
      <Input mb={3} placeholder="agent@propestate.com" />
      <Text mb={1}>Phone</Text>
      <Input mb={3} placeholder="+1 555-0000" />
      <Button colorScheme="blue">Create Agent</Button>
    </Box>
  );
}
