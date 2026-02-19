'use client';

import { Box, Text } from '@chakra-ui/react';
import type { Inquiry } from '../../types/inquiry';
import InquiryStatusBadge from '../ui/InquiryStatusBadge';

export default function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={5}>
      <Text fontSize="xl" fontWeight="700">{inquiry.clientName}</Text>
      <Text color="gray.600">{inquiry.clientEmail}</Text>
      <Text mt={3}>Property: {inquiry.propertyTitle}</Text>
      <Text>Agent: {inquiry.agentId}</Text>
      <Box mt={2}><InquiryStatusBadge status={inquiry.status} /></Box>
      <Text mt={4}>{inquiry.message}</Text>
    </Box>
  );
}
