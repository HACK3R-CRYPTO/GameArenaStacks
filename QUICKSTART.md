# GameArena Stacks - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Stacks wallet (Leather, Xverse, or Asigna)
- Testnet STX for testing

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/HACK3R-CRYPTO/GameArenaStacks.git
cd GameArenaStacks
```

### 2. Agent Setup

```bash
cd agent

# Install dependencies
npm install

# Generate agent wallet
npx @stacks/cli make_keychain -t > agent_wallet.json

# Create .env file
cp .env.example .env

# Edit .env and add your private key from agent_wallet.json
# PRIVATE_KEY=your_private_key_here
```

**Fund Agent Wallet:**
- Copy the `address` from `agent_wallet.json`
- Get testnet STX from [Stacks Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)

**Start Agent:**
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Testing the Flow

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Select your Stacks wallet (Leather/Xverse)
   - Approve connection

2. **Propose Match**
   - Select game type (Rock Paper Scissors)
   - Set wager (default: 100000 microSTX = 0.1 STX)
   - Click "PROPOSE_MATCH_VIA_STX"
   - Confirm transaction in wallet

3. **Agent Accepts (x402)**
   - Agent automatically detects match
   - x402 payment flow initiates
   - Agent accepts match on-chain

4. **Play Game**
   - Make your move (Rock/Paper/Scissors)
   - Agent responds with Markov prediction
   - Match resolves on-chain
   - Winner receives prize (98% of pot)

## Deployed Contracts (Testnet)

- **Deployer:** `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9`
- **Arena Platform:** `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform`
- **Agent Registry:** `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry`

[View on Explorer](https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet)

## Troubleshooting

**Agent not responding:**
- Check agent is running (`npm run dev` in agent directory)
- Verify agent wallet has testnet STX
- Check console for errors

**Transaction failing:**
- Ensure you have enough testnet STX
- Check wager amount is valid (> 0)
- Verify network is set to testnet

**Wallet connection issues:**
- Try refreshing the page
- Clear browser cache
- Try different wallet

## Architecture

```
Frontend (React + Vite)
    ↓ Stacks Connect
    ↓ x402 Client
    ↓
Agent (Express + x402)
    ↓ Stacks.js
    ↓
Stacks Blockchain (Testnet)
    ↓
Smart Contracts (Clarity)
```

## Key Features

✅ **Stacks.js Integration** - Proper wallet authentication with BNS  
✅ **Post-Conditions** - User asset protection  
✅ **x402 Protocol** - Automated agent payments  
✅ **Markov AI** - Strategic opponent modeling  
✅ **On-Chain Resolution** - Trustless match outcomes  

## Documentation

- [Walkthrough](./walkthrough.md) - Complete development documentation
- [README](./README.md) - Project overview
- [Implementation Plan](./implementation_plan.md) - Technical design

## Support

- **GitHub:** [HACK3R-CRYPTO/GameArenaStacks](https://github.com/HACK3R-CRYPTO/GameArenaStacks)
- **Stacks Docs:** [docs.stacks.co](https://docs.stacks.co)
- **x402 Protocol:** [x402stacks.xyz](https://x402stacks.xyz)
