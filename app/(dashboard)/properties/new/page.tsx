'use client';

import { Box } from '@chakra-ui/react';
import PropertyForm from '../../../../components/properties/PropertyForm';
import PageHeader from '../../../../components/ui/PageHeader';

export default function NewPropertyPage() {
  return (
    <Box>
      <PageHeader title="New Property" subtitle="Create a property listing" />
      <PropertyForm />
    </Box>
  );
}
