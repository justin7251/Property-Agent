'use client';

import { useParams } from 'next/navigation';
import { Box, Flex, Text } from '@chakra-ui/react';
import { agents, inquiries, landlords, properties } from '../../../../lib/mockData';
import { formatCurrency } from '../../../../lib/utils';
import PageHeader from '../../../../components/ui/PageHeader';

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const property = properties.find((item) => item.id === params.id);
  if (!property) return <Text>Property not found.</Text>;

  const agent = agents.find((item) => item.id === property.agentId);
  const landlord = landlords.find((item) => item.id === property.landlordId);
  const propertyInquiries = inquiries.filter((item) => item.propertyId === property.id);

  return (
    <Box>
      <PageHeader title={property.title} subtitle={property.address} />
      <Box h="220px" borderRadius="2xl" bg="linear-gradient(135deg,#bfdbfe,#93c5fd)" mb={4} />
      <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
        <Box flex="1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
          <Text fontWeight="700" mb={2}>Details</Text>
          <Text>Price: {formatCurrency(property.price)}/{property.priceUnit}</Text>
          <Text>Status: {property.status}</Text>
          <Text>Type: {property.type}</Text>
          <Text>Bedrooms: {property.bedrooms}</Text>
          <Text>Bathrooms: {property.bathrooms}</Text>
          <Text>Sqft: {property.sqft}</Text>
        </Box>
        <Box flex="1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
          <Text fontWeight="700" mb={2}>Assigned</Text>
          <Text>Agent: {agent?.name || property.agentId}</Text>
          <Text>Landlord: {landlord?.name || property.landlordId}</Text>
        </Box>
      </Flex>
      <Box mt={4} bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
        <Text fontWeight="700" mb={2}>Inquiry History</Text>
        {propertyInquiries.map((item) => (
          <Box key={item.id} borderTop="1px solid" borderColor="gray.100" py={2}>
            <Text>{item.clientName} - {item.status}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
