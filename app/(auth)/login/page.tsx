'use client';

import Link from 'next/link';
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import PageHeader from '../../../components/ui/PageHeader';

export default function LoginPage() {
  return (
    <Flex minH="100vh" bg="#F4F7FB" align="center" justify="center" p={6}>
      <Box w="full" maxW="420px" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={6}>
        <PageHeader title="Login" subtitle="Sign in to continue" />
        <Text mb={1}>Email</Text>
        <Input mb={3} placeholder="agent@propestate.com" />
        <Text mb={1}>Password</Text>
        <Input mb={4} type="password" placeholder="********" />
        <Button colorScheme="blue" w="full" mb={3}>Login</Button>
        <Text fontSize="sm" color="gray.600">
          No account? <Link href="/register">Register</Link>
        </Text>
      </Box>
    </Flex>
  );
}
