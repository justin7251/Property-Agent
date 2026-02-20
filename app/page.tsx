'use client';

import Link from 'next/link';
import { Box, Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { LuChartBar, LuHouse, LuUsers } from 'react-icons/lu';

export default function LandingPage() {
  return (
    <Box minH="100vh" bg="#f3f6fb" p={{ base: 4, md: 8 }}>
      <Flex maxW="1280px" mx="auto" gap={6} direction={{ base: 'column', xl: 'row' }}>
        <Box flex="1.65" bg="white" borderRadius="3xl" p={{ base: 5, md: 7 }} border="1px solid" borderColor="gray.100" boxShadow="0 10px 30px rgba(15,23,42,0.08)">
          <Flex justify="space-between" align="center" mb={6}>
            <Text fontWeight="800" fontSize="28px">EstateFlow</Text>
            <Flex gap={6} color="gray.600" fontSize="sm" display={{ base: 'none', md: 'flex' }}>
              <Text>Home</Text>
              <Text>Products</Text>
              <Text>Reports</Text>
              <Text>Pricing</Text>
            </Flex>
            <Flex gap={2}>
              <Link href="/login"><Button variant="ghost">Log in</Button></Link>
              <Link href="/dashboard"><Button colorScheme="blue">Get Started For Free</Button></Link>
            </Flex>
          </Flex>

          <Flex direction={{ base: 'column', lg: 'row' }} gap={6} align="center" mb={8}>
            <Box flex="1">
              <Heading fontSize={{ base: '36px', md: '56px' }} lineHeight="1.02" mb={4}>
                Simplify Your <Text as="span" color="blue.500">Real Estate Success</Text>
              </Heading>
              <Text color="gray.600" mb={5} maxW="560px">
                Simplify listing, inquiry handling, and agent collaboration in one operating dashboard.
              </Text>
              <Link href="/dashboard"><Button colorScheme="blue" size="lg">Start Free Trial</Button></Link>
            </Box>
            <Box flex="1" h={{ base: '240px', md: '310px' }} borderRadius="2xl" bg="linear-gradient(135deg,#dbeafe,#bbf7d0)" />
          </Flex>

          <Heading fontSize={{ base: '30px', md: '44px' }} textAlign="center" mb={4}>Everything You Need to Scale</Heading>
          <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
            {[
              { icon: LuHouse, title: 'Listing Management', text: 'Manage listings with fast status and pricing controls.' },
              { icon: LuUsers, title: 'Team Leaderboard', text: 'Track team output and identify top performers quickly.' },
              { icon: LuChartBar, title: 'Performance Analytics', text: 'Monitor sales, inquiries, and response rates over time.' },
            ].map((item) => (
              <Box key={item.title} flex="1" bg="gray.50" borderRadius="2xl" p={4} border="1px solid" borderColor="gray.100">
                <Icon as={item.icon} boxSize={7} mb={2} />
                <Text fontWeight="700" fontSize="xl">{item.title}</Text>
                <Text color="gray.600">{item.text}</Text>
                <Box h="120px" borderRadius="xl" mt={3} bg="linear-gradient(135deg,#e2e8f0,#cbd5e1)" />
              </Box>
            ))}
          </Flex>
        </Box>

        <Box flex="1" bg="white" borderRadius="3xl" border="1px solid" borderColor="gray.100" p={{ base: 5, md: 6 }}>
          <Text fontSize="38px" fontWeight="800" mb={2}>Mobile Management</Text>
          <Text color="gray.600" mb={4}>Run your operations from any device with synced data and fast actions.</Text>
          <Button colorScheme="blue" mb={6}>Get Started For Free</Button>
          <Box h="190px" borderRadius="2xl" bg="linear-gradient(135deg,#dbeafe,#f8fafc)" mb={6} />
          <Text fontSize="32px" fontWeight="800" mb={3}>Testimonials</Text>
          <Flex gap={3} mb={6}>
            {['Jofa Finigh', 'Joffey Smith', 'Sarah Johnson'].map((name) => (
              <Box key={name} flex="1" bg="gray.50" border="1px solid" borderColor="gray.100" borderRadius="xl" p={3}>
                <Text fontSize="sm" color="gray.600">“Great platform for daily execution.”</Text>
                <Text mt={2} fontWeight="700" fontSize="sm">{name}</Text>
              </Box>
            ))}
          </Flex>
          <Box bg="linear-gradient(135deg,#2563EB,#0EA5E9)" borderRadius="2xl" p={6} color="white">
            <Heading fontSize="36px" mb={2}>Ready to Close More Deals?</Heading>
            <Text mb={4}>Get started for the real estate sales team today.</Text>
            <Flex gap={3}>
              <Link href="/dashboard"><Button bg="white" color="blue.600" _hover={{ bg: 'gray.100' }}>Get Started For Free</Button></Link>
              <Button variant="outline" borderColor="whiteAlpha.700" color="white">Talk to Sales</Button>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
