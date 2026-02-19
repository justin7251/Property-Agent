'use client';

import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { LuBell, LuChevronDown, LuMail } from 'react-icons/lu';
import InitialsAvatar from '../ui/InitialsAvatar';

export default function Topbar({ title = 'Dashboard' }: { title?: string }) {
  return (
    <Flex justify="space-between" align="center" mb={5}>
      <Text fontSize={{ base: '30px', md: '42px' }} fontWeight="800" letterSpacing="-0.02em">
        {title}
      </Text>
      <Flex align="center" gap={3}>
        <Icon as={LuMail} boxSize={5} color="gray.500" />
        <Icon as={LuBell} boxSize={5} color="gray.500" />
        <Flex align="center" gap={2}>
          <InitialsAvatar name="Admin User" />
          <Icon as={LuChevronDown} color="gray.500" />
        </Flex>
      </Flex>
    </Flex>
  );
}
