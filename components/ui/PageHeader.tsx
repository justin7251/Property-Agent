'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

export default function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3} mb={4}>
      <Box>
        <Text fontSize="26px" fontWeight="800">{title}</Text>
        {subtitle ? <Text color="gray.600">{subtitle}</Text> : null}
      </Box>
      {action || null}
    </Flex>
  );
}
