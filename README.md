# FlowPay

Welcome to **FlowPay**, a comprehensive Web3 decentralized finance (DeFi) payment and lending platform. FlowPay is designed to seamlessly bridge the gap between traditional transaction settlements and decentralized liquidity, empowering users to leverage their cryptocurrency assets to unlock working capital without selling their holdings.

## 📖 Table of Contents
- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Architecture & Platform Modules](#architecture--platform-modules)
- [User Workflows](#user-workflows)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Smart Contracts Deployment](#smart-contracts-deployment)
  - [Backend Services](#backend-services)
  - [Frontend Application](#frontend-application)
  - [Database Initialization](#database-initialization)
- [Project Configuration](#project-configuration)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## 📌 About the Project

In the rapidly evolving world of decentralized finance, liquidity and capital efficiency are paramount. FlowPay is built to not only act as a seamless cryptocurrency payment gateway for merchants and users, but to also serve as a robust **on-chain borrowing and collateralization protocol**.

Instead of liquidating crypto assets to cover daily expenses or business operations, users can lock their assets (like ETH or MATIC) into our decentralized smart contract vaults and instantly mint or borrow stablecoins (like USDC). FlowPay continually monitors the health factor of these loans, safeguarding the protocol while giving users full transparency over their Loan-to-Value (LTV) ratios.

## 🌟 Key Features

### 🏦 Decentralized Borrowing & Lending Vaults
- **Over-collateralized Loans:** Users can deposit volatile crypto assets safely into audited smart contracts and draw down stable liquidity.
- **Dynamic Interest Rates:** (Planned) Interest rates algorithmically adjust based on pool utilization and market dynamics.
- **Real-Time Health Monitoring:** Keep a constant eye on loan health factors and collateral ratios directly from the unified dashboard, helping you avoid auto-liquidations.

### 💳 Seamless Crypto Payments
- **Multi-Asset Support:** Native support for transacting in USDC, MATIC, ETH, and other major tokens.
- **Merchant Gateway:** Provides simulated and on-chain payment rails for merchants looking to accept web3 payments effortlessly.

### 📊 Comprehensive User Dashboard
- **Web3 Integrations:** Effortless wallet connectivity using Wagmi and RainbowKit.
- **In-Depth Analytics:** Visual representations of your collateral balances, borrowing history, and liquidation thresholds using Recharts.
- **Hybrid Data Model:** Seamlessly blends on-chain data (Wagmi/Viem) with off-chain indexing (Supabase/Firebase) for a lightning-fast User Experience.

---

## 🏗 Architecture & Platform Modules

FlowPay employs a modern hybrid architecture, splitting responsibilities cleanly between the frontend, backend, smart contracts, and off-chain databases.

1. **Frontend App (`/frontend`)**
   The presentation layer built on React 19 and Next.js. It manages the decentralized wallet connections and reads/writes to the blockchain via Viem. It features aggressive caching, clean UI/UX using Tailwind CSS v4, and dynamic animations with Framer Motion.
   
2. **Backend Services (`/backend`)**
   An Express.js REST API that serves as an indexing bridge and relayer. It fetches real-time crypto aggregates, abstracts away complex logic, handles off-chain verification (mock payment settlements), and queries collateral health from the blockchain.

3. **Smart Contracts (`/smart-contracts`)**
   The heart of the borrowing protocol. Written in Solidity and managed via Hardhat, these contracts handle collateral custody, LTV mathematical logic, price oracle integrations via Chainlink (for asset valuation), and liquidator interactions.

4. **Off-Chain State (`Supabase / Firebase`)**
   Used to persist contextual user data that doesn't strictly need to be on-chain (e.g., user profiles, UI preferences, and transactional histories for faster loading).

---

## 🔄 User Workflows

### How to Borrow Against Your Crypto
1. **Connect Wallet:** Connect your Web3 wallet (MetaMask, Rabby, etc.) via the RainbowKit connect button on the dashboard.
2. **Deposit Collateral:** Navigate to the **Vault** interface. Select an approved asset (e.g., ETH) and securely deposit it into the FlowPay smart contract vault.
3. **Establish Credit Line:** Once confirmed on-chain, your dashboard updates to instantly show your newly available borrowing power.
4. **Borrow Assets:** Select a stable asset like USDC and initiate a borrow transaction. The smart contract validates your Loan-to-Value (LTV) limit and mints or dispatches the tokens directly to your wallet.

### How to Manage Your Position
- **Monitor Health Factor:** Keep your health factor above the liquidation threshold (e.g., 1.0) directly from the visual dashboard.
- **Add Collateral:** If the market dips, you can easily add more collateral to stabilize your health quotient and prevent liquidations.
- **Repay Loan:** You can repay a portion or all of your borrowed amount at any time to instantly unlock your collateral for withdrawal.

---

## 🛠 Technology Stack

### Frontend Ecosystem
- **Framework:** Next.js (App Router), React 19
- **Styling:** Tailwind CSS v4, Framer Motion
- **Web3 Layer:** Wagmi, Viem, @rainbow-me/rainbowkit
- **Charts/Visualization:** Recharts

### Backend API
- **Framework:** Node.js, Express.js
- **Web3 Interface:** Ethers.js (v6)

### Smart Contract Infrastructure
- **Development Environment:** Hardhat
- **Language:** Solidity
- **Libraries:** OpenZeppelin Contracts
- **Oracles:** (Future) Chainlink Price Feeds

### Databases & Auth
- **Relational DB:** Supabase (PostgreSQL)
- **NoSQL / Auth:** Firebase

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
You must have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Git](https://git-scm.com/)
- A package manager: `npm`, `yarn`, or `pnpm`.
- A Web3 extension wallet (e.g., MetaMask).

### Smart Contracts Deployment
To deploy the internal vaults and payment routers locally:
```bash
cd smart-contracts
npm install

# Compile the Solidity contracts
npm run compile

# Spin up a local blockchain node
npx hardhat node

# In a separate terminal, deploy the scripts:
npm run deploy:local
```

### Backend Services
To spin up the Express API:
```bash
cd backend
npm install
npm start
```
*The API should now be running on `http://localhost:4000`.*

### Frontend Application
To start the Next.js development server:
```bash
cd frontend
npm install
npm run dev
```
*The web interface will be accessible at `http://localhost:3000`.*

### Database Initialization
If you are syncing with Supabase:
1. Navigate to your Supabase project's SQL Editor.
2. Open the `supabase_migration.sql` file located in the root of this repository.
3. Execute the script to initialize tables, row-level security (RLS) policies, and authentication triggers.

---

## ⚙️ Project Configuration
Duplicate the provided `.env.example` to `.env` in the root (or within the respective `/frontend` and `/backend` directories) based on your build setup. Ensure you populate the required values!
- `NEXT_PUBLIC_ALCHEMY_API_KEY`: RPC endpoint key for blockchain reads.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Necessary for RainbowKit.
- `PRIVATE_KEY`: For deploying smart contracts locally or on testnets.
- **Database Endpoints**: Ensure your Firebase and Supabase keys match your managed projects.

---

## 🛤 Roadmap
- **Phase 1 (Current):** Basic decentralized vault collateralization, USDC borrowing structures, and simulated merchant payments.
- **Phase 2:** Integrate live Chainlink price feeds to natively process real-time liquidation thresholds. Migrate to testnets (e.g., Sepolia or Polygon Amoy).
- **Phase 3:** Introduce algorithmic dynamic interest rates and native token staking. Open the platform to allow third-party liquidators.
- **Phase 4:** Mainnet deployment, full institutional gateway APIs, and transition towards decentralized governance.

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to your Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request for review

---

## 📄 License
Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
