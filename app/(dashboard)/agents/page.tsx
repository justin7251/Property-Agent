'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Box, Button, Flex, Icon, Input, Text } from '@chakra-ui/react';
import { LuFilter, LuMail, LuPlus, LuStar } from 'react-icons/lu';
import { useAgents } from '../../../hooks/useAgents';
import { createAgent, updateAgent } from '../../../services/firebase';
import type { Agent } from '../../../types/agent';
import PopupDialog from '../../../components/ui/PopupDialog';

export default function AgentsPage() {
  const { filtered, setAgents, hasMore, loadMore, loadingMore } = useAgents();
  const [topOnly, setTopOnly] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', email: '', phone: '' });
  const visible = useMemo(
    () => (topOnly ? filtered.filter((agent) => agent.totalSales >= 500000) : filtered),
    [filtered, topOnly]
  );

  function openAdd() {
    setDraft({ name: '', email: '', phone: '' });
    setFormError(null);
    setEditingAgent(null);
    setIsAddOpen(true);
  }

  function openEdit(agent: Agent) {
    setDraft({ name: agent.name, email: agent.email, phone: agent.phone });
    setFormError(null);
    setIsAddOpen(false);
    setEditingAgent(agent);
  }

  function closeDialogs() {
    setIsAddOpen(false);
    setEditingAgent(null);
    setFormError(null);
  }

  async function submitForm() {
    if (saving) return;
    const payload = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    };
    if (!payload.name || !payload.email || !payload.phone) {
      setFormError('Name, email, and phone are required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, payload);
        setAgents((rows) => rows.map((row) => (row.id === editingAgent.id ? { ...row, ...payload } : row)));
      } else {
        const id = await createAgent({
          ...payload,
          totalSales: 0,
          activeListings: 0,
          closedDeals: 0,
          joinedAt: new Date().toISOString().slice(0, 10),
        });
        setAgents((rows) => [{ id, ...payload, totalSales: 0, activeListings: 0, closedDeals: 0, joinedAt: new Date().toISOString().slice(0, 10) }, ...rows]);
      }
      closeDialogs();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save agent.');
    } finally {
      setSaving(false);
    }
  }

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
          <Button colorScheme="blue" onClick={openAdd}><Icon as={LuPlus} />Add New Agent</Button>
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
              <Flex gap={2}>
                <Button size="xs" variant="outline" onClick={() => openEdit(agent)}>Edit</Button>
                <Link href={`/agents/${agent.id}`}>
                  <Text color="blue.600" fontWeight="600">View Profile</Text>
                </Link>
              </Flex>
            </Flex>
          </Box>
        ))}
        <Box border="1px dashed" borderColor="gray.300" borderRadius="2xl" p={6} display="grid" placeItems="center" cursor="pointer" onClick={openAdd}>
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

      <PopupDialog isOpen={isAddOpen || !!editingAgent} title={editingAgent ? 'Edit Agent' : 'Add New Agent'} onClose={closeDialogs} maxWidth="760px">
        <Box>
          <Text mb={1}>Name</Text>
          <Input mb={3} value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Agent name" />
          <Text mb={1}>Email</Text>
          <Input mb={3} value={draft.email} onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))} placeholder="agent@propestate.com" />
          <Text mb={1}>Phone</Text>
          <Input mb={3} value={draft.phone} onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+1 555-0000" />
          {formError ? <Text mb={3} color="red.500">{formError}</Text> : null}
          <Flex justify="flex-end" gap={2}>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button colorScheme="blue" onClick={submitForm} loading={saving}>
              {editingAgent ? 'Save Changes' : 'Create Agent'}
            </Button>
          </Flex>
        </Box>
      </PopupDialog>
    </Box>
  );
}
