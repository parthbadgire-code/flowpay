/**
 * priceService.ts
 * Mock price service — returns simulated INR prices for supported tokens.
 * Replace fetchTokenPrices() with real CoinGecko API calls in production.
 */

export interface TokenPrice {
  symbol: string;
  inrPrice: number;
  usdPrice: number;
  change24h: number;
}

const MOCK_PRICES: TokenPrice[] = [
  { symbol: 'USDC', inrPrice: 83.5,    usdPrice: 1.00,     change24h: 0.01 },
  { symbol: 'MATIC', inrPrice: 0.86,   usdPrice: 0.0103,   change24h: -2.3 },
  { symbol: 'ETH',   inrPrice: 271820, usdPrice: 3256.0,   change24h: 1.8  },
];

export async function fetchTokenPrices(): Promise<TokenPrice[]> {
  // TODO: Replace with CoinGecko API
  // const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,matic-network,ethereum&vs_currencies=inr,usd&include_24hr_change=true')
  await new Promise(r => setTimeout(r, 400)); // simulate network
  return MOCK_PRICES;
}

export async function fetchTokenPrice(symbol: string): Promise<TokenPrice | null> {
  const prices = await fetchTokenPrices();
  return prices.find(p => p.symbol === symbol) ?? null;
}

export function convertINRToToken(amountINR: number, priceINR: number): number {
  return amountINR / priceINR;
}

export function convertTokenToINR(amount: number, priceINR: number): number {
  return amount * priceINR;
}
