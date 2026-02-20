'use client';

import { Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Flex bg="#F4F7FB" minH="100vh">
      <Sidebar />
      <Box flex="1" p={{ base: 4, md: 6 }} overflowX="hidden">
        <Topbar />
        {children}
      </Box>
    </Flex>
  );
}
