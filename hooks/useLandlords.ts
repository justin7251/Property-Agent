'use client';

import { useEffect, useState } from 'react';
import { landlords as seededLandlords } from '../lib/mockData';
import type { Landlord } from '../types/landlord';
import { getLandlordsPage, seedDatabaseIfEmpty } from '../services/firebase';

export function useLandlords() {
  const [landlords, setLandlords] = useState<Landlord[]>(seededLandlords);
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
        const page = await getLandlordsPage({ pageSize: 25 });
        if (!mounted) return;
        setLandlords(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load landlords');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function loadMore() {
    if (!hasMore || !cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await getLandlordsPage({ pageSize: 25, cursor });
      setLandlords((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more landlords');
    } finally {
      setLoadingMore(false);
    }
  }

  return { landlords, setLandlords, loading, loadingMore, hasMore, loadMore, error };
}
