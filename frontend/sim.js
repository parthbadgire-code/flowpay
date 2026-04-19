const { createPublicClient, http, parseUnits, getContract } = require('viem');
const { sepolia } = require('viem/chains');
const ADDRESSES = require('./src/contracts/addresses.js').ADDRESSES;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://gateway.tenderly.co/public/sepolia')
});

async function main() {
  const address = '0xb344852e876F358F5a98635a6Fec9d9B5BD94faa';
  console.log("Simulating ERC20 Mint...");
  try {
    const { request } = await publicClient.simulateContract({
      address: ADDRESSES.MockMATIC,
      abi: [{ type: "function", name: "mint", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [] }],
      functionName: 'mint',
      args: [address, parseUnits('10000', 18)],
      account: address,
    });
    console.log("ERC20 Mint Success");
  } catch (e) {
    console.log("ERC20 Mint failed:", e.message.substring(0, 200));
  }

  console.log("Simulating NFT Mint...");
  try {
    const { request } = await publicClient.simulateContract({
      address: ADDRESSES.MockNFT,
      abi: [{ type: "function", name: "mint", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [] }],
      functionName: 'mint',
      args: [address, parseUnits('100', 0)],
      account: address,
    });
    console.log("NFT Mint Success");
  } catch (e) {
    console.log("NFT Mint failed:", e.message.substring(0, 200));
  }
}
main();
