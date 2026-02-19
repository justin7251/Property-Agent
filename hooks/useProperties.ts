'use client';

import { useMemo, useState } from 'react';
import { properties as seededProperties } from '../lib/mockData';
import type { Property, PropertyStatus } from '../types/property';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(seededProperties);
  const [status, setStatus] = useState<'all' | PropertyStatus>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const matchStatus = status === 'all' || property.status === status;
      const matchQuery = `${property.title} ${property.address}`.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [properties, query, status]);

  return { properties, filtered, status, setStatus, query, setQuery, setProperties };
}
