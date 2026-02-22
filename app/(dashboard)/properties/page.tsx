'use client';

import Link from 'next/link';
import { Box, Button, Flex, Icon, Input, Text } from '@chakra-ui/react';
import { LuHeart, LuHousePlus, LuMapPin, LuSearch } from 'react-icons/lu';
import { useProperties } from '../../../hooks/useProperties';

export default function PropertiesPage() {
  const { filtered, query, setQuery } = useProperties();
  return (
    <Box>
      <Text fontSize="48px" fontWeight="800" mb={4}>Properties Listing</Text>
      <Flex gap={3} mb={4} direction={{ base: 'column', lg: 'row' }}>
        <Flex flex="1" align="center" gap={2} bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" px={3}>
          <Icon as={LuSearch} color="gray.500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by property name, location, or ID..." border="none" _focusVisible={{ boxShadow: 'none' }} />
        </Flex>
        <Box as="select" px={3} h="48px" border="1px solid" borderColor="gray.200" borderRadius="xl"><option>All Types</option></Box>
        <Box as="select" px={3} h="48px" border="1px solid" borderColor="gray.200" borderRadius="xl"><option>Price Range</option></Box>
        <Link href="/properties/new">
          <Button colorScheme="blue"><LuHousePlus style={{ marginRight: 6 }} />Add Property</Button>
        </Link>
      </Flex>

      <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={4}>
        {[
          { label: 'Total Listings', value: '2,140' },
          { label: 'Sold This Month', value: '45' },
          { label: 'Pending', value: '12' },
          { label: 'Rented', value: '28' },
        ].map((stat) => (
          <Box key={stat.label} flex="1" bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={4}>
            <Text color="gray.600">{stat.label}</Text>
            <Text fontSize="42px" fontWeight="800">{stat.value}</Text>
          </Box>
        ))}
      </Flex>

      <Box display="grid" gap={4} gridTemplateColumns={{ base: '1fr', md: 'repeat(2,minmax(0,1fr))', xl: 'repeat(4,minmax(0,1fr))' }}>
        {filtered.slice(0, 8).map((property, index) => (
          <Box key={property.id} bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" overflow="hidden">
            <Box h="180px" bg={index % 2 ? 'linear-gradient(135deg,#bfdbfe,#7dd3fc)' : 'linear-gradient(135deg,#a7f3d0,#93c5fd)'} position="relative">
              <Box position="absolute" top={3} left={3} px={3} py={1} borderRadius="full" bg="#c7f9d6" fontWeight="600">{index % 3 === 1 ? 'Pending' : 'Active'}</Box>
              <Box position="absolute" top={3} right={3} bg="whiteAlpha.900" borderRadius="full" p={2}><Icon as={LuHeart} /></Box>
            </Box>
            <Box p={4}>
              <Text fontSize="38px" fontWeight="800">{property.title}</Text>
              <Flex align="center" color="gray.600" mb={2}><Icon as={LuMapPin} mr={1} />{property.address.split(',')[1] || property.address}</Flex>
              <Flex justify="space-between" fontSize="sm" color="gray.600" mb={2}>
                <Text>{property.bedrooms} Beds</Text>
                <Text>{property.bathrooms} Baths</Text>
                <Text>{property.sqft.toLocaleString()} sqft</Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontSize="42px" fontWeight="800">${property.price.toLocaleString()}</Text>
                <Text color="gray.700" fontWeight="600">Details {'->'}</Text>
              </Flex>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
