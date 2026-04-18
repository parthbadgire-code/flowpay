/**
 * depositService.ts
 * Simulates the deposit process into FlowPay wallet.
 * In production, this would call the FlowPayWallet smart contract on Polygon Amoy.
 */

import { DepositBreakdown, DepositTransaction } from '@/types/deposit';

export async function executeDeposit(
  userAddress: string,
  breakdown: DepositBreakdown
): Promise<{ success: boolean; tx: DepositTransaction }> {
  // TODO: Replace with actual contract interaction
  // const contract = new ethers.Contract(FLOWPAY_CONTRACT_ADDRESS, FlowPayABI, signer);
  // const tx = await contract.deposit(tokenAddress, amount);
  // await tx.wait();

  await new Promise(r => setTimeout(r, 1500)); // simulate blockchain TX

  const tx: DepositTransaction = {
    id: `dep_${Date.now()}`,
    totalINR: breakdown.totalINR,
    routes: breakdown.routes,
    timestamp: new Date(),
    status: 'success',
    txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
    flowPayBalanceBefore: 0, // will be set by context
    flowPayBalanceAfter: breakdown.totalINR,
  };

  return { success: true, tx };
}

export async function estimateDepositGas(breakdown: DepositBreakdown): Promise<number> {
  return breakdown.totalGasEstimateINR;
}
