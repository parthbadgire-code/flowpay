/**
 * walletService.ts
 * Mock wallet service — returns simulated token balances & portfolio data.
 * Replace getWalletBalances() with Alchemy API in production.
 */

import { TokenBalance, WalletState } from '@/types/wallet';
import { mockTokenBalances, mockTotalPortfolioINR } from '@/data/balances';
import { mockNFTs } from '@/data/nfts';
import { DEMO_WALLET_ADDRESS } from '@/constants';

export async function getWalletBalances(address: string): Promise<TokenBalance[]> {
  // TODO: Replace with Alchemy API
  // const alchemy = new Alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY, network: Network.MATIC_AMOY });
  // const balances = await alchemy.core.getTokenBalances(address, tokenAddresses);
  await new Promise(r => setTimeout(r, 600));
  return mockTokenBalances;
}

export async function getWalletState(address: string): Promise<WalletState> {
  await new Promise(r => setTimeout(r, 800));
  return {
    address: address || DEMO_WALLET_ADDRESS,
    isConnected: true,
    totalPortfolioINR: mockTotalPortfolioINR,
    tokens: mockTokenBalances,
    nfts: mockNFTs,
    network: 'Polygon Amoy',
  };
}

export async function getPortfolioValueINR(address: string): Promise<number> {
  await new Promise(r => setTimeout(r, 400));
  return mockTotalPortfolioINR;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
