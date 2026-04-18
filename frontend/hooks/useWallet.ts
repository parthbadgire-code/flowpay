'use client';

import { useFlowPay } from '@/lib/flowpayContext';
import { formatAddress } from '@/lib/utils';
import { useCallback } from 'react';

export function useWallet() {
  const { wallet, isDemo, connectWallet, disconnectWallet } = useFlowPay();

  const connect = useCallback(async () => {
    // In production: trigger RainbowKit/wagmi connect
    await connectWallet(true);
  }, [connectWallet]);

  const tryDemo = useCallback(async () => {
    await connectWallet(true);
  }, [connectWallet]);

  return {
    address: wallet.address,
    shortAddress: formatAddress(wallet.address),
    isConnected: wallet.isConnected,
    isDemo,
    tokens: wallet.tokens,
    nfts: wallet.nfts,
    totalPortfolioINR: wallet.totalPortfolioINR,
    network: wallet.network,
    connect,
    tryDemo,
    disconnect: disconnectWallet,
  };
}
