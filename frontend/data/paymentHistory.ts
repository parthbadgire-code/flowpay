import { PaymentTransaction } from '@/types/payment';

export const mockPaymentHistory: PaymentTransaction[] = [
  {
    id: 'pay_001',
    merchantName: 'Chai Point',
    merchantLogo: '☕',
    amountINR: 100,
    flowPayBalanceBefore: 300,
    flowPayBalanceAfter: 200,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'success',
    txHash: '0x111aaa222bbb333ccc444ddd555eee666fff000111aaa222bbb333ccc444dd',
    lotteryEntry: true,
  },
  {
    id: 'pay_002',
    merchantName: 'Swiggy',
    merchantLogo: '🛵',
    amountINR: 249,
    flowPayBalanceBefore: 449,
    flowPayBalanceAfter: 200,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: 'success',
    lotteryEntry: true,
  },
  {
    id: 'pay_003',
    merchantName: 'BookMyShow',
    merchantLogo: '🎬',
    amountINR: 500,
    flowPayBalanceBefore: 700,
    flowPayBalanceAfter: 200,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    lotteryEntry: false,
  },
];
