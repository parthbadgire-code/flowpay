export interface NFTMetadata {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  collectionAddress: string;
  attributes: NFTAttribute[];
  chain: string;
  owner: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFTBackupLiquidity {
  nft: NFTMetadata;
  floorPriceINR: number;
  floorPriceUSD: number;
  backupLiquidityINR: number;
  backupLiquidityPercent: number;
  isApproved: boolean;
  note: string;
}

export interface NFTCollection {
  name: string;
  address: string;
  totalItems: number;
  floorPriceINR: number;
  volumeINR: number;
  chain: string;
}
