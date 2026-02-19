'use client';

import { useParams } from 'next/navigation';
import { Box, Input, Text } from '@chakra-ui/react';
import InquiryDetail from '../../../../components/inquiries/InquiryDetail';
import PageHeader from '../../../../components/ui/PageHeader';
import { inquiries } from '../../../../lib/mockData';

export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const inquiry = inquiries.find((item) => item.id === params.id);
  if (!inquiry) return <Text>Inquiry not found.</Text>;

  return (
    <Box>
      <PageHeader title="Inquiry Detail" subtitle={`Inquiry ID: ${inquiry.id}`} />
      <InquiryDetail inquiry={inquiry} />
      <Box mt={4} bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
        <Text fontWeight="700" mb={2}>Reply / Notes</Text>
        <Input placeholder="Write a note..." mb={2} />
        <Input placeholder="Draft a reply..." />
      </Box>
    </Box>
  );
}
