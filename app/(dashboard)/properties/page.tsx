'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Button, Flex, Icon, Input, Text } from '@chakra-ui/react';
import { LuHeart, LuHousePlus, LuMapPin, LuSearch } from 'react-icons/lu';
import { useProperties } from '../../../hooks/useProperties';

export default function PropertiesPage() {
  const { filtered, query, setQuery, hasMore, loadMore, loadingMore } = useProperties();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<'all' | 'condo' | 'apartment' | 'house' | 'office'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under-2k' | '2k-4k' | '4k-plus'>('all');

  const visible = useMemo(() => {
    return filtered.filter((property) => {
      const byType = typeFilter === 'all' || property.type === typeFilter;
      const byPrice =
        priceRange === 'all' ||
        (priceRange === 'under-2k' && property.price < 2000) ||
        (priceRange === '2k-4k' && property.price >= 2000 && property.price <= 4000) ||
        (priceRange === '4k-plus' && property.price > 4000);
      return byType && byPrice;
    });
  }, [filtered, typeFilter, priceRange]);

  function toggleFavorite(propertyId: string) {
    setFavorites((prev) => ({ ...prev, [propertyId]: !prev[propertyId] }));
  }

  return (
    <Box>
      <Text fontSize="48px" fontWeight="800" mb={4}>Properties Listing</Text>
      <Flex gap={3} mb={4} direction={{ base: 'column', lg: 'row' }}>
        <Flex flex="1" align="center" gap={2} bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" px={3}>
          <Icon as={LuSearch} color="gray.500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by property name, location, or ID..." border="none" _focusVisible={{ boxShadow: 'none' }} />
        </Flex>
        <Box as="select" px={3} h="48px" border="1px solid" borderColor="gray.200" borderRadius="xl" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | 'condo' | 'apartment' | 'house' | 'office')}>
          <option value="all">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="house">House</option>
          <option value="office">Office</option>
        </Box>
        <Box as="select" px={3} h="48px" border="1px solid" borderColor="gray.200" borderRadius="xl" value={priceRange} onChange={(e) => setPriceRange(e.target.value as 'all' | 'under-2k' | '2k-4k' | '4k-plus')}>
          <option value="all">Price Range</option>
          <option value="under-2k">Under $2,000</option>
          <option value="2k-4k">$2,000 - $4,000</option>
          <option value="4k-plus">$4,000+</option>
        </Box>
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
        {visible.map((property, index) => (
          <Box key={property.id} bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" overflow="hidden">
            <Box h="180px" bg={index % 2 ? 'linear-gradient(135deg,#bfdbfe,#7dd3fc)' : 'linear-gradient(135deg,#a7f3d0,#93c5fd)'} position="relative">
              <Box position="absolute" top={3} left={3} px={3} py={1} borderRadius="full" bg="#c7f9d6" fontWeight="600">{index % 3 === 1 ? 'Pending' : 'Active'}</Box>
              <Button
                position="absolute"
                top={3}
                right={3}
                bg="whiteAlpha.900"
                borderRadius="full"
                p={2}
                minW="0"
                h="auto"
                onClick={() => toggleFavorite(property.id)}
                aria-label="Toggle favorite"
              >
                <Icon as={LuHeart} color={favorites[property.id] ? 'red.500' : 'gray.700'} />
              </Button>
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
                <Link href={`/properties/${property.id}`}>
                  <Text color="gray.700" fontWeight="600">Details {'->'}</Text>
                </Link>
              </Flex>
            </Box>
          </Box>
        ))}
      </Box>
      {hasMore ? (
        <Flex justify="center" mt={5}>
          <Button variant="outline" onClick={loadMore} loading={loadingMore}>
            Load More Properties
          </Button>
        </Flex>
      ) : null}
    </Box>
  );
}
