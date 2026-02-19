'use client';

import { useMemo, useState } from 'react';
import { agents as seededAgents } from '../lib/mockData';
import type { Agent } from '../types/agent';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(seededAgents);
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => agents.filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase())),
    [agents, query]
  );

  return { agents, filtered, query, setQuery, setAgents };
}
