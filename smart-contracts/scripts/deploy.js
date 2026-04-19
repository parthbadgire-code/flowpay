const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const SUBSCRIPTION_ID = "109875450105937948492512243849098070632142568475445286884777686620247923872012";
const EXISTING_MINR = "";
const EXISTING_ORACLE = "";
const EXISTING_NFT = "";
const EXISTING_CM = "";
const EXISTING_USDC = "";
const EXISTING_MATIC = "";
const EXISTING_ETH = "";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying securely streamlined smart contracts to Sepolia with:", deployer.address);

  // 1. Deploy MockINR
  let mINR, mINRAddress;
  if (EXISTING_MINR !== "") {
    mINRAddress = EXISTING_MINR;
    mINR = await hre.ethers.getContractAt("MockINR", mINRAddress, deployer);
    console.log("Reusing MockINR at:", mINRAddress);
  } else {
    console.log("Deploying MockINR...");
    const MockINR = await hre.ethers.getContractFactory("MockINR");
    mINR = await MockINR.deploy();
    await mINR.waitForDeployment();
    mINRAddress = await mINR.getAddress();
    console.log("MockINR deployed to:", mINRAddress);
  }

  // 2. Deploy MockPriceOracle
  let oracle, oracleAddress;
  if (EXISTING_ORACLE !== "") {
    oracleAddress = EXISTING_ORACLE;
    oracle = await hre.ethers.getContractAt("MockPriceOracle", oracleAddress, deployer);
    console.log("Reusing MockPriceOracle at:", oracleAddress);
  } else {
    console.log("Deploying MockPriceOracle...");
    const MockPriceOracle = await hre.ethers.getContractFactory("MockPriceOracle");
    oracle = await MockPriceOracle.deploy();
    await oracle.waitForDeployment();
    oracleAddress = await oracle.getAddress();
    console.log("MockPriceOracle deployed to:", oracleAddress);
  }

  // 3. Deploy MockNFT (required for Sepolia demo testing)
  let mockNFT, mockNFTAddress;
  if (EXISTING_NFT !== "") {
    mockNFTAddress = EXISTING_NFT;
    mockNFT = await hre.ethers.getContractAt("MockNFT", mockNFTAddress, deployer);
    console.log("Reusing MockNFT at:", mockNFTAddress);
  } else {
    console.log("Deploying MockNFT...");
    const MockNFT = await hre.ethers.getContractFactory("MockNFT");
    mockNFT = await MockNFT.deploy();
    await mockNFT.waitForDeployment();
    mockNFTAddress = await mockNFT.getAddress();
    console.log("MockNFT deployed to:", mockNFTAddress);
  }

  // 4. Deploy CollateralManager
  let cm, cmAddress;
  if (EXISTING_CM !== "") {
    cmAddress = EXISTING_CM;
    cm = await hre.ethers.getContractAt("CollateralManager", cmAddress, deployer);
    console.log("Reusing CollateralManager at:", cmAddress);
  } else {
    console.log("Deploying CollateralManager...");
    const CollateralManager = await hre.ethers.getContractFactory("CollateralManager");
    cm = await CollateralManager.deploy(mINRAddress, oracleAddress);
    await cm.waitForDeployment();
    cmAddress = await cm.getAddress();
    console.log("CollateralManager deployed to:", cmAddress);
  }

  // 5. Deploy Mock ERC20s (USDC, MATIC, ETH)
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");

  let mockUSDC, mockUSDCAddress;
  if (EXISTING_USDC !== "") {
    mockUSDCAddress = EXISTING_USDC;
    mockUSDC = await hre.ethers.getContractAt("MockERC20", mockUSDCAddress, deployer);
  } else {
    console.log("Deploying MockUSDC...");
    mockUSDC = await MockERC20.deploy("Mock USDC", "mUSDC");
    await mockUSDC.waitForDeployment();
    mockUSDCAddress = await mockUSDC.getAddress();
  }

  let mockMATIC, mockMATICAddress;
  if (EXISTING_MATIC !== "") {
    mockMATICAddress = EXISTING_MATIC;
    mockMATIC = await hre.ethers.getContractAt("MockERC20", mockMATICAddress, deployer);
  } else {
    console.log("Deploying MockMATIC...");
    mockMATIC = await MockERC20.deploy("Mock MATIC", "mMATIC");
    await mockMATIC.waitForDeployment();
    mockMATICAddress = await mockMATIC.getAddress();
  }

  let mockETH, mockETHAddress;
  if (EXISTING_ETH !== "") {
    mockETHAddress = EXISTING_ETH;
    mockETH = await hre.ethers.getContractAt("MockERC20", mockETHAddress, deployer);
  } else {
    console.log("Deploying MockETH...");
    mockETH = await MockERC20.deploy("Mock ETH", "mETH");
    await mockETH.waitForDeployment();
    mockETHAddress = await mockETH.getAddress();
  }

  // 5b. Deploy RewardLottery
  // console.log("Deploying RewardLottery...");
  // const RewardLottery = await hre.ethers.getContractFactory("RewardLottery");
  // const lottery = await RewardLottery.deploy(SUBSCRIPTION_ID);
  // await lottery.waitForDeployment();
  // const lotteryAddress = await lottery.getAddress();
  // console.log("RewardLottery deployed to:", lotteryAddress);

  // 6. Set Oracle Prices
  console.log("Setting Oracle Prices...");
  await (await oracle.setPrice(mockUSDCAddress, 8350000000)).wait(); // ₹83.50
  await (await oracle.setPrice(mockMATICAddress, 6820000000)).wait(); // ₹68.20
  await (await oracle.setPrice(mockETHAddress, 24500000000000)).wait(); // ₹245,000
  await (await oracle.setPrice(mockNFTAddress, 4500000000000)).wait(); // ₹45,000

  // 7. Grant minter role to CM
  console.log("Granting MockINR minter role to CollateralManager...");
  await (await mINR.grantMinter(cmAddress)).wait();

  // 8. Mint initial capital for testing
  console.log("Minting initial test tokens...");
  // await (await mINR.mint(deployer.address, hre.ethers.parseEther("1000000"))).wait();
  await (await mockUSDC.mint(deployer.address, hre.ethers.parseEther("10000"))).wait();
  await (await mockMATIC.mint(deployer.address, hre.ethers.parseEther("5000"))).wait();
  await (await mockETH.mint(deployer.address, hre.ethers.parseEther("10"))).wait();
  await (await mockNFT.mint(deployer.address, 1)).wait();
  await (await mockNFT.mint(deployer.address, 2)).wait();

  // Write addresses out to frontend
  const addresses = {
    CollateralManager: cmAddress,
    MockINR: mINRAddress,
    MockOracle: oracleAddress,
    MockNFT: mockNFTAddress,
    MockUSDC: mockUSDCAddress,
    MockMATIC: mockMATICAddress,
    MockETH: mockETHAddress,
    // RewardLottery: lotteryAddress
  };

  const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, 'addresses.js'),
    `export const ADDRESSES = ${JSON.stringify(addresses, null, 2)}`
  );

  console.log('Addresses securely written to frontend/src/contracts/addresses.js');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
