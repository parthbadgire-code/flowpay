'use client';

import { useState, useCallback } from 'react';
import { DepositBreakdown } from '@/types/deposit';
import { TokenBalance } from '@/types/wallet';
import { computeDepositRoutes } from '@/services/routingService';

export function usePaymentRouting() {
  const [breakdown, setBreakdown] = useState<DepositBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computeRoutes = useCallback(async (
    amountINR: number,
    tokens: TokenBalance[],
    preferences: Record<string, number> = {}
  ) => {
    if (amountINR <= 0) { setBreakdown(null); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await computeDepositRoutes(amountINR, tokens, preferences);
      setBreakdown(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const totalAvailableINR = useCallback((tokens: TokenBalance[]) =>
    tokens.reduce((acc, t) => acc + t.inrValue, 0),
  []);

  return { breakdown, loading, error, computeRoutes, totalAvailableINR };
}
