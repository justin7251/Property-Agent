'use client';

import { Flex, Icon, Text } from '@chakra-ui/react';
import { LuChevronDown } from 'react-icons/lu';
import InitialsAvatar from '../ui/InitialsAvatar';

export default function Topbar() {
  return (
    <Flex justify="flex-end" align="center" mb={4}>
      <Flex align="center" gap={2}>
        <InitialsAvatar name="Agent User" />
        <Text fontWeight="600">Agent</Text>
        <Flex align="center" gap={1}>
          <Icon as={LuChevronDown} color="gray.500" />
        </Flex>
      </Flex>
    </Flex>
  );
}
