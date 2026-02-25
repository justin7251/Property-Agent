'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { LuFilter, LuMail, LuPlus, LuStar } from 'react-icons/lu';
import { useAgents } from '../../../hooks/useAgents';

export default function AgentsPage() {
  const { filtered, hasMore, loadMore, loadingMore } = useAgents();
  const [topOnly, setTopOnly] = useState(false);
  const visible = useMemo(
    () => (topOnly ? filtered.filter((agent) => agent.totalSales >= 500000) : filtered),
    [filtered, topOnly]
  );

  return (
    <Box>
      <Text fontSize="48px" fontWeight="800" mb={2}>Agents</Text>
      <Text fontSize="42px" fontWeight="700">Team Overview</Text>
      <Text color="gray.600" mb={4}>Manage your agents and view their performance.</Text>

      <Flex justify="space-between" mb={4} direction={{ base: 'column', md: 'row' }} gap={3}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} flex="1">
          {[
            { label: 'Total Agents', value: '48' },
            { label: 'Top Performers', value: '12' },
            { label: "This Month's Sales", value: '$2.4M' },
          ].map((stat) => (
            <Box key={stat.label} flex="1" bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={4}>
              <Text color="gray.600">{stat.label}</Text>
              <Text fontSize="44px" fontWeight="800">{stat.value}</Text>
            </Box>
          ))}
        </Flex>
        <Flex gap={2}>
          <Button variant="outline" onClick={() => setTopOnly((prev) => !prev)}>
            <Icon as={LuFilter} />
            {topOnly ? 'All Agents' : 'Top Performers'}
          </Button>
          <Link href="/agents/new">
            <Button colorScheme="blue"><Icon as={LuPlus} />Add New Agent</Button>
          </Link>
        </Flex>
      </Flex>

      <Box display="grid" gap={4} gridTemplateColumns={{ base: '1fr', md: 'repeat(2,minmax(0,1fr))', xl: 'repeat(4,minmax(0,1fr))' }}>
        {visible.map((agent, index) => (
          <Box key={agent.id} bg="white" border="1px solid" borderColor={index < 3 ? '#e7ce70' : 'gray.200'} borderRadius="2xl" p={4}>
            <Flex justify="space-between">
              <Box w="88px" h="88px" borderRadius="full" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" />
              {index < 3 ? <Text fontSize="52px" fontWeight="800" color="#b38d29">{index + 1}</Text> : null}
            </Flex>
            <Text mt={3} fontSize="34px" fontWeight="800">{agent.name}</Text>
            <Text color="gray.600">Listing Agent</Text>
            <Flex align="center" gap={1} my={2}><Icon as={LuStar} color="#f59e0b" /><Text>4.{(index + 6) % 10} ({64 + index * 7} Reviews)</Text></Flex>
            <Flex justify="space-between" borderTop="1px solid" borderColor="gray.100" pt={2} mb={2}>
              <Box><Text fontSize="xs" color="gray.500">SALES</Text><Text fontWeight="700">${(agent.totalSales / 1000000).toFixed(1)}M</Text></Box>
              <Box><Text fontSize="xs" color="gray.500">LISTINGS</Text><Text fontWeight="700">{agent.activeListings}</Text></Box>
            </Flex>
            <Flex justify="space-between" color="gray.600">
              <Link href={`mailto:${encodeURIComponent(agent.email)}`}>
                <Icon as={LuMail} />
              </Link>
              <Link href={`/agents/${agent.id}`}>
                <Text color="blue.600" fontWeight="600">View Profile</Text>
              </Link>
            </Flex>
          </Box>
        ))}
        <Box border="1px dashed" borderColor="gray.300" borderRadius="2xl" p={6} display="grid" placeItems="center">
          <Text fontSize="4xl">+</Text>
          <Text fontWeight="700">Add New Agent</Text>
          <Text color="gray.600" textAlign="center">Onboard a new team member to your agency.</Text>
        </Box>
      </Box>
      {hasMore ? (
        <Flex justify="center" mt={5}>
          <Button variant="outline" onClick={loadMore} loading={loadingMore}>
            Load More Agents
          </Button>
        </Flex>
      ) : null}
    </Box>
  );
}
