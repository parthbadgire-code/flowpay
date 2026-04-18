import { DepositTransaction } from '@/types/deposit';

export const mockDepositHistory: DepositTransaction[] = [
  {
    id: 'dep_001',
    totalINR: 300,
    routes: [
      { token: 'USD Coin', symbol: 'USDC', amountINR: 150, tokenAmount: 1.80, logo: '💵', color: '#2775CA', gasEstimateINR: 0.01, routingScore: 0.92, badge: 'Best Route' },
      { token: 'Polygon', symbol: 'MATIC', amountINR: 100, tokenAmount: 116.28, logo: '🔷', color: '#8247E5', gasEstimateINR: 0.01, routingScore: 0.87 },
      { token: 'Ethereum', symbol: 'ETH', amountINR: 50, tokenAmount: 0.00192, logo: '⟠', color: '#627EEA', gasEstimateINR: 0.01, routingScore: 0.78 },
    ],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'success',
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789ab',
    flowPayBalanceBefore: 0,
    flowPayBalanceAfter: 300,
  },
  {
    id: 'dep_002',
    totalINR: 200,
    routes: [
      { token: 'USD Coin', symbol: 'USDC', amountINR: 200, tokenAmount: 2.39, logo: '💵', color: '#2775CA', gasEstimateINR: 0.01, routingScore: 0.95, badge: 'Best Route' },
    ],
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'success',
    txHash: '0xdef456abc789def456abc789def456abc789def456abc789def456abc789de',
    flowPayBalanceBefore: 300,
    flowPayBalanceAfter: 500,
  },
];
