'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Button, Flex, Icon } from '@chakra-ui/react';
import { LuChartBar, LuHouse, LuLayoutDashboard, LuLogOut, LuMessageSquare, LuSettings, LuUsers } from 'react-icons/lu';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { href: '/properties', label: 'Properties', icon: LuHouse },
  { href: '/inquiries', label: 'Inquiries', icon: LuMessageSquare },
  { href: '/agents', label: 'Agents', icon: LuUsers },
  { href: '/landlords', label: 'Landlords', icon: LuUsers },
  { href: '/reports', label: 'Reports', icon: LuChartBar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box w={{ base: '90px', md: '220px' }} minH="100vh" bg="white" borderRight="1px solid" borderColor="gray.100" p={3} display="flex" flexDir="column">
      {navItems.map((item) => (
        <Link href={item.href} key={item.href}>
          <Button
            w="full"
            justifyContent={{ base: 'center', md: 'start' }}
            variant={pathname === item.href ? 'solid' : 'ghost'}
            colorScheme={pathname === item.href ? 'blue' : 'gray'}
            borderRadius="xl"
            mb={1}
          >
            <Flex align="center" gap={2}>
              <Icon as={item.icon} />
              <Box display={{ base: 'none', md: 'block' }}>{item.label}</Box>
            </Flex>
          </Button>
        </Link>
      ))}
      <Box flex="1" />
      <Button justifyContent={{ base: 'center', md: 'start' }} variant="ghost" borderRadius="xl" mb={1}>
        <Flex align="center" gap={2}>
          <Icon as={LuSettings} />
          <Box display={{ base: 'none', md: 'block' }}>Settings</Box>
        </Flex>
      </Button>
      <Link href="/login">
        <Button justifyContent={{ base: 'center', md: 'start' }} variant="ghost" borderRadius="xl">
          <Flex align="center" gap={2}>
            <Icon as={LuLogOut} />
            <Box display={{ base: 'none', md: 'block' }}>Logout</Box>
          </Flex>
        </Button>
      </Link>
    </Box>
  );
}
