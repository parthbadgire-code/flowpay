'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { ADDRESSES } from '@/src/contracts/addresses';
import cmArtifact from '@/src/contracts/CollateralManager.json';
import mInrArtifact from '@/src/contracts/MockINR.json';
import oracleArtifact from '@/src/contracts/MockPriceOracle.json';
import { fetchTokenPrices, TokenPrice } from '@/services/priceService';
import { Position, BorrowSimulation, RiskLevel, CurrencyDisplay, INR_PER_USD, LTV_RULES, LIQUIDATION_THRESHOLD } from '@/types/creditLine';

interface CreditTransaction {
  id: string; type: string; token: string; amount: number; amountUSD: number; timestamp: string; txHash: string; loanId: string;
}

interface CreditLineContextType {
  loans: Position[];
  walletBalanceINR: number;
  collateralBalances: { MATIC: number; USDC: number; ETH: number };
  openPositionERC20: (token: string, amountRaw: bigint, creditRaw: bigint) => Promise<any>;
  openPositionNFT: (nftContract: string, tokenIdRaw: bigint, creditRaw: bigint) => Promise<any>;
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
  const publicClient = usePublicClient();
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

  // Multicall to fetch ERC20 balances
  const tokenContracts = useMemo(() => {
    if (!address) return [];
    return [
      { address: ADDRESSES.MockMATIC as `0x${string}`, abi: mInrArtifact.abi as any, functionName: 'balanceOf', args: [address] },
      { address: ADDRESSES.MockUSDC as `0x${string}`, abi: mInrArtifact.abi as any, functionName: 'balanceOf', args: [address] },
      { address: ADDRESSES.MockETH as `0x${string}`, abi: mInrArtifact.abi as any, functionName: 'balanceOf', args: [address] }
    ];
  }, [address]);

  const { data: rawTokenBalances } = useReadContracts({
    contracts: tokenContracts,
    query: { enabled: tokenContracts.length > 0, refetchInterval: 5000 }
  });

  const collateralBalances = useMemo(() => ({
    MATIC: rawTokenBalances?.[0]?.result ? Number(formatUnits(rawTokenBalances[0].result as bigint, 18)) : 0,
    USDC: rawTokenBalances?.[1]?.result ? Number(formatUnits(rawTokenBalances[1].result as bigint, 18)) : 0,
    ETH: rawTokenBalances?.[2]?.result ? Number(formatUnits(rawTokenBalances[2].result as bigint, 18)) : 0
  }), [rawTokenBalances]);

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

  // Live API Fetching
  const [liveData, setLiveData] = useState<TokenPrice[] | null>(null);
  const [sparkTick, setSparkTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function loadPrices() {
      const p = await fetchTokenPrices();
      if (mounted) setLiveData(p);
    }
    loadPrices();
    const interval = setInterval(loadPrices, 15000); // 15 seconds real-time fetch
    const sparkInterval = setInterval(() => setSparkTick(t => t + 1), 1000); // 1 second animation loop
    return () => {
      mounted = false;
      clearInterval(interval);
      clearInterval(sparkInterval);
    };
  }, []);

  // Calculate generic derived states strictly from blockchain array
  const totalCollateralUSD = useMemo(() => {
    let sum = 0;
    
    const getSymbolForAddress = (addr: string) => {
      const norm = addr.toLowerCase();
      if (norm === ADDRESSES.MockMATIC.toLowerCase()) return 'MATIC';
      if (norm === ADDRESSES.MockUSDC.toLowerCase()) return 'USDC';
      if (norm === ADDRESSES.MockETH.toLowerCase()) return 'ETH';
      return 'UNKNOWN';
    };

    loans.filter(l => l.active && !l.isNFT).forEach(l => {
      const amt = Number(formatUnits(l.collateralAmount, 18));
      const symbol = getSymbolForAddress(l.collateralContract);
      
      let price = 0;
      const livePrice = liveData?.find(t => t.symbol === symbol)?.usdPrice;
      if (livePrice) {
        price = livePrice;
      } else {
        if (symbol === 'MATIC') price = 0.8;
        else if (symbol === 'USDC') price = 1.0;
        else if (symbol === 'ETH') price = 3100.0;
      }
      
      sum += amt * price;
    });
    return sum;
  }, [loans, liveData]);

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
  
  const prices = useMemo(() => {
    const ethTarget = liveData?.find(t => t.symbol === 'ETH');
    const ethPriceUSD = ethTarget?.usdPrice || 3100;
    const ethChange = ethTarget?.change24h || 1.8;

    const usdcTarget = liveData?.find(t => t.symbol === 'USDC');
    const usdcPriceUSD = usdcTarget?.usdPrice || 1.0;
    const usdcChange = usdcTarget?.change24h || 0.01;

    // Use sparkTick to create a rolling sine wave offset so the graph flows dynamically
    const createSparkline = (base: number, volatility: number) => {
      let line = [];
      for(let i=0; i<6; i++) {
        if (i === 5) {
          line.push(base); // end exactly on the current live price
        } else {
          // Math wave that evolves per tick
          const wave = Math.sin((sparkTick * 0.5) + i) * volatility;
          line.push(base + (base * wave));
        }
      }
      return line;
    };

    return {
      eth: { priceUSD: ethPriceUSD, change24h: ethChange, sparkline: createSparkline(ethPriceUSD, 0.04) },
      usdc: { priceUSD: usdcPriceUSD, change24h: usdcChange, sparkline: createSparkline(usdcPriceUSD, 0.001) }
    };
  }, [liveData, sparkTick]);

  const liquidationPrice = prices.eth.priceUSD * 0.82; // UI estimation for chart scale

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

  const openPositionNFT = useCallback(async (nftContract: string, tokenIdRaw: bigint, creditRaw: bigint) => {
    if (!address) throw new Error("Not connected");
    const tx = await writeContractAsync({
      address: ADDRESSES.CollateralManager as `0x${string}`,
      abi: cmArtifact.abi,
      functionName: 'openPositionNFT',
      args: [nftContract, tokenIdRaw, creditRaw],
    });
    setActiveTx(tx);
    return tx;
  }, [address, writeContractAsync]);

  const repayPosition = useCallback(async (positionId: bigint, totalRepayRaw: bigint) => {
    if (!address) throw new Error("Not connected");
    
    // Step 1: Approve mINR
    const hash = await writeContractAsync({
      address: ADDRESSES.MockINR as `0x${string}`,
      abi: mInrArtifact.abi,
      functionName: 'approve',
      args: [ADDRESSES.CollateralManager, totalRepayRaw],
    });

    if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
    else await new Promise(r => setTimeout(r, 8000));
    
    // Step 2: Repay
    const tx = await writeContractAsync({
      address: ADDRESSES.CollateralManager as `0x${string}`,
      abi: cmArtifact.abi,
      functionName: 'repayPosition',
      args: [positionId],
    });
    setActiveTx(tx);
    return tx;
  }, [address, writeContractAsync, publicClient]);

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
    walletBalanceINR, collateralBalances, openPositionERC20, openPositionNFT, repayPosition, setCurrency: setCurrencyState, simulateBorrow, fmt, isLoading: !!activeTx, riskLevel, currency,
    liquidationPrice, collateralRatio, prices
  }), [loans, activeLoans, totalCollateralUSD, totalBorrowedUSD, maxBorrowUSD, availableCreditUSD, healthFactor, isAtRisk, safeBorrowUSD, walletBalanceINR, collateralBalances, openPositionERC20, openPositionNFT, repayPosition, simulateBorrow, fmt, activeTx, riskLevel, currency, liquidationPrice, collateralRatio, prices]);

  return <CreditLineContext.Provider value={value}>{children}</CreditLineContext.Provider>;
}

export function useCreditLineCtx() {
  const ctx = useContext(CreditLineContext);
  if (!ctx) throw new Error('useCreditLineCtx must be used within CreditLineProvider');
  return ctx;
}
