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
  { href: '/reports', label: 'Reports', icon: LuChartBar },
  { href: '/settings', label: 'Settings', icon: LuSettings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box w={{ base: '90px', md: '220px' }} minH="100vh" bg="white" borderRight="1px solid" borderColor="gray.100" p={3} display="flex" flexDir="column">
      <Flex align="center" h="56px" px={{ base: 0, md: 2 }} mb={4} justify={{ base: 'center', md: 'start' }}>
        <Box display={{ base: 'none', md: 'block' }} fontWeight="800" fontSize="26px" color="#2563EB">RealEstateOS</Box>
        <Box display={{ base: 'block', md: 'none' }} fontWeight="800" fontSize="18px" color="#2563EB">RE</Box>
      </Flex>
      {navItems.map((item) => (
        <Link href={item.href} key={item.href}>
          <Button
            w="full"
            justifyContent={{ base: 'center', md: 'start' }}
            variant={pathname === item.href ? 'subtle' : 'ghost'}
            colorPalette={pathname === item.href ? 'blue' : 'gray'}
            borderRadius="xl"
            mb={1}
            h="48px"
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
