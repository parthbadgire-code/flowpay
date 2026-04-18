import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RoutingScoreInput, DepositRoute } from '@/types/deposit';
import { TokenBalance } from '@/types/wallet';
import { ROUTING_WEIGHTS, TOKEN_PRIORITY, GAS_ESTIMATES_GWEI, NETWORK } from '@/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── INR Formatting ───────────────────────────────────────────────────────────
export function formatINR(amount: number, compact = false): string {
  if (compact && amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (compact && amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(n: number, decimals = 4): string {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Routing Score ────────────────────────────────────────────────────────────
export function calculateRoutingScore(input: RoutingScoreInput): number {
  return (
    ROUTING_WEIGHTS.TOKEN_AVAILABILITY * input.tokenAvailability +
    ROUTING_WEIGHTS.LOW_GAS * (1 - input.gasNormalized) +
    ROUTING_WEIGHTS.RECEIVER_PREFERENCE * input.receiverPreference
  );
}

// ─── Gas Estimation ──────────────────────────────────────────────────────────
export function estimateGasINR(symbol: string, maticPriceINR = 0.86): number {
  const gasUnits =
    symbol === 'USDC'
      ? GAS_ESTIMATES_GWEI.USDC_TRANSFER
      : symbol === 'MATIC'
      ? GAS_ESTIMATES_GWEI.MATIC_TRANSFER
      : GAS_ESTIMATES_GWEI.ETH_TRANSFER;

  const gasCostMATIC = (gasUnits * NETWORK.gasPrice * 1e-9);
  return gasCostMATIC * maticPriceINR;
}

// ─── Deposit Routing Algorithm ────────────────────────────────────────────────
export function calculateDepositRoutes(
  amountINR: number,
  tokens: TokenBalance[],
  receiverPreferences: Record<string, number> = {}
): DepositRoute[] {
  const routes: DepositRoute[] = [];
  let remaining = amountINR;

  // Sort by TOKEN_PRIORITY
  const sortedTokens = [...tokens].sort((a, b) => {
    const ai = TOKEN_PRIORITY.indexOf(a.symbol as typeof TOKEN_PRIORITY[number]);
    const bi = TOKEN_PRIORITY.indexOf(b.symbol as typeof TOKEN_PRIORITY[number]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const maxGas = estimateGasINR('USDC') * 3;

  for (const token of sortedTokens) {
    if (remaining <= 0) break;
    if (token.inrValue <= 0) continue;

    const useINR = Math.min(remaining, token.inrValue);
    const useTokenAmount = (useINR / token.inrValue) * token.amount;
    const gasINR = estimateGasINR(token.symbol);
    const gasNormalized = Math.min(gasINR / maxGas, 1);
    const availability = token.inrValue / amountINR;
    const preference = receiverPreferences[token.symbol] ?? 0.5;

    const score = calculateRoutingScore({
      tokenAvailability: Math.min(availability, 1),
      gasNormalized,
      receiverPreference: preference,
    });

    routes.push({
      token: token.name,
      symbol: token.symbol,
      amountINR: useINR,
      tokenAmount: useTokenAmount,
      logo: token.logo,
      color: token.color,
      gasEstimateINR: gasINR,
      routingScore: parseFloat(score.toFixed(3)),
      badge: routes.length === 0 ? 'Best Route' : undefined,
    });

    remaining -= useINR;
  }

  return routes;
}

// ─── FlowPay Balance ─────────────────────────────────────────────────────────
export function calculateSpendableBalance(
  flowPayBalance: number,
  nftBackupLiquidity = 0
): { spendable: number; fromFlowPay: number; fromNFT: number } {
  return {
    spendable: flowPayBalance + nftBackupLiquidity,
    fromFlowPay: flowPayBalance,
    fromNFT: nftBackupLiquidity,
  };
}

// ─── NFT Backup Value ────────────────────────────────────────────────────────
export function calculateNFTBackupValue(
  floorPriceINR: number,
  backupPercent = 0.125
): number {
  return floorPriceINR * backupPercent;
}
