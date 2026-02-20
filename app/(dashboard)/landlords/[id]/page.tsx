'use client';

import { useParams } from 'next/navigation';
import { Box, Text } from '@chakra-ui/react';
import PageHeader from '../../../../components/ui/PageHeader';
import { landlords, properties } from '../../../../lib/mockData';

export default function LandlordDetailPage() {
  const params = useParams<{ id: string }>();
  if (!params?.id) return <Text>Landlord not found.</Text>;
  const landlord = landlords.find((item) => item.id === params.id);
  if (!landlord) return <Text>Landlord not found.</Text>;

  const owned = properties.filter((property) => property.landlordId === landlord.id);

  return (
    <Box>
      <PageHeader title={landlord.name} subtitle={landlord.email} />
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4} mb={4}>
        <Text>Phone: {landlord.phone}</Text>
        <Text>Total Properties: {landlord.totalProperties}</Text>
        <Text>Active: {landlord.activeProperties}</Text>
        <Text>Revenue: ${landlord.revenue.toLocaleString()}</Text>
      </Box>
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
        <Text fontWeight="700">Owned Properties</Text>
        {owned.map((property) => <Text key={property.id}>{property.title}</Text>)}
      </Box>
    </Box>
  );
}
