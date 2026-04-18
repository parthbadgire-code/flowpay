import { TokenBalance } from '@/types/wallet';

export const mockTokenBalances: TokenBalance[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    amount: 2.39,
    inrValue: 200,
    usdValue: 2.39,
    logo: '💵',
    color: '#2775CA',
    change24h: 0.01,
    contractAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    amount: 174.83,
    inrValue: 150,
    usdValue: 1.80,
    logo: '🔷',
    color: '#8247E5',
    change24h: -2.3,
    contractAddress: 'native',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    amount: 0.00385,
    inrValue: 100,
    usdValue: 1.20,
    logo: '⟠',
    color: '#627EEA',
    change24h: 1.8,
    contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  },
];

export const mockTotalPortfolioINR = mockTokenBalances.reduce(
  (acc, t) => acc + t.inrValue, 0
) + 4500; // includes NFT backup value
