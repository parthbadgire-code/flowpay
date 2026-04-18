export interface Merchant {
  id: string;
  name: string;
  category: string;
  upiId: string;
  logo: string;
  color: string;
  qrData: string;
}

export interface PaymentTransaction {
  id: string;
  merchantName: string;
  merchantLogo: string;
  amountINR: number;
  flowPayBalanceBefore: number;
  flowPayBalanceAfter: number;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
  txHash?: string;
  lotteryEntry?: boolean;
}

export interface PaymentBreakdown {
  amountINR: number;
  merchant: Merchant;
  balanceBefore: number;
  balanceAfter: number;
  gasEstimateINR: number;
}
