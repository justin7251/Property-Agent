'use client';

import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export default function DataTable<T>({
  columns,
  data,
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}) {
  return (
    <Box overflowX="auto">
      <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
        <Box as="thead">
          <Box as="tr">
            {columns.map((column) => (
              <Box key={column.key} as="th" textAlign="left" px={2} py={2} fontSize="12px" color="gray.500" textTransform="uppercase">
                {column.header}
              </Box>
            ))}
          </Box>
        </Box>
        <Box as="tbody">
          {data.map((row, index) => (
            <Box key={index} as="tr" cursor={onRowClick ? 'pointer' : 'default'} onClick={() => onRowClick?.(row)}>
              {columns.map((column) => (
                <Box key={column.key} as="td" px={2} py={3} borderTop="1px solid" borderColor="gray.100">
                  {column.render(row)}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
