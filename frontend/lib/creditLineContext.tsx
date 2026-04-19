'use client';

import React, {
  createContext, useContext, useState, useCallback, useEffect, useMemo,
} from 'react';
import {
  CreditLineState, CollateralTokenSymbol, LoanPosition, PriceFeed,
  LTV_RULES, LIQUIDATION_THRESHOLD, INR_PER_USD,
  DepositParams, BorrowParams, RepayParams, WithdrawParams,
  RiskLevel, BorrowSimulation, CurrencyDisplay,
} from '@/types/creditLine';
import { mockLoans, mockPriceFeeds, mockCreditTransactions, CreditTransaction } from '@/data/mockLoans';

// ─── Context Type ─────────────────────────────────────────────────────────────

interface CreditLineContextType extends CreditLineState {
  transactions: CreditTransaction[];
  walletBalanceINR: number;
  // Actions
  depositCollateral: (params: DepositParams) => Promise<void>;
  borrow: (params: BorrowParams) => Promise<void>;
  repay: (params: RepayParams) => Promise<void>;
  withdraw: (params: WithdrawParams) => Promise<void>;
  setCurrency: (currency: CurrencyDisplay) => void;
  simulateBorrow: (amountUSD: number) => BorrowSimulation;
  fmt: (usd: number) => string;
  // Derived
  activeLoans: LoanPosition[];
  safeBorrowUSD: number;
  isAtRisk: boolean;
}

const CreditLineContext = createContext<CreditLineContextType | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeHealthFactor(collateralUSD: number, borrowedUSD: number): number {
  if (borrowedUSD === 0) return 999;
  return (collateralUSD * LIQUIDATION_THRESHOLD) / borrowedUSD;
}

function computeRiskLevel(hf: number): RiskLevel {
  if (hf > 2.0) return 'safe';
  if (hf >= 1.2) return 'moderate';
  return 'dangerous';
}

function computeLiquidationPrice(
  token: CollateralTokenSymbol,
  amount: number,
  borrowedUSD: number,
): number {
  if (amount === 0 || token === 'USDC') return 0;
  return borrowedUSD / (amount * LIQUIDATION_THRESHOLD);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CreditLineProvider({ children }: { children: React.ReactNode }) {
  const [loans, setLoans] = useState<LoanPosition[]>(mockLoans);
  const [transactions, setTransactions] = useState<CreditTransaction[]>(mockCreditTransactions);
  const [collateral, setCollateral] = useState({ eth: 0.5, usdc: 1000 });
  const [borrowed, setBorrowed] = useState({ usdc: 1300 }); // 580 + 720
  const [prices] = useState(mockPriceFeeds);
  const [currency, setCurrencyState] = useState<CurrencyDisplay>('USD');
  const [isLoading, setIsLoading] = useState(false);
  // FlowPay wallet INR balance — funded by borrow actions
  const [walletBalanceINR, setWalletBalanceINR] = useState<number>(1300 * INR_PER_USD); // pre-seeded from existing loans

  // ── Computed Values ──

  const totalCollateralUSD = useMemo(() =>
    collateral.eth * prices.eth.priceUSD + collateral.usdc * prices.usdc.priceUSD,
  [collateral, prices]);

  const maxBorrowUSD = useMemo(() =>
    collateral.eth * prices.eth.priceUSD * LTV_RULES.ETH +
    collateral.usdc * prices.usdc.priceUSD * LTV_RULES.USDC,
  [collateral, prices]);

  const totalBorrowedUSD = borrowed.usdc;

  const availableCreditUSD = Math.max(0, maxBorrowUSD - totalBorrowedUSD);

  const healthFactor = useMemo(() =>
    computeHealthFactor(totalCollateralUSD, totalBorrowedUSD),
  [totalCollateralUSD, totalBorrowedUSD]);

  const riskLevel = computeRiskLevel(healthFactor);

  const collateralRatio = totalBorrowedUSD > 0
    ? (totalCollateralUSD / totalBorrowedUSD) * 100
    : 999;

  // Blended liquidation price for ETH (dominant collateral)
  const liquidationPrice = collateral.eth > 0
    ? computeLiquidationPrice('ETH', collateral.eth, totalBorrowedUSD * (LTV_RULES.ETH))
    : 0;

  // ── Formatting Helper ──

  const fmt = useCallback((usd: number): string => {
    if (currency === 'INR') {
      return `₹${(usd * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
    return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }, [currency]);

  // ── Simulate Borrow ──

  const simulateBorrow = useCallback((amountUSD: number): BorrowSimulation => {
    const newBorrowed = totalBorrowedUSD + amountUSD;
    const newLTV = totalCollateralUSD > 0 ? newBorrowed / totalCollateralUSD : 0;
    const newHF = computeHealthFactor(totalCollateralUSD, newBorrowed);
    const newRisk = computeRiskLevel(newHF);
    return {
      borrowAmount: amountUSD,
      resultingLTV: newLTV,
      resultingHF: newHF,
      riskLevel: newRisk,
      isSafe: newHF >= 1.5 && amountUSD <= availableCreditUSD,
    };
  }, [totalBorrowedUSD, totalCollateralUSD, availableCreditUSD]);

  // ── Actions ──

  const depositCollateral = useCallback(async ({ token, amount }: DepositParams) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const priceUSD = token === 'ETH' ? prices.eth.priceUSD : prices.usdc.priceUSD;
    const valueUSD = amount * priceUSD;
    const maxBorrow = valueUSD * LTV_RULES[token];
    const existingLoan = loans.find(l => l.collateralToken === token && l.status === 'active');
    const loanId = existingLoan?.loanId ?? `LOAN-${Date.now()}`;

    if (existingLoan) {
      setLoans(prev => prev.map(l =>
        l.loanId === loanId
          ? {
              ...l,
              collateralAmount: l.collateralAmount + amount,
              collateralValueUSD: l.collateralValueUSD + valueUSD,
              ltv: l.borrowedAmountUSD / (l.collateralValueUSD + valueUSD),
            }
          : l
      ));
    } else {
      const newLoan: LoanPosition = {
        loanId,
        walletAddress: '',
        collateralToken: token,
        collateralAmount: amount,
        collateralValueUSD: valueUSD,
        borrowedAmountUSD: 0,
        ltv: 0,
        liquidationPriceUSD: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setLoans(prev => [newLoan, ...prev]);
    }

    setCollateral(prev => ({
      ...prev,
      [token.toLowerCase()]: prev[token.toLowerCase() as 'eth' | 'usdc'] + amount,
    }));

    const tx: CreditTransaction = {
      id: `TX-${Date.now()}`,
      type: 'deposit',
      token,
      amount,
      amountUSD: valueUSD,
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
      loanId,
    };
    setTransactions(prev => [tx, ...prev]);
    setIsLoading(false);
  }, [loans, prices]);

  const borrow = useCallback(async ({ amountUSD }: BorrowParams) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    if (amountUSD > availableCreditUSD) throw new Error('Exceeds borrow limit');
    setBorrowed(prev => ({ usdc: prev.usdc + amountUSD }));

    // ── Credit the user's FlowPay wallet in INR ──
    const creditINR = parseFloat((amountUSD * INR_PER_USD).toFixed(2));
    setWalletBalanceINR(prev => prev + creditINR);

    const activeLoan = loans.find(l => l.status === 'active');
    const loanId = activeLoan?.loanId ?? 'LOAN-UNKNOWN';
    setLoans(prev => prev.map(l =>
      l.loanId === loanId
        ? { ...l, borrowedAmountUSD: l.borrowedAmountUSD + amountUSD, ltv: (l.borrowedAmountUSD + amountUSD) / l.collateralValueUSD }
        : l
    ));

    const tx: CreditTransaction = {
      id: `TX-${Date.now()}`,
      type: 'borrow',
      token: 'USDC',
      amount: amountUSD,
      amountUSD,
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
      loanId,
    };
    setTransactions(prev => [tx, ...prev]);
    setIsLoading(false);
  }, [availableCreditUSD, loans]);

  const repay = useCallback(async ({ amountUSD }: RepayParams) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const repayAmt = Math.min(amountUSD, totalBorrowedUSD);
    setBorrowed(prev => ({ usdc: Math.max(0, prev.usdc - repayAmt) }));

    const activeLoan = loans.find(l => l.status === 'active' && l.borrowedAmountUSD > 0);
    const loanId = activeLoan?.loanId ?? 'LOAN-UNKNOWN';
    setLoans(prev => prev.map(l => {
      if (l.loanId !== loanId) return l;
      const newBorrowed = Math.max(0, l.borrowedAmountUSD - repayAmt);
      return {
        ...l,
        borrowedAmountUSD: newBorrowed,
        ltv: newBorrowed / l.collateralValueUSD,
        status: newBorrowed === 0 ? 'repaid' : 'active',
      };
    }));

    const tx: CreditTransaction = {
      id: `TX-${Date.now()}`,
      type: 'repay',
      token: 'USDC',
      amount: repayAmt,
      amountUSD: repayAmt,
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
      loanId,
    };
    setTransactions(prev => [tx, ...prev]);
    setIsLoading(false);
  }, [totalBorrowedUSD, loans]);

  const withdraw = useCallback(async ({ token, amount }: WithdrawParams) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const key = token.toLowerCase() as 'eth' | 'usdc';
    setCollateral(prev => ({ ...prev, [key]: Math.max(0, prev[key] - amount) }));

    const tx: CreditTransaction = {
      id: `TX-${Date.now()}`,
      type: 'withdraw',
      token,
      amount,
      amountUSD: amount * (token === 'ETH' ? prices.eth.priceUSD : prices.usdc.priceUSD),
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
      loanId: '',
    };
    setTransactions(prev => [tx, ...prev]);
    setIsLoading(false);
  }, [prices]);

  const setCurrency = useCallback((c: CurrencyDisplay) => setCurrencyState(c), []);

  // ── Derived helpers exposed on context (avoids needing a separate hook) ──
  const activeLoans = loans.filter(l => l.status === 'active');
  const safeBorrowUSD = Math.min(availableCreditUSD, availableCreditUSD * 0.7);
  const isAtRisk = healthFactor < 1.5 && healthFactor !== 999;

  const value: CreditLineContextType = useMemo(() => ({
    collateral,
    borrowed,
    loans,
    prices,
    totalCollateralUSD,
    totalBorrowedUSD,
    availableCreditUSD,
    maxBorrowUSD,
    healthFactor,
    liquidationPrice,
    riskLevel,
    collateralRatio,
    currency,
    isLoading,
    transactions,
    walletBalanceINR,
    activeLoans,
    safeBorrowUSD,
    isAtRisk,
    depositCollateral,
    borrow,
    repay,
    withdraw,
    setCurrency,
    simulateBorrow,
    fmt,
  }), [
    collateral, borrowed, loans, prices, totalCollateralUSD, totalBorrowedUSD,
    availableCreditUSD, maxBorrowUSD, healthFactor, liquidationPrice, riskLevel,
    collateralRatio, currency, isLoading, transactions, walletBalanceINR,
    activeLoans, safeBorrowUSD, isAtRisk,
    depositCollateral, borrow, repay, withdraw, setCurrency,
    simulateBorrow, fmt,
  ]);

  return (
    <CreditLineContext.Provider value={value}>
      {children}
    </CreditLineContext.Provider>
  );
}

export function useCreditLineCtx() {
  const ctx = useContext(CreditLineContext);
  if (!ctx) throw new Error('useCreditLineCtx must be used within CreditLineProvider');
  return ctx;
}
