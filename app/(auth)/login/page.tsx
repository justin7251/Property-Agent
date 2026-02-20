'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import PageHeader from '../../../components/ui/PageHeader';
import { loginWithEmail } from '../../../services/firebase';

function mapAuthError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  if (code.includes('auth/invalid-email')) return 'Please enter a valid email address.';
  if (code.includes('auth/user-not-found')) return 'No account was found for this email.';
  if (code.includes('auth/wrong-password') || code.includes('auth/invalid-credential')) return 'Incorrect email or password.';
  if (code.includes('auth/configuration-not-found')) return 'Authentication is not configured. Enable Email/Password in Firebase Auth.';
  return 'Unable to sign in right now. Please try again.';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Flex minH="100vh" bg="#F4F7FB" align="center" justify="center" p={6}>
      <Box w="full" maxW="420px" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={6}>
        <PageHeader title="Login" subtitle="Sign in to continue" />
        <Box as="form" onSubmit={onSubmit}>
          <Text mb={1}>Email</Text>
          <Input mb={3} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@propestate.com" />
          <Text mb={1}>Password</Text>
          <Input mb={4} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          {error ? <Text mb={3} color="red.500">{error}</Text> : null}
          <Button colorScheme="blue" w="full" mb={3} type="submit" loading={loading}>Login</Button>
          <Text fontSize="sm" color="gray.600">
            No account? <Link href="/register">Register</Link>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
