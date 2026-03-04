'use client';

import { useState } from 'react';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { LuBell, LuChevronDown } from 'react-icons/lu';
import { useNotifications } from '../../hooks/useNotifications';
import InitialsAvatar from '../ui/InitialsAvatar';

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <Box position="relative" mb={4}>
      <Flex justify="flex-end" align="center">
        <Button variant="ghost" position="relative" onClick={() => setOpen((prev) => !prev)} mr={2}>
          <Icon as={LuBell} boxSize={5} />
          {unreadCount > 0 ? (
            <Box
              position="absolute"
              top="6px"
              right="6px"
              bg="red.500"
              color="white"
              minW="18px"
              h="18px"
              borderRadius="full"
              fontSize="11px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              px={1}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Box>
          ) : null}
        </Button>
        <Flex align="center" gap={2}>
          <InitialsAvatar name="Agent User" />
          <Text fontWeight="600">Agent</Text>
          <Flex align="center" gap={1}>
            <Icon as={LuChevronDown} color="gray.500" />
          </Flex>
        </Flex>
      </Flex>

      {open ? (
        <Box
          position="absolute"
          right={0}
          mt={2}
          w={{ base: '100%', md: '380px' }}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="xl"
          boxShadow="0 10px 30px rgba(15,23,42,0.12)"
          zIndex={20}
          maxH="420px"
          overflowY="auto"
        >
          <Flex align="center" justify="space-between" p={3} borderBottom="1px solid" borderColor="gray.100">
            <Text fontWeight="700">Notifications</Text>
            <Button size="xs" variant="outline" onClick={() => void markAllRead()}>
              Mark all read
            </Button>
          </Flex>
          <Box>
            {notifications.length === 0 ? (
              <Text color="gray.500" p={3}>No notifications.</Text>
            ) : (
              notifications.map((item) => (
                <Box
                  key={item.id}
                  p={3}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  bg={item.readAt ? 'white' : '#eff6ff'}
                  cursor="pointer"
                  onClick={() => void markRead(item.id)}
                >
                  <Flex align="center" justify="space-between" mb={1}>
                    <Text fontWeight="700">{item.title}</Text>
                    {!item.readAt ? <Box w="8px" h="8px" borderRadius="full" bg="blue.500" /> : null}
                  </Flex>
                  <Text fontSize="sm" color="gray.700">{item.message}</Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>{item.createdAt}</Text>
                </Box>
              ))
            )}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
