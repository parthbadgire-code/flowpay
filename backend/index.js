/**
 * FlowPay Express Backend
 * All routes return mock data for hackathon demo.
 * Replace mock returns with real Firebase/Alchemy/CoinGecko calls in production.
 */

const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ['http://localhost:3000', 'https://flowpay.vercel.app'] }));
app.use(express.json());

// ─── Price Routes ──────────────────────────────────────────────────────────
app.get('/api/prices', (req, res) => {
  res.json({
    success: true,
    prices: [
      { symbol: 'USDC',  inrPrice: 83.5,    usdPrice: 1.00,   change24h: 0.01 },
      { symbol: 'MATIC', inrPrice: 0.86,    usdPrice: 0.0103, change24h: -2.3 },
      { symbol: 'ETH',   inrPrice: 271820,  usdPrice: 3256.0, change24h: 1.8  },
    ],
    updatedAt: new Date().toISOString(),
  });
});

// ─── Balance Routes ────────────────────────────────────────────────────────
app.get('/api/balance/:address', (req, res) => {
  const { address } = req.params;
  res.json({
    success: true,
    address,
    tokens: [
      { symbol: 'USDC', amount: 2.39,  inrValue: 200, usdValue: 2.39 },
      { symbol: 'MATIC', amount: 174.83, inrValue: 150, usdValue: 1.80 },
      { symbol: 'ETH',  amount: 0.00385, inrValue: 100, usdValue: 1.20 },
    ],
    totalINR: 450,
    network: 'Ethereum Sepolia',
  });
});

// ─── Deposit Routes ────────────────────────────────────────────────────────
app.post('/api/deposit', (req, res) => {
  const { amountINR, userAddress } = req.body;
  // TODO: Verify on-chain transaction and update Firestore
  res.json({
    success: true,
    txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
    amountINR,
    message: 'Deposit simulated successfully',
  });
});

// ─── Payment Routes ────────────────────────────────────────────────────────
app.post('/api/payment', (req, res) => {
  const { amountINR, merchantId, userAddress } = req.body;
  // TODO: Deduct from Firestore FlowPay balance & add lottery entry
  res.json({
    success: true,
    txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
    amountINR,
    message: 'Payment simulated successfully',
    lotteryEntry: true,
  });
});

// ─── Lottery Routes ────────────────────────────────────────────────────────
app.get('/api/lottery/pool', (req, res) => {
  res.json({
    success: true,
    pool: {
      totalPrizeINR: 12500,
      totalEntries: 847,
      currentRound: 48,
      drawTimestamp: new Date(Date.now() + 6 * 3600000).toISOString(),
    },
  });
});

app.post('/api/lottery/pick-winner', (req, res) => {
  // Call Chainlink VRF for verifiable randomness is handled on-chain
  res.json({
    success: true,
    message: "Winner is being selected via Chainlink VRF on-chain",
  });
});

app.get('/api/lottery/winner', async (req, res) => {
  const { contractAddress } = req.query;
  if (!contractAddress) return res.status(400).json({ error: "Missing contractAddress param" });
  
  try {
    // Ethers v6 compatible JSON RPC provider to Sepolia
    const provider = new ethers.JsonRpcProvider('https://rpc2.sepolia.org');
    const abi = ["function lastWinner() view returns (address)"];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    const lastWinner = await contract.lastWinner();
    res.json({
      success: true,
      lastWinner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ─── Health ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', env: process.env.NODE_ENV || 'development' });
});

app.listen(PORT, () => {
  console.log(`🚀 FlowPay API running at http://localhost:${PORT}`);
});

module.exports = app;
