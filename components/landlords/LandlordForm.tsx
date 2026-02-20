'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { createLandlord } from '../../services/firebase';

export default function LandlordForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Name, email, and phone are required.');
      return;
    }

    setLoading(true);
    try {
      await createLandlord({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        totalProperties: 0,
        activeProperties: 0,
        revenue: 0,
        joinedAt: new Date().toISOString().slice(0, 10),
      });
      router.push('/landlords');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create landlord.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box as="form" onSubmit={onSubmit} bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={5}>
      <Text mb={1}>Name</Text>
      <Input mb={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Landlord name" />
      <Text mb={1}>Email</Text>
      <Input mb={3} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@company.com" />
      <Text mb={1}>Phone</Text>
      <Input mb={3} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-0000" />
      {error ? <Text mb={3} color="red.500">{error}</Text> : null}
      <Button colorScheme="blue" type="submit" loading={loading}>Create Landlord</Button>
    </Box>
  );
}
