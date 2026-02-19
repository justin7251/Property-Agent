'use client';

import { Box, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

export default function EmptyState({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return (
    <Box border="1px dashed" borderColor="gray.300" borderRadius="xl" p={8} textAlign="center" bg="white">
      {icon ? <Box mb={2}>{icon}</Box> : null}
      <Text fontWeight="700" mb={1}>{title}</Text>
      <Text color="gray.600">{description}</Text>
    </Box>
  );
}
