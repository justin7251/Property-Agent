'use client';

import Link from 'next/link';
import { Box, Button, Text } from '@chakra-ui/react';
import type { Property } from '../../types/property';
import { formatCurrency } from '../../lib/utils';

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" overflow="hidden">
      <Box h="140px" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" />
      <Box p={4}>
        <Text fontWeight="700">{property.title}</Text>
        <Text color="gray.600" fontSize="sm">{property.address}</Text>
        <Text mt={2} fontWeight="700">{formatCurrency(property.price)}/{property.priceUnit}</Text>
        <Text mt={1} fontSize="12px" color="gray.500">{property.status} • Agent: {property.agentId}</Text>
        <Link href={`/properties/${property.id}`}>
          <Button mt={3} size="sm" variant="outline">View</Button>
        </Link>
      </Box>
    </Box>
  );
}
