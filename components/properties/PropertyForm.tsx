'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Input, SimpleGrid, Text } from '@chakra-ui/react';
import { createProperty } from '../../services/firebase';

export default function PropertyForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'condo' | 'apartment' | 'house' | 'office'>('condo');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [sqft, setSqft] = useState('700');
  const [status, setStatus] = useState<'available' | 'rented' | 'under_review' | 'off_market'>('available');
  const [agentId, setAgentId] = useState('a1');
  const [landlordId, setLandlordId] = useState('l1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!title.trim() || !address.trim() || !price.trim()) {
      setError('Title, address, and price are required.');
      return;
    }

    setLoading(true);
    try {
      await createProperty({
        title: title.trim(),
        address: address.trim(),
        price: Number(price),
        priceUnit: 'mo',
        status,
        type,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        sqft: Number(sqft),
        agentId,
        landlordId,
        images: [],
        createdAt: new Date().toISOString(),
      });
      router.push('/properties');
    } catch (err) {
      console.error('Error in onSubmit (PropertyForm):', err);
      setError(err instanceof Error ? err.message : 'Failed to create property.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box as="form" onSubmit={onSubmit} bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={5}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
        <Box><Text mb={1}>Title</Text><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Property title" /></Box>
        <Box><Text mb={1}>Address</Text><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" /></Box>
        <Box><Text mb={1}>Price</Text><Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2500" type="number" /></Box>
        <Box>
          <Text mb={1}>Type</Text>
          <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ width: '100%', height: '40px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0 8px' }}>
            <option value="condo">condo</option>
            <option value="apartment">apartment</option>
            <option value="house">house</option>
            <option value="office">office</option>
          </select>
        </Box>
        <Box><Text mb={1}>Bedrooms</Text><Input value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} type="number" placeholder="2" /></Box>
        <Box><Text mb={1}>Bathrooms</Text><Input value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} type="number" placeholder="2" /></Box>
        <Box><Text mb={1}>Sqft</Text><Input value={sqft} onChange={(e) => setSqft(e.target.value)} type="number" placeholder="1200" /></Box>
        <Box>
          <Text mb={1}>Status</Text>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ width: '100%', height: '40px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0 8px' }}>
            <option value="available">available</option>
            <option value="rented">rented</option>
            <option value="under_review">under_review</option>
            <option value="off_market">off_market</option>
          </select>
        </Box>
        <Box><Text mb={1}>Agent ID</Text><Input value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="a1" /></Box>
        <Box><Text mb={1}>Landlord ID</Text><Input value={landlordId} onChange={(e) => setLandlordId(e.target.value)} placeholder="l1" /></Box>
      </SimpleGrid>
      {error ? <Text mt={3} color="red.500">{error}</Text> : null}
      <Button mt={4} colorScheme="blue" type="submit" loading={loading}>Create Property</Button>
    </Box>
  );
}
