'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { ADDRESSES } from '@/src/contracts/addresses';
import cmArtifact from '@/src/contracts/CollateralManager.json';
import mInrArtifact from '@/src/contracts/MockINR.json';
import oracleArtifact from '@/src/contracts/MockPriceOracle.json';
import { Position, BorrowSimulation, RiskLevel, CurrencyDisplay, INR_PER_USD, LTV_RULES, LIQUIDATION_THRESHOLD } from '@/types/creditLine';

interface CreditTransaction {
  id: string; type: string; token: string; amount: number; amountUSD: number; timestamp: string; txHash: string; loanId: string;
}

interface CreditLineContextType {
  loans: Position[];
  walletBalanceINR: number;
  openPositionERC20: (token: string, amountRaw: bigint, creditRaw: bigint) => Promise<any>;
  repayPosition: (positionId: bigint, totalRepayRaw: bigint) => Promise<any>;
  setCurrency: (currency: CurrencyDisplay) => void;
  simulateBorrow: (amountUSD: number, collateralUSD: number) => BorrowSimulation;
  fmt: (usd: number) => string;
  activeLoans: Position[];
  availableCreditUSD: number;
  totalCollateralUSD: number;
  totalBorrowedUSD: number;
  healthFactor: number;
  isAtRisk: boolean;
  safeBorrowUSD: number;
  isLoading: boolean;
  riskLevel: RiskLevel;
  currency: CurrencyDisplay;
  liquidationPrice: number;
  collateralRatio: number;
  prices: any;
}

const CreditLineContext = createContext<CreditLineContextType | null>(null);

function computeHealthFactor(collateralUSD: number, borrowedUSD: number): number {
  if (borrowedUSD === 0 || isNaN(borrowedUSD)) return 999;
  return (collateralUSD * LIQUIDATION_THRESHOLD) / borrowedUSD;
}

function computeRiskLevel(hf: number): RiskLevel {
  if (hf > 2.0) return 'safe';
  if (hf >= 1.2) return 'moderate';
  return 'dangerous';
}

export function CreditLineProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const [currency, setCurrencyState] = useState<CurrencyDisplay>('USD');
  const [activeTx, setActiveTx] = useState<string | null>(null);

  // Wagmi reads
  const { data: userPosIds } = useReadContract({
    address: ADDRESSES.CollateralManager as `0x${string}`,
    abi: cmArtifact.abi,
    functionName: 'getUserPositions',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: mInrBalance } = useReadContract({
    address: ADDRESSES.MockINR as `0x${string}`,
    abi: mInrArtifact.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 }
  });

  // Multicall to fetch position structs
  const contracts = useMemo(() => {
    if (!userPosIds) return [];
    return (userPosIds as bigint[]).map(id => ({
      address: ADDRESSES.CollateralManager as `0x${string}`,
      abi: cmArtifact.abi as any,
      functionName: 'positions',
      args: [id],
    }));
  }, [userPosIds]);

  const { data: rawPositions } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0, refetchInterval: 5000 }
  });

  const loans: Position[] = useMemo(() => {
    if (!rawPositions) return [];
    return rawPositions
      .map(r => r.result as any[])
      .filter(Boolean)
      .map(arr => ({
        id: arr[0],
        borrower: arr[1],
        collateralContract: arr[2],
        collateralAmount: arr[3],
        isNFT: arr[4],
        creditIssued: arr[5],
        originationFee: arr[6],
        createdAt: arr[7],
        repayBy: arr[8],
        active: arr[9],
        liquidated: arr[10]
      }));
  }, [rawPositions]);

  // Multicall Oracle Prices
  const { data: maticPriceRaw } = useReadContract({
    address: ADDRESSES.MockOracle as `0x${string}`,
    abi: oracleArtifact.abi,
    functionName: 'getPrice',
    args: [ADDRESSES.MockMATIC],
    query: { refetchInterval: 10000 }
  });

  // Calculate generic derived states strictly from blockchain array
  const totalCollateralUSD = useMemo(() => {
    let sum = 0;
    loans.filter(l => l.active && !l.isNFT).forEach(l => {
      // Very basic price fallback simulation due to mock oracle limits
      const amt = Number(formatUnits(l.collateralAmount, 18));
      const price = maticPriceRaw ? Number(formatUnits(maticPriceRaw as bigint, 8)) / INR_PER_USD : 0.8;
      sum += amt * price;
    });
    return sum;
  }, [loans, maticPriceRaw]);

  const totalBorrowedUSD = useMemo(() => {
    let sum = 0;
    loans.filter(l => l.active).forEach(l => {
      sum += Number(formatUnits(l.creditIssued, 18)) / INR_PER_USD;
    });
    return sum;
  }, [loans]);

  const maxBorrowUSD = totalCollateralUSD * LTV_RULES.ERC20;
  const availableCreditUSD = Math.max(0, maxBorrowUSD - totalBorrowedUSD);
  const healthFactor = computeHealthFactor(totalCollateralUSD, totalBorrowedUSD);
  const riskLevel = computeRiskLevel(healthFactor);
  const isAtRisk = healthFactor < 1.5 && healthFactor !== 999;
  const activeLoans = loans.filter(l => l.active);
  const safeBorrowUSD = Math.min(availableCreditUSD, availableCreditUSD * 0.7);
  
  const collateralRatio = totalBorrowedUSD > 0 ? totalCollateralUSD / totalBorrowedUSD : 0;
  const liquidationPrice = 1250; // Mock ETH price for UI fallback
  const prices = useMemo(() => ({
    eth: { priceUSD: 3100, change24h: 2.5, sparkline: [3000, 3050, 3100, 3080, 3150, 3100] },
    usdc: { priceUSD: 1.0, change24h: 0.01, sparkline: [1, 1, 1, 1, 1, 1] }
  }), []);

  const walletBalanceINR = mInrBalance ? Number(formatUnits(mInrBalance as bigint, 18)) : 0;

  const { writeContractAsync } = useWriteContract();

  const openPositionERC20 = useCallback(async (token: string, amountRaw: bigint, creditRaw: bigint) => {
    if (!address) throw new Error("Not connected");
    const tx = await writeContractAsync({
      address: ADDRESSES.CollateralManager as `0x${string}`,
      abi: cmArtifact.abi,
      functionName: 'openPositionERC20',
      args: [token, amountRaw, creditRaw],
    });
    setActiveTx(tx);
    return tx;
  }, [address, writeContractAsync]);

  const repayPosition = useCallback(async (positionId: bigint, totalRepayRaw: bigint) => {
    if (!address) throw new Error("Not connected");
    
    // Step 1: Approve mINR
    await writeContractAsync({
      address: ADDRESSES.MockINR as `0x${string}`,
      abi: mInrArtifact.abi,
      functionName: 'approve',
      args: [ADDRESSES.CollateralManager, totalRepayRaw],
    });

    // We assume a naive delay between txs for Demo simplicity rather than watching receipt here, 
    // real PROD requires 2 distinct user-waits.
    await new Promise(r => setTimeout(r, 6000));
    
    // Step 2: Repay
    const tx = await writeContractAsync({
      address: ADDRESSES.CollateralManager as `0x${string}`,
      abi: cmArtifact.abi,
      functionName: 'repayPosition',
      args: [positionId],
    });
    setActiveTx(tx);
    return tx;
  }, [address, writeContractAsync]);

  const simulateBorrow = useCallback((amountUSD: number, colUSD: number): BorrowSimulation => {
    const newBorrowed = totalBorrowedUSD + amountUSD;
    const newColUSD = totalCollateralUSD + colUSD;
    const newLTV = newColUSD > 0 ? newBorrowed / newColUSD : 0;
    const newHF = computeHealthFactor(newColUSD, newBorrowed);
    const newRisk = computeRiskLevel(newHF);
    return {
      borrowAmount: amountUSD,
      resultingLTV: newLTV,
      resultingHF: newHF,
      riskLevel: newRisk,
      isSafe: newHF >= 1.5,
    };
  }, [totalBorrowedUSD, totalCollateralUSD]);

  const fmt = useCallback((usd: number): string => {
    if (currency === 'INR') {
      return `₹${(usd * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
    return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }, [currency]);

  const value: CreditLineContextType = useMemo(() => ({
    loans, activeLoans,
    totalCollateralUSD, totalBorrowedUSD, maxBorrowUSD, availableCreditUSD, healthFactor, isAtRisk, safeBorrowUSD,
    walletBalanceINR, openPositionERC20, repayPosition, setCurrency: setCurrencyState, simulateBorrow, fmt, isLoading: !!activeTx, riskLevel, currency,
    liquidationPrice, collateralRatio, prices
  }), [loans, activeLoans, totalCollateralUSD, totalBorrowedUSD, maxBorrowUSD, availableCreditUSD, healthFactor, isAtRisk, safeBorrowUSD, walletBalanceINR, openPositionERC20, repayPosition, simulateBorrow, fmt, activeTx, riskLevel, currency, liquidationPrice, collateralRatio, prices]);

  return <CreditLineContext.Provider value={value}>{children}</CreditLineContext.Provider>;
}

export function useCreditLineCtx() {
  const ctx = useContext(CreditLineContext);
  if (!ctx) throw new Error('useCreditLineCtx must be used within CreditLineProvider');
  return ctx;
}
