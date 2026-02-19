'use client';

import { Button, Text } from '@chakra-ui/react';
import type { Inquiry } from '../../types/inquiry';
import DataTable from '../ui/DataTable';
import InquiryStatusBadge from '../ui/InquiryStatusBadge';

export default function InquiryTable({ rows }: { rows: Inquiry[] }) {
  return (
    <DataTable
      columns={[
        { key: 'client', header: 'Client', render: (row) => <Text>{row.clientName}</Text> },
        { key: 'property', header: 'Property', render: (row) => <Text>{row.propertyTitle}</Text> },
        { key: 'agent', header: 'Agent', render: (row) => <Text>{row.agentId}</Text> },
        { key: 'date', header: 'Date', render: (row) => <Text>{row.date}</Text> },
        { key: 'status', header: 'Status', render: (row) => <InquiryStatusBadge status={row.status} /> },
        { key: 'action', header: 'Actions', render: () => <Button size="xs" variant="outline">View</Button> },
      ]}
      data={rows}
    />
  );
}
