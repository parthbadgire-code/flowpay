'use client';

import { useFlowPay } from '@/lib/flowpayContext';
import { calculateSpendableBalance } from '@/lib/utils';
import { mockNFTs } from '@/data/nfts';

export function useFlowPayBalance() {
  const { flowPayBalance, deposit, spend } = useFlowPay();

  const nftBackupLiquidity = mockNFTs.reduce((acc, n) => acc + n.backupLiquidity, 0);
  const { spendable, fromFlowPay, fromNFT } = calculateSpendableBalance(
    flowPayBalance,
    nftBackupLiquidity,
  );

  const canAfford = (amountINR: number) => flowPayBalance >= amountINR;
  const canAffordWithNFT = (amountINR: number) => spendable >= amountINR;

  return {
    flowPayBalance,
    spendableBalance: spendable,
    fromFlowPay,
    fromNFT: nftBackupLiquidity,
    canAfford,
    canAffordWithNFT,
    deposit,
    spend,
  };
}
