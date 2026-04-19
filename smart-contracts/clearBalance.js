const hre = require("hardhat");
const { ADDRESSES } = require("../frontend/src/contracts/addresses.js");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const mINR = await hre.ethers.getContractAt("MockINR", ADDRESSES.MockINR, deployer);
  const bal = await mINR.balanceOf(deployer.address);
  console.log("Current mINR Balance:", hre.ethers.formatEther(bal));

  if (bal > 0n) {
    const tx = await mINR.transfer("0x000000000000000000000000000000000000dEaD", bal);
    await tx.wait();
    console.log("Cleared mINR balance by transferring to dEaD address.");
  }
}
main().catch(console.error);
