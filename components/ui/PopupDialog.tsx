'use client';

import type { ReactNode } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

type PopupDialogProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
};

export default function PopupDialog({ isOpen, title, onClose, children, maxWidth = '980px' }: PopupDialogProps) {
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1400}
      bg="rgba(15, 23, 42, 0.35)"
      backdropFilter="blur(4px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Box
        w="100%"
        maxW={maxWidth}
        maxH="90vh"
        overflowY="auto"
        bg="white"
        borderRadius="20px"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="0 30px 80px rgba(15, 23, 42, 0.2)"
        onClick={(event) => event.stopPropagation()}
      >
        <Flex px={6} py={5} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100">
          <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight="700">{title}</Text>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </Flex>
        <Box p={6}>{children}</Box>
      </Box>
    </Box>
  );
}
