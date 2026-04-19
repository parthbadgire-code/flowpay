// ─── Credit Line Types ────────────────────────────────────────────────────────

export type RiskLevel = 'safe' | 'moderate' | 'dangerous';
export type CurrencyDisplay = 'USD' | 'INR';

export const LTV_RULES: any = {
  ERC20: 0.50, // 50% LTV for crypto like MATIC
  NFT: 0.40    // 40% LTV for NFT
};

export const LIQUIDATION_THRESHOLD = 0.75; // 75%
export const INR_PER_USD = 83.5;

export interface Position {
  id: bigint;
  borrower: string;
  collateralContract: string;
  collateralAmount: bigint;
  isNFT: boolean;
  creditIssued: bigint;
  originationFee: bigint;
  createdAt: bigint;
  repayBy: bigint;
  active: boolean;
  liquidated: boolean;
}

export interface CreditLineState {
  loans: Position[];
  prices: any;
  // Computed
  totalCollateralUSD: number;
  totalBorrowedUSD: number;
  availableCreditUSD: number;
  maxBorrowUSD: number;
  healthFactor: number;
  riskLevel: RiskLevel;
  // UI
  currency: CurrencyDisplay;
  isLoading: boolean;
}

export interface BorrowSimulation {
  borrowAmount: number;
  resultingLTV: number;
  resultingHF: number;
  riskLevel: RiskLevel;
  isSafe: boolean;
}
