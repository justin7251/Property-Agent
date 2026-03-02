'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text } from '@chakra-ui/react';

export default function NewPropertyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/properties');
  }, [router]);

  return (
    <Box>
      <Text color="gray.600">Redirecting to Properties...</Text>
    </Box>
  );
}
