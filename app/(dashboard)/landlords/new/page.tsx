'use client';

import { Box } from '@chakra-ui/react';
import LandlordForm from '../../../../components/landlords/LandlordForm';
import PageHeader from '../../../../components/ui/PageHeader';

export default function NewLandlordPage() {
  return (
    <Box>
      <PageHeader title="Add Landlord" subtitle="Create a new landlord profile" />
      <LandlordForm />
    </Box>
  );
}
