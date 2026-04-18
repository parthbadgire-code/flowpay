/**
 * lotteryService.ts
 * Mock lottery service. In production, integrate Chainlink VRF for provably fair draws.
 */

import { LotteryWinner, LotteryPool } from '@/types/lottery';
import { mockLotteryWinners, mockLotteryPool } from '@/data/lotteryWinners';

export async function getLotteryPool(): Promise<LotteryPool> {
  // TODO: Replace with Firebase Firestore / smart contract read
  await new Promise(r => setTimeout(r, 400));
  return mockLotteryPool;
}

export async function getLotteryWinners(limit = 5): Promise<LotteryWinner[]> {
  await new Promise(r => setTimeout(r, 400));
  return mockLotteryWinners.slice(0, limit);
}

export async function getUserEntries(address: string): Promise<number> {
  await new Promise(r => setTimeout(r, 200));
  return 3; // mock: user has 3 entries
}

export async function pickWinner(round: number): Promise<LotteryWinner> {
  // TODO: Replace with Chainlink VRF call
  await new Promise(r => setTimeout(r, 2000));
  const winner = mockLotteryWinners[Math.floor(Math.random() * mockLotteryWinners.length)];
  return {
    ...winner,
    id: `win_${Date.now()}`,
    round,
    timestamp: new Date(),
  };
}

export async function addEntry(userAddress: string, paymentId: string, amountINR: number): Promise<void> {
  // TODO: Store in Firebase Firestore
  await new Promise(r => setTimeout(r, 300));
}
