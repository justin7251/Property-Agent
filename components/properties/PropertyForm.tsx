'use client';

import { Box, Button, Input, SimpleGrid, Text } from '@chakra-ui/react';

export default function PropertyForm() {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={5}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
        <Box><Text mb={1}>Title</Text><Input placeholder="Property title" /></Box>
        <Box><Text mb={1}>Address</Text><Input placeholder="Address" /></Box>
        <Box><Text mb={1}>Price</Text><Input placeholder="2500" type="number" /></Box>
        <Box><Text mb={1}>Type</Text><Input placeholder="condo" /></Box>
        <Box><Text mb={1}>Bedrooms</Text><Input type="number" placeholder="2" /></Box>
        <Box><Text mb={1}>Bathrooms</Text><Input type="number" placeholder="2" /></Box>
        <Box><Text mb={1}>Sqft</Text><Input type="number" placeholder="1200" /></Box>
        <Box><Text mb={1}>Status</Text><Input placeholder="available" /></Box>
      </SimpleGrid>
      <Button mt={4} colorScheme="blue">Create Property</Button>
    </Box>
  );
}
