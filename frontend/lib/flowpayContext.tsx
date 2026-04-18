'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TokenBalance, WalletState, NFTAsset } from '@/types/wallet';
import { PaymentTransaction } from '@/types/payment';
import { DepositTransaction } from '@/types/deposit';
import { mockTokenBalances, mockTotalPortfolioINR } from '@/data/balances';
import { mockNFTs } from '@/data/nfts';
import { mockPaymentHistory } from '@/data/paymentHistory';
import { mockDepositHistory } from '@/data/depositHistory';
import { DEMO_WALLET_ADDRESS } from '@/constants';

interface FlowPayContextType {
  wallet: WalletState;
  flowPayBalance: number;
  isDemo: boolean;
  paymentHistory: PaymentTransaction[];
  depositHistory: DepositTransaction[];
  connectWallet: (demo?: boolean) => Promise<void>;
  disconnectWallet: () => void;
  deposit: (amountINR: number, routes: DepositTransaction['routes']) => Promise<void>;
  spend: (amountINR: number, merchantName: string, merchantLogo: string) => Promise<PaymentTransaction>;
  addLotteryEntry: () => void;
  lotteryEntries: number;
}

const FlowPayContext = createContext<FlowPayContextType | null>(null);

const STORAGE_KEY = 'flowpay_balance';
const ENTRIES_KEY = 'flowpay_lottery_entries';

export function FlowPayProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: '',
    isConnected: false,
    totalPortfolioINR: 0,
    tokens: [],
    nfts: [],
    network: 'Polygon Amoy',
  });
  const [flowPayBalance, setFlowPayBalance] = useState<number>(0);
  const [isDemo, setIsDemo] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [depositHistory, setDepositHistory] = useState<DepositTransaction[]>([]);
  const [lotteryEntries, setLotteryEntries] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setFlowPayBalance(parseFloat(stored));
    const entries = localStorage.getItem(ENTRIES_KEY);
    if (entries) setLotteryEntries(parseInt(entries));
  }, []);

  const connectWallet = useCallback(async (demo = false) => {
    setIsDemo(demo);
    setWallet({
      address: DEMO_WALLET_ADDRESS,
      isConnected: true,
      totalPortfolioINR: mockTotalPortfolioINR,
      tokens: mockTokenBalances,
      nfts: mockNFTs,
      network: 'Polygon Amoy',
    });
    setPaymentHistory(mockPaymentHistory);
    setDepositHistory(mockDepositHistory);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({ address: '', isConnected: false, totalPortfolioINR: 0, tokens: [], nfts: [], network: 'Polygon Amoy' });
    setFlowPayBalance(0);
    setIsDemo(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const deposit = useCallback(async (amountINR: number, routes: DepositTransaction['routes']) => {
    await new Promise(r => setTimeout(r, 1500)); // simulate TX
    const newBalance = flowPayBalance + amountINR;
    setFlowPayBalance(newBalance);
    localStorage.setItem(STORAGE_KEY, String(newBalance));
    const tx: DepositTransaction = {
      id: `dep_${Date.now()}`,
      totalINR: amountINR,
      routes,
      timestamp: new Date(),
      status: 'success',
      txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
      flowPayBalanceBefore: flowPayBalance,
      flowPayBalanceAfter: newBalance,
    };
    setDepositHistory(prev => [tx, ...prev]);
  }, [flowPayBalance]);

  const spend = useCallback(async (amountINR: number, merchantName: string, merchantLogo: string): Promise<PaymentTransaction> => {
    await new Promise(r => setTimeout(r, 1200)); // simulate TX
    const newBalance = flowPayBalance - amountINR;
    setFlowPayBalance(newBalance);
    localStorage.setItem(STORAGE_KEY, String(newBalance));
    const tx: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      merchantName,
      merchantLogo,
      amountINR,
      flowPayBalanceBefore: flowPayBalance,
      flowPayBalanceAfter: newBalance,
      timestamp: new Date(),
      status: 'success',
      txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
      lotteryEntry: true,
    };
    setPaymentHistory(prev => [tx, ...prev]);
    return tx;
  }, [flowPayBalance]);

  const addLotteryEntry = useCallback(() => {
    const next = lotteryEntries + 1;
    setLotteryEntries(next);
    localStorage.setItem(ENTRIES_KEY, String(next));
  }, [lotteryEntries]);

  return (
    <FlowPayContext.Provider value={{ wallet, flowPayBalance, isDemo, paymentHistory, depositHistory, connectWallet, disconnectWallet, deposit, spend, addLotteryEntry, lotteryEntries }}>
      {children}
    </FlowPayContext.Provider>
  );
}

export function useFlowPay() {
  const ctx = useContext(FlowPayContext);
  if (!ctx) throw new Error('useFlowPay must be used within FlowPayProvider');
  return ctx;
}
