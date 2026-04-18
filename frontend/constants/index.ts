export const ROUTING_WEIGHTS = {
  TOKEN_AVAILABILITY: 0.5,
  LOW_GAS: 0.3,
  RECEIVER_PREFERENCE: 0.2,
} as const;

export const TOKEN_PRIORITY = ['USDC', 'MATIC', 'ETH', 'NFT'] as const;

export const NETWORK = {
  name: 'Polygon Amoy',
  chainId: 80002,
  rpcUrl: 'https://rpc-amoy.polygon.technology',
  currency: 'MATIC',
  explorerUrl: 'https://amoy.polygonscan.com',
  gasPrice: 30, // Gwei
};

export const TOKEN_CONFIG = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: '💵',
    color: '#2775CA',
    gasMultiplier: 1.0,
    contractAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  },
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    logo: '🔷',
    color: '#8247E5',
    gasMultiplier: 0.8,
    contractAddress: 'native',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logo: '⟠',
    color: '#627EEA',
    gasMultiplier: 1.5,
    contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  },
} as const;

export const INR_USD_RATE = 83.5;

export const DEMO_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

export const FLOWPAY_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

export const GAS_ESTIMATES_GWEI = {
  USDC_TRANSFER: 65000,
  MATIC_TRANSFER: 21000,
  ETH_TRANSFER: 21000,
  ERC20_APPROVAL: 46000,
};
