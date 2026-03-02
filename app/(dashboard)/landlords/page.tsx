'use client';

import { useState } from 'react';
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import DataTable from '../../../components/ui/DataTable';
import PageHeader from '../../../components/ui/PageHeader';
import { useLandlords } from '../../../hooks/useLandlords';
import { createLandlord, updateLandlord } from '../../../services/firebase';
import type { Landlord } from '../../../types/landlord';
import PopupDialog from '../../../components/ui/PopupDialog';

export default function LandlordsPage() {
  const { landlords, setLandlords, hasMore, loadMore, loadingMore } = useLandlords();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLandlord, setEditingLandlord] = useState<Landlord | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', email: '', phone: '' });

  function openAdd() {
    setDraft({ name: '', email: '', phone: '' });
    setFormError(null);
    setEditingLandlord(null);
    setIsAddOpen(true);
  }

  function openEdit(landlord: Landlord) {
    setDraft({ name: landlord.name, email: landlord.email, phone: landlord.phone });
    setFormError(null);
    setIsAddOpen(false);
    setEditingLandlord(landlord);
  }

  function closeDialogs() {
    setIsAddOpen(false);
    setEditingLandlord(null);
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
      if (editingLandlord) {
        await updateLandlord(editingLandlord.id, payload);
        setLandlords((rows) => rows.map((row) => (row.id === editingLandlord.id ? { ...row, ...payload } : row)));
      } else {
        const joinedAt = new Date().toISOString().slice(0, 10);
        const id = await createLandlord({
          ...payload,
          totalProperties: 0,
          activeProperties: 0,
          revenue: 0,
          joinedAt,
        });
        setLandlords((rows) => [{ id, ...payload, totalProperties: 0, activeProperties: 0, revenue: 0, joinedAt }, ...rows]);
      }
      closeDialogs();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save landlord.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <PageHeader title="Landlords" action={<Button colorScheme="blue" onClick={openAdd}>Add Landlord</Button>} />
      <DataTable
        columns={[
          { key: 'name', header: 'Name', render: (row) => row.name },
          { key: 'email', header: 'Email', render: (row) => row.email },
          { key: 'total', header: 'Total Properties', render: (row) => row.totalProperties },
          { key: 'active', header: 'Active Properties', render: (row) => row.activeProperties },
          { key: 'revenue', header: 'Revenue', render: (row) => `$${row.revenue.toLocaleString()}` },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => <Button size="xs" variant="outline" onClick={() => openEdit(row)}>Edit</Button>,
          },
        ]}
        data={landlords}
      />
      {hasMore ? (
        <Box mt={4}>
          <Button variant="outline" onClick={loadMore} loading={loadingMore}>
            Load More Landlords
          </Button>
        </Box>
      ) : null}

      <PopupDialog isOpen={isAddOpen || !!editingLandlord} title={editingLandlord ? 'Edit Landlord' : 'Add Landlord'} onClose={closeDialogs} maxWidth="760px">
        <Box>
          <Text mb={1}>Name</Text>
          <Input mb={3} value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Landlord name" />
          <Text mb={1}>Email</Text>
          <Input mb={3} value={draft.email} onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))} placeholder="owner@company.com" />
          <Text mb={1}>Phone</Text>
          <Input mb={3} value={draft.phone} onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+1 555-0000" />
          {formError ? <Text mb={3} color="red.500">{formError}</Text> : null}
          <Flex justify="flex-end" gap={2}>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button colorScheme="blue" onClick={submitForm} loading={saving}>
              {editingLandlord ? 'Save Changes' : 'Create Landlord'}
            </Button>
          </Flex>
        </Box>
      </PopupDialog>
    </Box>
  );
}
