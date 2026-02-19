'use client';

import { useMemo, useState } from 'react';
import { inquiries as seededInquiries } from '../lib/mockData';
import type { Inquiry, InquiryStatus } from '../types/inquiry';

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(seededInquiries);
  const [status, setStatus] = useState<'all' | InquiryStatus>('all');

  const filtered = useMemo(
    () => inquiries.filter((inquiry) => (status === 'all' ? true : inquiry.status === status)),
    [inquiries, status]
  );

  return { inquiries, filtered, status, setStatus, setInquiries };
}
