'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text } from '@chakra-ui/react';

export default function NewAgentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/agents');
  }, [router]);

  return (
    <Box>
      <Text color="gray.600">Redirecting to Agents...</Text>
    </Box>
  );
}
