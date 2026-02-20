'use client';

import { useEffect, useMemo, useState } from 'react';
import { inquiries as seededInquiries } from '../lib/mockData';
import type { Inquiry, InquiryStatus } from '../types/inquiry';
import { seedDatabaseIfEmpty, subscribeInquiries } from '../services/firebase';

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(seededInquiries);
  const [status, setStatus] = useState<'all' | InquiryStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        await seedDatabaseIfEmpty();
        unsubscribe = subscribeInquiries((rows) => {
          if (!mounted) return;
          setInquiries(rows);
          setLoading(false);
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load inquiries');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filtered = useMemo(
    () => inquiries.filter((inquiry) => (status === 'all' ? true : inquiry.status === status)),
    [inquiries, status]
  );

  return { inquiries, filtered, status, setStatus, setInquiries, loading, error };
}
