'use client';

import { Box } from '@chakra-ui/react';
import { InquiryStatus } from '../../types/inquiry';

const colorByStatus: Record<InquiryStatus, { bg: string; fg: string }> = {
  new: { bg: '#DBEAFE', fg: '#1D4ED8' },
  approved: { bg: '#E0F2FE', fg: '#0C4A6E' },
  rejected: { bg: '#FEE2E2', fg: '#991B1B' },
  contacted: { bg: '#FEF3C7', fg: '#92400E' },
  converted: { bg: '#DCFCE7', fg: '#166534' },
};

export default function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const color = colorByStatus[status];
  return (
    <Box as="span" px={2.5} py={1} borderRadius="full" fontSize="12px" fontWeight="600" bg={color.bg} color={color.fg}>
      {status}
    </Box>
  );
}
