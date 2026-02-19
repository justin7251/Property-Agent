'use client';

import { Text } from '@chakra-ui/react';
import type { Property } from '../../types/property';
import DataTable from '../ui/DataTable';
import { formatCurrency } from '../../lib/utils';

export default function PropertyTable({ rows }: { rows: Property[] }) {
  return (
    <DataTable
      columns={[
        { key: 'title', header: 'Title', render: (row) => <Text>{row.title}</Text> },
        { key: 'address', header: 'Address', render: (row) => <Text>{row.address}</Text> },
        { key: 'price', header: 'Price', render: (row) => <Text>{formatCurrency(row.price)}</Text> },
        { key: 'status', header: 'Status', render: (row) => <Text>{row.status}</Text> },
      ]}
      data={rows}
    />
  );
}
