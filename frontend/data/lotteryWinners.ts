import { LotteryWinner, LotteryPool } from '@/types/lottery';

export const mockLotteryWinners: LotteryWinner[] = [
  {
    id: 'win_001',
    address: '0x742d35Cc6634C0532925a3b8',
    shortAddress: '0x742d...f44e',
    prize: { type: 'cashback', label: '₹50 Cashback', valueINR: 50, icon: '💰', color: '#10B981' },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    round: 47,
    avatarColor: '#7C3AED',
  },
  {
    id: 'win_002',
    address: '0x1234567890abcdef12345678',
    shortAddress: '0x1234...5678',
    prize: { type: 'nft', label: 'FlowPay Badge NFT', valueINR: 200, icon: '🏆', color: '#F59E0B' },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    round: 46,
    avatarColor: '#3B82F6',
  },
  {
    id: 'win_003',
    address: '0xdeadbeefcafebabe00112233',
    shortAddress: '0xdead...2233',
    prize: { type: 'tokens', label: '5 MATIC Bonus', valueINR: 430, icon: '🔷', color: '#8247E5' },
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    round: 45,
    avatarColor: '#EC4899',
  },
];

export const mockLotteryPool: LotteryPool = {
  totalPrizeINR: 12500,
  totalEntries: 847,
  currentRound: 48,
  drawTimestamp: new Date(Date.now() + 6 * 60 * 60 * 1000),
  userEntries: 3,
  prizes: [
    { type: 'cashback', label: '₹500 Cashback', valueINR: 500, icon: '💰', color: '#10B981' },
    { type: 'nft', label: 'Gold FlowPay Badge', valueINR: 2000, icon: '🏆', color: '#F59E0B' },
    { type: 'tokens', label: '50 MATIC', valueINR: 4300, icon: '🔷', color: '#8247E5' },
  ],
};
