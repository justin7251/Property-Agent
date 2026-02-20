'use client';

import { Flex, Icon } from '@chakra-ui/react';
import { LuBell, LuChevronDown, LuMail, LuSearch } from 'react-icons/lu';
import InitialsAvatar from '../ui/InitialsAvatar';

export default function Topbar() {
  return (
    <Flex justify="flex-end" align="center" mb={4}>
      <Flex align="center" gap={4}>
        <Icon as={LuSearch} boxSize={5} color="gray.500" />
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
