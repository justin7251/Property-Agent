'use client';

import { useEffect, useMemo, useState } from 'react';
import { properties as seededProperties } from '../lib/mockData';
import type { Property, PropertyStatus } from '../types/property';
import { seedDatabaseIfEmpty, subscribeProperties } from '../services/firebase';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(seededProperties);
  const [status, setStatus] = useState<'all' | PropertyStatus>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        await seedDatabaseIfEmpty();
        unsubscribe = subscribeProperties((rows) => {
          if (!mounted) return;
          setProperties(rows);
          setLoading(false);
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load properties');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const matchStatus = status === 'all' || property.status === status;
      const matchQuery = `${property.title} ${property.address}`.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [properties, query, status]);

  return { properties, filtered, status, setStatus, query, setQuery, setProperties, loading, error };
}
