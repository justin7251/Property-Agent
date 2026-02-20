'use client';

import { useEffect, useState } from 'react';
import { landlords as seededLandlords } from '../lib/mockData';
import type { Landlord } from '../types/landlord';
import { seedDatabaseIfEmpty, subscribeLandlords } from '../services/firebase';

export function useLandlords() {
  const [landlords, setLandlords] = useState<Landlord[]>(seededLandlords);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        await seedDatabaseIfEmpty();
        unsubscribe = subscribeLandlords((rows) => {
          if (!mounted) return;
          setLandlords(rows);
          setLoading(false);
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load landlords');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { landlords, setLandlords, loading, error };
}
