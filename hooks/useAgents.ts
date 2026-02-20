'use client';

import { useEffect, useMemo, useState } from 'react';
import { agents as seededAgents } from '../lib/mockData';
import type { Agent } from '../types/agent';
import { seedDatabaseIfEmpty, subscribeAgents } from '../services/firebase';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(seededAgents);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        await seedDatabaseIfEmpty();
        unsubscribe = subscribeAgents((rows) => {
          if (!mounted) return;
          setAgents(rows);
          setLoading(false);
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load agents');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filtered = useMemo(
    () => agents.filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase())),
    [agents, query]
  );

  return { agents, filtered, query, setQuery, setAgents, loading, error };
}
