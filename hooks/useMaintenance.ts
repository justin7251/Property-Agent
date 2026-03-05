'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MaintenanceRequest, MaintenanceStatus } from '../types/maintenance';
import {
  assignMaintenanceRequest,
  createMaintenanceRequest,
  getCompanyUsersPage,
  getMaintenanceRequestsPage,
  updateMaintenanceStatus,
  type CompanyUserSummary,
} from '../services/firebase';

export function useMaintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [users, setUsers] = useState<CompanyUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestCursor, setRequestCursor] = useState<string | null>(null);
  const [hasMoreRequests, setHasMoreRequests] = useState(false);
  const [usersCursor, setUsersCursor] = useState<string | null>(null);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const firstRequests = await getMaintenanceRequestsPage({ pageSize: 25 });
        if (!mounted) return;
        setRequests(firstRequests.items);
        setRequestCursor(firstRequests.nextCursor);
        setHasMoreRequests(firstRequests.hasMore);
        try {
          const team = await getCompanyUsersPage({ pageSize: 50 });
          if (mounted) {
            setUsers(team.items);
            setUsersCursor(team.nextCursor);
            setHasMoreUsers(team.hasMore);
          }
        } catch {
          if (mounted) setUsers([]);
        }
        if (mounted) setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load maintenance requests.');
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function loadMoreRequests() {
    if (!hasMoreRequests || !requestCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getMaintenanceRequestsPage({ pageSize: 25, cursor: requestCursor });
      setRequests((prev) => [...prev, ...page.items]);
      setRequestCursor(page.nextCursor);
      setHasMoreRequests(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more maintenance requests.');
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadMoreUsers() {
    if (!hasMoreUsers || !usersCursor || loadingMoreUsers) return;
    setLoadingMoreUsers(true);
    try {
      const page = await getCompanyUsersPage({ pageSize: 50, cursor: usersCursor });
      setUsers((prev) => [...prev, ...page.items]);
      setUsersCursor(page.nextCursor);
      setHasMoreUsers(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more users.');
    } finally {
      setLoadingMoreUsers(false);
    }
  }

  const assignees = useMemo(
    () => users.filter((user) => user.role === 'agent' || user.role === 'contractor'),
    [users]
  );

  async function createRequest(input: {
    propertyId: string;
    propertyTitle: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }) {
    setSaving(true);
    setError(null);
    try {
      await createMaintenanceRequest(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create maintenance request.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function assignRequest(requestId: string, assignedToUserId: string) {
    setSaving(true);
    setError(null);
    try {
      await assignMaintenanceRequest(requestId, assignedToUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign maintenance request.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(requestId: string, status: MaintenanceStatus) {
    setSaving(true);
    setError(null);
    try {
      await updateMaintenanceStatus(requestId, { status });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update maintenance status.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return {
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
  };
}
