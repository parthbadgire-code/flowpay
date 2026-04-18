'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useFlowPay } from '@/lib/flowpayContext';
import { Sidebar, BottomNav } from '@/components/layout/Navigation';
import { LotteryCard } from '@/components/lottery/LotteryCard';
import { mockLotteryPool, mockLotteryWinners } from '@/data/lotteryWinners';

export default function LotteryPage() {
  const { isConnected, tryDemo } = useWallet();
  const { lotteryEntries } = useFlowPay();

  useEffect(() => {
    if (!isConnected) { tryDemo(); }
  }, [isConnected, tryDemo]);

  const poolWithEntries = { ...mockLotteryPool, userEntries: lotteryEntries || mockLotteryPool.userEntries };

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-6 px-4 lg:px-8 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Reward Lottery</h1>
          <p className="text-sm text-slate-500">Every payment earns you an entry. Win cashback, NFTs, and bonus tokens.</p>
        </div>
        <div className="max-w-lg mx-auto">
          <LotteryCard pool={poolWithEntries} winners={mockLotteryWinners} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
