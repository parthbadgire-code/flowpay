/**
 * nftService.ts
 * Mock NFT service for fetching NFT assets and backup liquidity values.
 * Replace with Alchemy NFT API in production.
 */

import { NFTBackupLiquidity } from '@/types/nft';
import { NFTAsset } from '@/types/wallet';
import { mockNFTs } from '@/data/nfts';

export async function getUserNFTs(address: string): Promise<NFTAsset[]> {
  // TODO: Replace with Alchemy NFT API
  // const alchemy = new Alchemy({ apiKey, network: Network.MATIC_AMOY });
  // const nfts = await alchemy.nft.getNftsForOwner(address);
  await new Promise(r => setTimeout(r, 700));
  return mockNFTs;
}

export async function getNFTBackupLiquidity(nft: NFTAsset): Promise<NFTBackupLiquidity> {
  await new Promise(r => setTimeout(r, 200));
  return {
    nft: {
      tokenId: nft.tokenId,
      name: nft.name,
      description: `${nft.collection} NFT on ${nft.chain}`,
      image: nft.image,
      collection: nft.collection,
      collectionAddress: '0x1234567890abcdef1234567890abcdef12345678',
      attributes: [{ trait_type: 'Rarity', value: nft.rarity ?? 'Common' }],
      chain: nft.chain,
      owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    },
    floorPriceINR: nft.floorPriceINR,
    floorPriceUSD: nft.floorPriceINR / 83.5,
    backupLiquidityINR: nft.backupLiquidity,
    backupLiquidityPercent: (nft.backupLiquidity / nft.floorPriceINR) * 100,
    isApproved: false,
    note: 'NFT-backed liquidity is simulated and approval-based.',
  };
}

export async function getAllNFTBackupLiquidity(address: string): Promise<number> {
  const nfts = await getUserNFTs(address);
  return nfts.reduce((acc, n) => acc + n.backupLiquidity, 0);
}
