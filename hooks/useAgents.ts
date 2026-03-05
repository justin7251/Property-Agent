'use client';

import { useEffect, useMemo, useState } from 'react';
import { agents as seededAgents } from '../lib/mockData';
import type { Agent } from '../types/agent';
import { getAgentsPage, seedDatabaseIfEmpty } from '../services/firebase';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(seededAgents);
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
        const page = await getAgentsPage({ pageSize: 25 });
        if (!mounted) return;
        setAgents(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load agents');
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
      const page = await getAgentsPage({ pageSize: 25, cursor });
      setAgents((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more agents');
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = useMemo(
    () => agents.filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase())),
    [agents, query]
  );

  return { agents, filtered, query, setQuery, setAgents, loading, loadingMore, hasMore, loadMore, error };
}
