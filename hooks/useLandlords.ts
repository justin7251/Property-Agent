'use client';

import { useState } from 'react';
import { landlords as seededLandlords } from '../lib/mockData';
import type { Landlord } from '../types/landlord';

export function useLandlords() {
  const [landlords, setLandlords] = useState<Landlord[]>(seededLandlords);
  return { landlords, setLandlords };
}
