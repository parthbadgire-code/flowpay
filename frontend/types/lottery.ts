export interface LotteryEntry {
  id: string;
  userAddress: string;
  paymentId: string;
  amountINR: number;
  timestamp: Date;
  entries: number;
}

export interface LotteryWinner {
  id: string;
  address: string;
  shortAddress: string;
  prize: LotteryPrize;
  timestamp: Date;
  round: number;
  avatarColor: string;
}

export interface LotteryPrize {
  type: 'cashback' | 'nft' | 'tokens';
  label: string;
  valueINR: number;
  icon: string;
  color: string;
}

export interface LotteryPool {
  totalPrizeINR: number;
  totalEntries: number;
  currentRound: number;
  drawTimestamp: Date;
  prizes: LotteryPrize[];
  userEntries: number;
}
