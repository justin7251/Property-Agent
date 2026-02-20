'use client';

import { Box, Button, Flex, Input, Text, Textarea } from '@chakra-ui/react';
import { LuBell, LuShield, LuUsers } from 'react-icons/lu';

export default function SettingsPage() {
  return (
    <Box>
      <Text fontSize="48px" fontWeight="800" mb={2}>Settings</Text>
      <Text color="gray.600" mb={4}>Dashboard {'>'} <Text as="span" fontWeight="700" color="gray.800">Settings</Text></Text>
      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" overflow="hidden">
        <Flex gap={8} px={6} pt={4} borderBottom="1px solid" borderColor="gray.100" align="center">
          <Text color="blue.600" fontWeight="700" pb={3} borderBottom="3px solid" borderColor="blue.500">Profile</Text>
          <Text color="gray.600" pb={3}><LuBell style={{ display: 'inline' }} /> Notifications</Text>
          <Text color="gray.600" pb={3}><LuShield style={{ display: 'inline' }} /> Security</Text>
          <Text color="gray.600" pb={3}><LuUsers style={{ display: 'inline' }} /> Team</Text>
          <Text color="gray.600" pb={3}>Billing</Text>
        </Flex>

        <Flex p={6} gap={8} direction={{ base: 'column', xl: 'row' }}>
          <Box w={{ base: '100%', xl: '320px' }}>
            <Text fontSize="34px" fontWeight="700" mb={3}>Profile Picture</Text>
            <Box w="180px" h="180px" borderRadius="full" bg="linear-gradient(135deg,#f5d0c5,#fde7e2)" mx="auto" mb={3} />
            <Text textAlign="center" color="gray.600" mb={4}>Allowed file types: png, jpg, jpeg.</Text>
            <Box bg="#eaf4ff" borderRadius="xl" p={4}>
              <Text fontWeight="700">Verified Agent</Text>
              <Text color="gray.600">Your profile is visible to all clients on the platform.</Text>
            </Box>
          </Box>

          <Box flex="1">
            <Text fontSize="34px" fontWeight="700" mb={3}>Personal Information</Text>
            <Flex gap={3} mb={3} direction={{ base: 'column', md: 'row' }}>
              <Box flex="1"><Text mb={1}>First Name</Text><Input defaultValue="Alex" /></Box>
              <Box flex="1"><Text mb={1}>Last Name</Text><Input defaultValue="Morgan" /></Box>
            </Flex>
            <Flex gap={3} mb={3} direction={{ base: 'column', md: 'row' }}>
              <Box flex="1"><Text mb={1}>Email Address</Text><Input defaultValue="alex.morgan@realstate.com" /></Box>
              <Box flex="1"><Text mb={1}>Phone Number</Text><Input defaultValue="+1 (555) 000-1234" /></Box>
            </Flex>
            <Box mb={3}><Text mb={1}>About Me</Text><Textarea defaultValue="Experienced real estate agent with over 5 years of experience in luxury downtown condos. Dedicated to finding the perfect home for my clients." /></Box>
            <Flex gap={3} mb={2} direction={{ base: 'column', md: 'row' }}>
              <Box flex="1"><Text mb={1}>Role</Text><Box as="select" style={{ width: '100%', height: '40px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px' }}><option>Senior Agent</option></Box></Box>
              <Box flex="1"><Text mb={1}>License Number</Text><Input defaultValue="RE-992838-NY" /></Box>
            </Flex>
            <Text color="gray.500" mb={5}>Contact support to update license details.</Text>
            <Flex justify="flex-end" gap={3}>
              <Button variant="outline">Cancel</Button>
              <Button colorScheme="blue">Save Changes</Button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
