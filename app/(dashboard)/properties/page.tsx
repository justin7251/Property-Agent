'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Button, Flex, Icon, Input, Text } from '@chakra-ui/react';
import { LuHeart, LuHousePlus, LuMapPin, LuSearch } from 'react-icons/lu';
import { useProperties } from '../../../hooks/useProperties';
import { createProperty, updateProperty } from '../../../services/firebase';
import type { Property } from '../../../types/property';
import PopupDialog from '../../../components/ui/PopupDialog';

export default function PropertiesPage() {
  const { filtered, setProperties, query, setQuery, hasMore, loadMore, loadingMore } = useProperties();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<'all' | 'condo' | 'apartment' | 'house' | 'office'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under-2k' | '2k-4k' | '4k-plus'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: '',
    address: '',
    price: '2500',
    type: 'condo' as 'condo' | 'apartment' | 'house' | 'office',
    bedrooms: '1',
    bathrooms: '1',
    sqft: '700',
    status: 'available' as 'available' | 'rented' | 'under_review' | 'off_market',
    agentId: 'a1',
    landlordId: 'l1',
  });

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

  function openAdd() {
    setDraft({
      title: '',
      address: '',
      price: '2500',
      type: 'condo',
      bedrooms: '1',
      bathrooms: '1',
      sqft: '700',
      status: 'available',
      agentId: 'a1',
      landlordId: 'l1',
    });
    setFormError(null);
    setEditingProperty(null);
    setIsAddOpen(true);
  }

  function openEdit(property: Property) {
    setDraft({
      title: property.title,
      address: property.address,
      price: String(property.price),
      type: property.type,
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      sqft: String(property.sqft),
      status: property.status,
      agentId: property.agentId,
      landlordId: property.landlordId,
    });
    setFormError(null);
    setIsAddOpen(false);
    setEditingProperty(property);
  }

  function closeDialogs() {
    setIsAddOpen(false);
    setEditingProperty(null);
    setFormError(null);
  }

  async function submitForm() {
    if (saving) return;
    const payload = {
      title: draft.title.trim(),
      address: draft.address.trim(),
      price: Number(draft.price),
      type: draft.type,
      bedrooms: Number(draft.bedrooms),
      bathrooms: Number(draft.bathrooms),
      sqft: Number(draft.sqft),
      status: draft.status,
      agentId: draft.agentId.trim(),
      landlordId: draft.landlordId.trim(),
    };
    if (!payload.title || !payload.address || !Number.isFinite(payload.price) || payload.price <= 0) {
      setFormError('Title, address, and valid price are required.');
      return;
    }
    if (!payload.agentId || !payload.landlordId) {
      setFormError('Agent ID and Landlord ID are required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, payload);
        setProperties((rows) => rows.map((row) => (row.id === editingProperty.id ? { ...row, ...payload } : row)));
      } else {
        const createdAt = new Date().toISOString();
        const id = await createProperty({
          ...payload,
          priceUnit: 'mo',
          images: [],
          createdAt,
        });
        setProperties((rows) => [{ id, ...payload, priceUnit: 'mo', images: [], createdAt }, ...rows]);
      }
      closeDialogs();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save property.');
    } finally {
      setSaving(false);
    }
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
        <Button colorScheme="blue" onClick={openAdd}><LuHousePlus style={{ marginRight: 6 }} />Add Property</Button>
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
                <Flex gap={3} align="center">
                  <Button size="xs" variant="outline" onClick={() => openEdit(property)}>Edit</Button>
                  <Link href={`/properties/${property.id}`}>
                    <Text color="gray.700" fontWeight="600">Details {'->'}</Text>
                  </Link>
                </Flex>
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

      <PopupDialog isOpen={isAddOpen || !!editingProperty} title={editingProperty ? 'Edit Property' : 'Add Property'} onClose={closeDialogs}>
        <Box display="grid" gap={3} gridTemplateColumns={{ base: '1fr', md: 'repeat(2,minmax(0,1fr))' }}>
          <Box>
            <Text mb={1}>Title</Text>
            <Input value={draft.title} onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="Property title" />
          </Box>
          <Box>
            <Text mb={1}>Address</Text>
            <Input value={draft.address} onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))} placeholder="Address" />
          </Box>
          <Box>
            <Text mb={1}>Price</Text>
            <Input value={draft.price} onChange={(e) => setDraft((prev) => ({ ...prev, price: e.target.value }))} placeholder="2500" type="number" />
          </Box>
          <Box>
            <Text mb={1}>Type</Text>
            <Box
              as="select"
              px={3}
              h="40px"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              value={draft.type}
              onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value as 'condo' | 'apartment' | 'house' | 'office' }))}
            >
              <option value="condo">condo</option>
              <option value="apartment">apartment</option>
              <option value="house">house</option>
              <option value="office">office</option>
            </Box>
          </Box>
          <Box>
            <Text mb={1}>Bedrooms</Text>
            <Input value={draft.bedrooms} onChange={(e) => setDraft((prev) => ({ ...prev, bedrooms: e.target.value }))} type="number" />
          </Box>
          <Box>
            <Text mb={1}>Bathrooms</Text>
            <Input value={draft.bathrooms} onChange={(e) => setDraft((prev) => ({ ...prev, bathrooms: e.target.value }))} type="number" />
          </Box>
          <Box>
            <Text mb={1}>Sqft</Text>
            <Input value={draft.sqft} onChange={(e) => setDraft((prev) => ({ ...prev, sqft: e.target.value }))} type="number" />
          </Box>
          <Box>
            <Text mb={1}>Status</Text>
            <Box
              as="select"
              px={3}
              h="40px"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as 'available' | 'rented' | 'under_review' | 'off_market' }))}
            >
              <option value="available">available</option>
              <option value="rented">rented</option>
              <option value="under_review">under_review</option>
              <option value="off_market">off_market</option>
            </Box>
          </Box>
          <Box>
            <Text mb={1}>Agent ID</Text>
            <Input value={draft.agentId} onChange={(e) => setDraft((prev) => ({ ...prev, agentId: e.target.value }))} />
          </Box>
          <Box>
            <Text mb={1}>Landlord ID</Text>
            <Input value={draft.landlordId} onChange={(e) => setDraft((prev) => ({ ...prev, landlordId: e.target.value }))} />
          </Box>
        </Box>
        {formError ? <Text mt={3} color="red.500">{formError}</Text> : null}
        <Flex justify="flex-end" gap={2} mt={4}>
          <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
          <Button colorScheme="blue" onClick={submitForm} loading={saving}>
            {editingProperty ? 'Save Changes' : 'Create Property'}
          </Button>
        </Flex>
      </PopupDialog>
    </Box>
  );
}
