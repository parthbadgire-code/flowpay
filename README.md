# FlowPay

Welcome to **FlowPay**, a decentralized finance (DeFi) on-chain borrowing and collateralization protocol. FlowPay empowers users to leverage their cryptocurrency assets to unlock working capital by minting or borrowing stablecoins, all without needing to sell their underlying holdings.

🌐 **Live Demo:** [Click Me](https://flowpaynew.vercel.app/)

## 📖 Table of Contents
- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Core Algorithms & Math](#core-algorithms--math)
- [Protocol Economics & Profitability](#protocol-economics--profitability)
- [Architecture & Platform Modules](#architecture--platform-modules)
- [User Workflows](#user-workflows)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Configuration](#project-configuration)
- [Contributing](#contributing)
- [License](#license)

## 📌 About the Project

In the rapidly evolving world of decentralized finance, liquidity and capital efficiency are paramount. FlowPay is built to serve exclusively as a robust **on-chain borrowing and collateralization protocol**.

Instead of liquidating crypto assets to cover daily expenses or business operations, users can lock their assets (like ETH or MATIC) into our decentralized smart contract vaults and instantly mint or borrow stablecoins (like USDC). FlowPay continually monitors the health factor of these loans, safeguarding the protocol while giving users full transparency over their Loan-to-Value (LTV) ratios.

## 🌟 Key Features

### 🏦 Decentralized Borrowing & Lending Vaults
- **Over-collateralized Loans:** Users can deposit volatile crypto assets safely into audited smart contracts and draw down stable liquidity.
- **Dynamic Interest Rates:** Interest rates algorithmically adjust based on pool utilization and market dynamics.
- **Real-Time Health Monitoring:** Keep a constant eye on loan health factors and collateral ratios directly from the unified dashboard, helping you avoid auto-liquidations.

### 📊 Comprehensive User Dashboard
- **Web3 Integrations:** Effortless wallet connectivity using Wagmi and RainbowKit.
- **In-Depth Analytics:** Visual representations of your collateral balances, borrowing history, and liquidation thresholds using Recharts.
- **Persistent Data:** Uses Supabase for storing necessary off-chain context and ensuring a snappy user experience.

---

## 🧮 Core Algorithms & Math

FlowPay leverages mathematically rigorous models securely locked on-chain (e.g., within `CollateralManager.sol`) and simulated in real-time on your dashboard:

1. **Total Collateral (USD):**
   Calculated by summing the total deposited balance multiplied by the live oracle spot price.
   ```text
   Total Collateral USD = Σ (Token Amount * Live Oracle Spot Price)
   ```
2. **Total Borrowed (USD):**
   Calculated by converting fiat debt (e.g., INR) into USD representations.
   ```text
   Total Borrowed USD = Total INR Debt / INR_PER_USD (83.5)
   ```
3. **Health Factor (HF) Algorithm:**
   The definitive dynamic safety score. An `HF < 1.0` triggers liquidation.
   ```text
   Health Factor = (Total Collateral USD * LIQUIDATION_THRESHOLD) / Total Borrowed USD
   ```
   *Note: The **Liquidation Threshold** (e.g., 0.85 or 85%) dictates the maximum percentage of collateral value recognized.*
   The UI categorizes this automatically: **Safe** (`HF > 2.0`, Green), **Moderate** (`HF >= 1.2`, Yellow), and **Dangerous** (`HF < 1.2`, Red).
4. **Loan-To-Value (LTV) Bounds:**
   LTV dictates the maximum permitted borrow limit for a new position. To create a safety buffer, the initial LTV (e.g., 70%) is structurally lower than the Liquidation Threshold (85%).
   ```text
   Maximum Borrowable USD = Total Collateral USD * LTV_RULES.ERC20
   ```

---

## 💰 Protocol Economics & Profitability

FlowPay is designed as a fundamentally self-sustaining and profitable decentralized entity:

1. **Liquidation Arbitrage & Spread:**
   When a position becomes underwater (`HF < 1.0`), automated third-party bots call `liquidatePosition()` to physically pay off the debt. In exchange, the smart contract rewards them with the user's locked crypto **plus a liquidation penalty/bonus** (e.g., 5%). The protocol remains fully funded and solvent, the bots turn an arbitrage profit, and the protocol treasury can capture a fractional margin of the penalty.
2. **Origination & Borrowing Fees:**
   FlowPay profits by applying marginal algorithmic fees when users mint stable tokens or establish new decentralized credit lines.
3. **Interest Rate Spread (Future Phase):**
   As the protocol expands, variable interest algorithms will govern the asset pools. The fractional spread between what borrowers pay and what suppliers earn flows continuously into the protocol treasury as recurring revenue.

---

## 🏗 Architecture & Platform Modules

FlowPay employs a modern architecture, splitting responsibilities cleanly between the frontend, smart contracts, and off-chain indexing databases.

1. **Frontend App (`/frontend`)**
   The presentation layer built on React 19 and Next.js (App Router). It manages the decentralized wallet connections and reads/writes to the blockchain via Viem. It features aggressive caching, clean UI/UX using Tailwind CSS v4, and dynamic animations with Framer Motion.

2. **Smart Contracts (`/smart-contracts`)**
   The heart of the borrowing protocol. Written in Solidity and managed via Hardhat, these contracts handle collateral custody, LTV mathematical logic, and liquidator interactions. Price oracle integrations are powered by **Chainlink Data Feeds** (ETH/USD, USDC/USD) for tamper-proof, decentralized asset valuation directly on-chain.

3. **Off-Chain State (`Supabase`)**
   Used to persist contextual user data that doesn't strictly need to be on-chain, accelerating the loading times for the dashboard.

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

### Smart Contract Infrastructure
- **Development Environment:** Hardhat
- **Language:** Solidity
- **Libraries:** OpenZeppelin Contracts
- **Oracles:** Chainlink Data Feeds (Decentralized Price Oracles)

### Databases
- **Relational DB:** Supabase (PostgreSQL)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
You must have the following installed:
- [Next.js](https://nextjs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- A package manager: `npm`, `yarn`, or `pnpm`.
- A Web3 extension wallet (e.g., MetaMask).

### Smart Contracts Deployment
To deploy the internal vaults locally:
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
Duplicate the provided `.env.example` to `.env` in the root (or within the respective `/frontend` directory) based on your build setup. Ensure you populate the required values!
- `NEXT_PUBLIC_ALCHEMY_API_KEY`: RPC endpoint key for blockchain reads.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Necessary for RainbowKit.
- `PRIVATE_KEY`: For deploying smart contracts locally or on testnets.
- **Supabase URLs**: Ensure your Supabase keys match your managed projects.

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
