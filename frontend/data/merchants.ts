import { Merchant } from '@/types/payment';

export const mockMerchants: Merchant[] = [
  {
    id: 'merchant_001',
    name: 'Chai Point',
    category: 'Cafe & Beverages',
    upiId: 'chaipoint@ybl',
    logo: '☕',
    color: '#F59E0B',
    qrData: 'upi://pay?pa=chaipoint@ybl&pn=Chai+Point&mc=5812&mode=02&purpose=00',
  },
  {
    id: 'merchant_002',
    name: 'Swiggy',
    category: 'Food Delivery',
    upiId: 'swiggy@icibeneficiaries',
    logo: '🛵',
    color: '#FC8019',
    qrData: 'upi://pay?pa=swiggy@icibeneficiaries&pn=Swiggy&mc=5812&mode=02&purpose=00',
  },
  {
    id: 'merchant_003',
    name: 'Zepto',
    category: 'Grocery',
    upiId: 'zepto@paytm',
    logo: '🛒',
    color: '#8B5CF6',
    qrData: 'upi://pay?pa=zepto@paytm&pn=Zepto&mc=5411&mode=02&purpose=00',
  },
  {
    id: 'merchant_004',
    name: 'BookMyShow',
    category: 'Entertainment',
    upiId: 'bookmyshow@hdfcbank',
    logo: '🎬',
    color: '#EF4444',
    qrData: 'upi://pay?pa=bookmyshow@hdfcbank&pn=BookMyShow&mc=7832&mode=02&purpose=00',
  },
  {
    id: 'merchant_005',
    name: 'Starbucks',
    category: 'Cafe',
    upiId: 'starbucks@sbi',
    logo: '⭐',
    color: '#065F46',
    qrData: 'upi://pay?pa=starbucks@sbi&pn=Starbucks&mc=5812&mode=02&purpose=00',
  },
];
