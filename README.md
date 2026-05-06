# 🪙 Ritual CoinFlip — Web3 Betting Game

A double-or-nothing coin flip betting game built on **Ritual Chain** (testnet, Chain ID 1979). Pick your side — **🐱 Heads (Cat)** or **🔮 Tails (Ritual Logo)** — place your bet, and flip to win 2x your wager.

![Ritual CoinFlip](https://img.shields.io/badge/Chain-Ritual_1979-purple) ![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Game Rules](#-game-rules)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Smart Contract Setup (Foundry)](#-smart-contract-setup-foundry)
- [Frontend Setup (Next.js)](#-frontend-setup-nextjs)
- [Deploying to Vercel](#-deploying-to-vercel)
- [Environment Variables](#-environment-variables)
- [How to Play](#-how-to-play)
- [Contract Functions](#-contract-functions)
- [Funding the Contract](#-funding-the-contract)
- [Tech Stack](#-tech-stack)
- [License](#-license)

---

## 🎲 Game Rules

| Parameter | Value |
|-----------|-------|
| **Win Rate** | 30% |
| **Payout** | Double or Nothing (2x) |
| **Min Bet** | 0.001 RITUAL |
| **Max Bet** | 0.005 RITUAL |
| **Currency** | RITUAL (native token on Chain 1979) |
| **Heads** | 🐱 Cat (pixel art) |
| **Tails** | 🔮 Ritual Logo (endless knot) |

**How it works:** You pick HEADS or TAILS and bet an amount of RITUAL. The contract generates a random outcome — with a 30% probability, you win and receive **2x your bet**. With 70% probability, you lose and your bet stays in the contract.

> **House Edge:** With a 30% win rate and 2x payout, the expected value per bet is `0.30 × 2 = 0.60`, giving the house a **40% edge**.

---

## 📁 Project Structure

```
ritual-coinflip/
├── contracts/                        # Foundry project (Solidity)
│   ├── src/
│   │   └── CoinFlip.sol             # Main game contract
│   ├── script/
│   │   └── DeployCoinFlip.s.sol     # Deployment script
│   ├── test/
│   │   └── CoinFlip.t.sol           # Contract tests
│   ├── foundry.toml                 # Foundry configuration
│   └── .env.example                 # Contract env template
│
├── src/                             # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx               # Root layout + providers
│   │   ├── page.tsx                 # Main page
│   │   ├── globals.css              # Global styles + animations
│   │   └── providers.tsx            # wagmi + React Query providers
│   ├── components/
│   │   ├── CoinFlipGame.tsx         # Main game orchestrator
│   │   ├── Coin.tsx                 # 3D animated coin component
│   │   ├── ConnectWallet.tsx        # Wallet connection dialog
│   │   ├── UsernameEntry.tsx        # Username registration
│   │   └── GameHistory.tsx          # Recent flip history
│   ├── config/
│   │   ├── chain.ts                 # Ritual Chain definition
│   │   └── contract.ts              # Contract ABI + address
│   └── hooks/
│       └── useCoinFlip.ts           # Contract interaction hook
│
├── public/
│   ├── cat-heads.png                # Cat image (Heads side)
│   ├── ritual-tails.png             # Ritual logo (Tails side)
│   └── ...
│
├── .env.local.example               # Vercel env template
├── README.md                        # This file
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## ✅ Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Foundry** | Latest | `curl -L https://foundry.paradigm.xyz \| bash && foundryup` |
| **Node.js** | 18+ | `nvm install 18` |
| **Bun** | Latest | `curl -fsSL https://bun.sh/install \| bash` |
| **MetaMask** | — | [metamask.io](https://metamask.io) |
| **Ritual Testnet RITUAL** | — | [Faucet](https://faucet.ritualfoundation.org) |

### Add Ritual Chain to MetaMask

```
Network Name: Ritual Chain
RPC URL: https://rpc.ritualfoundation.org
Chain ID: 1979
Currency Symbol: RITUAL
Block Explorer: https://explorer.ritualfoundation.org
```

---

## 🔧 Smart Contract Setup (Foundry)

### 1. Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash && foundryup
```

### 2. Navigate to contracts directory

```bash
cd contracts
```

### 3. Install dependencies (if needed)

```bash
forge install foundry-rs/forge-std --no-commit
```

### 4. Compile the contract

```bash
forge build
```

### 5. Run tests

```bash
forge test -vvv
```

### 6. Deploy to Ritual Chain

```bash
# Set up environment
cp .env.example .env
# Edit .env with your private key
nano .env

# Source the env
source .env

# Deploy
forge script script/DeployCoinFlip.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 7. Verify on explorer (optional)

```bash
forge verify-contract <DEPLOYED_ADDRESS> \
  src/CoinFlip.sol \
  --rpc-url $RPC_URL \
  --verifier etherscan \
  --verifier-url https://explorer.ritualfoundation.org/api
```

### 8. Fund the contract

```bash
# Fund with 0.1 RITUAL as bankroll
cast send <DEPLOYED_ADDRESS> \
  --value 0.1ether \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### 9. Copy the contract address

After deployment, copy the contract address from the output and set it in your `.env.local` file.

---

## 🖥️ Frontend Setup (Next.js)

### 1. Install dependencies

```bash
bun install
```

### 2. Set up environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your deployed contract address:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_RPC_URL=https://rpc.ritualfoundation.org
```

### 3. Run development server

```bash
bun run dev
```

### 4. Open in browser

Visit `http://localhost:3000`

---

## 🚀 Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial commit - Ritual CoinFlip game"
git remote add origin https://github.com/YOUR_USERNAME/ritual-coinflip.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables (see below)
4. Deploy

### 3. Set Environment Variables in Vercel

Go to **Project Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Your deployed contract address |
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.ritualfoundation.org` |
| `NEXT_PUBLIC_WS_URL` | `wss://rpc.ritualfoundation.org/ws` |
| `NEXT_PUBLIC_EXPLORER_URL` | `https://explorer.ritualfoundation.org` |

---

## 🔐 Environment Variables

### `.env.local` (Frontend / Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | ✅ | Deployed CoinFlip contract address on Ritual Chain |
| `NEXT_PUBLIC_RPC_URL` | ✅ | Ritual Chain RPC endpoint |
| `NEXT_PUBLIC_WS_URL` | ❌ | WebSocket endpoint for real-time events |
| `NEXT_PUBLIC_EXPLORER_URL` | ❌ | Block explorer base URL |

### `contracts/.env` (Foundry Deployment)

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | ✅ | Deployer wallet private key (NEVER commit) |
| `RPC_URL` | ✅ | Ritual Chain RPC endpoint |
| `ETHERSCAN_API_KEY` | ❌ | Explorer verification key |

---

## 🎮 How to Play

1. **Connect Wallet** — Click "Connect Wallet" and select your wallet provider
2. **Set Username** — Enter a display name (1-20 characters), stored on-chain
3. **Pick Your Side** — Choose 🐱 HEADS or 🔮 TAILS
4. **Set Bet Amount** — Choose between 0.001 and 0.005 RITUAL
5. **Flip!** — Click "BET X RITUAL" and watch the coin spin
6. **Result** — Win (2x payout!) or lose (bet goes to the house)

---

## 📜 Contract Functions

### Player Functions

| Function | Type | Description |
|----------|------|-------------|
| `setUsername(_username)` | Write | Set your display name (required before playing) |
| `flip(_choice)` | Payable | Place a bet — `true` = HEADS, `false` = TAILS |
| `getPlayerStats(_player)` | View | Get username, bets, wins, losses, wagered, won |
| `getRecentFlips(_offset, _limit)` | View | Get recent flip results (max 50) |
| `canAcceptBet(_amount)` | View | Check if a bet amount can be accepted |

### Owner Functions

| Function | Type | Description |
|----------|------|-------------|
| `fundContract()` | Payable | Deposit RITUAL into the prize pool |
| `withdrawProfit(_amount)` | Write | Withdraw profits from the contract |
| `transferOwnership(_newOwner)` | Write | Transfer contract ownership |

### View Functions

| Function | Description |
|----------|-------------|
| `getContractBalance()` | Current bankroll balance |
| `getGlobalStats()` | Total bets, wins, losses, balance |
| `getTotalFlips()` | Total number of flips ever |
| `MIN_BET` | Minimum bet amount (0.001 RITUAL) |
| `MAX_BET` | Maximum bet amount (0.005 RITUAL) |
| `WIN_PERCENTAGE` | Win probability (30) |

---

## 💰 Funding the Contract

The contract needs a **bankroll** to pay out winners. Here's the recommended process:

### Initial Funding

```bash
# Fund with enough to cover max payouts
# Max payout = 0.005 × 2 = 0.01 RITUAL
# Recommended: 0.1 RITUAL (covers 10 max payouts)
cast send <CONTRACT_ADDRESS> --value 0.1ether --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

### How It Works

```
Player bets 0.001 RITUAL
    ├── WIN (30%) → Contract pays 0.002 RITUAL (player's 0.001 + 0.001 from pool)
    └── LOSE (70%) → Player's 0.001 stays in contract (adds to pool)
```

### Monitoring Balance

```bash
# Check contract balance
cast call <CONTRACT_ADDRESS> "getContractBalance()" --rpc-url $RPC_URL
```

### Withdrawing Profits

```bash
# Withdraw 0.05 RITUAL in profits
cast send <CONTRACT_ADDRESS> "withdrawProfit(uint256)" 50000000000000000 \
  --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity 0.8.20, Foundry |
| **Blockchain** | Ritual Chain (ID 1979, TEE-verified L1) |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Web3** | wagmi v3, viem v2 |
| **State** | TanStack React Query |
| **Deployment** | Vercel (frontend), Foundry (contract) |

---

## ⚠️ Security Note

The contract uses **on-chain pseudo-randomness** (`keccak256` of block data). This is acceptable for a low-stakes testnet game but is **not suitable for production** with significant value. For production:

- Use **Chainlink VRF** for verifiable randomness
- Or use **Ritual's TEE-verified** random precompile when available
- Add **reentrancy guards** (the contract uses `call` for payouts, which is safe but worth hardening)
- Consider **circuit breakers** for abnormal win rates

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with 💜 on [Ritual Chain](https://ritual.foundation)
