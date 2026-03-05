'use client';

import { useEffect, useMemo, useState } from 'react';
import { properties as seededProperties } from '../lib/mockData';
import type { Property, PropertyStatus } from '../types/property';
import { getPropertiesPage, seedDatabaseIfEmpty } from '../services/firebase';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(seededProperties);
  const [status, setStatus] = useState<'all' | PropertyStatus>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await seedDatabaseIfEmpty();
        const page = await getPropertiesPage({ pageSize: 25 }, status === 'all' ? undefined : status);
        if (!mounted) return;
        setProperties(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load properties');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [status]);

  async function loadMore() {
    if (!hasMore || !cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await getPropertiesPage({ pageSize: 25, cursor }, status === 'all' ? undefined : status);
      setProperties((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more properties');
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const matchStatus = status === 'all' || property.status === status;
      const matchQuery = `${property.title} ${property.address}`.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [properties, query, status]);

  return { properties, filtered, status, setStatus, query, setQuery, setProperties, loading, loadingMore, hasMore, loadMore, error };
}
