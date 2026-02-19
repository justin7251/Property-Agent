'use client';

import Link from 'next/link';
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import PageHeader from '../../../components/ui/PageHeader';

export default function RegisterPage() {
  return (
    <Flex minH="100vh" bg="#F4F7FB" align="center" justify="center" p={6}>
      <Box w="full" maxW="480px" bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={6}>
        <PageHeader title="Register" subtitle="Create a new account" />
        <Text mb={1}>Full Name</Text>
        <Input mb={3} placeholder="Agent Name" />
        <Text mb={1}>Email</Text>
        <Input mb={3} placeholder="agent@propestate.com" />
        <Text mb={1}>Password</Text>
        <Input mb={4} type="password" placeholder="********" />
        <Button colorScheme="blue" w="full" mb={3}>Create Account</Button>
        <Text fontSize="sm" color="gray.600">
          Already registered? <Link href="/login">Login</Link>
        </Text>
      </Box>
    </Flex>
  );
}
