'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Button, Flex, Icon } from '@chakra-ui/react';
import { LuChartBar, LuHouse, LuLayoutDashboard, LuLogOut, LuMessageSquare, LuSettings, LuUsers } from 'react-icons/lu';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { href: '/properties', label: 'Properties', icon: LuHouse },
  { href: '/landlords', label: 'Clients', icon: LuUsers },
  { href: '/inquiries', label: 'Inquiries', icon: LuMessageSquare },
  { href: '/reports', label: 'Reports', icon: LuChartBar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box w={{ base: '88px', md: '220px' }} minH="100vh" bg="white" borderRight="1px solid" borderColor="#E5EAF1" p={3} display="flex" flexDir="column">
      <Flex align="center" h="64px" px={{ base: 0, md: 2 }} mb={5} justify={{ base: 'center', md: 'start' }} gap={2}>
        <Box color="#5B8FD9" fontSize="24px">⌂</Box>
        <Box display={{ base: 'none', md: 'block' }} fontWeight="800" fontSize="32px" letterSpacing="-0.3px">REALM</Box>
      </Flex>
      {navItems.map((item) => (
        <Link href={item.href} key={item.href}>
          <Button
            w="full"
            justifyContent={{ base: 'center', md: 'start' }}
            variant="ghost"
            bg={pathname === item.href ? '#EDF3FF' : 'transparent'}
            color={pathname === item.href ? '#2D5FAF' : '#1F2937'}
            borderRadius="xl"
            mb={1}
            h="48px"
            _hover={{ bg: '#EDF3FF' }}
          >
            <Flex align="center" gap={2}>
              <Icon as={item.icon} />
              <Box display={{ base: 'none', md: 'block' }}>{item.label}</Box>
            </Flex>
          </Button>
        </Link>
      ))}
      <Box flex="1" />
      <Link href="/settings">
        <Button justifyContent={{ base: 'center', md: 'start' }} variant="ghost" borderRadius="xl" mb={1} h="48px">
          <Flex align="center" gap={2}>
            <Icon as={LuSettings} />
            <Box display={{ base: 'none', md: 'block' }}>Settings</Box>
          </Flex>
        </Button>
      </Link>
      <Link href="/login">
        <Button justifyContent={{ base: 'center', md: 'start' }} variant="ghost" borderRadius="xl" h="48px">
          <Flex align="center" gap={2}>
            <Icon as={LuLogOut} />
            <Box display={{ base: 'none', md: 'block' }}>Logout</Box>
          </Flex>
        </Button>
      </Link>
    </Box>
  );
}
