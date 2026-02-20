'use client';

import Link from 'next/link';
import { Box, Button } from '@chakra-ui/react';
import DataTable from '../../../components/ui/DataTable';
import PageHeader from '../../../components/ui/PageHeader';
import { useLandlords } from '../../../hooks/useLandlords';

export default function LandlordsPage() {
  const { landlords } = useLandlords();
  return (
    <Box>
      <PageHeader title="Landlords" action={<Link href="/landlords/new"><Button colorScheme="blue">Add Landlord</Button></Link>} />
      <DataTable
        columns={[
          { key: 'name', header: 'Name', render: (row) => row.name },
          { key: 'email', header: 'Email', render: (row) => row.email },
          { key: 'total', header: 'Total Properties', render: (row) => row.totalProperties },
          { key: 'active', header: 'Active Properties', render: (row) => row.activeProperties },
          { key: 'revenue', header: 'Revenue', render: (row) => `$${row.revenue.toLocaleString()}` },
        ]}
        data={landlords}
      />
    </Box>
  );
}
