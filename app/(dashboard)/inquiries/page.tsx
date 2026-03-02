'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Box, Button, Flex, Icon, Input, Text, Textarea } from '@chakra-ui/react';
import { LuMail } from 'react-icons/lu';
import { auth, createInquiry, createMaintenanceRequest, updateInquiry } from '../../../services/firebase';
import { useInquiries } from '../../../hooks/useInquiries';
import type { Inquiry, InquiryStatus, MaintenanceDecision } from '../../../types/inquiry';
import type { MaintenancePriority } from '../../../types/maintenance';
import PopupDialog from '../../../components/ui/PopupDialog';

type ViewMode = 'inbox' | 'follow_up' | 'converted' | 'archived';
type OwnerMode = 'team' | 'mine' | 'unassigned';

function getAgeDays(dateValue: string, now: number): number {
  const ts = Date.parse(dateValue);
  if (Number.isNaN(ts)) return 0;
  return Math.max(0, Math.floor((now - ts) / 86400000));
}

function urgency(ageDays: number): { label: string; bg: string; fg: string } {
  if (ageDays >= 3) return { label: 'Overdue', bg: '#fee2e2', fg: '#991b1b' };
  if (ageDays >= 1) return { label: 'Due Soon', bg: '#fef3c7', fg: '#92400e' };
  return { label: 'On Track', bg: '#dcfce7', fg: '#166534' };
}

function getMaintenancePriority(row: Inquiry, ageDays: number): MaintenancePriority {
  const body = row.message.toLowerCase();
  if (body.includes('flood') || body.includes('electrical') || body.includes('no power') || body.includes('gas')) {
    return 'critical';
  }
  if (ageDays >= 3) return 'high';
  if (ageDays >= 1) return 'medium';
  return 'low';
}

export default function InquiriesPage() {
  const { inquiries, setInquiries, hasMore, loadMore, loadingMore, status, setStatus } = useInquiries();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftInquiry, setDraftInquiry] = useState({
    clientName: '',
    clientEmail: '',
    propertyId: '',
    propertyTitle: '',
    agentId: '',
    message: '',
    status: 'new' as InquiryStatus,
  });
  const [view, setView] = useState<ViewMode>('inbox');
  const [ownerMode, setOwnerMode] = useState<OwnerMode>('team');
  const [daysFilter, setDaysFilter] = useState<'all' | '7' | '30' | '90'>('30');
  const [archivedIds, setArchivedIds] = useState<Record<string, boolean>>({});
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<string, string>>({});
  const [referenceNow] = useState(() => Date.now());
  const [savingId, setSavingId] = useState<string | null>(null);
  const activeUserId = auth.currentUser?.uid || 'me';

  const filteredRows = useMemo(() => {
    const days = daysFilter === 'all' ? null : Number(daysFilter);
    return inquiries.filter((row) => {
      const isArchived = !!archivedIds[row.id];
      const isMine = row.agentId === activeUserId;
      const isUnassigned = !row.agentId || row.agentId.trim() === '';

      if (view === 'archived') {
        if (!isArchived) return false;
      } else if (isArchived) {
        return false;
      }

      if (view === 'inbox' && row.status !== 'new' && row.status !== 'approved') return false;
      if (view === 'follow_up' && row.status !== 'contacted') return false;
      if (view === 'converted' && row.status !== 'converted') return false;

      if (ownerMode === 'mine' && !isMine) return false;
      if (ownerMode === 'unassigned' && !isUnassigned) return false;

      if (!days) return true;
      const ts = Date.parse(row.date);
      if (Number.isNaN(ts)) return true;
      return referenceNow - ts <= days * 86400000;
    });
  }, [inquiries, daysFilter, archivedIds, referenceNow, view, ownerMode, activeUserId]);

  const needsAction = useMemo(() => {
    return filteredRows
      .filter((row) => row.status === 'new' || row.status === 'approved')
      .sort((a, b) => getAgeDays(b.date, referenceNow) - getAgeDays(a.date, referenceNow))
      .slice(0, 6);
  }, [filteredRows, referenceNow]);

  const summary = useMemo(() => {
    return {
      total: inquiries.length,
      unassigned: inquiries.filter((row) => !row.agentId || row.agentId.trim() === '').length,
      overdue: inquiries.filter((row) => getAgeDays(row.date, referenceNow) >= 3 && row.status !== 'converted' && !archivedIds[row.id]).length,
      mine: inquiries.filter((row) => row.agentId === activeUserId && !archivedIds[row.id]).length,
    };
  }, [inquiries, archivedIds, referenceNow, activeUserId]);

  function archiveInquiry(id: string) {
    setArchivedIds((prev) => ({ ...prev, [id]: true }));
  }

  async function applyPatch(id: string, patch: Partial<Inquiry>) {
    setSavingId(id);
    const snapshot = inquiries;
    setInquiries((rows) =>
      rows.map((row) =>
        row.id === id
          ? {
              ...row,
              ...patch,
            }
          : row
      )
    );
    try {
      await updateInquiry(id, patch);
    } catch {
      setInquiries(snapshot);
    } finally {
      setSavingId(null);
    }
  }

  async function setMaintenanceDecision(id: string, decision: MaintenanceDecision) {
    await applyPatch(id, { inquiryType: 'maintenance', maintenanceDecision: decision });
  }

  async function createMaintenanceJob(row: Inquiry) {
    setSavingId(row.id);
    const snapshot = inquiries;
    const ageDays = getAgeDays(row.date, referenceNow);
    try {
      const requestId = await createMaintenanceRequest({
        propertyId: row.propertyId,
        propertyTitle: row.propertyTitle,
        title: `Inquiry from ${row.clientName}`,
        description: row.message,
        priority: getMaintenancePriority(row, ageDays),
      });
      setInquiries((rows) =>
        rows.map((item) =>
          item.id === row.id
            ? {
                ...item,
                inquiryType: 'maintenance',
                maintenanceDecision: 'approved',
                maintenanceRequestId: requestId,
              }
            : item
        )
      );
      await updateInquiry(row.id, {
        inquiryType: 'maintenance',
        maintenanceDecision: 'approved',
        maintenanceRequestId: requestId,
      });
    } catch {
      setInquiries(snapshot);
    } finally {
      setSavingId(null);
    }
  }

  async function saveSchedule(row: Inquiry) {
    const draft = scheduleDrafts[row.id];
    if (!draft) return;
    const iso = new Date(draft).toISOString();
    await applyPatch(row.id, { inquiryType: 'maintenance', maintenanceScheduledAt: iso });
  }

  function openCreateForm() {
    setDraftInquiry({
      clientName: '',
      clientEmail: '',
      propertyId: '',
      propertyTitle: '',
      agentId: '',
      message: '',
      status: 'new',
    });
    setCreateError(null);
    setEditingInquiry(null);
    setShowCreateForm(true);
  }

  function openEditForm(row: Inquiry) {
    setDraftInquiry({
      clientName: row.clientName,
      clientEmail: row.clientEmail,
      propertyId: row.propertyId,
      propertyTitle: row.propertyTitle,
      agentId: row.agentId,
      message: row.message,
      status: row.status,
    });
    setCreateError(null);
    setShowCreateForm(false);
    setEditingInquiry(row);
  }

  function closeFormDialog() {
    setShowCreateForm(false);
    setEditingInquiry(null);
    setCreateError(null);
  }

  async function submitInquiryForm() {
    if (creating) return;
    setCreateError(null);
    const payload = {
      clientName: draftInquiry.clientName.trim(),
      clientEmail: draftInquiry.clientEmail.trim(),
      propertyId: draftInquiry.propertyId.trim(),
      propertyTitle: draftInquiry.propertyTitle.trim(),
      agentId: draftInquiry.agentId.trim(),
      message: draftInquiry.message.trim(),
      status: draftInquiry.status,
    };
    if (!payload.clientName || !payload.clientEmail || !payload.propertyId || !payload.propertyTitle || !payload.agentId || !payload.message) {
      setCreateError('All fields are required.');
      return;
    }
    setCreating(true);
    try {
      if (editingInquiry) {
        await updateInquiry(editingInquiry.id, payload);
        setInquiries((rows) => rows.map((row) => (row.id === editingInquiry.id ? { ...row, ...payload } : row)));
      } else {
        const now = new Date().toISOString();
        const id = await createInquiry({
          ...payload,
          inquiryType: 'lead',
          date: now,
        });
        setInquiries((rows) => [{ id, ...payload, inquiryType: 'lead', date: now }, ...rows]);
      }
      closeFormDialog();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to save inquiry.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
        <Text fontSize="48px" fontWeight="800">Inquiries</Text>
        <Button colorPalette="blue" onClick={openCreateForm}>
          Add Inquiry
        </Button>
      </Flex>

      <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={4}>
        {[
          { label: 'Total', value: summary.total },
          { label: 'Unassigned', value: summary.unassigned },
          { label: 'Overdue', value: summary.overdue },
          { label: 'My Queue', value: summary.mine },
        ].map((card) => (
          <Box key={card.label} flex="1" bg="white" border="1px solid" borderColor="#bde8dc" borderRadius="2xl" p={4}>
            <Text color="gray.600">{card.label}</Text>
            <Text fontSize="42px" fontWeight="800">{card.value}</Text>
          </Box>
        ))}
      </Flex>

      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={4} mb={4}>
        <Text fontSize="30px" fontWeight="700" mb={2}>Needs Action</Text>
        {needsAction.length === 0 ? (
          <Text color="gray.500">No urgent inquiries right now.</Text>
        ) : (
          needsAction.map((row) => {
            const ageDays = getAgeDays(row.date, referenceNow);
            const badge = urgency(ageDays);
            return (
              <Flex key={row.id} justify="space-between" align="center" py={3} borderTop="1px solid" borderColor="gray.100" gap={3} wrap="wrap">
                <Box>
                  <Text fontWeight="700">{row.clientName} - {row.propertyTitle}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Age: {ageDays} day(s) | Type: {row.inquiryType || 'lead'}
                  </Text>
                </Box>
                <Flex align="center" gap={2} wrap="wrap">
                  <Box px={2.5} py={1} borderRadius="full" bg={badge.bg} color={badge.fg} fontSize="xs" fontWeight="700">{badge.label}</Box>
                  <Button size="xs" variant="outline" onClick={() => applyPatch(row.id, { agentId: activeUserId })} loading={savingId === row.id}>Claim</Button>
                  <Button size="xs" variant="outline" colorPalette="blue" onClick={() => applyPatch(row.id, { status: 'contacted' })} loading={savingId === row.id}>Contacted</Button>
                  {row.inquiryType !== 'maintenance' ? (
                    <Button size="xs" variant="outline" colorPalette="orange" onClick={() => applyPatch(row.id, { inquiryType: 'maintenance', maintenanceDecision: 'pending' })} loading={savingId === row.id}>
                      Mark Maintenance
                    </Button>
                  ) : null}
                  {row.inquiryType === 'maintenance' && !row.maintenanceRequestId ? (
                    <Button size="xs" variant="outline" colorPalette="orange" onClick={() => createMaintenanceJob(row)} loading={savingId === row.id}>
                      Approve + Create Job
                    </Button>
                  ) : null}
                  <Button size="xs" variant="outline" colorPalette="green" onClick={() => applyPatch(row.id, { status: 'converted' })} loading={savingId === row.id}>Convert</Button>
                  <Button size="xs" variant="outline" colorPalette="red" onClick={() => applyPatch(row.id, { status: 'rejected' })} loading={savingId === row.id}>Reject</Button>
                </Flex>
              </Flex>
            );
          })
        )}
      </Box>

      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={3}>
        <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
          <Text fontSize="34px" fontWeight="700">Inquiry Queue</Text>
          <Flex gap={2} wrap="wrap">
            {[
              { id: 'inbox', label: 'Inbox' },
              { id: 'follow_up', label: 'Follow-up' },
              { id: 'converted', label: 'Converted' },
              { id: 'archived', label: 'Archived' },
            ].map((tab) => (
              <Button key={tab.id} size="sm" variant={view === tab.id ? 'solid' : 'outline'} colorPalette="blue" onClick={() => setView(tab.id as ViewMode)}>
                {tab.label}
              </Button>
            ))}
          </Flex>
        </Flex>

        <Flex gap={2} mb={3} wrap="wrap">
          <Box as="select" border="1px solid" borderColor="blue.200" borderRadius="lg" px={2} value={status} onChange={(e) => setStatus(e.target.value as 'all' | InquiryStatus)}>
            <option value="all">Status: All</option>
            <option value="new">New</option>
            <option value="approved">Approved</option>
            <option value="contacted">Contacted</option>
            <option value="rejected">Rejected</option>
            <option value="converted">Converted</option>
          </Box>
          <Box as="select" border="1px solid" borderColor="gray.200" borderRadius="lg" px={2} value={ownerMode} onChange={(e) => setOwnerMode(e.target.value as OwnerMode)}>
            <option value="team">Team</option>
            <option value="mine">My Inquiries</option>
            <option value="unassigned">Unassigned</option>
          </Box>
          <Box as="select" border="1px solid" borderColor="gray.200" borderRadius="lg" px={2} value={daysFilter} onChange={(e) => setDaysFilter(e.target.value as 'all' | '7' | '30' | '90')}>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </Box>
          <Button variant="outline" colorPalette="blue">Export</Button>
        </Flex>

        <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
          <Box as="thead">
            <Box as="tr">
              {['Client', 'Property', 'Type', 'Owner', 'Urgency', 'Status', 'Maintenance', 'Actions'].map((header) => (
                <Box key={header} as="th" py={2} px={2} textAlign="left">{header}</Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {filteredRows.map((row) => {
              const ageDays = getAgeDays(row.date, referenceNow);
              const badge = urgency(ageDays);
              return (
                <Box as="tr" key={row.id}>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{row.clientName}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{row.propertyTitle}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{row.inquiryType || 'lead'}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{row.agentId || 'Unassigned'}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                    <Box as="span" px={2.5} py={1} borderRadius="full" bg={badge.bg} color={badge.fg} fontSize="xs" fontWeight="700">{badge.label}</Box>
                  </Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                    <Box as="span" px={2.5} py={1} borderRadius="full" bg="#d1fae5" color="#065f46">{row.status}</Box>
                  </Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                    {row.inquiryType === 'maintenance' ? (
                      <Flex gap={2} align="center" wrap="wrap">
                        <Box as="span" px={2} py={1} borderRadius="full" bg="#ffedd5" color="#9a3412" fontSize="xs">
                          {row.maintenanceDecision || 'pending'}
                        </Box>
                        {!row.maintenanceRequestId ? (
                          <Button size="xs" variant="outline" colorPalette="orange" onClick={() => createMaintenanceJob(row)} loading={savingId === row.id}>
                            Create Job
                          </Button>
                        ) : (
                          <Link href={`/maintenance?requestId=${encodeURIComponent(row.maintenanceRequestId)}`}>
                            <Button size="xs" variant="outline" colorPalette="orange">View Job</Button>
                          </Link>
                        )}
                        <Button size="xs" variant="outline" onClick={() => setMaintenanceDecision(row.id, 'deferred')} loading={savingId === row.id}>
                          Defer
                        </Button>
                        <Button size="xs" variant="outline" colorPalette="red" onClick={() => setMaintenanceDecision(row.id, 'rejected')} loading={savingId === row.id}>
                          Reject
                        </Button>
                        <Box
                          as="input"
                          type="datetime-local"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                          px={2}
                          py={1}
                          value={scheduleDrafts[row.id] || (row.maintenanceScheduledAt ? row.maintenanceScheduledAt.slice(0, 16) : '')}
                          onChange={(e) => setScheduleDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))}
                        />
                        <Button size="xs" variant="outline" colorPalette="blue" onClick={() => saveSchedule(row)} loading={savingId === row.id}>
                          Schedule
                        </Button>
                      </Flex>
                    ) : (
                      <Button size="xs" variant="outline" colorPalette="orange" onClick={() => applyPatch(row.id, { inquiryType: 'maintenance', maintenanceDecision: 'pending' })} loading={savingId === row.id}>
                        Mark Maintenance
                      </Button>
                    )}
                  </Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                    <Flex gap={2} wrap="wrap">
                      <Link href={`mailto:${encodeURIComponent(row.clientEmail)}`}>
                        <Button size="xs" variant="outline"><Icon as={LuMail} /></Button>
                      </Link>
                      <Button size="xs" variant="outline" onClick={() => applyPatch(row.id, { status: 'contacted' })} loading={savingId === row.id}>
                        Contacted
                      </Button>
                      <Button size="xs" variant="outline" onClick={() => openEditForm(row)}>
                        Edit
                      </Button>
                      <Link href={`/inquiries/${row.id}`}>
                        <Button size="xs" variant="outline" colorPalette="blue">Details</Button>
                      </Link>
                      <Button size="xs" variant="outline" colorPalette="gray" onClick={() => archiveInquiry(row.id)}>Archive</Button>
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {hasMore ? (
          <Flex justify="center" mt={4}>
            <Button variant="outline" onClick={loadMore} loading={loadingMore}>
              Load More Inquiries
            </Button>
          </Flex>
        ) : null}
      </Box>

      <PopupDialog isOpen={showCreateForm || !!editingInquiry} title={editingInquiry ? 'Edit Inquiry' : 'Add New Inquiry'} onClose={closeFormDialog}>
        <Box>
          <Flex gap={2} direction={{ base: 'column', md: 'row' }} mb={2}>
            <Input placeholder="Client Name" value={draftInquiry.clientName} onChange={(e) => setDraftInquiry((prev) => ({ ...prev, clientName: e.target.value }))} />
            <Input placeholder="Client Email" value={draftInquiry.clientEmail} onChange={(e) => setDraftInquiry((prev) => ({ ...prev, clientEmail: e.target.value }))} />
          </Flex>
          <Flex gap={2} direction={{ base: 'column', md: 'row' }} mb={2}>
            <Input placeholder="Property ID" value={draftInquiry.propertyId} onChange={(e) => setDraftInquiry((prev) => ({ ...prev, propertyId: e.target.value }))} />
            <Input placeholder="Property Title" value={draftInquiry.propertyTitle} onChange={(e) => setDraftInquiry((prev) => ({ ...prev, propertyTitle: e.target.value }))} />
            <Input placeholder="Assign Agent ID" value={draftInquiry.agentId} onChange={(e) => setDraftInquiry((prev) => ({ ...prev, agentId: e.target.value }))} />
          </Flex>
          <Box as="select" w="100%" border="1px solid" borderColor="gray.200" borderRadius="md" px={3} py={2} mb={2} value={draftInquiry.status} onChange={(e) => setDraftInquiry((prev) => ({ ...prev, status: e.target.value as InquiryStatus }))}>
            <option value="new">new</option>
            <option value="approved">approved</option>
            <option value="contacted">contacted</option>
            <option value="rejected">rejected</option>
            <option value="converted">converted</option>
          </Box>
          <Textarea placeholder="Inquiry Message" value={draftInquiry.message} onChange={(e) => setDraftInquiry((prev) => ({ ...prev, message: e.target.value }))} mb={2} />
          {createError ? <Text color="red.600" fontSize="sm" mb={2}>{createError}</Text> : null}
          <Flex justify="flex-end" gap={2}>
            <Button variant="outline" onClick={closeFormDialog}>Cancel</Button>
            <Button colorPalette="blue" onClick={submitInquiryForm} loading={creating}>
              {editingInquiry ? 'Save Changes' : 'Create Inquiry'}
            </Button>
          </Flex>
        </Box>
      </PopupDialog>
    </Box>
  );
}
