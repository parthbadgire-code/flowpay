const hre = require("hardhat");

async function main() {
  console.log("Deploying FlowPayWallet to Polygon Amoy...");

  const FlowPayWallet = await hre.ethers.getContractFactory("FlowPayWallet");
  const contract = await FlowPayWallet.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ FlowPayWallet deployed to: ${address}`);
  console.log(`   Network: ${hre.network.name}`);
  console.log(`   Explorer: https://amoy.polygonscan.com/address/${address}`);

  // Verify on Polygonscan
  if (hre.network.name !== "hardhat") {
    console.log("\nWaiting 5 blocks before verification...");
    await new Promise(r => setTimeout(r, 15000));
    try {
      await hre.run("verify:verify", { address, constructorArguments: [] });
      console.log("✅ Contract verified on Polygonscan");
    } catch (e) {
      console.log("Verification failed (may already be verified):", e.message);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
