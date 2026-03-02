'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text } from '@chakra-ui/react';

export default function NewLandlordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/landlords');
  }, [router]);

  return (
    <Box>
      <Text color="gray.600">Redirecting to Landlords...</Text>
    </Box>
  );
}
