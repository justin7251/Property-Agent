'use client';

import Link from 'next/link';
import { Box, Button, Flex, Input } from '@chakra-ui/react';
import PropertyCard from '../../../components/properties/PropertyCard';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { useProperties } from '../../../hooks/useProperties';

export default function PropertiesPage() {
  const { filtered, status, setStatus, query, setQuery } = useProperties();
  return (
    <Box>
      <PageHeader title="Properties" action={<Link href="/properties/new"><Button colorScheme="blue">Add Property</Button></Link>} />
      <Flex gap={2} mb={4} direction={{ base: 'column', md: 'row' }}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        >
          <option value="all">all</option>
          <option value="available">available</option>
          <option value="rented">rented</option>
          <option value="under_review">under_review</option>
          <option value="off_market">off_market</option>
        </select>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search properties..." maxW="360px" />
      </Flex>
      {filtered.length === 0 ? (
        <EmptyState title="No properties" description="No properties match the selected filters." />
      ) : (
        <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2,minmax(0,1fr))', xl: 'repeat(3,minmax(0,1fr))' }} gap={3}>
          {filtered.map((property) => <PropertyCard key={property.id} property={property} />)}
        </Box>
      )}
    </Box>
  );
}
