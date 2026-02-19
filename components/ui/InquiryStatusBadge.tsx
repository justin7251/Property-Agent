'use client';

import { Box } from '@chakra-ui/react';
import { InquiryStatus } from '../../types/inquiry';

const colorByStatus: Record<InquiryStatus, { bg: string; fg: string }> = {
  new: { bg: '#DBEAFE', fg: '#1D4ED8' },
  in_progress: { bg: '#FEF3C7', fg: '#A16207' },
  resolved: { bg: '#DCFCE7', fg: '#166534' },
  closed: { bg: '#E5E7EB', fg: '#374151' },
};

export default function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const color = colorByStatus[status];
  return (
    <Box as="span" px={2.5} py={1} borderRadius="full" fontSize="12px" fontWeight="600" bg={color.bg} color={color.fg}>
      {status}
    </Box>
  );
}
