'use client';

import { useEffect, useMemo, useState } from 'react';
import { inquiries as seededInquiries } from '../lib/mockData';
import type { Inquiry, InquiryStatus } from '../types/inquiry';
import { getInquiriesPage, seedDatabaseIfEmpty } from '../services/firebase';

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(seededInquiries);
  const [status, setStatus] = useState<'all' | InquiryStatus>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await seedDatabaseIfEmpty();
        const page = await getInquiriesPage({ pageSize: 25 }, status);
        if (!mounted) return;
        setInquiries(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load inquiries');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [status]);

  async function loadMore() {
    if (!hasMore || !cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await getInquiriesPage({ pageSize: 25, cursor }, status);
      setInquiries((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more inquiries');
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = useMemo(
    () => inquiries.filter((inquiry) => (status === 'all' ? true : inquiry.status === status)),
    [inquiries, status]
  );

  return { inquiries, filtered, status, setStatus, setInquiries, loading, loadingMore, hasMore, loadMore, error };
}
