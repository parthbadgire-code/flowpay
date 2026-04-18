'use client';

import { useState, useEffect } from 'react';
import { TokenPrice, fetchTokenPrices } from '@/services/priceService';

export function usePrices() {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchTokenPrices()
      .then(data => { if (mounted) { setPrices(data); setLoading(false); } })
      .catch(err => { if (mounted) { setError(err.message); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  const getPrice = (symbol: string): number => {
    return prices.find(p => p.symbol === symbol)?.inrPrice ?? 0;
  };

  return { prices, loading, error, getPrice };
}
