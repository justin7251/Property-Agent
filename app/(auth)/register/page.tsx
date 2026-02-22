'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Button, Flex, Input, Select, Text } from '@chakra-ui/react';
import PageHeader from '../../../components/ui/PageHeader';
import { registerWithEmail } from '../../../services/firebase';

function mapAuthError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  if (code.includes('auth/invalid-email')) return 'Please enter a valid email address.';
  if (code.includes('auth/email-already-in-use')) return 'This email is already registered. Try logging in.';
  if (code.includes('auth/weak-password')) return 'Password is too weak. Use at least 6 characters.';
  if (code.includes('auth/configuration-not-found')) return 'Authentication is not configured. Enable Email/Password in Firebase Auth.';
  return 'Unable to create account right now. Please try again.';
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'agent' | 'landlord'>('agent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerWithEmail(email, password, name, role);
      router.push('/dashboard');
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Flex minH="100vh" bg="#F4F7FB" align="center" justify="center" p={6}>
      <Box w="full" maxW="480px" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={6}>
        <PageHeader title="Register" subtitle="Create a new account" />
        <Box as="form" onSubmit={onSubmit}>
          <Text mb={1}>Full Name</Text>
          <Input mb={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent Name" />
          <Text mb={1}>Email</Text>
          <Input mb={3} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@propestate.com" />
          <Text mb={1}>Password</Text>
          <Input mb={4} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          <Text mb={1}>Role</Text>
          <Select mb={4} value={role} onChange={(e) => setRole(e.target.value as 'agent' | 'landlord')}>
            <option value="agent">Agent</option>
            <option value="landlord">Landlord</option>
          </Select>
          {error ? <Text mb={3} color="red.500">{error}</Text> : null}
          <Button colorScheme="blue" w="full" mb={3} type="submit" loading={loading}>Create Account</Button>
          <Text fontSize="sm" color="gray.600">
            Already registered? <Link href="/login">Login</Link>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
