'use client';

import { useMemo, useState } from 'react';
import { Box, Button, Flex, Input, Spinner, Text } from '@chakra-ui/react';
import { useMaintenance } from '../../../hooks/useMaintenance';
import type { MaintenancePriority, MaintenanceStatus } from '../../../types/maintenance';

const STATUS_STEPS: MaintenanceStatus[] = ['new', 'assigned', 'in_progress', 'completed'];
const PRIORITY_OPTIONS: MaintenancePriority[] = ['low', 'medium', 'high', 'critical'];

export default function MaintenancePage() {
  const {
    requests,
    assignees,
    hasMoreRequests,
    hasMoreUsers,
    loading,
    loadingMore,
    loadingMoreUsers,
    saving,
    error,
    setError,
    createRequest,
    assignRequest,
    updateStatus,
    loadMoreRequests,
    loadMoreUsers,
  } = useMaintenance();
  const [propertyId, setPropertyId] = useState('');
  const [propertyTitle, setPropertyTitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [assignTarget, setAssignTarget] = useState<Record<string, string>>({});

  const stats = useMemo(
    () => ({
      total: requests.length,
      new: requests.filter((item) => item.status === 'new').length,
      active: requests.filter((item) => item.status === 'assigned' || item.status === 'in_progress').length,
      completed: requests.filter((item) => item.status === 'completed').length,
    }),
    [requests]
  );

  async function onCreate() {
    setError(null);
    try {
      await createRequest({ propertyId, propertyTitle, title, description, priority });
      setPropertyId('');
      setPropertyTitle('');
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch {
      // handled in hook
    }
  }

  async function onAssign(requestId: string) {
    const target = assignTarget[requestId];
    if (!target) return;
    try {
      await assignRequest(requestId, target);
    } catch {
      // handled in hook
    }
  }

  async function onAdvance(itemId: string, current: MaintenanceStatus) {
    const idx = STATUS_STEPS.indexOf(current);
    if (idx < 0 || idx === STATUS_STEPS.length - 1) return;
    const next = STATUS_STEPS[idx + 1];
    try {
      await updateStatus(itemId, next);
    } catch {
      // handled in hook
    }
  }

  return (
    <Box>
      <Text fontSize="48px" fontWeight="800" mb={2}>Maintenance</Text>
      <Text color="gray.600" mb={4}>Track requests from creation to completion with role-based assignment and progress.</Text>

      {error ? (
        <Box mb={4} p={3} borderRadius="md" bg="#fee2e2" color="#991b1b" border="1px solid #fecaca">
          {error}
        </Box>
      ) : null}

      <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={4}>
        {[
          { label: 'Total', value: stats.total },
          { label: 'New', value: stats.new },
          { label: 'Active', value: stats.active },
          { label: 'Completed', value: stats.completed },
        ].map((stat) => (
          <Box key={stat.label} flex="1" bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={4}>
            <Text color="gray.600">{stat.label}</Text>
            <Text fontSize="38px" fontWeight="800">{stat.value}</Text>
          </Box>
        ))}
      </Flex>

      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={4} mb={4}>
        <Text fontWeight="700" mb={3}>Create Maintenance Request</Text>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={3}>
          <Input value={propertyId} onChange={(e) => setPropertyId(e.target.value)} placeholder="Property ID" />
          <Input value={propertyTitle} onChange={(e) => setPropertyTitle(e.target.value)} placeholder="Property Title" />
        </Flex>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={3}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Issue title" />
          <Box
            as="select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
            style={{ width: '100%', height: '40px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px' }}
          >
            {PRIORITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Box>
        </Flex>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue" mb={3} />
        <Button colorScheme="blue" onClick={onCreate} loading={saving}>
          Submit Request
        </Button>
      </Box>

      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={4}>
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontWeight="700">Maintenance Queue</Text>
          {hasMoreUsers ? (
            <Button size="xs" variant="outline" onClick={loadMoreUsers} loading={loadingMoreUsers}>
              Load More Assignees
            </Button>
          ) : null}
        </Flex>
        {loading ? (
          <Spinner />
        ) : (
          <Box overflowX="auto">
            <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
              <Box as="thead">
                <Box as="tr">
                  {['Property', 'Issue', 'Priority', 'Status', 'Assignee', 'Actions'].map((header) => (
                    <Box key={header} as="th" textAlign="left" py={2} px={2}>
                      <Text fontSize="sm" color="gray.600">{header}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {requests.map((item) => (
                  <Box key={item.id} as="tr">
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{item.propertyTitle}</Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                      <Text fontWeight="600">{item.title}</Text>
                      <Text color="gray.600" fontSize="sm">{item.description}</Text>
                    </Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{item.priority}</Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{item.status}</Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                      <Box
                        as="select"
                        value={assignTarget[item.id] || item.assignedToUserId || ''}
                        onChange={(e) => setAssignTarget((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        style={{ width: '200px', height: '36px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px' }}
                      >
                        <option value="">Unassigned</option>
                        {assignees.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email} ({user.role})
                          </option>
                        ))}
                      </Box>
                    </Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                      <Flex gap={2}>
                        <Button size="xs" variant="outline" onClick={() => onAssign(item.id)} loading={saving} disabled={!assignTarget[item.id]}>
                          Assign
                        </Button>
                        <Button size="xs" colorScheme="blue" onClick={() => onAdvance(item.id, item.status)} loading={saving} disabled={item.status === 'completed'}>
                          Advance
                        </Button>
                      </Flex>
                    </Box>
                  </Box>
                ))}
                {requests.length === 0 ? (
                  <Box as="tr">
                    <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100" colSpan={6}>
                      <Text color="gray.500">No maintenance requests found.</Text>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            </Box>
          </Box>
        )}
        {hasMoreRequests ? (
          <Flex justify="center" mt={4}>
            <Button variant="outline" onClick={loadMoreRequests} loading={loadingMore}>
              Load More Requests
            </Button>
          </Flex>
        ) : null}
      </Box>
    </Box>
  );
}
