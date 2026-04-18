/**
 * routingService.ts
 * Asset routing algorithm for optimal deposit routes.
 * Score = 0.5(TokenAvailability) + 0.3(LowGas) + 0.2(ReceiverPreference)
 */

import { DepositBreakdown, DepositRoute } from '@/types/deposit';
import { TokenBalance } from '@/types/wallet';
import { calculateDepositRoutes, estimateGasINR } from '@/lib/utils';

export async function computeDepositRoutes(
  amountINR: number,
  tokens: TokenBalance[],
  receiverPreferences: Record<string, number> = {}
): Promise<DepositBreakdown> {
  await new Promise(r => setTimeout(r, 300)); // simulate computation

  const routes = calculateDepositRoutes(amountINR, tokens, receiverPreferences);
  const totalGas = routes.reduce((acc, r) => acc + r.gasEstimateINR, 0);

  return {
    totalINR: amountINR,
    routes,
    totalGasEstimateINR: parseFloat(totalGas.toFixed(4)),
    network: 'Polygon Amoy',
    estimatedTime: '~15 seconds',
    savedSwaps: Math.max(routes.length - 1, 0),
  };
}

export function getRoutingBadge(route: DepositRoute, index: number): string | undefined {
  if (index === 0) return 'Best Route';
  if (route.routingScore > 0.85) return 'Low Gas';
  return undefined;
}
