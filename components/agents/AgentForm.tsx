'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { createAgent } from '../../services/firebase';

export default function AgentForm() {
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
      await createAgent({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        totalSales: 0,
        activeListings: 0,
        closedDeals: 0,
        joinedAt: new Date().toISOString().slice(0, 10),
      });
      router.push('/agents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box as="form" onSubmit={onSubmit} bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={5}>
      <Text mb={1}>Name</Text>
      <Input mb={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" />
      <Text mb={1}>Email</Text>
      <Input mb={3} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@propestate.com" />
      <Text mb={1}>Phone</Text>
      <Input mb={3} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-0000" />
      {error ? <Text mb={3} color="red.500">{error}</Text> : null}
      <Button colorScheme="blue" type="submit" loading={loading}>Create Agent</Button>
    </Box>
  );
}
