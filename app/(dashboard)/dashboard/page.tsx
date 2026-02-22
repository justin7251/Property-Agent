'use client';

import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { LuArrowUpRight, LuExternalLink, LuSquareArrowOutUpRight } from 'react-icons/lu';
import dynamic from 'next/dynamic';
import { inquiries } from '../../../lib/mockData';

const weeklyPerformance = [
  { day: 'Sun', leads: 4, goals: 2 },
  { day: 'Mon', leads: 11, goals: 7 },
  { day: 'Tue', leads: 7, goals: 4 },
  { day: 'Wed', leads: 15, goals: 11 },
  { day: 'Thu', leads: 13, goals: 12 },
  { day: 'Fri', leads: 8, goals: 17 },
  { day: 'Sat', leads: 18, goals: 13 },
];

const WeeklyPerformanceChart = dynamic(() => import('./weekly-performance-chart'), {
  ssr: false,
  loading: () => <Box h="100%" borderRadius="lg" bg="linear-gradient(180deg,#f8fafc,#eef4fb)" />,
});

const priorityTasks = [
  { id: 1, label: 'Follow up with client X', priority: 'High', icon: LuArrowUpRight },
  { id: 2, label: 'Sign contract for property Y', priority: 'Urgent', icon: LuExternalLink },
  { id: 3, label: 'Review new leads', priority: 'Medium', icon: LuSquareArrowOutUpRight },
];

const leaderboard = [
  { name: 'Agent A', value: 150, color: 'linear-gradient(90deg,#1f5fc4,#3b82f6)' },
  { name: 'Agent B', value: 120, color: 'linear-gradient(90deg,#1f5fc4,#3b82f6)' },
  { name: 'Agent C', value: 80, color: 'linear-gradient(90deg,#75d7c7,#8ee6d5)' },
];

export default function DashboardPage() {
  const topInquiries = inquiries.slice(0, 2);
  const maxLeader = Math.max(...leaderboard.map((item) => item.value));

  return (
    <Box>
      <Text fontSize={{ base: '30px', md: '42px' }} fontWeight="800" mb={4} letterSpacing="-0.6px">
        Welcome back, Agent
      </Text>

      <Flex gap={4} direction={{ base: 'column', xl: 'row' }} mb={4}>
        <Box flex="1.15" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontWeight="700" fontSize="34px">Weekly Performance</Text>
            <Flex gap={4} fontSize="sm" color="gray.700">
              <Flex align="center" gap={2}>
                <Box w="10px" h="10px" borderRadius="full" bg="#3b82f6" />
                <Text>Lead Conversions</Text>
              </Flex>
              <Flex align="center" gap={2}>
                <Box w="10px" h="10px" borderRadius="full" bg="#84e1bc" />
                <Text>Goals</Text>
              </Flex>
            </Flex>
          </Flex>
          <Box h="240px">
            <WeeklyPerformanceChart data={weeklyPerformance} />
          </Box>
        </Box>

        <Box flex="0.95" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
          <Text fontWeight="700" fontSize="34px" mb={3}>Priority Tasks</Text>
          {priorityTasks.map((task) => (
            <Flex key={task.id} py={3} borderTop="1px solid" borderColor="gray.100" justify="space-between" align="center">
              <Flex align="center" gap={3}>
                <Box as="input" type="checkbox" w="18px" h="18px" />
                <Text>{task.label} - {task.priority}</Text>
              </Flex>
              <Icon as={task.icon} color="gray.500" />
            </Flex>
          ))}
        </Box>
      </Flex>

      <Flex gap={4} direction={{ base: 'column', xl: 'row' }}>
        <Box flex="1.15" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
          <Text fontWeight="700" fontSize="34px" mb={2}>Recent Inquiries</Text>
          <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
            <Box as="thead">
              <Box as="tr">
                {['Name', 'Property', 'Date', 'Status'].map((header) => (
                  <Box key={header} as="th" textAlign="left" py={2} px={2}>
                    <Text color="gray.700" fontSize="sm">{header}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box as="tbody">
              {topInquiries.map((item) => (
                <Box as="tr" key={item.id}>
                  <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100">{item.clientName}</Box>
                  <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100">{item.propertyTitle}</Box>
                  <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100">{item.date}</Box>
                  <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100">
                    <Box
                      as="span"
                      px={4}
                      py={1}
                      borderRadius="full"
                      bg={item.status === 'new' ? '#9FE8D1' : '#4B84D8'}
                      color={item.status === 'new' ? '#0B3B2E' : '#F8FAFF'}
                      fontWeight="600"
                    >
                      {item.status === 'new' ? 'New' : 'Pending'}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box flex="0.95" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
          <Text fontWeight="700" fontSize="34px" mb={3}>Agent Leaderboard</Text>
          <Flex direction="column" gap={4}>
            {leaderboard.map((item) => (
              <Flex key={item.name} align="center" gap={3}>
                <Text w="80px">{item.name}</Text>
                <Box flex="1" h="34px" borderRadius="md" bg="#eef2f7" overflow="hidden">
                  <Box w={`${(item.value / maxLeader) * 100}%`} h="100%" bg={item.color} borderRadius="md" />
                </Box>
                <Text minW="42px" textAlign="right">{item.value}k</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
