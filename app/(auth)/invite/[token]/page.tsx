'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Flex, Input, Spinner, Text } from '@chakra-ui/react';
import PageHeader from '../../../../components/ui/PageHeader';
import { acceptInvitation, getInvitationByToken, registerWithEmail, type InvitationRecord } from '../../../../services/firebase';

function mapAuthError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  if (code.includes('auth/invalid-email')) return 'Invalid email.';
  if (code.includes('auth/email-already-in-use')) return 'This email is already registered.';
  if (code.includes('auth/weak-password')) return 'Password is too weak. Use at least 6 characters.';
  return error instanceof Error ? error.message : 'Unable to accept invitation right now.';
}

export default function InviteRegisterPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [invitation, setInvitation] = useState<InvitationRecord | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingInvite(true);
      setError(null);
      try {
        const record = await getInvitationByToken(token);
        if (!cancelled) setInvitation(record);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Invalid invitation.');
      } finally {
        if (!cancelled) setLoadingInvite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!invitation) return;
    setError(null);
    setLoadingSubmit(true);
    try {
      await registerWithEmail(invitation.email, password, name, invitation.role, invitation.companyId);
      await acceptInvitation(invitation.id);
      router.push('/dashboard');
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoadingSubmit(false);
    }
  }

  if (loadingInvite) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#F4F7FB">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="#F4F7FB" align="center" justify="center" p={6}>
      <Box w="full" maxW="520px" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={6}>
        <PageHeader title="Accept Invitation" subtitle="Create your account to join the company workspace." />

        {error ? <Box mb={3} p={3} borderRadius="md" bg="#fee2e2" color="#991b1b">{error}</Box> : null}
        {!invitation ? (
          <Text color="gray.600">
            Invitation is invalid or expired. Contact your company admin for a new link.
          </Text>
        ) : (
          <Box as="form" onSubmit={onSubmit}>
            <Text mb={1}>Company ID</Text>
            <Input mb={3} value={invitation.companyId} readOnly />
            <Text mb={1}>Invited Role</Text>
            <Input mb={3} value={invitation.role} readOnly />
            <Text mb={1}>Email</Text>
            <Input mb={3} value={invitation.email} readOnly />
            <Text mb={1}>Full Name</Text>
            <Input mb={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            <Text mb={1}>Password</Text>
            <Input mb={4} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
            <Button colorScheme="blue" w="full" type="submit" loading={loadingSubmit}>
              Create Account and Join Company
            </Button>
          </Box>
        )}
        <Text fontSize="sm" color="gray.600" mt={3}>
          Already registered? <Link href="/login">Login</Link>
        </Text>
      </Box>
    </Flex>
  );
}
