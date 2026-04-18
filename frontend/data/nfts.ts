import { NFTAsset } from '@/types/wallet';

export const mockNFTs: NFTAsset[] = [
  {
    tokenId: '12',
    name: 'Cyber Tiger #12',
    collection: 'Cyber Tigers Club',
    floorPriceINR: 4000,
    backupLiquidity: 500,
    image: 'https://api.dicebear.com/7.x/shapes/svg?seed=tiger12&backgroundColor=b6e3f4',
    chain: 'Polygon',
    rarity: 'Rare',
  },
  {
    tokenId: '847',
    name: 'Pixel Punk #847',
    collection: 'Pixel Punks',
    floorPriceINR: 2500,
    backupLiquidity: 300,
    image: 'https://api.dicebear.com/7.x/shapes/svg?seed=punk847&backgroundColor=ffd5dc',
    chain: 'Polygon',
    rarity: 'Common',
  },
  {
    tokenId: '33',
    name: 'MetaApe #33',
    collection: 'MetaApe Gang',
    floorPriceINR: 8000,
    backupLiquidity: 1000,
    image: 'https://api.dicebear.com/7.x/shapes/svg?seed=ape33&backgroundColor=c0aede',
    chain: 'Polygon',
    rarity: 'Epic',
  },
];

export const totalNFTBackupLiquidity = mockNFTs.reduce(
  (acc, n) => acc + n.backupLiquidity, 0
);
