'use client';

import { Box } from '@chakra-ui/react';
import InquiryTable from '../../../components/inquiries/InquiryTable';
import PageHeader from '../../../components/ui/PageHeader';
import { useInquiries } from '../../../hooks/useInquiries';

export default function InquiriesPage() {
  const { filtered, status, setStatus } = useInquiries();
  return (
    <Box>
      <PageHeader
        title="Inquiries"
        action={
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: '8px' }}>
            <option value="all">all</option>
            <option value="new">new</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
          </select>
        }
      />
      <InquiryTable rows={filtered} />
    </Box>
  );
}
