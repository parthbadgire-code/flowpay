export interface TokenBalance {
  symbol: string;
  name: string;
  amount: number;
  inrValue: number;
  usdValue: number;
  logo: string;
  color: string;
  change24h: number;
  contractAddress?: string;
}

export interface NFTAsset {
  tokenId: string;
  name: string;
  collection: string;
  floorPriceINR: number;
  backupLiquidity: number;
  image: string;
  chain: string;
  rarity?: string;
}

export interface WalletState {
  address: string;
  isConnected: boolean;
  totalPortfolioINR: number;
  tokens: TokenBalance[];
  nfts: NFTAsset[];
  network: string;
}

export interface ReceiverPreference {
  label: string;
  preferredToken: string;
  weight: number;
}
