require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: [".env", ".env.local"] });

// Use a valid dummy fallback key (Hardhat Account 0) to prevent the curve.n bigint crash when env is entirely missing
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc2.sepolia.org";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
      evmVersion: "cancun"
    },
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      timeout: 120000,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};
