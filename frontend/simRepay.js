const { createPublicClient, http, getContract } = require('viem');
const { sepolia } = require('viem/chains');
const ADDRESSES = require('./src/contracts/addresses.js').ADDRESSES;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://gateway.tenderly.co/public/sepolia')
});

async function main() {
  const address = '0xb344852e876F358F5a98635a6Fec9d9B5BD94faa';
  console.log("Fetching user positions...");
  try {
    const userPosIds = await publicClient.readContract({
      address: ADDRESSES.CollateralManager,
      abi: [{ type: "function", name: "getUserPositions", inputs: [{ type: "address" }], outputs: [{ type: "uint256[]" }], stateMutability: "view" }],
      functionName: 'getUserPositions',
      args: [address],
    });
    console.log("Positions:", userPosIds);
    if (userPosIds.length === 0) {
      console.log("No positions to test repay");
      return;
    }
    const posId = userPosIds[0];
    
    // Test Repay Simulation
    console.log(`Simulating Repay for Position ${posId}...`);
    await publicClient.simulateContract({
      address: ADDRESSES.CollateralManager,
      abi: [{ type: "function", name: "repayPosition", inputs: [{ type: "uint256" }], outputs: [] }],
      functionName: 'repayPosition',
      args: [posId],
      account: address,
    });
    console.log("Repay Success");
  } catch (e) {
    console.log("Repay failed:", e.message);
  }
}
main();
