'use client';

import { Box } from '@chakra-ui/react';
import { initialsFromName } from '../../lib/utils';

export default function InitialsAvatar({ name, size = 34 }: { name: string; size?: number }) {
  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="full"
      bg="blue.100"
      color="blue.700"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="700"
      fontSize={`${Math.max(10, Math.floor(size * 0.35))}px`}
      flexShrink={0}
    >
      {initialsFromName(name)}
    </Box>
  );
}
