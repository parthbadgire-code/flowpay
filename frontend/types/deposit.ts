export interface DepositRoute {
  token: string;
  symbol: string;
  amountINR: number;
  tokenAmount: number;
  logo: string;
  color: string;
  gasEstimateINR: number;
  routingScore: number;
  badge?: 'Best Route' | 'Low Gas' | 'Preferred';
}

export interface DepositBreakdown {
  totalINR: number;
  routes: DepositRoute[];
  totalGasEstimateINR: number;
  network: string;
  estimatedTime: string;
  savedSwaps: number;
}

export interface DepositTransaction {
  id: string;
  totalINR: number;
  routes: DepositRoute[];
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
  txHash?: string;
  flowPayBalanceBefore: number;
  flowPayBalanceAfter: number;
}

export interface RoutingScoreInput {
  tokenAvailability: number; // 0-1
  gasNormalized: number; // 0-1 (lower is better, so 1 - gasNormalized in formula)
  receiverPreference: number; // 0-1
}
