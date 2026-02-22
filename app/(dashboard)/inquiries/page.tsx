'use client';

import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { LuExpand } from 'react-icons/lu';
import { useInquiries } from '../../../hooks/useInquiries';

export default function InquiriesPage() {
  const { filtered } = useInquiries();
  return (
    <Box>
      <Text fontSize="48px" fontWeight="800" mb={2}>Inquiries</Text>
      <Text fontSize="40px" fontWeight="700" mb={4}>Inquiries Overview</Text>

      <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={4}>
        {[
          { label: 'Total Inquiries', value: '1,240' },
          { label: 'Pending Review', value: '25' },
          { label: 'Replied Today', value: '13' },
          { label: 'Conversion Rate', value: '80%' },
        ].map((stat) => (
          <Box key={stat.label} flex="1" bg="white" border="1px solid" borderColor="#bde8dc" borderRadius="2xl" p={4}>
            <Flex align="center" gap={3}>
              <Box w="54px" h="54px" borderRadius="full" border="6px solid #6ee7b7" borderTopColor="transparent" />
              <Box>
                <Text color="gray.600">{stat.label}</Text>
                <Text fontSize="42px" fontWeight="800">{stat.value}</Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </Flex>

      <Flex gap={3} direction={{ base: 'column', xl: 'row' }}>
        <Box flex="1.05" bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={3}>
          <Box h="520px" borderRadius="xl" bg="linear-gradient(135deg,#e2e8f0,#cbd5e1)" position="relative">
            <Button position="absolute" top={3} right={3} variant="outline" size="xs"><Icon as={LuExpand} /></Button>
            <Box position="absolute" left="50%" top="50%" transform="translate(-50%,-50%)" w="250px" bg="white" border="1px solid" borderColor="blue.200" borderRadius="xl" p={3}>
              <Box h="84px" borderRadius="md" bg="linear-gradient(135deg,#60a5fa,#0284c7)" mb={2} />
              <Text fontWeight="700">Luxury Condo, Downtown</Text>
              <Text color="green.500" fontWeight="800" fontSize="30px">$2,500/mo</Text>
              <Text fontSize="sm" color="gray.600">Jofa Finigh</Text>
            </Box>
          </Box>
        </Box>

        <Box flex="1.7" bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={3}>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="40px" fontWeight="700">Recent Inquiries</Text>
            <Flex gap={2}>
              <Box as="select" border="1px solid" borderColor="blue.200" borderRadius="lg" px={2}><option>Status: All</option></Box>
              <Box as="select" border="1px solid" borderColor="gray.200" borderRadius="lg" px={2}><option>This Month</option></Box>
              <Button variant="outline" colorPalette="blue">Export</Button>
            </Flex>
          </Flex>
          <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
            <Box as="thead">
              <Box as="tr">
                {['Client Name', 'Property', 'Date', 'Status', 'Action'].map((h) => (
                  <Box key={h} as="th" py={2} px={2} textAlign="left">{h}</Box>
                ))}
              </Box>
            </Box>
            <Box as="tbody">
              {filtered.slice(0, 7).map((row) => (
                <Box as="tr" key={row.id}>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{row.clientName}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{row.propertyTitle}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{row.date}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                    <Box as="span" px={2.5} py={1} borderRadius="full" bg="#d1fae5" color="#065f46">{row.status}</Box>
                  </Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                    <Flex gap={2}>
                      <Button size="xs" variant="outline" colorPalette="blue">View Details</Button>
                      <Button size="xs" variant="outline" colorPalette="blue">View Archive</Button>
                    </Flex>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
