'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { ADDRESSES } from '@/src/contracts/addresses';
// The JSON will be created in the next steps, we use dynamic/any type assertion fallback just in case
import RewardLotteryABI from '@/src/contracts/RewardLottery.json';
import { NFTAsset } from '@/types/wallet';
import { PaymentTransaction } from '@/types/payment';
import { DepositTransaction } from '@/types/deposit';
import { mockNFTs } from '@/data/nfts';
import { mockPaymentHistory } from '@/data/paymentHistory';
import { mockDepositHistory } from '@/data/depositHistory';

export type PriceSnapshot = {
  USDC: number;
  MATIC: number;
  ETH: number;
  [key: string]: number;
};

export type PaymentBreakdown = {
  assetUsage: {
    symbol: string;
    amountToSell: number;
    inrValue: number;
  }[];
  totalInr: number;
};

export interface FlowPayContextType {
  mode: 'demo' | 'real';
  wallet: {
    address: string | null;
    isConnected: boolean;
    balances: {
      usdc: number;
      matic: number;
      eth: number;
      inr: number;
      nfts: NFTAsset[];
    };
  };
  prices: {
    snapshot: PriceSnapshot | null;
    lockedAt: number | null;
  };
  payment: {
    amount: number;
    breakdown: PaymentBreakdown | null;
    loading: boolean;
  };
  
  // Legacy / Common Data
  paymentHistory: PaymentTransaction[];
  depositHistory: DepositTransaction[];
  lotteryEntries: number;

  // Actions
  setPaymentState: (state: Partial<FlowPayContextType['payment']>) => void;
  lockPrices: (snapshot: PriceSnapshot) => void;
  setDemoMode: (enabled: boolean) => void;
  deposit: (amountINR: number, routes: DepositTransaction['routes']) => Promise<void>;
  spend: (amountINR: number, merchantName: string, merchantLogo: string, breakdown?: PaymentBreakdown) => Promise<PaymentTransaction>;
  addLotteryEntry: () => void;
}

const FlowPayContext = createContext<FlowPayContextType | null>(null);

const STORAGE_KEY = 'flowpay_balance';
const ENTRIES_KEY = 'flowpay_lottery_entries';

export function FlowPayProvider({ children }: { children: React.ReactNode }) {
  const account = useAccount(); // Wagmi
  const { writeContractAsync } = useWriteContract();
  
  const [isForcedDemo, setIsForcedDemo] = useState(false);
  const mode: 'demo' | 'real' = (account.isConnected && !isForcedDemo) ? 'real' : 'demo';
  
  // Base State
  const [flowPayInrBalance, setFlowPayInrBalance] = useState(0);
  const [lotteryEntries, setLotteryEntries] = useState(0);
  const [prices, setPrices] = useState<{ snapshot: PriceSnapshot | null; lockedAt: number | null }>({ snapshot: null, lockedAt: null });
  const [payment, setPayment] = useState<FlowPayContextType['payment']>({ amount: 0, breakdown: null, loading: false });

  // History State
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [depositHistory, setDepositHistory] = useState<DepositTransaction[]>([]);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setFlowPayInrBalance(parseFloat(stored));
    const entries = localStorage.getItem(ENTRIES_KEY);
    if (entries) setLotteryEntries(parseInt(entries));
    
    // Init demo history
    if (paymentHistory.length === 0) setPaymentHistory(mockPaymentHistory);
    if (depositHistory.length === 0) setDepositHistory(mockDepositHistory);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute Wallet
  const wallet = useMemo(() => ({
    address: mode === 'real' ? (account.address || null) : '0xDEm0...Flow',
    isConnected: mode === 'real' ? true : isForcedDemo,
    balances: {
      // Still using mock balances until queried from onchain
      usdc: 200,
      matic: 150,
      eth: 100,
      inr: flowPayInrBalance,
      nfts: mockNFTs,
    }
  }), [mode, account.address, isForcedDemo, flowPayInrBalance]);

  const lockPrices = useCallback((snapshot: PriceSnapshot) => {
    setPrices({ snapshot, lockedAt: Date.now() });
  }, []);

  const setPaymentState = useCallback((state: Partial<FlowPayContextType['payment']>) => {
    setPayment(prev => ({ ...prev, ...state }));
  }, []);

  const deposit = useCallback(async (amountINR: number, routes: DepositTransaction['routes']) => {
    await new Promise(r => setTimeout(r, 1500));
    const newBalance = flowPayInrBalance + amountINR;
    setFlowPayInrBalance(newBalance);
    localStorage.setItem(STORAGE_KEY, String(newBalance));
    
    const tx: DepositTransaction = {
      id: `dep_${Date.now()}`,
      totalINR: amountINR,
      routes,
      timestamp: new Date(),
      status: 'success',
      txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
      flowPayBalanceBefore: flowPayInrBalance,
      flowPayBalanceAfter: newBalance,
    };
    setDepositHistory(prev => [tx, ...prev]);
  }, [flowPayInrBalance]);

  const spend = useCallback(async (amountINR: number, merchantName: string, merchantLogo: string, breakdown?: PaymentBreakdown): Promise<PaymentTransaction> => {
    setPaymentState({ loading: true });
    
    // Simulating off-chain swap / indexer update logic execution time
    await new Promise(r => setTimeout(r, 1000));
    const newBalance = flowPayInrBalance - amountINR;
    setFlowPayInrBalance(newBalance);
    localStorage.setItem(STORAGE_KEY, String(newBalance));
    
    try {
      if (mode === 'real' && account.address && ADDRESSES.RewardLottery) {
        writeContractAsync({
          address: ADDRESSES.RewardLottery as `0x${string}`,
          abi: RewardLotteryABI.abi,
          functionName: 'addParticipant',
          args: [account.address]
        }).catch(e => console.error("VRF AddParticipant error (background):", e));
      }
    } catch (e) {
      console.warn("Failed to initiate VRF addParticipant", e);
    }
    
    const tx: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      merchantName,
      merchantLogo,
      amountINR,
      flowPayBalanceBefore: flowPayInrBalance,
      flowPayBalanceAfter: newBalance,
      timestamp: new Date(),
      status: 'success',
      txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
      lotteryEntry: true,
    };
    setPaymentHistory(prev => [tx, ...prev]);
    setPaymentState({ loading: false, amount: 0, breakdown: null });
    
    return tx;
  }, [flowPayInrBalance, setPaymentState]);

  const addLotteryEntry = useCallback(() => {
    const next = lotteryEntries + 1;
    setLotteryEntries(next);
    localStorage.setItem(ENTRIES_KEY, String(next));
  }, [lotteryEntries]);

  const value = useMemo(() => ({
    mode,
    wallet,
    prices,
    payment,
    paymentHistory,
    depositHistory,
    lotteryEntries,
    setPaymentState,
    lockPrices,
    setDemoMode: setIsForcedDemo,
    deposit,
    spend,
    addLotteryEntry,
  }), [mode, wallet, prices, payment, paymentHistory, depositHistory, lotteryEntries, setPaymentState, lockPrices, deposit, spend, addLotteryEntry]);

  return (
    <FlowPayContext.Provider value={value}>
      {children}
    </FlowPayContext.Provider>
  );
}

export function useFlowPay() {
  const ctx = useContext(FlowPayContext);
  if (!ctx) throw new Error('useFlowPay must be used within FlowPayProvider');
  return ctx;
}
