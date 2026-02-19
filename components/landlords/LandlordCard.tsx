'use client';

import Link from 'next/link';
import { Box, Button, Text } from '@chakra-ui/react';
import type { Landlord } from '../../types/landlord';
import { formatCurrency } from '../../lib/utils';

export default function LandlordCard({ landlord }: { landlord: Landlord }) {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
      <Text fontWeight="700">{landlord.name}</Text>
      <Text color="gray.600" fontSize="sm">{landlord.email}</Text>
      <Text mt={2} fontSize="sm">Properties: {landlord.totalProperties}</Text>
      <Text fontSize="sm">Active: {landlord.activeProperties}</Text>
      <Text fontSize="sm">Revenue: {formatCurrency(landlord.revenue)}</Text>
      <Link href={`/landlords/${landlord.id}`}>
        <Button mt={3} size="sm" variant="outline">View</Button>
      </Link>
    </Box>
  );
}
