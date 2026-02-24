'use client';

import { useMemo } from 'react';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { LuArrowUpRight, LuExternalLink, LuSquareArrowOutUpRight } from 'react-icons/lu';
import dynamic from 'next/dynamic';
import { useInquiries } from '../../../hooks/useInquiries';
import { useProperties } from '../../../hooks/useProperties';
import type { Inquiry, InquiryStatus } from '../../../types/inquiry';

const WeeklyPerformanceChart = dynamic(() => import('./weekly-performance-chart'), {
  ssr: false,
  loading: () => <Box h="100%" borderRadius="lg" bg="linear-gradient(180deg,#f8fafc,#eef4fb)" />,
});

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDayIndex(value: string): number | null {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCDay();
}

function statusBadgeColors(status: InquiryStatus): { bg: string; fg: string; label: string } {
  if (status === 'new') return { bg: '#9FE8D1', fg: '#0B3B2E', label: 'New' };
  if (status === 'approved') return { bg: '#dbeafe', fg: '#1e40af', label: 'Approved' };
  if (status === 'contacted') return { bg: '#fef3c7', fg: '#92400e', label: 'Contacted' };
  if (status === 'converted') return { bg: '#dcfce7', fg: '#166534', label: 'Converted' };
  return { bg: '#fee2e2', fg: '#991b1b', label: 'Rejected' };
}

function inquiryPriority(status: InquiryStatus): { rank: number; label: string } {
  if (status === 'new') return { rank: 3, label: 'High' };
  if (status === 'approved') return { rank: 4, label: 'Urgent' };
  if (status === 'contacted') return { rank: 2, label: 'Medium' };
  if (status === 'converted') return { rank: 1, label: 'Low' };
  return { rank: 0, label: 'Low' };
}

function iconByIndex(index: number) {
  if (index % 3 === 0) return LuArrowUpRight;
  if (index % 3 === 1) return LuExternalLink;
  return LuSquareArrowOutUpRight;
}

export default function DashboardPage() {
  const { inquiries, loading: inquiriesLoading, error: inquiriesError } = useInquiries();
  const { properties, loading: propertiesLoading, error: propertiesError } = useProperties();
  const isLoading = inquiriesLoading || propertiesLoading;
  const combinedError = inquiriesError || propertiesError;

  const weeklyPerformance = useMemo(() => {
    const byDay = DAY_LABELS.map((day) => ({ day, leads: 0, goals: 0 }));
    for (const inquiry of inquiries) {
      const dayIndex = toDayIndex(inquiry.date);
      if (dayIndex === null) continue;
      if (inquiry.status === 'approved' || inquiry.status === 'contacted' || inquiry.status === 'converted') {
        byDay[dayIndex].leads += 1;
      }
    }
    return byDay.map((item) => ({
      ...item,
      goals: item.leads + 1,
    }));
  }, [inquiries]);

  const topInquiries = useMemo(() => inquiries.slice(0, 6), [inquiries]);

  const priorityTasks = useMemo(() => {
    return inquiries
      .filter((item) => item.status !== 'converted' && item.status !== 'rejected')
      .map((item, index) => ({
        id: item.id,
        label: `${item.clientName} - ${item.propertyTitle}`,
        priority: inquiryPriority(item.status).label,
        rank: inquiryPriority(item.status).rank,
        icon: iconByIndex(index),
      }))
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 5);
  }, [inquiries]);

  const leaderboard = useMemo(() => {
    const inquiryScore = new Map<string, number>();
    for (const item of inquiries) {
      const current = inquiryScore.get(item.agentId) || 0;
      const scoreBoost =
        item.status === 'converted' ? 50 :
        item.status === 'contacted' ? 25 :
        item.status === 'approved' ? 15 : 8;
      inquiryScore.set(item.agentId, current + scoreBoost);
    }

    const propertyScore = new Map<string, number>();
    for (const property of properties) {
      const current = propertyScore.get(property.agentId) || 0;
      const boost = property.status === 'rented' ? 40 : property.status === 'available' ? 15 : 8;
      propertyScore.set(property.agentId, current + boost);
    }

    const allAgentIds = Array.from(new Set([...inquiryScore.keys(), ...propertyScore.keys()]));
    const rows = allAgentIds.map((agentId) => {
      const value = (inquiryScore.get(agentId) || 0) + (propertyScore.get(agentId) || 0);
      return {
        name: `Agent ${agentId.replace(/^a/i, '').toUpperCase()}`,
        value,
        color: 'linear-gradient(90deg,#1f5fc4,#3b82f6)',
      };
    });

    const sorted = rows.sort((a, b) => b.value - a.value).slice(0, 3);
    if (sorted[2]) sorted[2].color = 'linear-gradient(90deg,#75d7c7,#8ee6d5)';
    return sorted;
  }, [inquiries, properties]);

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
            {isLoading ? (
              <Box h="100%" borderRadius="lg" bg="linear-gradient(180deg,#f8fafc,#eef4fb)" />
            ) : combinedError ? (
              <Flex h="100%" align="center" justify="center">
                <Text color="red.500">Failed to load chart data.</Text>
              </Flex>
            ) : (
              <WeeklyPerformanceChart data={weeklyPerformance} />
            )}
          </Box>
        </Box>

        <Box flex="0.95" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
          <Text fontWeight="700" fontSize="34px" mb={3}>Priority Tasks</Text>
          {isLoading ? (
            <Text color="gray.500">Loading tasks...</Text>
          ) : combinedError ? (
            <Text color="red.500">Unable to load tasks.</Text>
          ) : priorityTasks.length === 0 ? (
            <Text color="gray.500">No open priority tasks.</Text>
          ) : (
            priorityTasks.map((task) => (
              <Flex key={task.id} py={3} borderTop="1px solid" borderColor="gray.100" justify="space-between" align="center">
                <Flex align="center" gap={3}>
                  <Box as="input" type="checkbox" w="18px" h="18px" />
                  <Text>{task.label} - {task.priority}</Text>
                </Flex>
                <Icon as={task.icon} color="gray.500" />
              </Flex>
            ))
          )}
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
              {isLoading ? (
                <Box as="tr">
                  <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100" colSpan={4}>
                    <Text color="gray.500">Loading inquiries...</Text>
                  </Box>
                </Box>
              ) : combinedError ? (
                <Box as="tr">
                  <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100" colSpan={4}>
                    <Text color="red.500">Unable to load inquiries.</Text>
                  </Box>
                </Box>
              ) : topInquiries.length === 0 ? (
                <Box as="tr">
                  <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100" colSpan={4}>
                    <Text color="gray.500">No inquiries yet.</Text>
                  </Box>
                </Box>
              ) : (
                topInquiries.map((item: Inquiry) => {
                  const badge = statusBadgeColors(item.status);
                  return (
                    <Box as="tr" key={item.id}>
                      <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100">{item.clientName}</Box>
                      <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100">{item.propertyTitle}</Box>
                      <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100">{item.date}</Box>
                      <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100">
                        <Box as="span" px={4} py={1} borderRadius="full" bg={badge.bg} color={badge.fg} fontWeight="600">
                          {badge.label}
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>

        <Box flex="0.95" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
          <Text fontWeight="700" fontSize="34px" mb={3}>Agent Leaderboard</Text>
          {isLoading ? (
            <Text color="gray.500">Loading leaderboard...</Text>
          ) : combinedError ? (
            <Text color="red.500">Unable to load leaderboard.</Text>
          ) : leaderboard.length === 0 ? (
            <Text color="gray.500">No leaderboard data available.</Text>
          ) : (
            <Flex direction="column" gap={4}>
              {leaderboard.map((item) => (
                <Flex key={item.name} align="center" gap={3}>
                  <Text w="90px">{item.name}</Text>
                  <Box flex="1" h="34px" borderRadius="md" bg="#eef2f7" overflow="hidden">
                    <Box w={`${(item.value / Math.max(1, maxLeader)) * 100}%`} h="100%" bg={item.color} borderRadius="md" />
                  </Box>
                  <Text minW="42px" textAlign="right">{item.value}</Text>
                </Flex>
              ))}
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
