# GameArenaStacks-Overview

# GameArenaStacks Overview

> **Relevant source files**
> * [PROJECT_SUMMARY.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md)
> * [QUICKSTART.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)

## Purpose and Scope

This document provides a high-level introduction to the GameArenaStacks platform, explaining its architecture, core concepts, and key innovations. It covers the purpose of the system, the three-tier architecture, and how components interact to enable decentralized 1v1 wagering with autonomous AI agents.

For detailed setup instructions, see [Getting Started](/HACK3R-CRYPTO/GameArenaStacks/1.1-getting-started). For in-depth technical documentation on specific subsystems, see [Frontend Application](/HACK3R-CRYPTO/GameArenaStacks/2-frontend-application), [AI Agent System](/HACK3R-CRYPTO/GameArenaStacks/3-ai-agent-system), and [Smart Contracts](/HACK3R-CRYPTO/GameArenaStacks/4-smart-contracts).

**Sources:** [README.md L1-L86](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L1-L86)

 [PROJECT_SUMMARY.md L1-L142](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L1-L142)

---

## What is GameArenaStacks?

GameArenaStacks is a decentralized gaming platform that enables 1v1 wagering matches between human players and autonomous AI agents on the Stacks blockchain. The system implements three core innovations:

1. **x402 Monetization Protocol** - Autonomous agents charge micro-payments for their services using HTTP 402 status codes
2. **Markov Chain AI** - Strategic opponent modeling that learns player patterns and generates counter-strategies
3. **Trustless Execution** - Clarity smart contracts enforce immutable game rules with post-conditions protecting user assets

The platform supports three game types: Rock-Paper-Scissors, Dice Roll, and Coin Flip, with each match involving real STX wagers distributed to winners through on-chain resolution.

**Sources:** [README.md L1-L4](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L1-L4)

 [PROJECT_SUMMARY.md L1-L6](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L1-L6)

---

## Three-Tier Architecture

GameArenaStacks implements a three-tier architecture where each tier has distinct responsibilities:

### Architecture Overview

```mermaid
flowchart TD

ArenaGame["ArenaGame.jsx<br>Match proposal & gameplay"]
Navigation["Navigation.jsx<br>Wallet connection"]
DocsModal["DocsModal.jsx<br>Documentation UI"]
HallOfFame["Hall of Fame<br>Match results"]
ExpressServer["Express HTTP Server<br>Port 3000"]
x402Middleware["x402Middleware()<br>Payment verification"]
OpponentModel["OpponentModel Class<br>Markov Chain AI"]
monitorChain["monitorChain()<br>Background polling"]
ArenaPlatform["arena-platform-v2.clar<br>Game logic & wagering"]
AgentRegistry["agent-registry.clar<br>Agent identity"]
TraitsContract["traits.clar<br>Game interfaces"]

ArenaGame -.-> ExpressServer
ArenaGame -.-> ArenaPlatform
Navigation -.-> ArenaPlatform
x402Middleware -.-> ArenaPlatform
OpponentModel -.-> ArenaPlatform
monitorChain -.-> ArenaPlatform

subgraph Blockchain ["Tier 3: Stacks Blockchain"]
    ArenaPlatform
    AgentRegistry
    TraitsContract
    ArenaPlatform -.-> AgentRegistry
    ArenaPlatform -.-> TraitsContract
end

subgraph Agent ["Tier 2: Agent (Node.js + Express)"]
    ExpressServer
    x402Middleware
    OpponentModel
    monitorChain
end

subgraph Frontend ["Tier 1: Frontend (React + Vite)"]
    ArenaGame
    Navigation
    DocsModal
    HallOfFame
end
```

**Sources:** [README.md L5-L39](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L5-L39)

 [PROJECT_SUMMARY.md L15-L35](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L15-L35)

### Tier Responsibilities

| Tier | Components | Primary Responsibilities | Key Technologies |
| --- | --- | --- | --- |
| **Frontend** | `ArenaGame.jsx`, `Navigation.jsx`, `DocsModal.jsx` | User interface, wallet integration, x402 payment client, transaction signing | React 19, Vite 7, `@stacks/connect`, `x402-stacks` |
| **Agent** | `ArenaAgent.ts`, `OpponentModel`, Express server | x402 payment server, Markov AI strategy, chain monitoring, automated gameplay | Node.js 18+, Express 4, TypeScript 5, `x402-stacks` |
| **Blockchain** | `arena-platform-v2.clar`, `agent-registry.clar` | Game logic enforcement, wagering system, agent identity, trustless resolution | Clarity 2.5, Stacks Testnet |

**Sources:** [PROJECT_SUMMARY.md L38-L59](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L38-L59)

 [README.md L50-L56](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L50-L56)

---

## Key Component Interactions

The following diagram shows how specific code entities interact during a typical match flow:

```mermaid
sequenceDiagram
  participant p1 as ArenaGame.jsx<br/>handleProposeMatch()
  participant p2 as Stacks Connect<br/>openContractCall()
  participant p3 as arena-platform-v2.clar<br/>propose-match()
  participant p4 as Express Server<br/>/accept-match endpoint
  participant p5 as x402Middleware()<br/>verifyPayment()
  participant p6 as OpponentModel.predict()

  p1->>p2: "Call propose-match()<br/>with post-conditions"
  p2->>p3: "STX transfer + function call"
  p3-->>p1: "matchId returned"
  p1->>p4: "POST /accept-match<br/>{matchId, matchTxId}"
  p4->>p5: "Check for payment proof"
  p5-->>p1: "HTTP 402 Payment Required<br/>1000 microSTX"
  p1->>p2: "Authorize micropayment"
  p2-->>p4: "STX transfer confirmed"
  p1->>p4: "Retry with x-payment-proof header"
  p5->>p5: "Verify on-chain payment"
  p4->>p3: "accept-match(matchId)"
  p1->>p3: "play-move(matchId, move)"
  p3-->>p4: "Move confirmed on-chain"
  p4->>p6: "predict(player, lastMove)"
  p6-->>p4: "Counter-move generated"
  p4->>p3: "play-move(matchId, aiMove)"
  p3->>p3: "resolve-match()<br/>Distribute prizes"
```

**Sources:** [README.md L58-L65](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L58-L65)

 [PROJECT_SUMMARY.md L61-L76](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L61-L76)

---

## Core Concepts

### Decentralized Agent Identity

The `agent-registry.clar` contract provides on-chain agent identity management. Agents register their metadata including:

* Wallet address (principal)
* Model description (e.g., "Markov Chain v1")
* x402 payment endpoint URL
* Creator attribution

The frontend queries `agent-registry.clar` to discover active agents and route x402 payments correctly. This enables decentralized trust without requiring centralized agent directories.

**Sources:** [README.md L41-L49](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L41-L49)

### x402 Payment Protocol

The x402 protocol enables autonomous agents to monetize their services through HTTP 402 status codes. The agent charges:

* **1000 microSTX** for match acceptance via `POST /accept-match`
* **500 microSTX** for move execution via `POST /play-move`

The `x402Middleware()` function in the agent intercepts requests, checks for payment proofs in the `x-payment-proof` header, verifies the STX transfer on-chain, and only then processes the request. See [x402 Monetization Protocol](/HACK3R-CRYPTO/GameArenaStacks/5-x402-monetization-protocol) for implementation details.

**Sources:** [README.md L58-L65](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L58-L65)

### Fair Play Architecture

The agent implements strict ordering to prevent front-running:

1. Agent waits for user move to be confirmed on-chain
2. Agent reads move from `arena-platform-v2.clar` via `get-player-move()`
3. Agent generates counter-move using `OpponentModel.predict()`
4. Agent submits its move to blockchain

This ensures the agent cannot predict or manipulate outcomes before the user's move is immutable.

**Sources:** [README.md L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L64-L64)

### Post-Conditions Protection

Every transaction includes Stacks post-conditions that specify expected STX transfers. For example, when proposing a match with a 100000 microSTX wager:

```python
PostConditionMode: Deny
Post-Conditions: STX transfer of exactly 100000 microSTX from user to contract
```

If the transaction would violate these conditions (e.g., draining more STX than expected), the wallet rejects it before signing. See [Post-Conditions and Asset Protection](/HACK3R-CRYPTO/GameArenaStacks/6.2-post-conditions-and-asset-protection) for implementation details.

**Sources:** [PROJECT_SUMMARY.md L67-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L67-L70)

---

## System Infrastructure

### Deployed Contracts (Testnet)

| Contract | Address | Purpose |
| --- | --- | --- |
| **arena-platform-v2** | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform-v2` | Match lifecycle, wagering, prize distribution |
| **agent-registry** | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry` | Agent identity and discovery |
| **traits** | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.traits` | Game type interfaces |

Contract explorer: [https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet](https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet)

**Sources:** [QUICKSTART.md L83-L89](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L83-L89)

 [PROJECT_SUMMARY.md L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L81-L81)

### Technology Stack Summary

```mermaid
flowchart TD

Clarity["Clarity 2.5"]
StacksTestnet["Stacks Testnet"]
BitcoinAnchoring["Bitcoin Anchoring"]
Node["Node.js 18+"]
Express["Express 4.21.2"]
TypeScript["TypeScript 5.7.2"]
X402Server["x402-stacks 2.0.1"]
React["React 19.0.0"]
Vite["Vite 7.2.4"]
StacksConnect["@stacks/connect 7.8.3"]
X402Client["x402-stacks 2.0.1"]

subgraph BlockchainStack ["Blockchain Stack"]
    Clarity
    StacksTestnet
    BitcoinAnchoring
    Clarity -.-> StacksTestnet
    StacksTestnet -.-> BitcoinAnchoring
end

subgraph AgentStack ["Agent Stack"]
    Node
    Express
    TypeScript
    X402Server
    Express -.-> Node
    Express -.-> TypeScript
    Express -.-> X402Server
end

subgraph FrontendStack ["Frontend Stack"]
    React
    Vite
    StacksConnect
    X402Client
    React -.-> Vite
    React -.-> StacksConnect
    React -.-> X402Client
end
```

**Sources:** [PROJECT_SUMMARY.md L38-L59](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L38-L59)

 [README.md L50-L56](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L50-L56)

### Multi-Node Resilience

Both frontend and agent implement failover across multiple Stacks RPC nodes:

**Frontend node array** (`ArenaGame.jsx`):

* `api.testnet.hiro.so`
* `stacks-node-api.testnet.stacks.co`
* `stacks-node-api.mainnet.stacks.co`

**Agent node array** (`ArenaAgent.ts`):

* `api.testnet.hiro.so`
* `stacks-node-api.testnet.stacks.co`

The `callReadOnlyWithRetry()` function in the frontend and similar logic in the agent automatically rotate to the next node on RPC failures, ensuring high availability. See [Multi-Node Failover and Reliability](/HACK3R-CRYPTO/GameArenaStacks/6.1-multi-node-failover-and-reliability) for implementation details.

**Sources:** [README.md L79-L82](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L79-L82)

---

## Match Lifecycle Overview

The following table summarizes the states and transitions in a typical match:

| State | Triggered By | On-Chain Function | Result |
| --- | --- | --- | --- |
| **Proposed** | User via `handleProposeMatch()` | `propose-match()` | `matchId` created, wager locked |
| **Accepted** | Agent after x402 payment | `accept-match()` | Agent committed, ready for moves |
| **User Moved** | User via `handlePlayMove()` | `play-move()` | User move recorded on-chain |
| **Agent Moved** | Agent via `monitorChain()` | `play-move()` | Both moves submitted |
| **Resolved** | Automatic via contract | `resolve-match()` | Winner receives 98% of pot, 2% platform fee |

The complete state machine and detailed transitions are documented in [Match Lifecycle and State Management](/HACK3R-CRYPTO/GameArenaStacks/9-match-lifecycle-and-state-management).

**Sources:** [README.md L58-L72](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L58-L72)

 [QUICKSTART.md L59-L82](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L59-L82)

---

## Project Structure

```javascript
GameArenaStacks/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── pages/
│   │   │   └── ArenaGame.jsx       # Main game component
│   │   ├── components/
│   │   │   ├── Navigation.jsx      # Wallet integration
│   │   │   └── DocsModal.jsx       # Documentation UI
│   │   └── App.jsx
│   └── package.json                # React 19, @stacks/connect, x402-stacks
│
├── agent/                 # Node.js + Express agent
│   ├── src/
│   │   └── ArenaAgent.ts          # Main agent logic, OpponentModel
│   └── package.json               # Express, x402-stacks, @stacks/transactions
│
├── contracts/             # Clarity smart contracts
│   ├── contracts/
│   │   ├── arena-platform-v2.clar # Game logic
│   │   ├── agent-registry.clar    # Agent identity
│   │   └── traits.clar            # Interfaces
│   └── deployments/
│       └── default.testnet-plan.yaml
│
└── README.md              # Main documentation
```

**Sources:** [README.md L50-L56](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L50-L56)

 [QUICKSTART.md L11-L57](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L11-L57)

---

## Key Innovations

### 1. Autonomous Economic Agents

The agent is not merely automated—it is **economically autonomous**. By implementing the x402 protocol, the agent charges micro-payments for its services and sustains itself without external funding. The `x402Middleware()` function enforces payment before processing any request.

### 2. Strategic AI Gameplay

The `OpponentModel` class implements a first-order Markov Chain that learns player patterns. For Rock-Paper-Scissors, it predicts the opponent's next move based on transition probabilities and returns the winning counter-move: `(predicted + 1) % 3`. See [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy) for technical details.

### 3. Trustless Asset Protection

Every transaction uses Stacks post-conditions to specify expected STX transfers. Users can visually inspect these in their wallet UI before signing. If any transaction would transfer more STX than specified, the wallet rejects it pre-signature.

### 4. On-Chain Verifiable Identity

The `agent-registry.clar` contract provides decentralized agent identity. Players can verify they are competing against a registered AI rather than an anonymous actor. The registry stores agent metadata, model versions, and payment endpoints.

**Sources:** [README.md L58-L65](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L58-L65)

 [PROJECT_SUMMARY.md L61-L76](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L61-L76)

---

## Development Status

| Component | Status | Tests | Deployment |
| --- | --- | --- | --- |
| Smart Contracts | ✅ Complete | 7/7 passing | Testnet deployed |
| Frontend | ✅ Complete | Manual testing | Localhost + production build |
| Agent Backend | ✅ Complete | Integration tests | Localhost |
| Documentation | ✅ Complete | N/A | GitHub repository |

**Deployment Cost:** 0.06962 STX (~$0.05)
**Lines of Code:** ~2,500+

**Sources:** [PROJECT_SUMMARY.md L8-L14](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L8-L14)

 [PROJECT_SUMMARY.md L78-L86](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L78-L86)

---

## Next Steps

To begin using GameArenaStacks:

1. **Setup Development Environment** - See [Getting Started](/HACK3R-CRYPTO/GameArenaStacks/1.1-getting-started) for installation instructions
2. **Understand System Architecture** - See [System Architecture](/HACK3R-CRYPTO/GameArenaStacks/1.2-system-architecture) for component interactions
3. **Explore Frontend** - See [Frontend Application](/HACK3R-CRYPTO/GameArenaStacks/2-frontend-application) for UI components and integration
4. **Configure Agent** - See [AI Agent System](/HACK3R-CRYPTO/GameArenaStacks/3-ai-agent-system) for agent setup and deployment
5. **Review Smart Contracts** - See [Smart Contracts](/HACK3R-CRYPTO/GameArenaStacks/4-smart-contracts) for on-chain logic

For a complete walkthrough of the match flow, see [Match Lifecycle and State Management](/HACK3R-CRYPTO/GameArenaStacks/9-match-lifecycle-and-state-management). For x402 protocol implementation details, see [x402 Monetization Protocol](/HACK3R-CRYPTO/GameArenaStacks/5-x402-monetization-protocol).

**Sources:** [README.md L73-L77](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L73-L77)

 [QUICKSTART.md L1-L142](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L1-L142)

---

# Getting-Started

# Getting Started

> **Relevant source files**
> * [QUICKSTART.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md)

This page provides quickstart instructions for setting up and running the GameArenaStacks platform locally. It covers installation of the frontend application, configuration and deployment of the AI agent, and connection to the deployed testnet smart contracts. For detailed information about the system architecture, see [System Architecture](/HACK3R-CRYPTO/GameArenaStacks/1.2-system-architecture). For specific agent configuration options, see [Agent Setup and Configuration](/HACK3R-CRYPTO/GameArenaStacks/3.1-agent-setup-and-configuration).

**Scope**: This guide assumes you want to run the full stack locally (frontend + agent) against existing testnet smart contracts. It does not cover contract deployment; the contracts are already deployed and accessible on Stacks testnet.

## Prerequisites

Before beginning setup, ensure your development environment meets these requirements:

| Requirement | Version | Purpose |
| --- | --- | --- |
| Node.js | 18+ | Runtime for frontend and agent |
| npm | 8+ | Package management |
| Stacks Wallet | Any | Leather, Xverse, or Asigna for transaction signing |
| Testnet STX | ~5 STX | For agent wallet funding and testing |

**Sources**: [QUICKSTART.md L3-L7](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L3-L7)

## Setup Flow Overview

The following diagram illustrates the complete setup sequence:

```mermaid
flowchart TD

Start["Clone Repository"]
AgentDir["Navigate to /agent"]
AgentInstall["npm install"]
GenerateWallet["Generate Agent Wallet<br>npx @stacks/cli make_keychain -t"]
ConfigEnv["Configure .env<br>Add PRIVATE_KEY"]
FundAgent["Fund Agent Wallet<br>via Stacks Faucet"]
StartAgent["npm run dev<br>Agent listening on :3000"]
FrontendDir["Navigate to /frontend"]
FrontendInstall["npm install"]
StartFrontend["npm run dev<br>UI at localhost:5173"]
TestWallet["Connect Stacks Wallet<br>via Stacks Connect"]
ProposeMatch["Propose Match<br>propose-match()"]
X402Payment["x402 Payment Flow<br>Agent acceptance"]
PlayGame["Play Moves<br>AI responds"]

Start -.-> AgentDir
AgentDir -.-> AgentInstall
AgentInstall -.-> GenerateWallet
GenerateWallet -.-> ConfigEnv
ConfigEnv -.-> FundAgent
FundAgent -.-> StartAgent
Start -.-> FrontendDir
FrontendDir -.-> FrontendInstall
FrontendInstall -.-> StartFrontend
StartAgent -.-> TestWallet
StartFrontend -.-> TestWallet
TestWallet -.-> ProposeMatch
ProposeMatch -.-> X402Payment
X402Payment -.-> PlayGame
```

**Title**: Complete Setup and Testing Flow

**Sources**: [QUICKSTART.md L9-L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L9-L81)

 [README.md L73-L77](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L73-L77)

## Repository Setup

Clone the repository and navigate to the project root:

```
git clone https://github.com/HACK3R-CRYPTO/GameArenaStacks.git
cd GameArenaStacks
```

The repository structure contains three primary directories:

* `agent/` - Autonomous AI agent with x402 monetization
* `frontend/` - React application with Stacks Connect integration
* `contracts/` - Clarity smart contracts (already deployed to testnet)

**Sources**: [QUICKSTART.md L13-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L13-L16)

## Agent Setup

The agent must be configured and running before the frontend can interact with it. The agent requires its own funded Stacks wallet to sign transactions.

### Agent Installation

Navigate to the agent directory and install dependencies:

```
cd agent
npm install
```

**Sources**: [QUICKSTART.md L19-L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L19-L24)

### Wallet Generation

Generate a new Stacks wallet for the agent:

```
npx @stacks/cli make_keychain -t > agent_wallet.json
```

This creates a JSON file with the following structure:

```json
{
  "mnemonic": "...",
  "keyInfo": {
    "privateKey": "your_private_key_here",
    "address": "ST...",
    "btcAddress": "...",
    "index": 0
  }
}
```

**Important**: The `address` field will be needed for funding, and the `privateKey` field must be added to the agent's environment configuration.

**Sources**: [QUICKSTART.md L26-L33](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L26-L33)

### Environment Configuration

Create the agent's environment file:

```
cp .env.example .env
```

Edit `.env` and add the private key from `agent_wallet.json`:

```
PRIVATE_KEY=your_private_key_here
PORT=3000
NETWORK=testnet
```

The agent uses this private key to sign transactions when accepting matches and playing moves. The configuration is loaded by [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

 at startup.

**Sources**: [QUICKSTART.md L29-L34](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L29-L34)

 [agent/README.md L40](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L40-L40)

### Agent Wallet Funding

The agent wallet must have testnet STX to pay transaction fees:

1. Copy the `address` value from `agent_wallet.json`
2. Visit the [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
3. Request testnet STX (recommended: 5 STX minimum)
4. Wait for confirmation (typically 1-2 minutes)

**Sources**: [QUICKSTART.md L36-L38](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L36-L38)

### Starting the Agent

Start the agent in development mode:

```
npm run dev
```

Expected output:

```
x402 middleware initialized for arena-platform-v2
OpponentModel loaded for Rock-Paper-Scissors
Agent listening on port 3000
Chain monitor started (polling every 15s)
```

The agent exposes these HTTP endpoints:

* `POST /accept-match` - Accept a proposed match (requires x402 payment)
* `POST /play-move` - Execute an AI move (requires x402 payment)

Both endpoints are protected by the x402 middleware implemented in [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

**Sources**: [QUICKSTART.md L40-L43](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L40-L43)

 [agent/README.md L8-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L8-L12)

 [agent/README.md L34-L38](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L34-L38)

## Frontend Setup

The frontend is a React application built with Vite that connects to Stacks wallets and communicates with the agent via x402.

### Frontend Installation

Navigate to the frontend directory and install dependencies:

```
cd frontend
npm install
```

**Sources**: [QUICKSTART.md L45-L54](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L45-L54)

### Starting the Development Server

Start the Vite development server:

```
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

Expected console output:

```
VITE v7.2.4  ready in 523 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

The frontend configuration is defined in [frontend/vite.config.js](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js)

 and uses [frontend/package.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json)

 for dependency management.

**Sources**: [QUICKSTART.md L52-L57](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L52-L57)

## Component Architecture with Code Entities

The following diagram maps system components to their actual code entities:

```mermaid
flowchart TD

ArenaGame["ArenaGame Component<br>[src/pages/ArenaGame.jsx]"]
Navigation["Navigation Component<br>[src/components/Navigation.jsx]"]
X402Client["x402PaymentHandler()<br>[ArenaGame.jsx:handleChallengeAgent]"]
StacksConnect["Stacks Connect<br>@stacks/connect library"]
ExpressServer["Express Server<br>[src/ArenaAgent.ts:app]"]
X402MW["x402Middleware<br>[ArenaAgent.ts:x402Middleware]"]
OpponentModel["OpponentModel Class<br>[ArenaAgent.ts:OpponentModel]"]
ChainMonitor["monitorChain()<br>[ArenaAgent.ts:monitorChain]"]
ArenaPlatform["arena-platform-v2<br>ST3V7NY32G2...W5F9"]
AgentRegistry["agent-registry<br>ST3V7NY32G2...W5F9"]
HiroAPI["api.testnet.hiro.so"]
Faucet["Stacks Faucet<br>explorer.hiro.so/sandbox/faucet"]

StacksConnect -.-> HiroAPI
X402Client -.-> ExpressServer
ArenaGame -.-> ArenaPlatform
ChainMonitor -.-> ArenaPlatform
ChainMonitor -.-> AgentRegistry
X402MW -.-> HiroAPI
OpponentModel -.-> ArenaPlatform

subgraph subGraph3 ["External Services"]
    HiroAPI
    Faucet
end

subgraph subGraph2 ["Smart Contracts [Testnet]"]
    ArenaPlatform
    AgentRegistry
end

subgraph subGraph1 ["Agent [agent/]"]
    ExpressServer
    X402MW
    OpponentModel
    ChainMonitor
    ExpressServer -.-> X402MW
    ExpressServer -.-> OpponentModel
    ExpressServer -.-> ChainMonitor
end

subgraph subGraph0 ["Frontend [frontend/]"]
    ArenaGame
    Navigation
    X402Client
    StacksConnect
    Navigation -.-> StacksConnect
    ArenaGame -.-> X402Client
end
```

**Title**: Component Architecture with Code Entity Mapping

**Sources**: [README.md L9-L39](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L9-L39)

 [QUICKSTART.md L108-L121](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L108-L121)

 [agent/README.md L1-L41](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L1-L41)

## Deployed Testnet Contracts

The smart contracts are already deployed to Stacks testnet and do not require local deployment:

| Contract | Address | Purpose |
| --- | --- | --- |
| Deployer Account | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` | Contract owner |
| `arena-platform-v2` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform-v2` | Game logic, wagering, resolution |
| `agent-registry` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry` | Agent identity and discovery |

View contracts on [Stacks Explorer](https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet).

The frontend references these contracts in [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

 via the `CONTRACT_ADDRESS` and `CONTRACT_NAME` constants.

**Sources**: [QUICKSTART.md L83-L89](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L83-L89)

 [README.md L43-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L43-L48)

## Testing the Complete Flow

Once both agent and frontend are running, test the end-to-end flow:

### 1. Wallet Connection

1. Click "Connect Wallet" in the navigation bar
2. Select your Stacks wallet (Leather, Xverse, or Asigna)
3. Approve the connection request
4. Your address should appear in the navigation bar

The wallet connection is handled by [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)

 using the `@stacks/connect` library.

**Sources**: [QUICKSTART.md L61-L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L61-L64)

### 2. Match Proposal

1. Select a game type from the dropdown: * Rock Paper Scissors (gameType: 1) * Dice Roll (gameType: 2) * Coin Flip (gameType: 3)
2. Set wager amount (default: 100000 microSTX = 0.1 STX)
3. Click "PROPOSE_MATCH_VIA_STX"
4. Confirm the transaction in your wallet

The proposal is submitted via the `handleProposeMatch()` function in [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

 which calls the `propose-match` function in the `arena-platform-v2` contract.

**Sources**: [QUICKSTART.md L66-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L66-L70)

### 3. Agent Acceptance (x402 Flow)

The agent automatically detects the new match via its chain monitor and processes it:

1. Agent's `monitorChain()` function polls for new matches
2. When detected, agent sends HTTP 402 Payment Required
3. Frontend's `handleChallengeAgent()` triggers x402 payment flow
4. User authorizes micro-payment (1000 microSTX)
5. Agent verifies payment and calls `accept-match()` on-chain

This flow is orchestrated by [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#LNaN-LNaN)

 and [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#LNaN-LNaN)

**Sources**: [QUICKSTART.md L72-L76](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L72-L76)

 [agent/README.md L8-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L8-L12)

### 4. Gameplay

1. User selects their move (Rock/Paper/Scissors, Dice number, or Coin side)
2. Frontend calls `play-move()` with post-conditions for asset protection
3. Agent's `OpponentModel` predicts counter-move using Markov Chain
4. Agent submits counter-move to contract
5. Contract resolves winner and distributes prize (98% to winner, 2% platform fee)

The move submission is handled by [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#LNaN-LNaN)

 and the AI strategy is implemented in [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#LNaN-LNaN)

**Sources**: [QUICKSTART.md L77-L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L77-L81)

 [agent/README.md L14-L23](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L14-L23)

## Configuration Reference

The following diagram shows the relationship between configuration files:

```mermaid
flowchart TD

AgentEnv[".env<br>PRIVATE_KEY<br>PORT<br>NETWORK"]
AgentWallet["agent_wallet.json<br>privateKey<br>address"]
PackageAgent["package.json<br>Dependencies<br>Scripts"]
ViteConfig["vite.config.js<br>Server settings<br>Build options"]
PackageFE["package.json<br>@stacks/connect<br>x402-stacks"]
AgentTS["ArenaAgent.ts"]
ArenaGameJSX["ArenaGame.jsx"]

AgentEnv -.->|"Signs txs with"| AgentTS
PackageAgent -.->|"Defines deps"| AgentTS
ViteConfig -.->|"Configures"| ArenaGameJSX
PackageFE -.->|"Defines deps"| ArenaGameJSX
AgentTS -.->|"Loaded by"| AgentEnv
ArenaGameJSX -.->|"Connects via"| PackageFE

subgraph Runtime ["Runtime"]
    AgentTS
    ArenaGameJSX
end

subgraph subGraph1 ["Frontend Configuration"]
    ViteConfig
    PackageFE
end

subgraph subGraph0 ["Agent Configuration"]
    AgentEnv
    AgentWallet
    PackageAgent
    AgentWallet -.->|"Generates"| AgentEnv
end
```

**Title**: Configuration File Dependencies

**Sources**: [QUICKSTART.md L29-L34](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L29-L34)

 [agent/README.md L40](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L40-L40)

## Troubleshooting

### Agent Not Responding

**Symptoms**: Frontend shows "Agent unavailable" or x402 requests timeout.

**Solutions**:

* Verify agent is running: Check for "Agent listening on port 3000" in terminal
* Confirm agent wallet has testnet STX: Check address on [Stacks Explorer](https://explorer.hiro.so/?chain=testnet)
* Review agent logs: Look for errors in the agent terminal output
* Check agent registration: Verify agent is registered in `agent-registry` contract

**Sources**: [QUICKSTART.md L93-L96](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L93-L96)

### Transaction Failures

**Symptoms**: Wallet transaction rejected or "Insufficient funds" error.

**Solutions**:

* Ensure wallet has sufficient testnet STX (minimum 1 STX for testing)
* Verify wager amount is greater than 0
* Confirm network is set to testnet in wallet settings
* Check that contract address matches deployed testnet contracts

The frontend implements post-conditions in [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#LNaN-LNaN)

 to protect against unexpected asset transfers.

**Sources**: [QUICKSTART.md L98-L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L98-L101)

### Wallet Connection Issues

**Symptoms**: "Connect Wallet" button unresponsive or wallet popup doesn't appear.

**Solutions**:

* Refresh the browser page
* Clear browser cache and local storage
* Try a different Stacks wallet (Leather/Xverse/Asigna)
* Ensure wallet extension is installed and unlocked
* Check browser console for errors

The wallet integration is implemented in [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)

 using the Stacks Connect protocol.

**Sources**: [QUICKSTART.md L103-L106](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L103-L106)

### Chain Monitor Not Detecting Matches

**Symptoms**: Agent doesn't automatically accept matches or make moves.

**Solutions**:

* Verify `NETWORK=testnet` in agent's `.env` file
* Check that Hiro API is accessible: Visit [api.testnet.hiro.so/extended/v1/status](https://api.testnet.hiro.so/extended/v1/status)
* Review chain monitor logs for polling errors
* Ensure agent wallet has sufficient STX for transaction fees

The chain monitor implementation is in [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#LNaN-LNaN)

 and polls every 15 seconds by default.

**Sources**: [agent/README.md L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L30-L30)

## Next Steps

After successfully setting up and testing the basic flow:

* **Explore Game Types**: Try all three game types and observe the AI's adaptive strategies (see [Game Types and Rules](/HACK3R-CRYPTO/GameArenaStacks/7-game-types-and-rules))
* **Review Architecture**: Understand the three-tier system design (see [System Architecture](/HACK3R-CRYPTO/GameArenaStacks/1.2-system-architecture))
* **Study x402 Integration**: Learn how machine-to-machine payments work (see [x402 Monetization Protocol](/HACK3R-CRYPTO/GameArenaStacks/5-x402-monetization-protocol))
* **Examine Smart Contracts**: Review the Clarity contract implementations (see [Smart Contracts](/HACK3R-CRYPTO/GameArenaStacks/4-smart-contracts))
* **Configure Agent Strategy**: Modify the Markov Chain parameters (see [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy))

**Sources**: [README.md L50-L56](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L50-L56)

 [QUICKSTART.md L131-L141](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L131-L141)

---

# System-Architecture

# System Architecture

> **Relevant source files**
> * [PROJECT_SUMMARY.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

## Purpose and Scope

This document describes the technical architecture of GameArenaStacks, a decentralized 1v1 wagering platform. It covers the three-tier system design (Frontend, Agent, Blockchain), component responsibilities, and inter-tier communication protocols including x402 monetization.

For smart contract specifications, see [arena-platform-v2 Contract](/HACK3R-CRYPTO/GameArenaStacks/4.1-arena-platform-v2-contract). For x402 protocol details, see [x402 Monetization Protocol](/HACK3R-CRYPTO/GameArenaStacks/5-x402-monetization-protocol). For agent AI implementation, see [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy).

## Three-Tier Architecture Overview

GameArenaStacks implements a layered architecture where each tier has distinct responsibilities and communicates through well-defined interfaces.

```mermaid
flowchart TD

ArenaGame["ArenaGame.jsx<br>Match Management"]
Navigation["Navigation.jsx<br>Wallet Connection"]
ArenaAgent["ArenaAgent.ts<br>Express Server"]
OpponentModel["OpponentModel Class<br>Markov Chain AI"]
x402MW["x402Middleware()<br>Payment Verification"]
monitorChain["monitorChain()<br>Auto-Resolution"]
ArenaPlatform["arena-platform-v2.clar<br>Game Logic"]
AgentRegistry["agent-registry.clar<br>Identity System"]

ArenaGame -.->|"POST /accept-matchx402 payment flow"| ArenaPlatform
ArenaGame -.->|"openContractCall()propose-match()"| x402MW
x402MW -.->|"makeContractCall()accept-match()"| ArenaPlatform
monitorChain -.->|"callReadOnlyFunction()get-match-details()"| ArenaPlatform
monitorChain -.->|"makeContractCall()resolve-match()"| ArenaPlatform

subgraph Tier3 ["Tier 3: Blockchain (Stacks)"]
    ArenaPlatform
    AgentRegistry
    ArenaPlatform -.->|"verification"| AgentRegistry
end

subgraph Tier2 ["Tier 2: Agent (Node.js + Express)"]
    ArenaAgent
    OpponentModel
    x402MW
    monitorChain
    OpponentModel -.->|"predict() return move"| x402MW
    ArenaAgent -.-> OpponentModel
    ArenaAgent -.-> x402MW
    ArenaAgent -.-> monitorChain
end

subgraph Tier1 ["Tier 1: Frontend (React + Vite)"]
    ArenaGame
    Navigation
    ArenaGame -.->|"showConnect()"| Navigation
end
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L1-L720](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L1-L720)

 [agent/src/ArenaAgent.ts L1-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L1-L482)

 [README.md L5-L39](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L5-L39)

## Frontend Tier (React Application)

The frontend tier provides user interface and blockchain transaction management through React components and Stacks Connect integration.

### Component Structure

| Component | File Path | Primary Responsibilities |
| --- | --- | --- |
| `ArenaGame` | [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx) | Match proposal, move submission, x402 payment flows, state polling |
| `Navigation` | [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx) | Wallet connection via `showConnect()`, BNS resolution |

### Network Configuration and Resilience

The frontend implements multi-node failover through the `callReadOnlyWithRetry()` function:

```mermaid
flowchart TD

callReadOnlyWithRetry["callReadOnlyWithRetry()"]
Node1["api.testnet.hiro.so"]
Node2["stacks-node-api.testnet.stacks.co"]
Node3["stacks-node-api.testnet.hiro.so"]

callReadOnlyWithRetry -.->|"try node 1"| Node1
callReadOnlyWithRetry -.->|"fallback node 2"| Node2
callReadOnlyWithRetry -.->|"fallback node 3"| Node3
Node1 -.->|"on error, continue"| Node2
Node2 -.->|"on error, continue"| Node3
```

The `STACKS_NODES` array at [frontend/src/pages/ArenaGame.jsx L28-L32](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L28-L32)

 defines available RPC endpoints. The `callReadOnlyWithRetry()` function at [frontend/src/pages/ArenaGame.jsx L34-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L34-L50)

 iterates through nodes until success or exhaustion.

**Sources:** [frontend/src/pages/ArenaGame.jsx L28-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L28-L50)

 [README.md L79-L82](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L79-L82)

### Transaction Management (BitSubs Pattern)

The frontend uses targeted transaction polling to track pending operations:

```sql
#mermaid-l7o7blkfdh9{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;fill:#333;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-l7o7blkfdh9 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-l7o7blkfdh9 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-l7o7blkfdh9 .error-icon{fill:#dddddd;}#mermaid-l7o7blkfdh9 .error-text{fill:#222222;stroke:#222222;}#mermaid-l7o7blkfdh9 .edge-thickness-normal{stroke-width:1px;}#mermaid-l7o7blkfdh9 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-l7o7blkfdh9 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-l7o7blkfdh9 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-l7o7blkfdh9 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-l7o7blkfdh9 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-l7o7blkfdh9 .marker{fill:#999;stroke:#999;}#mermaid-l7o7blkfdh9 .marker.cross{stroke:#999;}#mermaid-l7o7blkfdh9 svg{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;}#mermaid-l7o7blkfdh9 p{margin:0;}#mermaid-l7o7blkfdh9 defs #statediagram-barbEnd{fill:#999;stroke:#999;}#mermaid-l7o7blkfdh9 g.stateGroup text{fill:#dddddd;stroke:none;font-size:10px;}#mermaid-l7o7blkfdh9 g.stateGroup text{fill:#333;stroke:none;font-size:10px;}#mermaid-l7o7blkfdh9 g.stateGroup .state-title{font-weight:bolder;fill:#333;}#mermaid-l7o7blkfdh9 g.stateGroup rect{fill:#ffffff;stroke:#dddddd;}#mermaid-l7o7blkfdh9 g.stateGroup line{stroke:#999;stroke-width:1;}#mermaid-l7o7blkfdh9 .transition{stroke:#999;stroke-width:1;fill:none;}#mermaid-l7o7blkfdh9 .stateGroup .composit{fill:#f4f4f4;border-bottom:1px;}#mermaid-l7o7blkfdh9 .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#mermaid-l7o7blkfdh9 .state-note{stroke:#e6d280;fill:#fff5ad;}#mermaid-l7o7blkfdh9 .state-note text{fill:#333;stroke:none;font-size:10px;}#mermaid-l7o7blkfdh9 .stateLabel .box{stroke:none;stroke-width:0;fill:#ffffff;opacity:0.5;}#mermaid-l7o7blkfdh9 .edgeLabel .label rect{fill:#ffffff;opacity:0.5;}#mermaid-l7o7blkfdh9 .edgeLabel{background-color:#ffffff;text-align:center;}#mermaid-l7o7blkfdh9 .edgeLabel p{background-color:#ffffff;}#mermaid-l7o7blkfdh9 .edgeLabel rect{opacity:0.5;background-color:#ffffff;fill:#ffffff;}#mermaid-l7o7blkfdh9 .edgeLabel .label text{fill:#333;}#mermaid-l7o7blkfdh9 .label div .edgeLabel{color:#333;}#mermaid-l7o7blkfdh9 .stateLabel text{fill:#333;font-size:10px;font-weight:bold;}#mermaid-l7o7blkfdh9 .node circle.state-start{fill:#999;stroke:#999;}#mermaid-l7o7blkfdh9 .node .fork-join{fill:#999;stroke:#999;}#mermaid-l7o7blkfdh9 .node circle.state-end{fill:#dddddd;stroke:#f4f4f4;stroke-width:1.5;}#mermaid-l7o7blkfdh9 .end-state-inner{fill:#f4f4f4;stroke-width:1.5;}#mermaid-l7o7blkfdh9 .node rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-l7o7blkfdh9 .node polygon{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-l7o7blkfdh9 #statediagram-barbEnd{fill:#999;}#mermaid-l7o7blkfdh9 .statediagram-cluster rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-l7o7blkfdh9 .cluster-label,#mermaid-l7o7blkfdh9 .nodeLabel{color:#333;}#mermaid-l7o7blkfdh9 .statediagram-cluster rect.outer{rx:5px;ry:5px;}#mermaid-l7o7blkfdh9 .statediagram-state .divider{stroke:#dddddd;}#mermaid-l7o7blkfdh9 .statediagram-state .title-state{rx:5px;ry:5px;}#mermaid-l7o7blkfdh9 .statediagram-cluster.statediagram-cluster .inner{fill:#f4f4f4;}#mermaid-l7o7blkfdh9 .statediagram-cluster.statediagram-cluster-alt .inner{fill:#f8f8f8;}#mermaid-l7o7blkfdh9 .statediagram-cluster .inner{rx:0;ry:0;}#mermaid-l7o7blkfdh9 .statediagram-state rect.basic{rx:5px;ry:5px;}#mermaid-l7o7blkfdh9 .statediagram-state rect.divider{stroke-dasharray:10,10;fill:#f8f8f8;}#mermaid-l7o7blkfdh9 .note-edge{stroke-dasharray:5;}#mermaid-l7o7blkfdh9 .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-l7o7blkfdh9 .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-l7o7blkfdh9 .statediagram-note text{fill:#333;}#mermaid-l7o7blkfdh9 .statediagram-note .nodeLabel{color:#333;}#mermaid-l7o7blkfdh9 .statediagram .edgeLabel{color:red;}#mermaid-l7o7blkfdh9 #dependencyStart,#mermaid-l7o7blkfdh9 #dependencyEnd{fill:#999;stroke:#999;stroke-width:1;}#mermaid-l7o7blkfdh9 .statediagramTitleText{text-anchor:middle;font-size:18px;fill:#333;}#mermaid-l7o7blkfdh9 :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}"setPendingTxs()""useEffect() triggered""fetchWithTimeout()""txData.tx_status""tx_status === 'success'""tx_status === 'abort_by_response'""else (pending)""delete pendingTxs[matchId]""delete pendingTxs[matchId]""fetchMatches(), fetchBalance()"PendingTxsPollingIntervalFetchTxStatusCheckStatusSuccessFailedCleanupStateRefreshData
```

The `pendingTxs` state object at [frontend/src/pages/ArenaGame.jsx L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L101-L101)

 stores transactions with structure `{ [matchId]: { type: 'user'|'agent', txId: string } }`. The polling logic at [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

 runs every 5 seconds for targeted updates.

**Sources:** [frontend/src/pages/ArenaGame.jsx L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L101-L101)

 [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

### Key Frontend Functions

```mermaid
flowchart TD

handleProposeMatch["handleProposeMatch()"]
handleChallengeAgent["handleChallengeAgent()"]
handlePlayMove["handlePlayMove()"]
triggerAgentMove["triggerAgentMove()"]
SmartContract["arena-platform-v2"]
AgentAPI["Agent API"]
Wallet["Stacks Wallet"]

handleProposeMatch -.->|"openContractCall()propose-match()"| SmartContract
handleProposeMatch -.->|"onFinish callback"| handleChallengeAgent
handleChallengeAgent -.->|"axios.post()/accept-match"| AgentAPI
handleChallengeAgent -.->|"on 402 responseopenSTXTransfer()"| Wallet
handlePlayMove -.->|"openContractCall()play-move()"| SmartContract
handlePlayMove -.->|"onFinish callback"| triggerAgentMove
triggerAgentMove -.->|"axios.post()/play-move"| AgentAPI
triggerAgentMove -.->|"on 402 responseopenSTXTransfer()"| Wallet
```

* `handleProposeMatch()` at [frontend/src/pages/ArenaGame.jsx L300-L348](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L348) : Creates match with post-conditions protecting user wager
* `handleChallengeAgent()` at [frontend/src/pages/ArenaGame.jsx L350-L398](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L350-L398) : Implements x402 payment flow with retry logic
* `handlePlayMove()` at [frontend/src/pages/ArenaGame.jsx L447-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L447-L482) : Submits user move on-chain
* `triggerAgentMove()` at [frontend/src/pages/ArenaGame.jsx L401-L445](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L401-L445) : Signals agent to play with x402 payment handling

**Sources:** [frontend/src/pages/ArenaGame.jsx L300-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L482)

## Agent Tier (Node.js Server)

The agent tier implements an autonomous Express server that accepts match challenges, executes AI-driven moves, and monitors the blockchain for resolution opportunities.

### Agent Architecture

```mermaid
flowchart TD

ExpressServer["Express Server<br>app.listen(PORT)"]
AcceptMatch["/accept-match<br>POST endpoint"]
PlayMove["/play-move<br>POST endpoint"]
x402Middleware1["x402Middleware(1000)<br>match acceptance fee"]
x402Middleware2["x402Middleware(500)<br>move fee"]
OpponentModel["OpponentModel class"]
update["update(gameType, player, move)"]
predict["predict(gameType, player)"]
monitorChain["monitorChain()<br>setInterval(20s)"]
calculateWinner["calculateWinner()"]

ExpressServer -.->|"verify payment"| AcceptMatch
ExpressServer -.->|"verify payment"| PlayMove
ExpressServer -.-> monitorChain
AcceptMatch -.-> x402Middleware1
PlayMove -.-> x402Middleware2
x402Middleware1 -.-> AcceptMatch
x402Middleware2 -.-> PlayMove
PlayMove -.-> predict

subgraph Monitor ["Background Process"]
    monitorChain
    calculateWinner
    monitorChain -.-> calculateWinner
end

subgraph AI ["AI Strategy"]
    OpponentModel
    update
    predict
    predict -.-> update
end

subgraph Middleware ["Middleware Layer"]
    x402Middleware1
    x402Middleware2
end

subgraph Endpoints ["HTTP Endpoints"]
    AcceptMatch
    PlayMove
end
```

**Sources:** [agent/src/ArenaAgent.ts L26-L481](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L26-L481)

### x402 Middleware Implementation

The `x402Middleware()` function at [agent/src/ArenaAgent.ts L109-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L140)

 implements HTTP 402 Payment Required responses:

```mermaid
sequenceDiagram
  participant p1 as Frontend
  participant p2 as x402Middleware()
  participant p3 as API Endpoint

  p1->>p2: "POST request (no proof)"
  p2->>p2: "check x-payment-proof header"
  p2-->>p1: "402 + payment instructions JSON"
  note over p1: User pays via openSTXTransfer()
  p1->>p2: "POST retry (with proof)"
  p2->>p2: "verify x-payment-proof"
  p2->>p3: "next()"
  p3-->>p1: "200 OK + response"
```

The payment instruction structure at [agent/src/ArenaAgent.ts L116-L128](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L116-L128)

 includes:

* `x402Version: 2`
* `accepts[0].scheme: 'direct-payment'`
* `accepts[0].network: 'stacks-testnet'`
* `accepts[0].amount: '1000'` or `'500'`
* `accepts[0].payTo: AGENT_ADDRESS`

**Sources:** [agent/src/ArenaAgent.ts L109-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L140)

### OpponentModel Class (Markov Chain)

The `OpponentModel` class at [agent/src/ArenaAgent.ts L63-L102](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L63-L102)

 implements first-order Markov Chain learning:

```mermaid
classDiagram
    note "transitions[gameType][player][lastMove][currentMove] = count"
    note "history[gameType][player] = lastMove"
    class OpponentModel {
        +transitions: Record<number, Record>string, number[][]<>
        +history: Record<number, Record>string, number<>
        +update(gameType, player, move)
        +predict(gameType, player) : number
    }
```

Data structures:

* `transitions`: Tracks move patterns as `gameType → player → lastMove → currentMove → count`
* `history`: Stores most recent move as `gameType → player → lastMove`

Counter-strategies at [agent/src/ArenaAgent.ts L98-L100](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L98-L100)

:

* **Rock-Paper-Scissors**: `(predictedMove + 1) % 3` (counter the prediction)
* **Dice Roll**: `Math.random() > 0.3 ? 5 : random` (70% favor rolling 6)
* **Coin Flip**: `Math.random() > 0.5 ? predicted : 1 - predicted` (adaptive)

**Sources:** [agent/src/ArenaAgent.ts L63-L102](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L63-L102)

### Chain Monitoring and Auto-Resolution

The `monitorChain()` function at [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

 runs every 20 seconds:

```mermaid
flowchart TD

Start["setInterval(20000)"]
GetCount["callReadOnlyFunction()<br>get-match-count()"]
ScanMatches["Loop: count-1 to count-50"]
GetDetails["callReadOnlyFunction()<br>get-match-details(matchId)"]
CheckStatus["status === 1<br>(ACTIVE)?"]
CheckMoves["callReadOnlyFunction()<br>get-player-move() x2"]
BothPlayed["Both moves<br>exist?"]
AgentIsOpponent["opponent ===<br>AGENT_ADDRESS?"]
AgentMove["makeContractCall()<br>play-move()"]
ResolveMatch["calculateWinner()"]
BroadcastResolve["makeContractCall()<br>resolve-match()"]

Start -.->|"no"| GetCount
GetCount -.-> ScanMatches
ScanMatches -.-> GetDetails
GetDetails -.->|"yes"| CheckStatus
CheckStatus -.-> CheckMoves
CheckStatus -.-> ScanMatches
CheckMoves -.->|"yes"| BothPlayed
BothPlayed -.->|"no"| ResolveMatch
BothPlayed -.-> AgentIsOpponent
AgentIsOpponent -.->|"yes + challenger played"| AgentMove
AgentIsOpponent -.->|"no"| ScanMatches
ResolveMatch -.-> BroadcastResolve
BroadcastResolve -.-> ScanMatches
AgentMove -.-> ScanMatches
```

The function scans the last 50 matches to catch any missed due to network latency. Winner calculation at [agent/src/ArenaAgent.ts L305-L327](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L305-L327)

 implements game-specific rules.

**Sources:** [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

 [agent/src/ArenaAgent.ts L305-L327](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L305-L327)

## Blockchain Tier (Clarity Smart Contracts)

The blockchain tier provides immutable game logic and asset custody through Clarity smart contracts deployed on Stacks testnet.

### Contract Deployment

```mermaid
flowchart TD

Deployer["DEPLOYER_ADDRESS<br>ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA"]
Arena["arena-platform-v2"]
Registry["agent-registry"]
Traits["traits"]

Deployer -.->|"clarinet deployments apply"| Arena
Deployer -.->|"clarinet deployments apply"| Registry
Deployer -.->|"clarinet deployments apply"| Traits

subgraph Contracts ["Deployed Contracts"]
    Arena
    Registry
    Traits
    Arena -.->|"implements"| Traits
    Arena -.->|"reads"| Registry
end
```

Configuration at [frontend/src/pages/ArenaGame.jsx L10-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L10-L11)

 and [agent/src/ArenaAgent.ts L45-L46](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L45-L46)

:

* `DEPLOYER_ADDRESS`: Environment variable or default
* `ARENA_CONTRACT`: `${DEPLOYER_ADDRESS}.arena-platform-v2`
* `CONTRACT_ADDRESS`: Shared deployer address

**Sources:** [frontend/src/pages/ArenaGame.jsx L10-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L10-L11)

 [agent/src/ArenaAgent.ts L45-L46](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L45-L46)

 [README.md L80-L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L80-L81)

### Contract Function Mapping

| Frontend Action | Agent Action | Contract Function | Description |
| --- | --- | --- | --- |
| `handleProposeMatch()` | - | `propose-match(opponent, game-type, wager)` | Creates new match with wager deposit |
| - | `/accept-match` endpoint | `accept-match(match-id)` | Agent accepts and matches wager |
| `handlePlayMove()` | `/play-move` endpoint | `play-move(match-id, move)` | Commits player move |
| - | `monitorChain()` | `resolve-match(match-id, winner)` | Distributes prize to winner |
| `fetchMatches()` | `monitorChain()` | `get-match-details(match-id)` | Reads match state |
| `fetchMatches()` | `monitorChain()` | `get-player-move(match-id, player)` | Reads committed move |
| `fetchMatches()` | - | `get-match-count()` | Gets total match count |

**Sources:** [frontend/src/pages/ArenaGame.jsx L300-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L482)

 [agent/src/ArenaAgent.ts L143-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L301)

## Integration Layer: x402 Payment Flow

The x402 protocol enables machine-to-machine micropayments between frontend and agent.

### x402 Complete Handshake

```mermaid
sequenceDiagram
  participant p1 as ArenaGame.jsx
  participant p2 as Stacks Wallet
  participant p3 as ArenaAgent.ts
  participant p4 as arena-platform-v2

  note over p1,p4: Phase 1: Match Proposal
  p1->>p2: "openContractCall()<br/>propose-match()"
  p2->>p4: "STX Transfer + TX"
  p4-->>p1: "matchId assigned"
  note over p1,p3: Phase 2: x402 Challenge
  p1->>p3: "POST /accept-match<br/>{matchId, matchTxId}"
  p3->>p3: "x402Middleware(1000)<br/>check headers"
  p3-->>p1: "402 Payment Required<br/>payTo: AGENT_ADDRESS"
  note over p1,p2: Phase 3: Micropayment
  p1->>p2: "openSTXTransfer()<br/>amount: 1000"
  p2-->>p1: "payment txId"
  note over p1,p3: Phase 4: Retry with Proof
  p1->>p3: "POST /accept-match<br/>x-payment-proof: txId"
  p3->>p3: "verify payment<br/>(production check)"
  p3->>p4: "makeContractCall()<br/>accept-match()"
  p3-->>p1: "200 OK + txid"
```

Implementation files:

* Frontend request: [frontend/src/pages/ArenaGame.jsx L353-L398](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L353-L398)
* Agent middleware: [agent/src/ArenaAgent.ts L109-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L140)
* Agent endpoint: [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

**Sources:** [frontend/src/pages/ArenaGame.jsx L350-L398](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L350-L398)

 [agent/src/ArenaAgent.ts L109-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L183)

### Payment Header Protocol

The x402 protocol uses custom HTTP headers:

```mermaid
flowchart TD

Request["HTTP Request"]
ProofHeader["x-payment-proof: txId"]
AddressHeader["x-stacks-address: ST..."]
PaymentReq["X-Payment-Required: base64(JSON)"]

Request -.-> ProofHeader
Request -.-> AddressHeader
ServerHeaders -.-> PaymentReq

subgraph ServerHeaders ["Server Response Headers"]
    PaymentReq
end

subgraph ClientHeaders ["Client Headers"]
    ProofHeader
    AddressHeader
end
```

Header definitions:

* `x-payment-proof`: Transaction ID of STX payment at [frontend/src/pages/ArenaGame.jsx L381](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L381-L381)
* `x-stacks-address`: User's testnet address at [frontend/src/pages/ArenaGame.jsx L382](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L382-L382)
* `X-Payment-Required`: Base64-encoded payment instructions at [agent/src/ArenaAgent.ts L130-L132](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L130-L132)

The `X402_HEADERS` constant from `x402-stacks` package is imported at [agent/src/ArenaAgent.ts L3-L4](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L3-L4)

**Sources:** [frontend/src/pages/ArenaGame.jsx L381-L382](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L381-L382)

 [agent/src/ArenaAgent.ts L3-L4](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L3-L4)

 [agent/src/ArenaAgent.ts L130-L132](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L130-L132)

## Data Flow: Complete Match Lifecycle

```mermaid
flowchart TD

ProposeMatch["1. User: handleProposeMatch()openContractCall(propose-match)"]
OnChainProposal["2. Contract: match createdstatus = PENDING"]
ChallengeAgent["3. User: handleChallengeAgent()POST /accept-match"]
Payment402["4. Agent: return 402x402Middleware(1000)"]
UserPays["5. User: openSTXTransfer()1000 microSTX to agent"]
RetryWithProof["6. User: retry POSTwith x-payment-proof"]
AgentAccepts["7. Agent: makeContractCall()accept-match()"]
OnChainAccepted["8. Contract: match acceptedstatus = ACTIVE"]
UserMove["9. User: handlePlayMove()openContractCall(play-move)"]
OnChainUserMove["10. Contract: move committed"]
TriggerAgent["11. User: triggerAgentMove()POST /play-move"]
Payment402Move["12. Agent: return 402x402Middleware(500)"]
UserPaysMove["13. User: openSTXTransfer()500 microSTX"]
RetryMove["14. User: retry POSTwith proof"]
FairnessCheck["15. Agent: verify challengerplayed on-chain"]
MarkovPredict["16. Agent: OpponentModel.predict()strategic counter-move"]
AgentMove["17. Agent: makeContractCall()play-move()"]
OnChainAgentMove["18. Contract: both moves committed"]
MonitorDetects["19. monitorChain(): scan matchesdetects both played"]
CalculateWinner["20. calculateWinner()game-specific logic"]
ResolveMatch["21. makeContractCall()resolve-match(winner)"]
OnChainResolved["22. Contract: status = COMPLETEDprize distributed (98%)"]

ProposeMatch -.-> OnChainProposal
OnChainProposal -.-> ChallengeAgent
ChallengeAgent -.-> Payment402
Payment402 -.-> UserPays
UserPays -.-> RetryWithProof
RetryWithProof -.-> AgentAccepts
AgentAccepts -.-> OnChainAccepted
OnChainAccepted -.-> UserMove
UserMove -.-> OnChainUserMove
OnChainUserMove -.-> TriggerAgent
TriggerAgent -.-> Payment402Move
Payment402Move -.-> UserPaysMove
UserPaysMove -.-> RetryMove
RetryMove -.-> FairnessCheck
FairnessCheck -.-> MarkovPredict
MarkovPredict -.-> AgentMove
AgentMove -.-> OnChainAgentMove
OnChainAgentMove -.-> MonitorDetects
MonitorDetects -.-> CalculateWinner
CalculateWinner -.-> ResolveMatch
ResolveMatch -.-> OnChainResolved
```

Key safeguards:

* **Post-Conditions**: [frontend/src/pages/ArenaGame.jsx L310-L314](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L310-L314)  ensures user only sends exact wager amount
* **Fairness Check**: [agent/src/ArenaAgent.ts L194-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L194-L224)  verifies challenger played before agent responds
* **Auto-Resolution**: [agent/src/ArenaAgent.ts L392-L434](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L392-L434)  prevents manual intervention

**Sources:** [frontend/src/pages/ArenaGame.jsx L300-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L482)

 [agent/src/ArenaAgent.ts L143-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L301)

 [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

## Configuration and Environment

### Frontend Environment Variables

```mermaid
flowchart TD

EnvVars["Environment Variables"]
DeployerAddr["VITE_DEPLOYER_ADDRESS<br>default: ST3273F..."]
AgentURL["VITE_AGENT_API_URL<br>default: localhost:3000"]
ArenaContract["ARENA_CONTRACT<br>=DEPLOYER_ADDRESS.arena-platform-v2"]

EnvVars -.-> DeployerAddr
EnvVars -.-> AgentURL
DeployerAddr -.-> ArenaContract
```

Defined at [frontend/src/pages/ArenaGame.jsx L10-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L10-L12)

:

* `VITE_DEPLOYER_ADDRESS`: Contract deployer principal
* `VITE_AGENT_API_URL`: Agent server base URL

### Agent Environment Variables

```mermaid
flowchart TD

AgentEnv["Agent .env"]
PrivKey["PRIVATE_KEY<br>agent wallet key"]
NetType["NETWORK_TYPE<br>testnet/mainnet"]
ContractAddr["CONTRACT_ADDRESS<br>deployer principal"]
Port["PORT<br>default: 3000"]
AgentAddress["AGENT_ADDRESS<br>getAddressFromPrivateKey()"]

AgentEnv -.-> PrivKey
AgentEnv -.-> NetType
AgentEnv -.-> ContractAddr
AgentEnv -.-> Port
PrivKey -.-> AgentAddress
```

Configuration at [agent/src/ArenaAgent.ts L40-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L40-L48)

:

* `PRIVATE_KEY`: Required for signing transactions
* `NETWORK_TYPE`: Determines address version
* `CONTRACT_ADDRESS`: Defaults to testnet deployer
* `PORT`: HTTP server port

Example at [agent/.env.example L1-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L1-L16)

 shows required variables.

**Sources:** [frontend/src/pages/ArenaGame.jsx L10-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L10-L12)

 [agent/src/ArenaAgent.ts L40-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L40-L48)

 [agent/.env.example L1-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L1-L16)

---

# Frontend-Application

# Frontend Application

> **Relevant source files**
> * [frontend/index.html](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html)
> * [frontend/package.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json)
> * [frontend/src/components/DocsModal.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx)
> * [frontend/vite.config.js](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js)

## Purpose and Scope

This document describes the React-based frontend application that provides the user interface for GameArenaStacks. The frontend is responsible for wallet connectivity, match proposal and gameplay interactions, x402 payment flow orchestration, and displaying game state from the Stacks blockchain.

For detailed information about specific components, see:

* ArenaGame component and match flows: [ArenaGame Component](/HACK3R-CRYPTO/GameArenaStacks/2.1-arenagame-component)
* Wallet integration and BNS resolution: [Wallet Integration and Navigation](/HACK3R-CRYPTO/GameArenaStacks/2.2-wallet-integration-and-navigation)
* UI components (Landing, Docs, Hall of Fame): [User Interface Components](/HACK3R-CRYPTO/GameArenaStacks/2.3-user-interface-components)
* Build configuration and tooling: [Frontend Build and Configuration](/HACK3R-CRYPTO/GameArenaStacks/2.4-frontend-build-and-configuration)
* Transaction polling and state management: [Transaction Management and State Polling](/HACK3R-CRYPTO/GameArenaStacks/2.5-transaction-management-and-state-polling)

## Technology Stack

The frontend application is built using modern web technologies optimized for blockchain integration and real-time user interactions.

### Core Framework and Build System

```mermaid
flowchart TD

Vite["Vite 7.2.4<br>Build Tool & Dev Server"]
React["React 19.2.0<br>UI Framework"]
ReactDOM["react-dom 19.2.0<br>Rendering"]
JSX["JSX/JavaScript<br>Component Language"]
Tailwind["TailwindCSS 4.1.18<br>Utility-First CSS"]
TailwindPostCSS["@tailwindcss/postcss 4.1.18<br>PostCSS Integration"]
PostCSS["PostCSS 8.5.6<br>CSS Processing"]
Autoprefixer["autoprefixer 10.4.23<br>Browser Compatibility"]
StacksConnect["@stacks/connect 7.8.3<br>Wallet Connection"]
StacksTx["@stacks/transactions 6.13.0<br>Transaction Building"]
StacksNetwork["@stacks/network 6.13.0<br>Network Configuration"]
StacksCommon["@stacks/common 6.13.0<br>Shared Utilities"]
Axios["axios 1.13.5<br>HTTP Client"]
X402["x402-stacks 2.0.1<br>Payment Protocol Client"]
Lucide["lucide-react 0.564.0<br>Icon Components"]
ReactHotToast["react-hot-toast 2.6.0<br>Toast Notifications"]
ReactRouter["react-router-dom 7.12.0<br>Routing"]
Buffer["buffer 6.0.3<br>Buffer Polyfill"]
Process["process 0.11.10<br>Process Polyfill"]

React -.-> Tailwind
React -.-> StacksConnect
React -.-> X402
React -.-> Lucide
React -.-> ReactHotToast
React -.-> ReactRouter
Vite -.-> Buffer
Vite -.-> Process

subgraph Polyfills ["Polyfills"]
    Buffer
    Process
end

subgraph subGraph4 ["UI Libraries"]
    Lucide
    ReactHotToast
    ReactRouter
end

subgraph subGraph3 ["HTTP & Payments"]
    Axios
    X402
    X402 -.-> Axios
end

subgraph subGraph2 ["Blockchain Integration"]
    StacksConnect
    StacksTx
    StacksNetwork
    StacksCommon
    StacksConnect -.-> StacksTx
    StacksConnect -.-> StacksNetwork
    StacksConnect -.-> StacksCommon
end

subgraph subGraph1 ["Styling System"]
    Tailwind
    TailwindPostCSS
    PostCSS
    Autoprefixer
    Tailwind -.-> TailwindPostCSS
    TailwindPostCSS -.-> PostCSS
    PostCSS -.-> Autoprefixer
end

subgraph subGraph0 ["Development Environment"]
    Vite
    React
    ReactDOM
    JSX
    Vite -.-> React
    React -.-> ReactDOM
    ReactDOM -.-> JSX
end
```

**Technology Stack Dependency Graph**

The application uses Vite 7.2.4 as its build tool and development server, providing fast hot module replacement (HMR) and optimized production builds. React 19.2.0 serves as the UI framework with JSX for component composition.

**Sources:** [frontend/package.json L1-L37](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L1-L37)

### Dependency Categories

| Category | Purpose | Key Packages |
| --- | --- | --- |
| **Core Framework** | UI rendering and reactivity | `react@19.2.0`, `react-dom@19.2.0` |
| **Build Tooling** | Development server and bundling | `vite@7.2.4`, `@vitejs/plugin-react@5.1.1` |
| **Styling** | CSS framework and processing | `tailwindcss@4.1.18`, `@tailwindcss/postcss@4.1.18`, `postcss@8.5.6` |
| **Blockchain** | Stacks network integration | `@stacks/connect@7.8.3`, `@stacks/transactions@6.13.0`, `@stacks/network@6.13.0` |
| **Payments** | x402 micropayment protocol | `x402-stacks@2.0.1` |
| **HTTP** | API communication | `axios@1.13.5` |
| **UI Components** | Icons and notifications | `lucide-react@0.564.0`, `react-hot-toast@2.6.0` |
| **Routing** | Client-side navigation | `react-router-dom@7.12.0` |
| **Polyfills** | Browser compatibility | `buffer@6.0.3`, `process@0.11.10` |

**Sources:** [frontend/package.json L12-L27](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L12-L27)

## Application Structure

The frontend follows a component-based architecture with clear separation between UI components, blockchain interaction logic, and state management.

```mermaid
flowchart TD

IndexHTML["index.html<br>HTML Template"]
MainJSX["src/main.jsx<br>React Bootstrap"]
ArenaGame["src/pages/ArenaGame.jsx<br>Main Game Interface"]
Navigation["src/components/Navigation.jsx<br>Wallet & BNS Integration"]
DocsModal["src/components/DocsModal.jsx<br>Documentation Display"]
LandingOverlay["src/components/LandingOverlay.jsx<br>Initial Screen"]
HallOfFame["src/components/HallOfFame.jsx<br>Match History Display"]
StacksConnect["@stacks/connect<br>showConnect()"]
X402Client["x402-stacks<br>x402RequestWithRetry()"]
AxiosClient["axios<br>HTTP requests"]
StacksTxLib["@stacks/transactions<br>makeContractCall()"]

MainJSX -.-> ArenaGame
ArenaGame -.-> Navigation
ArenaGame -.-> DocsModal
ArenaGame -.-> LandingOverlay
ArenaGame -.-> HallOfFame
ArenaGame -.-> StacksConnect
ArenaGame -.-> X402Client
ArenaGame -.-> AxiosClient
ArenaGame -.-> StacksTxLib
Navigation -.-> StacksConnect

subgraph subGraph3 ["External Dependencies"]
    StacksConnect
    X402Client
    AxiosClient
    StacksTxLib
end

subgraph subGraph2 ["UI Components"]
    Navigation
    DocsModal
    LandingOverlay
    HallOfFame
end

subgraph subGraph1 ["Page Components"]
    ArenaGame
end

subgraph subGraph0 ["Entry Point"]
    IndexHTML
    MainJSX
    IndexHTML -.-> MainJSX
end
```

**Component Hierarchy and Integration Points**

The application entry point is [frontend/index.html L1-L13](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html#L1-L13)

 which loads the React application through [frontend/src/main.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/main.jsx)

 The main interface component is `ArenaGame`, which orchestrates wallet connections, match proposals, gameplay interactions, and x402 payment flows.

**Sources:** [frontend/index.html L1-L13](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html#L1-L13)

### Component Responsibilities

| Component | File Path | Primary Responsibilities |
| --- | --- | --- |
| **ArenaGame** | `src/pages/ArenaGame.jsx` | Match proposal, move submission, x402 payment orchestration, game state management, transaction polling |
| **Navigation** | `src/components/Navigation.jsx` | Wallet connection via Stacks Connect, BNS name resolution, user identity display |
| **DocsModal** | `src/components/DocsModal.jsx` | Game rules display, integration examples, system documentation |
| **LandingOverlay** | `src/components/LandingOverlay.jsx` | Initial landing screen, system initialization prompts |
| **HallOfFame** | `src/components/HallOfFame.jsx` | Historical match display, winner showcase, statistics |

**Sources:** [frontend/src/components/DocsModal.jsx L1-L127](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L1-L127)

## DocsModal Component

The `DocsModal` component provides in-app documentation for users, explaining game rules, AI behavior, and integration examples for developers.

```mermaid
flowchart TD

DocsModal["DocsModal<br>Main Component"]
Header["Header Section<br>Terminal Icon + Title"]
Content["Content Container<br>Scrollable Area"]
MissionBrief["MISSION_BRIEF<br>Platform Overview"]
GameProtocols["GAME_PROTOCOLS<br>Game Rules Grid"]
AgentIntegration["AGENT_INTEGRATION<br>Code Examples"]
CloseButton["X Button<br>Close Modal"]
RPS["Rock-Paper-Scissors Card"]
Dice["Dice Roll Card"]
Coin["Coin Flip Card"]
CodeBlock["JavaScript Example<br>Event Listeners"]
DocsLink["External Docs Link<br>/ARENA_SKILL.md"]
Terminal["Terminal Icon"]
BookOpen["BookOpen Icon"]
Calculator["Calculator Icon"]
Code["Code Icon"]
XIcon["X Icon"]

Header -.-> Terminal
Header -.-> CloseButton
CloseButton -.-> XIcon
Content -.-> MissionBrief
Content -.-> GameProtocols
Content -.-> AgentIntegration
MissionBrief -.-> BookOpen
GameProtocols -.-> Calculator
AgentIntegration -.-> Code
GameProtocols -.-> RPS
GameProtocols -.-> Dice
GameProtocols -.-> Coin
AgentIntegration -.-> CodeBlock
AgentIntegration -.-> DocsLink

subgraph subGraph3 ["Lucide Icons"]
    Terminal
    BookOpen
    Calculator
    Code
    XIcon
end

subgraph subGraph2 ["UI Elements"]
    CloseButton
    RPS
    Dice
    Coin
    CodeBlock
    DocsLink
end

subgraph subGraph1 ["Content Sections"]
    MissionBrief
    GameProtocols
    AgentIntegration
end

subgraph subGraph0 ["DocsModal Component Structure"]
    DocsModal
    Header
    Content
    DocsModal -.-> Header
    DocsModal -.-> Content
end
```

**DocsModal Internal Structure**

The component uses a modal overlay pattern with fixed positioning (`fixed inset-0 z-[200]`) and backdrop blur (`bg-black/80 backdrop-blur-sm`). The modal is conditionally rendered based on the `isOpen` prop [frontend/src/components/DocsModal.jsx L5](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L5-L5)

### Key Features

**Header Section** [frontend/src/components/DocsModal.jsx L10-L22](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L10-L22)

* Displays "SYSTEM_MANUAL_V1.0" with Terminal icon from `lucide-react`
* Close button triggers `onClose` callback
* Styled with purple accent (`text-purple-400`)

**Mission Brief** [frontend/src/components/DocsModal.jsx L27-L44](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L27-L44)

* Explains platform purpose: "competitive 1v1 wagering platform"
* Highlights key features: * Direct AI challenges (no waiting) * 98% winner payout * Markov Chain learning * Human advantage: **YOU WIN ALL TIES**

**Game Protocols Grid** [frontend/src/components/DocsModal.jsx L46-L75](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L46-L75)

Three game cards displayed in a responsive grid (`grid-cols-1 md:grid-cols-3`):

| Game | Emoji | Rules | AI Strategy |
| --- | --- | --- | --- |
| Rock-Paper-Scissors | ✊ | 0=Rock, 1=Paper, 2=Scissors | Analyzes previous moves for prediction |
| Dice Roll | 🎲 | Roll 1-6, higher wins | Pure chance with 50/50 logic; ties favor human |
| Coin Flip | 🪙 | Heads(0) or Tails(1) | Pattern recognition in choices |

**Agent Integration Section** [frontend/src/components/DocsModal.jsx L77-L118](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L77-L118)

Provides JavaScript code example demonstrating:

1. Event listener setup with `watchEvent`
2. Match acceptance with `writeContract`
3. Move submission with `playMove`

The code example uses Viem-style syntax but documents the Stacks contract interaction pattern. It links to full documentation at `/ARENA_SKILL.md` [frontend/src/components/DocsModal.jsx L111](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L111-L111)

**Sources:** [frontend/src/components/DocsModal.jsx L1-L127](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L1-L127)

## Build Configuration

The Vite configuration provides essential polyfills and aliases required for Stacks blockchain libraries to function in a browser environment.

```mermaid
flowchart TD

ViteConfig["vite.config.js<br>defineConfig()"]
ReactPlugin["@vitejs/plugin-react<br>JSX Transform"]
GlobalThis["global → globalThis<br>Node.js Compatibility"]
ProcessEnv["process.env → {}<br>Environment Variables"]
BufferAlias["buffer → 'buffer'<br>Buffer Polyfill"]
ProcessAlias["process → 'process/browser'<br>Process Polyfill"]
EsbuildOptions["esbuildOptions<br>Dependency Pre-bundling"]
GlobalDefine["define.global → globalThis<br>Build-time Replacement"]
BufferPackage["buffer@6.0.3<br>Browser Buffer Implementation"]
ProcessPackage["process@0.11.10<br>Browser Process Implementation"]

ViteConfig -.-> GlobalThis
ViteConfig -.-> ProcessEnv
ViteConfig -.-> BufferAlias
ViteConfig -.-> ProcessAlias
ViteConfig -.-> EsbuildOptions
BufferAlias -.-> BufferPackage
ProcessAlias -.-> ProcessPackage

subgraph subGraph4 ["Runtime Polyfills"]
    BufferPackage
    ProcessPackage
end

subgraph Optimization ["Optimization"]
    EsbuildOptions
    GlobalDefine
    EsbuildOptions -.-> GlobalDefine
end

subgraph subGraph2 ["Module Aliases"]
    BufferAlias
    ProcessAlias
end

subgraph subGraph1 ["Global Definitions"]
    GlobalThis
    ProcessEnv
end

subgraph subGraph0 ["Vite Configuration"]
    ViteConfig
    ReactPlugin
    ViteConfig -.-> ReactPlugin
end
```

**Vite Build Configuration Architecture**

### Configuration Details

**React Plugin** [frontend/vite.config.js L6](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L6-L6)

* Enables JSX transformation and Fast Refresh for React components
* Automatically imports React in JSX files

**Global Definitions** [frontend/vite.config.js L7-L10](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L7-L10)

```
define: {
  'global': 'globalThis',
  'process.env': {},
}
```

These definitions replace Node.js global variables with browser-compatible equivalents. The `@stacks` libraries expect `global` to be available, so it's aliased to the standard `globalThis`.

**Module Resolution Aliases** [frontend/vite.config.js L11-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L11-L16)

```yaml
resolve: {
  alias: {
    buffer: 'buffer',
    process: 'process/browser',
  },
}
```

Maps Node.js core modules to browser-compatible polyfill packages. The `buffer` package [frontend/package.json L19](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L19-L19)

 provides a JavaScript implementation of Node's Buffer class, while `process` [frontend/package.json L21](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L21-L21)

 emulates the process global.

**Optimization Configuration** [frontend/vite.config.js L17-L23](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L17-L23)

```yaml
optimizeDeps: {
  esbuildOptions: {
    define: {
      global: 'globalThis'
    },
  },
}
```

Ensures that during dependency pre-bundling with esbuild, the `global` variable is consistently defined as `globalThis`.

### Why These Polyfills Are Required

The Stacks blockchain libraries (`@stacks/connect`, `@stacks/transactions`, etc.) were originally designed for Node.js environments and rely on Node.js-specific APIs. When running in a browser:

1. **Buffer**: Required for binary data manipulation in transaction construction
2. **Process**: Some libraries check `process.env` for configuration
3. **Global**: Libraries expect `global.Buffer` or similar Node.js globals

Without these polyfills, the application would encounter runtime errors like "Buffer is not defined" or "global is not defined" when interacting with Stacks wallets or constructing transactions.

**Sources:** [frontend/vite.config.js L1-L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L1-L24)

 [frontend/package.json L19-L21](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L19-L21)

## Development and Production Scripts

The `package.json` defines npm scripts for development, building, and deployment workflows.

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Starts development server with HMR on `http://localhost:5173` (default) |
| `build` | `vite build` | Creates production-optimized bundle in `dist/` directory |
| `preview` | `vite preview` | Serves production build locally for testing |
| `lint` | `eslint .` | Runs ESLint to check code quality and style |

**Development Workflow:**

1. Run `npm run dev` to start the development server
2. Edit components in `src/` with hot reload
3. Run `npm run lint` to check for issues
4. Run `npm run build` to create production bundle
5. Run `npm run preview` to test production build locally

**Sources:** [frontend/package.json L6-L10](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L6-L10)

## Entry Point and HTML Template

The application entry point is a minimal HTML template that loads the React application.

```mermaid
flowchart TD

Browser["Browser Navigation"]
IndexHTML["index.html<br>HTML5 Document"]
RootDiv["div#root<br>React Mount Point"]
MainScript["script type=module<br>src=/src/main.jsx"]
MainJSX["main.jsx<br>React.createRoot()"]
App["App Component<br>Router Setup"]
ArenaGame["ArenaGame Page<br>Main Interface"]

Browser -.-> IndexHTML
IndexHTML -.-> RootDiv
IndexHTML -.-> MainScript
MainScript -.-> MainJSX
MainJSX -.-> RootDiv
MainJSX -.-> App
App -.-> ArenaGame
```

**Application Bootstrap Flow**

The HTML template [frontend/index.html L1-L13](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html#L1-L13)

 provides:

1. **Document Metadata** [frontend/index.html L3-L7](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html#L3-L7) * UTF-8 character encoding * Vite SVG favicon * Responsive viewport configuration * Title: "GameArena Stacks - x402 AI Gaming Platform"
2. **React Mount Point** [frontend/index.html L10](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html#L10-L10) * `<div id="root"></div>` where the React application renders
3. **Module Script** [frontend/index.html L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html#L11-L11) * Loads `src/main.jsx` as ES module * Vite transforms this during development and build

The `main.jsx` file (not provided in sources but referenced) bootstraps React, sets up routing with `react-router-dom`, and renders the application into the `#root` div.

**Sources:** [frontend/index.html L1-L13](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html#L1-L13)

## Integration with Backend Systems

The frontend communicates with multiple backend systems to provide complete functionality.

```mermaid
flowchart TD

ArenaGameComponent["ArenaGame Component"]
NavComponent["Navigation Component"]
StacksConnect["Stacks Connect API<br>showConnect()"]
ContractCalls["Contract Calls<br>makeContractCall()"]
ReadOnlyCalls["Read-Only Calls<br>callReadOnlyFunction()"]
RPCNodes["Stacks RPC Nodes<br>Multi-node failover"]
X402Endpoint["POST /accept-match<br>x402 Payment Challenge"]
PlayMoveEndpoint["POST /play-move<br>AI Move Generation"]
AgentServer["Express Server<br>localhost:3000"]
LeatherWallet["Leather Wallet"]
XverseWallet["Xverse Wallet"]
AsignaWallet["Asigna Wallet"]
ArenaPlatform["arena-platform-v2<br>propose-match()"]
AgentRegistry["agent-registry<br>register-agent()"]

ArenaGameComponent -.-> StacksConnect
ArenaGameComponent -.-> X402Endpoint
ArenaGameComponent -.-> PlayMoveEndpoint
ArenaGameComponent -.-> ReadOnlyCalls
NavComponent -.-> StacksConnect
StacksConnect -.-> LeatherWallet
StacksConnect -.-> XverseWallet
StacksConnect -.-> AsignaWallet
RPCNodes -.-> ArenaPlatform
RPCNodes -.-> AgentRegistry
LeatherWallet -.-> ContractCalls
XverseWallet -.-> ContractCalls
AsignaWallet -.-> ContractCalls

subgraph subGraph4 ["Smart Contracts"]
    ArenaPlatform
    AgentRegistry
end

subgraph subGraph3 ["Wallet Applications"]
    LeatherWallet
    XverseWallet
    AsignaWallet
end

subgraph subGraph2 ["AI Agent Backend"]
    X402Endpoint
    PlayMoveEndpoint
    AgentServer
    X402Endpoint -.-> AgentServer
    PlayMoveEndpoint -.-> AgentServer
end

subgraph subGraph1 ["Stacks Blockchain Layer"]
    StacksConnect
    ContractCalls
    ReadOnlyCalls
    RPCNodes
    ContractCalls -.-> RPCNodes
    ReadOnlyCalls -.-> RPCNodes
end

subgraph subGraph0 ["Frontend Application"]
    ArenaGameComponent
    NavComponent
end
```

**Frontend Integration Architecture**

### Stacks Connect Integration

The frontend uses `@stacks/connect@7.8.3` [frontend/package.json L14](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L14-L14)

 to interact with Stacks wallets. This library provides:

* `showConnect()`: Displays wallet connection modal
* `openContractCall()`: Prompts user to sign transactions
* `openSTXTransfer()`: Initiates STX transfers
* Wallet detection and connection management

Supported wallets include Leather (formerly Hiro Wallet), Xverse, and Asigna. The wallet handles transaction signing and broadcasting to the Stacks network.

### x402 Payment Protocol

The frontend implements x402 micropayment flows using `x402-stacks@2.0.1` [frontend/package.json L26](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L26-L26)

 The typical flow:

1. Frontend sends request to agent endpoint (e.g., `/accept-match`)
2. Agent returns HTTP 402 Payment Required with payment details
3. Frontend automatically initiates STX transfer
4. Frontend retries request with payment proof header
5. Agent verifies payment and processes request

This protocol enables the AI agent to monetize its services without manual payment coordination. For details on x402 implementation, see [x402 Monetization Protocol](/HACK3R-CRYPTO/GameArenaStacks/5-x402-monetization-protocol).

### Blockchain Read Operations

The frontend queries contract state using read-only function calls:

* Match status queries
* Player move retrieval
* Agent registry lookups
* Historical match data

These operations use the `@stacks/transactions` library to construct read-only calls that don't require wallet signatures or transaction fees.

### Multi-Node Resilience

The frontend implements failover logic across multiple Stacks RPC nodes to ensure high availability. If the primary node (`api.testnet.hiro.so`) fails or times out, the application automatically retries against backup nodes. For implementation details, see [Multi-Node Failover and Reliability](/HACK3R-CRYPTO/GameArenaStacks/6.1-multi-node-failover-and-reliability).

**Sources:** [frontend/package.json L12-L27](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L12-L27)

## State Management Patterns

The frontend application uses React's built-in state management without external libraries like Redux or Zustand. State is managed through:

1. **Component State** (`useState`): Local UI state like modal visibility, form inputs
2. **Effect Hooks** (`useEffect`): Side effects like transaction polling, event listeners
3. **Context** (likely): Shared state for wallet connection status across components
4. **Props**: Data flow from parent to child components

The `ArenaGame` component serves as the primary state coordinator, managing:

* Active match data
* Pending transactions
* User move selections
* Agent interaction status
* x402 payment states

Transaction state is synchronized with the blockchain through polling mechanisms documented in [Transaction Management and State Polling](/HACK3R-CRYPTO/GameArenaStacks/2.5-transaction-management-and-state-polling).

**Sources:** [frontend/package.json L22-L23](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L22-L23)

## UI Framework and Styling

The application uses TailwindCSS 4.1.18 [frontend/package.json L34](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L34-L34)

 as its primary styling framework, with PostCSS for processing.

### Tailwind Configuration

The styling system uses the modern `@tailwindcss/postcss` integration [frontend/package.json L17](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L17-L17)

 which provides:

* Utility-first CSS classes
* Responsive design utilities
* Dark theme support (application uses dark mode)
* Custom scrollbar styling (`custom-scrollbar` class)

### Design System Patterns

Based on the DocsModal component [frontend/src/components/DocsModal.jsx L8-L122](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L8-L122)

 the application follows these design patterns:

**Color Palette:**

* Background: `bg-[#050505]`, `bg-[#0a0a0a]`, `bg-black/80`
* Borders: `border-white/10`, `border-white/5`
* Text: `text-white`, `text-gray-300`, `text-gray-400`, `text-gray-500`
* Accents: `text-purple-400`, `text-green-500`, `text-blue-500`, `border-purple-500/20`

**Typography:**

* Font: `font-mono` (monospace) for technical aesthetic
* Headings: `text-xl font-bold`
* Body: `text-sm` or `text-xs`
* Code: `font-mono text-xs`

**Layout Patterns:**

* Modal overlays with backdrop blur
* Responsive grids: `grid-cols-1 md:grid-cols-3`
* Flexbox for component alignment
* Fixed positioning for overlays: `fixed inset-0 z-[200]`

**Interactive Elements:**

* Hover states: `hover:text-white`, `hover:border-blue-500/30`
* Transitions: `transition-colors`
* Custom z-index layers for modals and overlays

The dark theme with purple/green/blue accents creates a futuristic, gaming-oriented aesthetic that aligns with the "Arena AI Champion" branding.

**Sources:** [frontend/package.json L17](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L17-L17)

 [frontend/package.json L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L30-L30)

 [frontend/package.json L34](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L34-L34)

 [frontend/src/components/DocsModal.jsx L8-L122](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L8-L122)

## Icon System

The application uses `lucide-react@0.564.0` [frontend/package.json L20](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L20-L20)

 for consistent iconography. Icons are imported as React components:

```javascript
import { X, Terminal, Code, BookOpen, Calculator } from 'lucide-react';
```

Icons used in DocsModal [frontend/src/components/DocsModal.jsx L2](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L2-L2)

:

* `Terminal`: System/command-line aesthetic
* `X`: Close buttons
* `BookOpen`: Documentation sections
* `Calculator`: Game rules/protocols
* `Code`: Developer integration examples

Icons accept `size` prop for consistent sizing (typically 18-20px) and inherit text color for theming.

**Sources:** [frontend/package.json L20](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L20-L20)

 [frontend/src/components/DocsModal.jsx L2](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L2-L2)

## Notification System

The application uses `react-hot-toast@2.6.0` [frontend/package.json L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L24-L24)

 for user notifications. This library provides:

* Toast notifications for transaction status
* Success/error/loading states
* Customizable appearance and positioning
* Auto-dismiss functionality
* Promise-based API for async operations

Typical use cases:

* "Transaction submitted" messages
* "Waiting for confirmation..." loaders
* "Match accepted!" success toasts
* "Transaction failed" error messages
* x402 payment status updates

**Sources:** [frontend/package.json L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L24-L24)

## Routing Configuration

The application uses `react-router-dom@7.12.0` [frontend/package.json L25](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L25-L25)

 for client-side navigation. While specific routes aren't visible in the provided files, the typical structure likely includes:

* `/` - Landing page with LandingOverlay
* `/game` or `/arena` - Main ArenaGame interface
* Potential additional routes for match history, leaderboards, or agent management

The router enables deep linking to specific match states and browser history integration.

**Sources:** [frontend/package.json L25](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L25-L25)

## Summary

The Frontend Application is a modern React 19 application built with Vite 7 that provides the user interface for GameArenaStacks. It integrates with Stacks blockchain wallets via Stacks Connect, implements x402 micropayment protocols for agent interactions, and uses TailwindCSS for a dark, gaming-oriented aesthetic.

Key architectural decisions:

1. **Vite over Create React App**: Faster development with modern ESM-based tooling
2. **Polyfills for blockchain libraries**: Browser compatibility for Node.js-based Stacks SDKs
3. **x402-stacks integration**: Automated micropayment flows for agent services
4. **Multi-component architecture**: Separation of concerns between game logic, UI, and blockchain interactions
5. **Dark theme with monospace fonts**: Creates a technical, gaming aesthetic

The frontend serves as the primary entry point for users, orchestrating complex flows involving wallet connections, contract calls, agent payments, and real-time state synchronization with the Stacks blockchain.

**Sources:** [frontend/package.json L1-L37](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L1-L37)

 [frontend/index.html L1-L13](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html#L1-L13)

 [frontend/vite.config.js L1-L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L1-L24)

 [frontend/src/components/DocsModal.jsx L1-L127](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L1-L127)

---

# ArenaGame-Component

# ArenaGame Component

> **Relevant source files**
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

## Purpose and Scope

The `ArenaGame` component is the primary user interface for GameArenaStacks, implementing the complete match lifecycle from wallet connection to prize distribution. This component handles match proposals, move submissions, x402-based agent challenges, real-time transaction polling, and comprehensive match visualization. It serves as the integration point between the Stacks blockchain, the autonomous AI agent API, and the end user.

For wallet connectivity and BNS name resolution, see [Wallet Integration and Navigation](/HACK3R-CRYPTO/GameArenaStacks/2.2-wallet-integration-and-navigation). For the x402 protocol details, see [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware). For smart contract interaction specifics, see [arena-platform-v2 Contract](/HACK3R-CRYPTO/GameArenaStacks/4.1-arena-platform-v2-contract).

## Component Architecture

The `ArenaGame` component is a React functional component that accepts `userSession` and `userData` props from the Stacks Connect authentication system. The component is located at [frontend/src/pages/ArenaGame.jsx L94-L911](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L94-L911)

 and implements a stateful architecture with 10 distinct state variables, multiple asynchronous data fetching hooks, and x402 payment integration.

**Sources:** [frontend/src/pages/ArenaGame.jsx L1-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L1-L11)

 [frontend/src/pages/ArenaGame.jsx L94-L105](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L94-L105)

## State Management Architecture

The component maintains game state through React hooks, with state variables managing everything from blockchain data to pending transactions. The following table documents each state variable and its role:

| State Variable | Type | Initial Value | Purpose |
| --- | --- | --- | --- |
| `stxBalance` | string | `'0'` | User's STX balance in human-readable format |
| `wager` | string | `'0.1'` | Current wager amount in STX for new matches |
| `selectedGameType` | number | `0` | Currently selected game type (0=RPS, 1=Dice, 2=Coin) |
| `matches` | array | `[]` | Array of match objects with full details and moves |
| `matchCount` | number | `0` | Total number of matches in the contract |
| `loading` | boolean | `false` | Loading state for async operations |
| `pendingTxs` | object | `{}` | Map of `matchId` to pending transaction metadata |
| `agentOnline` | boolean | `true` | Agent availability status (currently unused) |
| `showHelp` | boolean | `false` | Controls visibility of help overlay modal |
| `activeTab` | string | `'live'` | Active tab in the global feed ('live', 'hof', 'social') |

```mermaid
flowchart TD

STXBalance["stxBalance<br>(string)"]
Wager["wager<br>(string)"]
GameType["selectedGameType<br>(number)"]
Matches["matches<br>(array)"]
MatchCount["matchCount<br>(number)"]
Loading["loading<br>(boolean)"]
PendingTxs["pendingTxs<br>(object)"]
ShowHelp["showHelp<br>(boolean)"]
ActiveTab["activeTab<br>(string)"]
FetchBalance["fetchBalance()"]
FetchMatches["fetchMatches()"]
ProposeMatch["handleProposeMatch()"]
PlayMove["handlePlayMove()"]
ChallengeAgent["handleChallengeAgent()"]
TriggerAgent["triggerAgentMove()"]
TxPoller["useEffect<br>Transaction Poller"]

FetchBalance -.-> STXBalance
FetchMatches -.-> Matches
FetchMatches -.-> MatchCount
ProposeMatch -.-> PendingTxs
PlayMove -.-> PendingTxs
ChallengeAgent -.-> Matches
TriggerAgent -.-> PendingTxs
PendingTxs -.-> TxPoller
TxPoller -.-> FetchMatches
TxPoller -.-> FetchBalance
GameType -.-> ProposeMatch
Wager -.-> ProposeMatch

subgraph subGraph3 ["Transaction Polling"]
    TxPoller
end

subgraph subGraph2 ["User Actions"]
    ProposeMatch
    PlayMove
    ChallengeAgent
    TriggerAgent
    ProposeMatch -.-> ChallengeAgent
    PlayMove -.-> TriggerAgent
end

subgraph subGraph1 ["Data Fetching"]
    FetchBalance
    FetchMatches
end

subgraph subGraph0 ["State Management Layer"]
    STXBalance
    Wager
    GameType
    Matches
    MatchCount
    Loading
    PendingTxs
    ShowHelp
    ActiveTab
end
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L95-L105](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L95-L105)

 [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

## Configuration Constants

The component defines several configuration constants at the module level that control blockchain interaction and game logic:

### Blockchain Configuration

```javascript
const DEPLOYER_ADDRESS = import.meta.env.VITE_DEPLOYER_ADDRESS || 'ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA';
const ARENA_CONTRACT = `${DEPLOYER_ADDRESS}.arena-platform-v2`;
const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:3000';
```

These constants are configured via environment variables with fallback defaults. The `DEPLOYER_ADDRESS` is the Stacks address that deployed the contracts, while `ARENA_CONTRACT` is the fully qualified contract identifier used in all read-only and transaction calls.

**Sources:** [frontend/src/pages/ArenaGame.jsx L10-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L10-L12)

### Multi-Node Failover Configuration

```javascript
const STACKS_NODES = [
    'https://api.testnet.hiro.so',
    'https://stacks-node-api.testnet.stacks.co',
    'https://stacks-node-api.testnet.hiro.so'
];
```

The component implements high-availability through automatic node rotation. The `STACKS_NODES` array lists three RPC endpoints that are tried sequentially on failure. This is implemented in the `callReadOnlyWithRetry` function.

**Sources:** [frontend/src/pages/ArenaGame.jsx L27-L32](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L27-L32)

 [frontend/src/pages/ArenaGame.jsx L34-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L34-L50)

### Game Type Definitions

The `GAME_TYPES` constant defines all supported game modes:

| ID | Label | Icon | Status |
| --- | --- | --- | --- |
| 0 | Rock Paper Scissors | ✊ | Active |
| 1 | Dice Roll | 🎲 | Active |
| 2 | Coin Flip | 🪙 | Active |
| 3 | Tic Tac Toe | ❌ | Disabled (Coming Soon) |

**Sources:** [frontend/src/pages/ArenaGame.jsx L57-L62](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L57-L62)

## Network Resilience Infrastructure

### Request Timeout Wrapper

The `fetchWithTimeout` utility enforces a 5-second timeout on all network requests to prevent hanging requests from degrading user experience:

```mermaid
flowchart TD

Request["fetch() call"]
Controller["AbortController"]
Timer["setTimeout(5000ms)"]
Abort["controller.abort()"]
Response["Success Response"]
Error["Throw Error"]

Request -.-> Controller
Controller -.-> Timer
Timer -.-> Abort
Request -.-> Response
Request -.-> Abort
Abort -.-> Error
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L14-L25](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L14-L25)

### Multi-Node Read-Only Call Retry

The `callReadOnlyWithRetry` function implements automatic failover across multiple Stacks RPC nodes. When a node fails, the function logs a warning and tries the next node in the `STACKS_NODES` array:

```mermaid
sequenceDiagram
  participant p1 as ArenaGame
  participant p2 as callReadOnlyWithRetry
  participant p3 as api.testnet.hiro.so
  participant p4 as stacks-node-api...
  participant p5 as stacks-node-api.hiro

  p1->>p2: "get-match-details(matchId)"
  p2->>p3: "callReadOnlyFunction()"
  alt Node1 Success
    p3-->>p2: "Match Data"
    p2-->>p1: "Match Data"
  else Node1 Failure
    p3-->>p2: "Error"
    p2->>p4: "callReadOnlyFunction()"
  alt Node2 Success
    p4-->>p2: "Match Data"
    p2-->>p1: "Match Data"
  else Node2 Failure
  else Node2 Failure
    p4-->>p2: "Error"
    p2->>p5: "callReadOnlyFunction()"
    p5-->>p2: "Match Data"
    p2-->>p1: "Match Data"
  end
  end
```

This pattern is used extensively in `fetchBalance` and `fetchMatches` to ensure blockchain data is always retrievable despite individual node failures.

**Sources:** [frontend/src/pages/ArenaGame.jsx L34-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L34-L50)

 [frontend/src/pages/ArenaGame.jsx L108-L122](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L108-L122)

## Data Fetching Subsystem

### Balance Fetching with Retry

The `fetchBalance` callback queries the user's STX balance from multiple nodes using the `/extended/v1/address/{address}/balances` endpoint. The balance is converted from microSTX to STX (division by 1,000,000) and formatted to 2 decimal places:

**Sources:** [frontend/src/pages/ArenaGame.jsx L108-L122](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L108-L122)

### Match Fetching with Parallel Queries

The `fetchMatches` callback implements a sophisticated parallel query system to load match data efficiently:

```mermaid
flowchart TD

GetCount["get-match-count()"]
Count["matchCount = N"]
MatchQueries["Promise.all(<br>N queries)"]
Query1["get-match-details(0)"]
Query2["get-match-details(1)"]
QueryN["get-match-details(N-1)"]
MoveQueries["Promise.all(<br>2N queries)"]
ChallengerMoves["get-player-move<br>(challenger)"]
OpponentMoves["get-player-move<br>(opponent)"]
ParseMatches["Parse & Combine"]
SetMatches["setMatches(parsedMatches)"]

Count -.-> MatchQueries
Query1 -.-> MoveQueries
Query2 -.-> MoveQueries
QueryN -.-> MoveQueries
ChallengerMoves -.-> ParseMatches
OpponentMoves -.-> ParseMatches

subgraph subGraph3 ["Phase 4: State Update"]
    ParseMatches
    SetMatches
    ParseMatches -.-> SetMatches
end

subgraph subGraph2 ["Phase 3: Parallel Move Queries"]
    MoveQueries
    ChallengerMoves
    OpponentMoves
    MoveQueries -.-> ChallengerMoves
    MoveQueries -.-> OpponentMoves
end

subgraph subGraph1 ["Phase 2: Parallel Match Queries"]
    MatchQueries
    Query1
    Query2
    QueryN
    MatchQueries -.-> Query1
    MatchQueries -.-> Query2
    MatchQueries -.-> QueryN
end

subgraph subGraph0 ["Phase 1: Get Match Count"]
    GetCount
    Count
    GetCount -.-> Count
end
```

The function fetches the last 30 matches in reverse chronological order (newest first) and queries both challenger and opponent moves in parallel. This reduces the total fetch time from O(3N) sequential queries to approximately O(1) with three parallel batches.

**Sources:** [frontend/src/pages/ArenaGame.jsx L132-L240](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L132-L240)

### Polling Strategy

Two distinct polling strategies are implemented:

1. **General State Polling**: A 60-second interval polls `fetchBalance()` and `fetchMatches()` for background updates [frontend/src/pages/ArenaGame.jsx L242-L254](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L242-L254)
2. **Targeted Transaction Polling (BitSubs Pattern)**: A 5-second interval polls specific transaction IDs in `pendingTxs`, checking their status via the Hiro API `/extended/v1/tx/{txId}` endpoint. When a transaction confirms (status `success` or `abort_by_response`), it is removed from `pendingTxs` and the state is refreshed [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

**Sources:** [frontend/src/pages/ArenaGame.jsx L124-L130](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L124-L130)

 [frontend/src/pages/ArenaGame.jsx L242-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L242-L298)

## Match Proposal Flow

### Transaction Construction

The `handleProposeMatch` function orchestrates on-chain match creation with the following sequence:

```mermaid
sequenceDiagram
  participant p1 as User
  participant p2 as handleProposeMatch
  participant p3 as Stacks Wallet
  participant p4 as arena-platform-v2
  participant p5 as handleChallengeAgent

  p1->>p2: "Click INITIATE_CHALLENGE"
  p2->>p2: "Validate userData"
  p2->>p2: "Build post-conditions"<br/>"openContractCall(
  note over p2: "Post-Condition:<br/>willSendEq(wager)"
  p2->>p3: propose-match,<br/>[none, gameType, wager])"
  p3->>p1: "Sign Transaction?"
  p1->>p3: "Approve"
  p3->>p4: "Broadcast TX"
  p4-->>p3: "txId"
  p3->>p2: "onFinish(data)"
  p2->>p2: "setPendingTxs({matchId: {type:'proposal', txId}})"
  p2->>p5: "setTimeout(<br/>handleChallengeAgent, 2000)"
```

The function implements Stacks post-conditions to ensure trustless asset transfers. Specifically, it requires that the user will send exactly the wager amount in microSTX using `Pc.principal(userAddress).willSendEq(wagerAmount).ustx()` with post-condition mode 1 (Deny).

**Sources:** [frontend/src/pages/ArenaGame.jsx L300-L348](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L348)

### Post-Condition Enforcement

```javascript
const postConditions = [
    Pc.principal(userAddress)
        .willSendEq(Math.floor(parseFloat(wager) * 1000000))
        .ustx()
];
```

This post-condition guarantees that if the transaction execution differs from the expected STX transfer amount, the entire transaction will be rejected by the Stacks blockchain. This protects users from malicious contract upgrades or unexpected contract behavior.

**Sources:** [frontend/src/pages/ArenaGame.jsx L309-L314](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L309-L314)

## x402 Payment Integration

### Agent Challenge Flow

The `handleChallengeAgent` function implements the x402 payment protocol for automated agent acceptance. It uses a recursive `processRequest` pattern that handles HTTP 402 responses:

```mermaid
flowchart TD

Start["handleChallengeAgent(matchTxId, matchId)"]
ProcessReq["processRequest(headers={})"]
PostRequest["POST /accept-match<br>{matchId, matchTxId, wager}"]
Check402["status === 402?"]
ParsePayment["paymentInfo = response.data"]
Amount["amount = accepts[0].amount"]
PayTo["payTo = accepts[0].payTo"]
OpenWallet["openSTXTransfer(<br>recipient: payTo,<br>amount: amount)"]
UserApprove["User Approves Transfer"]
PaymentTx["Payment TX Broadcast"]
RetryReq["processRequest({<br>'x-payment-proof': txId,<br>'x-stacks-address': userAddr})"]
VerifyAgent["Agent Verifies Payment"]
AcceptMatch["Agent Calls accept-match()"]
Success["Response: {success: true}"]

PostRequest -.-> Check402
PayTo -.-> OpenWallet
PaymentTx -.-> RetryReq
Check402 -.-> Success

subgraph subGraph3 ["Retry with Proof"]
    RetryReq
    VerifyAgent
    AcceptMatch
    Success
    RetryReq -.-> VerifyAgent
    VerifyAgent -.-> AcceptMatch
    AcceptMatch -.-> Success
end

subgraph subGraph2 ["User Payment"]
    OpenWallet
    UserApprove
    PaymentTx
    OpenWallet -.-> UserApprove
    UserApprove -.-> PaymentTx
end

subgraph subGraph1 ["HTTP 402 Response"]
    Check402
    ParsePayment
    Amount
    PayTo
    Check402 -.-> ParsePayment
    ParsePayment -.-> Amount
    Amount -.->|"No (200)"| PayTo
end

subgraph subGraph0 ["Initial Request"]
    Start
    ProcessReq
    PostRequest
    Start -.-> ProcessReq
    ProcessReq -.->|"Yes"| PostRequest
end
```

The function uses closures to capture `matchTxId` and `predictedMatchId`, allowing the nested `processRequest` function to retry the request with payment proof headers after the user approves the STX transfer.

**Sources:** [frontend/src/pages/ArenaGame.jsx L350-L398](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L350-L398)

### Agent Move Triggering

The `triggerAgentMove` function follows an identical x402 pattern but targets the `/play-move` endpoint. This is called after the user submits their move to signal the agent to calculate and submit its counter-move:

```mermaid
sequenceDiagram
  participant p1 as User
  participant p2 as handlePlayMove
  participant p3 as arena-platform-v2
  participant p4 as triggerAgentMove
  participant p5 as Agent API

  p1->>p2: "Submit Move"
  p2->>p3: "play-move(matchId, move)"
  p3-->>p2: "TX Confirmed"
  p2->>p2: "setPendingTxs"
  p2->>p4: "setTimeout(5000)"
  note over p4: "5-second delay for<br/>on-chain confirmation"
  p4->>p5: "POST /play-move {matchId}"
  alt "x402 Required"
    p5-->>p4: "402 Payment Required"
    p4->>p1: "openSTXTransfer(500 μSTX)"
    p1->>p4: "Approve Payment"
    p4->>p5: "POST /play-move<br/>(with x-payment-proof)"
    p5-->>p4: "{txId: agentTxId}"
  else "No Payment Required"
    p5-->>p4: "{txId: agentTxId}"
  end
  p4->>p4: "setPendingTxs({matchId: {type:'agent', txId}})"
```

The 5-second delay before calling `triggerAgentMove` ensures the user's move transaction has propagated through the network before the agent queries it. This is part of the Fair Play Architecture described in [Fair Play Architecture](/HACK3R-CRYPTO/GameArenaStacks/8-fair-play-architecture).

**Sources:** [frontend/src/pages/ArenaGame.jsx L400-L445](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L400-L445)

 [frontend/src/pages/ArenaGame.jsx L447-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L447-L482)

## Move Submission System

### Move Execution

The `handlePlayMove` function constructs and broadcasts a `play-move` transaction to the `arena-platform-v2` contract:

```javascript
await openContractCall({
    contractAddress: DEPLOYER_ADDRESS,
    contractName: 'arena-platform-v2',
    functionName: 'play-move',
    functionArgs: [
        Cl.uint(matchId),
        Cl.uint(move)
    ],
    network,
    onFinish: (data) => {
        setPendingTxs(prev => ({ ...prev, [matchId]: { type: 'user', txId: data.txId } }));
        setTimeout(() => { triggerAgentMove(matchId); }, 5000);
    }
});
```

The function integrates with the transaction polling system by adding the transaction to `pendingTxs` and then triggers the agent move after a 5-second delay. This ensures fair play by guaranteeing the user's move is on-chain before the agent responds.

**Sources:** [frontend/src/pages/ArenaGame.jsx L447-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L447-L482)

### Move Display Helpers

Two utility functions support move rendering:

1. **`getMoveData(gameType, move)`**: Converts numeric move values to human-readable names and emoji icons. For example, in Rock-Paper-Scissors (gameType 0), move 0 becomes `{name: 'ROCK', icon: '✊'}` [frontend/src/pages/ArenaGame.jsx L64-L78](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L64-L78)
2. **`getMoveOptions(gameType)`**: Returns available move options for inline UI pickers. Rock-Paper-Scissors returns three buttons, Coin Flip returns two, and Dice Roll returns an empty array (uses custom RNG button) [frontend/src/pages/ArenaGame.jsx L80-L92](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L80-L92)

**Sources:** [frontend/src/pages/ArenaGame.jsx L64-L92](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L64-L92)

## Transaction Polling (BitSubs Pattern)

The component implements targeted transaction polling to provide real-time feedback without overwhelming the RPC nodes:

```mermaid
flowchart TD

PendingTxs["pendingTxs = {<br>matchId1: {type:'user', txId},<br>matchId2: {type:'agent', txId}<br>}"]
Interval["setInterval(5000ms)"]
Iterate["for (matchId in pendingTxs)"]
FetchTx["fetch('/extended/v1/tx/' + txId)"]
CheckStatus["tx_status === 'success'?"]
ShowToast["toast.success()"]
RemovePending["delete pendingTxs[matchId]"]
RefreshData["fetchMatches()<br>fetchBalance()"]
ShowError["toast.error()"]
RemovePendingFail["delete pendingTxs[matchId]"]

PendingTxs -.-> Interval
CheckStatus -.->|"Yes"| ShowToast
CheckStatus -.-> ShowError

subgraph subGraph3 ["Transaction Failed"]
    ShowError
    RemovePendingFail
    ShowError -.-> RemovePendingFail
end

subgraph subGraph2 ["Transaction Confirmed"]
    ShowToast
    RemovePending
    RefreshData
    ShowToast -.-> RemovePending
    RemovePending -.-> RefreshData
end

subgraph subGraph1 ["Polling Loop (5s interval)"]
    Interval
    Iterate
    FetchTx
    CheckStatus
    Interval -.->|"pending"| Iterate
    Iterate -.-> FetchTx
    FetchTx -.->|"abort_by_response"| CheckStatus
    CheckStatus -.-> Iterate
end

subgraph subGraph0 ["Pending Transaction State"]
    PendingTxs
end
```

This approach is more efficient than polling all matches continuously. It only polls transactions that the user has initiated or that the agent is processing, minimizing API calls while maximizing responsiveness.

**Sources:** [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

## User Interface Structure

The component renders three primary UI sections in a responsive grid layout:

```mermaid
flowchart TD

CenterPanel["Center Panel<br>(lg:col-span-8)"]
RightSidebar["Right Sidebar<br>(lg:col-span-4)"]
AIChallenge["Challenge AI Section"]
GameSelect["Game Type Selector"]
WagerInput["Wager Controls"]
InitButton["INITIATE_CHALLENGE Button"]
YourMatches["Your Matches Panel<br>(h-45%)"]
GlobalFeed["Global History Feed<br>(h-55%)"]
LiveTab["LIVE_HISTORY Tab"]
HoFTab["HALL_OF_FAME Tab"]
SocialTab["SOCIAL_FEED Tab<br>(Coming Soon)"]
MatchList["Match List"]
InlineMovePicker["Inline Move Picker"]
WaitingStatus["WAITING_OPPONENT Status"]

CenterPanel -.-> AIChallenge
RightSidebar -.-> YourMatches
RightSidebar -.-> GlobalFeed
YourMatches -.-> MatchList
GlobalFeed -.-> LiveTab
GlobalFeed -.-> HoFTab
GlobalFeed -.-> SocialTab

subgraph subGraph4 ["Your Matches Features"]
    MatchList
    InlineMovePicker
    WaitingStatus
    MatchList -.-> InlineMovePicker
    MatchList -.-> WaitingStatus
end

subgraph subGraph3 ["Global Feed Tabs"]
    LiveTab
    HoFTab
    SocialTab
end

subgraph subGraph2 ["Right Sidebar Components"]
    YourMatches
    GlobalFeed
end

subgraph subGraph1 ["Center Panel Components"]
    AIChallenge
    GameSelect
    WagerInput
    InitButton
    AIChallenge -.-> GameSelect
    AIChallenge -.-> WagerInput
    AIChallenge -.-> InitButton
end

subgraph subGraph0 ["Main Layout (lg:grid-cols-12)"]
    CenterPanel
    RightSidebar
end
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L484-L863](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L484-L863)

### Challenge AI Panel

The center panel displays:

* Game type selector with 4 buttons (RPS, Dice, Coin, Tic-Tac-Toe disabled)
* Wager input with potential win calculation (wager × 1.96)
* "INITIATE_CHALLENGE" button with "POWERED_BY_X402" badge

**Sources:** [frontend/src/pages/ArenaGame.jsx L487-L574](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L487-L574)

### Your Matches Section

Displays matches where the user is either challenger or opponent. Each match card shows:

* Game type icon and match ID
* Match status (Pending, Active, Completed)
* Wager amount in STX
* Move status or inline move picker for active matches
* Win/loss indicators with "X402_AUTH_PAYOUT" labels

For active matches where the user hasn't played, an inline move picker is rendered. For Dice Roll (gameType 1), this is a single "ROLL_DICE_RNG" button that generates a random roll. For other games, it displays buttons for each valid move option.

**Sources:** [frontend/src/pages/ArenaGame.jsx L577-L683](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L577-L683)

### Global History Feed

A tabbed interface with three views:

1. **LIVE_HISTORY**: Shows the last 30 matches from all players with real-time updates. Displays both players' addresses, wager amount, revealed moves (if completed), and match status [frontend/src/pages/ArenaGame.jsx L796-L856](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L796-L856)
2. **HALL_OF_FAME**: Aggregates wins by player address and displays a leaderboard with ranking badges (gold/silver/bronze for top 3). Identifies the agent with an "AGENT" badge and highlights the current user as "YOU" [frontend/src/pages/ArenaGame.jsx L724-L793](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L724-L793)
3. **SOCIAL_FEED**: Currently shows a "COMING_SOON" overlay [frontend/src/pages/ArenaGame.jsx L714-L722](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L714-L722)

**Sources:** [frontend/src/pages/ArenaGame.jsx L685-L858](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L685-L858)

### Help Overlay

A modal triggered by clicking the help icon (HelpCircle) displays game rules for all three active game types:

* Rock-Paper-Scissors: Standard rules with winner-takes-pot explanation
* Dice Roll: Highest roll wins
* Coin Flip: Prediction-based game

The overlay includes a footer note about x402 protocol integration.

**Sources:** [frontend/src/pages/ArenaGame.jsx L861-L909](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L861-L909)

## Axios Configuration

The component creates a configured Axios instance for agent API communication:

```javascript
const api = axios.create({ baseURL: AGENT_API_URL });
```

This instance is used in both `handleChallengeAgent` and `triggerAgentMove` to interact with the agent's Express API endpoints. The x402 payment flow automatically handles HTTP 402 responses through the recursive `processRequest` pattern.

**Sources:** [frontend/src/pages/ArenaGame.jsx L55](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L55-L55)

 [frontend/src/pages/ArenaGame.jsx L350-L445](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L350-L445)

## Integration Points

The `ArenaGame` component integrates with multiple external systems:

| System | Integration Method | Purpose |
| --- | --- | --- |
| Stacks Blockchain | `callReadOnlyFunction`, `openContractCall` | Match state queries and transaction broadcasts |
| Stacks Connect | `openSTXTransfer` | x402 micro-payments to agent |
| Hiro API | `fetch('/extended/v1/tx/{txId}')` | Transaction status polling |
| Agent API | `axios.post('/accept-match')`, `axios.post('/play-move')` | Agent challenge and move triggering |
| BNS API | (via Navigation component) | Name resolution for display |

The component is designed to operate entirely on Stacks Testnet, with the `network` constant set to `StacksTestnet({ url: STACKS_NODES[0] })`.

**Sources:** [frontend/src/pages/ArenaGame.jsx L3-L6](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L3-L6)

 [frontend/src/pages/ArenaGame.jsx L52](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L52-L52)

---

# Wallet-Integration-and-Navigation

# Wallet Integration and Navigation

> **Relevant source files**
> * [frontend/package.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

This document covers the frontend's wallet integration layer, including Stacks Connect authentication, BNS name resolution, and the Navigation component. For game-specific wallet operations like match proposals and move submissions, see [ArenaGame Component](/HACK3R-CRYPTO/GameArenaStacks/2.1-arenagame-component). For transaction polling and state synchronization, see [Transaction Management and State Polling](/HACK3R-CRYPTO/GameArenaStacks/2.5-transaction-management-and-state-polling).

## Purpose and Scope

The wallet integration system provides:

* User authentication via Stacks Connect protocol
* Support for multiple Stacks wallet providers (Leather, Xverse, Asigna)
* BNS name resolution for human-readable addresses
* Navigation UI with connect/disconnect functionality
* Transaction signing interfaces for contract calls and STX transfers

## Stacks Connect Integration Architecture

```mermaid
flowchart TD

Nav["Navigation.jsx"]
ConnectBtn["connectWallet()"]
DisconnectBtn["disconnectWallet()"]
DisplayLogic["displayName()"]
BNSFetch["getBns()"]
ShowConnect["showConnect()"]
UserSession["UserSession"]
OpenContractCall["openContractCall()"]
OpenSTXTransfer["openSTXTransfer()"]
Leather["Leather Wallet"]
Xverse["Xverse Wallet"]
Asigna["Asigna Wallet"]
BNSAPI["api.bnsv2.com/testnet"]
UserData["userData State"]
BNSName["bns State"]

ConnectBtn -.-> ShowConnect
ShowConnect -.-> Leather
ShowConnect -.-> Xverse
ShowConnect -.-> Asigna
UserSession -.-> UserData
UserData -.-> DisplayLogic
UserData -.-> BNSFetch
BNSFetch -.-> BNSAPI
BNSAPI -.-> BNSName
BNSName -.-> DisplayLogic
DisconnectBtn -.-> UserSession

subgraph subGraph4 ["Application State"]
    UserData
    BNSName
end

subgraph subGraph3 ["External APIs"]
    BNSAPI
end

subgraph subGraph2 ["Wallet Providers"]
    Leather
    Xverse
    Asigna
end

subgraph subGraph1 ["@stacks/connect Library"]
    ShowConnect
    UserSession
    OpenContractCall
    OpenSTXTransfer
    ShowConnect -.-> UserSession
end

subgraph subGraph0 ["Navigation Component"]
    Nav
    ConnectBtn
    DisconnectBtn
    DisplayLogic
    BNSFetch
    Nav -.-> ConnectBtn
    Nav -.-> DisconnectBtn
    Nav -.-> DisplayLogic
end
```

**Diagram: Stacks Connect Authentication Flow**

The `Navigation` component orchestrates wallet connection through the `showConnect` function from `@stacks/connect`. The `UserSession` object manages authentication state and persists across page reloads. After successful connection, the component fetches BNS names via external API and updates display logic accordingly.

**Sources:** [frontend/src/components/Navigation.jsx L1-L92](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L1-L92)

 [frontend/package.json L14](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L14-L14)

## Navigation Component Structure

The `Navigation` component is the primary interface for wallet operations. It maintains two key pieces of state:

| State Variable | Type | Purpose |
| --- | --- | --- |
| `bns` | string | Stores resolved BNS name for the connected address |
| `userData` | object | User profile data from `userSession.loadUserData()` |

The component provides three core functions:

### connectWallet()

[frontend/src/components/Navigation.jsx L7-L28](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L7-L28)

```mermaid
sequenceDiagram
  participant p1 as User
  participant p2 as Navigation
  participant p3 as showConnect
  participant p4 as WalletProvider
  participant p5 as UserSession
  participant p6 as BNS_API

  p1->>p2: Click "Connect Wallet"
  p2->>p3: "showConnect({appDetails, onFinish})"
  p3->>p4: Launch wallet selection
  p4->>p1: Request approval
  p1->>p4: Approve connection
  p4->>p3: Authentication token
  p3->>p5: "loadUserData()"
  p5->>p2: "userData object"
  p2->>p6: "GET /names/address/{address}/valid"
  p6->>p2: "BNS name or empty"
  p2->>p1: Display connected state
```

**Diagram: Wallet Connection Sequence**

The function invokes `showConnect()` with application metadata including name and icon. The `onFinish` callback receives user data and triggers BNS resolution. The `redirectTo: '/'` parameter ensures users return to the main page after authentication.

**Sources:** [frontend/src/components/Navigation.jsx L7-L28](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L7-L28)

### disconnectWallet()

[frontend/src/components/Navigation.jsx L30-L34](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L30-L34)

Calls `userSession.signUserOut()` to clear authentication state and resets both `userData` and `bns` to empty values. This immediately updates the UI to show the "Connect Wallet" button.

### displayName()

[frontend/src/components/Navigation.jsx L47-L52](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L47-L52)

Returns the display string for the connected wallet using this precedence:

1. BNS name if available (e.g., "alice.btc")
2. Truncated address format: `${address.slice(0, 6)}...${address.slice(-4)}`
3. `null` if no wallet connected

**Sources:** [frontend/src/components/Navigation.jsx L30-L52](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L30-L52)

## BNS Name Resolution

```mermaid
flowchart TD

A["Connected Address<br>ST3273FDNH..."]
B["getBns(stxAddress)"]
C["fetch()<br>api.bnsv2.com/testnet"]
D["Response JSON"]
E["data.names[0].full_name"]
F["bns State<br>or empty string"]
G["displayName()"]
H["Rendered in UI"]

A -.-> B
B -.-> C
C -.-> D
D -.-> E
E -.-> F
G -.-> F
F -.-> H
```

**Diagram: BNS Resolution Pipeline**

The `getBns` function queries the BNS v2 API to retrieve human-readable names associated with a Stacks address:

[frontend/src/components/Navigation.jsx L36-L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L36-L45)

```
Endpoint: https://api.bnsv2.com/testnet/names/address/${stxAddress}/valid
Response structure:
{
  "names": [
    {
      "full_name": "alice.btc",
      ...
    }
  ]
}
```

The function returns the first valid name from the `names` array or an empty string if resolution fails. Error handling logs failures to console but does not block the UI.

**Sources:** [frontend/src/components/Navigation.jsx L36-L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L36-L45)

## Wallet State Flow Through Application

```mermaid
flowchart TD

AppState["useState: userData"]
SessionInit["UserSession initialization"]
NavProps["Props: userSession, userData, setUserData"]
NavConnect["Connect/Disconnect logic"]
GameProps["Props: userSession, userData"]
UseAddress["userData.profile.stxAddress.testnet"]
ContractCalls["openContractCall()"]
STXTransfers["openSTXTransfer()"]

SessionInit -.-> NavProps
AppState -.-> NavProps
AppState -.-> GameProps
NavConnect -.-> AppState

subgraph subGraph2 ["ArenaGame Component"]
    GameProps
    UseAddress
    ContractCalls
    STXTransfers
    UseAddress -.-> ContractCalls
    UseAddress -.-> STXTransfers
end

subgraph subGraph1 ["Navigation Component"]
    NavProps
    NavConnect
end

subgraph subGraph0 ["App.jsx (Root)"]
    AppState
    SessionInit
end
```

**Diagram: Wallet State Propagation**

The `userSession` and `userData` objects flow from the root application component down to both `Navigation` and `ArenaGame`. The `Navigation` component can mutate `userData` via `setUserData` callback, while `ArenaGame` consumes it read-only for transaction signing.

**Key data structure:**

```yaml
userData = {
  profile: {
    stxAddress: {
      testnet: "ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA",
      mainnet: "SP3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA"
    }
  }
}
```

**Sources:** [frontend/src/components/Navigation.jsx L4](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L4-L4)

 [frontend/src/pages/ArenaGame.jsx L94](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L94-L94)

## Transaction Signing Interfaces

The wallet integration exposes two primary transaction functions used throughout the application:

### openContractCall

[frontend/src/pages/ArenaGame.jsx L317-L339](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L317-L339)

Used for invoking smart contract functions. Example from match proposal:

```mermaid
sequenceDiagram
  participant p1 as ArenaGame
  participant p2 as openContractCall
  participant p3 as Wallet
  participant p4 as Stacks_Network
  participant p5 as User

  p1->>p2: "{contractAddress, functionName, functionArgs, postConditions}"
  p2->>p3: Display transaction preview
  p3->>p5: Request signature
  p5->>p3: Approve
  p3->>p4: Broadcast signed tx
  p4->>p2: Transaction ID
  p2->>p1: "onFinish({txId})"
  p1->>p1: "setPendingTxs()"
```

**Diagram: Contract Call Transaction Flow**

Key parameters:

* `contractAddress` + `contractName`: Target contract identifier
* `functionName`: Clarity function to invoke
* `functionArgs`: Array of Clarity values (constructed via `Cl.*` helpers)
* `postConditions`: Asset transfer constraints (see [Post-Conditions and Asset Protection](/HACK3R-CRYPTO/GameArenaStacks/6.2-post-conditions-and-asset-protection))
* `network`: StacksTestnet or StacksMainnet instance
* `onFinish`: Callback receiving `{txId, stacksTransaction}`
* `onCancel`: Callback for user rejection

**Sources:** [frontend/src/pages/ArenaGame.jsx L317-L339](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L317-L339)

### openSTXTransfer

[frontend/src/pages/ArenaGame.jsx L371-L389](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L371-L389)

Used for direct STX transfers, primarily for x402 micropayments:

```javascript
await openSTXTransfer({
  recipient: paymentInfo.accepts[0].payTo,
  amount: paymentInfo.accepts[0].amount,
  memo: 'x402 Agent Fee',
  network,
  onFinish: (data) => {
    // Retry API request with payment proof
    processRequest({
      'x-payment-proof': data.txId,
      'x-stacks-address': userData.profile.stxAddress.testnet
    });
  }
});
```

The transaction ID returned in `onFinish` serves as cryptographic proof of payment for x402 protocol (see [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware)).

**Sources:** [frontend/src/pages/ArenaGame.jsx L371-L389](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L371-L389)

 [frontend/src/pages/ArenaGame.jsx L418-L436](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L418-L436)

## Network Configuration and Multi-Node Failover

```mermaid
flowchart TD

TestnetInstance["StacksTestnet Instance"]
NodeArray["STACKS_NODES Array"]
Node1["api.testnet.hiro.so"]
Node2["stacks-node-api.testnet.stacks.co"]
Node3["stacks-node-api.testnet.hiro.so"]
ContractCall["openContractCall()"]
STXTransfer["openSTXTransfer()"]

TestnetInstance -.-> Node1
NodeArray -.-> Node1
NodeArray -.-> Node2
NodeArray -.-> Node3
ContractCall -.-> TestnetInstance
STXTransfer -.-> TestnetInstance

subgraph subGraph2 ["Wallet Operations"]
    ContractCall
    STXTransfer
end

subgraph subGraph1 ["Node Rotation"]
    Node1
    Node2
    Node3
end

subgraph subGraph0 ["Network Configuration"]
    TestnetInstance
    NodeArray
end
```

**Diagram: Network Configuration Architecture**

[frontend/src/pages/ArenaGame.jsx L28-L32](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L28-L32)

The application defines a primary `network` instance pointing to the first node in `STACKS_NODES` array. While read-only operations use multi-node failover via `callReadOnlyWithRetry` (see [Multi-Node Failover and Reliability](/HACK3R-CRYPTO/GameArenaStacks/6.1-multi-node-failover-and-reliability)), wallet-initiated transactions always use the primary node since the wallet provider handles broadcasting.

| Node URL | Purpose |
| --- | --- |
| `https://api.testnet.hiro.so` | Primary RPC endpoint |
| `https://stacks-node-api.testnet.stacks.co` | Fallback for read operations |
| `https://stacks-node-api.testnet.hiro.so` | Secondary fallback |

**Sources:** [frontend/src/pages/ArenaGame.jsx L28-L52](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L28-L52)

## Supported Wallet Providers

The `@stacks/connect` library automatically detects and presents all installed Stacks wallet providers. The three primary wallets supported:

| Wallet | Type | Features |
| --- | --- | --- |
| **Leather** (formerly Hiro Wallet) | Browser Extension | Native Stacks support, BNS integration, hardware wallet support |
| **Xverse** | Browser Extension + Mobile | Multi-chain (Stacks, Bitcoin, Ordinals), mobile app available |
| **Asigna** | Browser Extension | Multisig support, enterprise features |

All wallets implement the same Stacks Connect API, ensuring the application code remains provider-agnostic. Users see a provider selection dialog when clicking "Connect Wallet" if multiple wallets are installed.

**Sources:** [frontend/package.json L14](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L14-L14)

 [frontend/src/components/Navigation.jsx L9-L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L9-L24)

## Navigation UI Implementation

[frontend/src/components/Navigation.jsx L54-L89](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L54-L89)

The navigation bar renders a fixed header with the following structure:

```javascript
┌─────────────────────────────────────────────────────────────┐
│ 🦞 ARENA_CHAMPION [x402_STACKS]           [Wallet Button]  │
│    Stacks Testnet • HTTP_402_MONETIZATION_LAYER             │
└─────────────────────────────────────────────────────────────┘
```

**Key CSS classes:**

* `fixed top-0 left-0 right-0 z-50`: Persistent header
* `bg-[#050505]/80 backdrop-blur-md`: Semi-transparent dark background with blur
* `border-b border-white/10`: Subtle bottom border

**Wallet button states:**

1. **Disconnected**: Purple button with "Connect Wallet" text
2. **Connected**: Dark purple background displaying BNS name or truncated address

The component uses Tailwind CSS utility classes for styling and responds to hover states with smooth transitions.

**Sources:** [frontend/src/components/Navigation.jsx L54-L89](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L54-L89)

## Integration with x402 Payment Flow

The wallet integration plays a critical role in the x402 monetization protocol. When the agent returns HTTP 402, the frontend:

1. Parses payment requirements from response headers
2. Invokes `openSTXTransfer` with recipient and amount
3. Waits for user approval in wallet
4. Receives transaction ID in `onFinish` callback
5. Retries API request with proof headers: * `x-payment-proof`: Transaction ID * `x-stacks-address`: User's testnet address

This seamless integration eliminates manual payment steps, creating an automated pay-per-use experience. See [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware) for server-side verification logic.

**Sources:** [frontend/src/pages/ArenaGame.jsx L366-L394](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L366-L394)

## Error Handling and Edge Cases

| Scenario | Behavior |
| --- | --- |
| **User cancels wallet connection** | `onCancel` callback prevents state mutation, no error shown |
| **BNS API fails** | Falls back to truncated address display, logs error to console |
| **Transaction rejection** | `onCancel` callback shows toast notification, no state change |
| **Network timeout during signing** | Wallet provider handles retry logic, app waits for callback |
| **Multiple rapid connect attempts** | `showConnect` is idempotent, subsequent calls queue |

The wallet integration prioritizes user experience by handling errors gracefully without blocking the UI. All transaction operations are async and non-blocking.

**Sources:** [frontend/src/components/Navigation.jsx L7-L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L7-L45)

 [frontend/src/pages/ArenaGame.jsx L336-L338](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L336-L338)

---

# User-Interface-Components

# User Interface Components

> **Relevant source files**
> * [.gitignore](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/.gitignore)
> * [frontend/index.html](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html)
> * [frontend/src/components/DocsModal.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx)
> * [frontend/src/components/LandingOverlay.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx)
> * [temp_snippet.txt](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt)

This page documents the presentational UI components in the GameArenaStacks frontend that provide user onboarding, documentation, and match history visualization. These components complement the core game interaction layer documented in [ArenaGame Component](/HACK3R-CRYPTO/GameArenaStacks/2.1-arenagame-component) and work alongside the wallet integration in [Navigation](/HACK3R-CRYPTO/GameArenaStacks/2.2-wallet-integration-and-navigation).

For information about the main game interface and match management, see [ArenaGame Component](/HACK3R-CRYPTO/GameArenaStacks/2.1-arenagame-component). For wallet connection UI, see [Wallet Integration and Navigation](/HACK3R-CRYPTO/GameArenaStacks/2.2-wallet-integration-and-navigation).

---

## Overview of UI Component Architecture

The frontend implements three specialized UI components that handle non-gameplay interactions:

| Component | File | Purpose | Integration Point |
| --- | --- | --- | --- |
| `LandingOverlay` | `frontend/src/components/LandingOverlay.jsx` | System initialization screen with typewriter animation | Wraps entire application, dismissed via callback |
| `DocsModal` | `frontend/src/components/DocsModal.jsx` | In-app documentation modal with game rules and API examples | Toggled from main game interface |
| Hall of Fame | Inline in `ArenaGame.jsx` | Match history display showing winners and payouts | Embedded in social tab of main interface |

```mermaid
flowchart TD

App["App.jsx<br>(Root Component)"]
Landing["LandingOverlay<br>Entry Animation"]
Arena["ArenaGame<br>Main Game Interface"]
Nav["Navigation<br>Wallet & Header"]
Docs["DocsModal<br>Documentation"]
HoF["Hall of Fame<br>(Social Tab)"]

App -.-> Landing
Landing -.->|"onEnter() callback"| Arena
Arena -.-> Nav
Arena -.->|"isOpen prop"| Docs
Arena -.->|"activeTab === 'social'"| HoF
Landing -.->|"dismissed after entry"| Arena
Docs -.-> Arena
HoF -.-> Arena
```

**Sources:** [frontend/src/components/LandingOverlay.jsx L1-L79](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L1-L79)

 [frontend/src/components/DocsModal.jsx L1-L127](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L1-L127)

 [temp_snippet.txt L1-L44](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt#L1-L44)

---

## LandingOverlay Component

### Component Structure and Props

The `LandingOverlay` component implements a full-screen entry animation with a terminal aesthetic. It accepts a single callback prop:

| Prop | Type | Purpose |
| --- | --- | --- |
| `onEnter` | `() => void` | Callback invoked when user dismisses overlay |

The component manages two pieces of local state:

```css
#mermaid-f8b61z9px7{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;fill:#333;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-f8b61z9px7 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-f8b61z9px7 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-f8b61z9px7 .error-icon{fill:#dddddd;}#mermaid-f8b61z9px7 .error-text{fill:#222222;stroke:#222222;}#mermaid-f8b61z9px7 .edge-thickness-normal{stroke-width:1px;}#mermaid-f8b61z9px7 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-f8b61z9px7 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-f8b61z9px7 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-f8b61z9px7 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-f8b61z9px7 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-f8b61z9px7 .marker{fill:#999;stroke:#999;}#mermaid-f8b61z9px7 .marker.cross{stroke:#999;}#mermaid-f8b61z9px7 svg{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;}#mermaid-f8b61z9px7 p{margin:0;}#mermaid-f8b61z9px7 defs #statediagram-barbEnd{fill:#999;stroke:#999;}#mermaid-f8b61z9px7 g.stateGroup text{fill:#dddddd;stroke:none;font-size:10px;}#mermaid-f8b61z9px7 g.stateGroup text{fill:#333;stroke:none;font-size:10px;}#mermaid-f8b61z9px7 g.stateGroup .state-title{font-weight:bolder;fill:#333;}#mermaid-f8b61z9px7 g.stateGroup rect{fill:#ffffff;stroke:#dddddd;}#mermaid-f8b61z9px7 g.stateGroup line{stroke:#999;stroke-width:1;}#mermaid-f8b61z9px7 .transition{stroke:#999;stroke-width:1;fill:none;}#mermaid-f8b61z9px7 .stateGroup .composit{fill:#f4f4f4;border-bottom:1px;}#mermaid-f8b61z9px7 .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#mermaid-f8b61z9px7 .state-note{stroke:#e6d280;fill:#fff5ad;}#mermaid-f8b61z9px7 .state-note text{fill:#333;stroke:none;font-size:10px;}#mermaid-f8b61z9px7 .stateLabel .box{stroke:none;stroke-width:0;fill:#ffffff;opacity:0.5;}#mermaid-f8b61z9px7 .edgeLabel .label rect{fill:#ffffff;opacity:0.5;}#mermaid-f8b61z9px7 .edgeLabel{background-color:#ffffff;text-align:center;}#mermaid-f8b61z9px7 .edgeLabel p{background-color:#ffffff;}#mermaid-f8b61z9px7 .edgeLabel rect{opacity:0.5;background-color:#ffffff;fill:#ffffff;}#mermaid-f8b61z9px7 .edgeLabel .label text{fill:#333;}#mermaid-f8b61z9px7 .label div .edgeLabel{color:#333;}#mermaid-f8b61z9px7 .stateLabel text{fill:#333;font-size:10px;font-weight:bold;}#mermaid-f8b61z9px7 .node circle.state-start{fill:#999;stroke:#999;}#mermaid-f8b61z9px7 .node .fork-join{fill:#999;stroke:#999;}#mermaid-f8b61z9px7 .node circle.state-end{fill:#dddddd;stroke:#f4f4f4;stroke-width:1.5;}#mermaid-f8b61z9px7 .end-state-inner{fill:#f4f4f4;stroke-width:1.5;}#mermaid-f8b61z9px7 .node rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-f8b61z9px7 .node polygon{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-f8b61z9px7 #statediagram-barbEnd{fill:#999;}#mermaid-f8b61z9px7 .statediagram-cluster rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-f8b61z9px7 .cluster-label,#mermaid-f8b61z9px7 .nodeLabel{color:#333;}#mermaid-f8b61z9px7 .statediagram-cluster rect.outer{rx:5px;ry:5px;}#mermaid-f8b61z9px7 .statediagram-state .divider{stroke:#dddddd;}#mermaid-f8b61z9px7 .statediagram-state .title-state{rx:5px;ry:5px;}#mermaid-f8b61z9px7 .statediagram-cluster.statediagram-cluster .inner{fill:#f4f4f4;}#mermaid-f8b61z9px7 .statediagram-cluster.statediagram-cluster-alt .inner{fill:#f8f8f8;}#mermaid-f8b61z9px7 .statediagram-cluster .inner{rx:0;ry:0;}#mermaid-f8b61z9px7 .statediagram-state rect.basic{rx:5px;ry:5px;}#mermaid-f8b61z9px7 .statediagram-state rect.divider{stroke-dasharray:10,10;fill:#f8f8f8;}#mermaid-f8b61z9px7 .note-edge{stroke-dasharray:5;}#mermaid-f8b61z9px7 .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-f8b61z9px7 .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-f8b61z9px7 .statediagram-note text{fill:#333;}#mermaid-f8b61z9px7 .statediagram-note .nodeLabel{color:#333;}#mermaid-f8b61z9px7 .statediagram .edgeLabel{color:red;}#mermaid-f8b61z9px7 #dependencyStart,#mermaid-f8b61z9px7 #dependencyEnd{fill:#999;stroke:#999;stroke-width:1;}#mermaid-f8b61z9px7 .statediagramTitleText{text-anchor:middle;font-size:18px;fill:#333;}#mermaid-f8b61z9px7 :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}Component mountsuseEffect triggersText fully renderedsetShowButton(true)User clicks EnteronEnter() callbackInitializingAnimatingAnimationCompleteButtonVisibleDismisseduseState: textTypewriter effect at 30ms/charuseState: showButtonFade-in transition
```

**Sources:** [frontend/src/components/LandingOverlay.jsx L3-L6](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L3-L6)

 [frontend/src/components/LandingOverlay.jsx L8-L19](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L8-L19)

### Typewriter Animation Implementation

The component uses `useEffect` with `setInterval` to create a typewriter effect:

```mermaid
flowchart TD

Mount["Component Mount"]
Effect["useEffect Hook"]
Interval["setInterval(30ms)"]
Slice["setText(fullText.slice(0, i))"]
Increment["i++"]
Check["i > length?"]
Clear["clearInterval"]
Button["setShowButton(true)"]
Cleanup["return () => clearInterval"]

Mount -.->|"Cleanup"| Effect
Effect -.-> Interval
Interval -.->|"No"| Slice
Slice -.->|"Yes"| Increment
Increment -.-> Check
Check -.-> Slice
Check -.-> Clear
Clear -.-> Button
Effect -.-> Cleanup
```

The full animation text is defined as a constant: [frontend/src/components/LandingOverlay.jsx L5](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L5-L5)

```
">> SYSTEM_INITIALIZING...\n>> CONNECTING_TO_STACKS_TESTNET...\n>> ESTABLISHING_SECURE_LINK...\n>> ACCESSING_ARENA_PROTOCOL..."
```

Animation parameters:

* **Character interval:** 30 milliseconds per character
* **Button fade-in:** 1000ms CSS transition after text completion
* **Cleanup:** `clearInterval` called on unmount to prevent memory leaks

**Sources:** [frontend/src/components/LandingOverlay.jsx L8-L19](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L8-L19)

 [frontend/src/components/LandingOverlay.jsx L38](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L38-L38)

### Visual Structure and Styling

The overlay implements a terminal-inspired design with the following layout hierarchy:

```mermaid
flowchart TD

Root["Fixed full-screen container<br>bg-[#050505]"]
Container["Max-width card<br>border + backdrop-blur"]
Header["Terminal header<br>Version + traffic lights"]
TextArea["Animation display area<br>min-h-[120px] + cursor"]
Content["Content section<br>Fade-in after animation"]
Lobster["Lobster emoji<br>animate-bounce"]
Title["ARENA_CHAMPION<br>gradient text"]
Description["Mission description<br>gray-400"]
Button["[ ENTER_ARENA ]<br>purple-600 + hover effects"]
Links["External links<br>Stacks Network"]
Footer["Bottom badge<br>SECURE_CONNECTION"]

Root -.-> Container
Container -.-> Header
Container -.-> TextArea
Container -.-> Content
Content -.-> Lobster
Content -.-> Title
Content -.-> Description
Content -.-> Button
Content -.-> Links
Root -.-> Footer
```

Key styling features:

* **Font family:** `font-mono` applied to entire overlay
* **Terminal header:** Simulated window controls at [frontend/src/components/LandingOverlay.jsx L26-L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L26-L30)
* **Animated cursor:** Pulsing underscore using `animate-pulse` class
* **Gradient text:** Applied to title using Tailwind gradient utilities
* **Shadow effects:** Purple glow on button using `shadow-[0_0_20px_rgba(147,51,234,0.3)]`

**Sources:** [frontend/src/components/LandingOverlay.jsx L22-L74](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L22-L74)

---

## DocsModal Component

### Modal State Management and Props

The `DocsModal` component implements a full-screen documentation overlay with the following interface:

| Prop | Type | Purpose |
| --- | --- | --- |
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Callback to dismiss modal |

Early return pattern for conditional rendering: [frontend/src/components/DocsModal.jsx L5](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L5-L5)

```
if (!isOpen) return null;
```

**Sources:** [frontend/src/components/DocsModal.jsx L4-L5](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L4-L5)

### Content Structure and Sections

The modal organizes documentation into three primary sections with distinct visual styling:

```mermaid
flowchart TD

Modal["DocsModal<br>z-[200] overlay"]
Header["Header bar<br>SYSTEM_MANUAL_V1.0"]
Scroll["Scrollable content area<br>custom-scrollbar"]
Icon1["Terminal icon"]
Title["System version"]
Close["X button"]
Mission["MISSION_BRIEF<br>BookOpen icon + green accent"]
Protocols["GAME_PROTOCOLS<br>Calculator icon + blue accent"]
Integration["AGENT_INTEGRATION<br>Code icon + purple accent"]
MissionContent["Platform overview<br>Key features list<br>Human advantage callout"]
RPS["Rock-Paper-Scissors card"]
Dice["Dice Roll card"]
Coin["Coin Flip card"]
CodeBlock["JavaScript example<br>Event listening & contract calls"]
Link["Full documentation link"]

Modal -.-> Header
Modal -.-> Scroll
Header -.-> Icon1
Header -.-> Title
Header -.-> Close
Scroll -.-> Mission
Scroll -.-> Protocols
Scroll -.-> Integration
Mission -.-> MissionContent
Protocols -.-> RPS
Protocols -.-> Dice
Protocols -.-> Coin
Integration -.-> CodeBlock
Integration -.-> Link
```

**Sources:** [frontend/src/components/DocsModal.jsx L8-L122](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L8-L122)

### Game Protocols Documentation

The `GAME_PROTOCOLS` section displays game rules in a responsive grid layout using Tailwind's `grid-cols-1 md:grid-cols-3` pattern. Each game card includes:

| Element | Implementation |
| --- | --- |
| Icon | Emoji character (✊, 🎲, 🪙) |
| Title | Bold game name |
| Description | Rules explanation in `text-xs` |
| Hover effect | Border color transition to `blue-500/30` |

**Key messaging highlights:**

* Rock-Paper-Scissors: AI pattern analysis mentioned at [frontend/src/components/DocsModal.jsx L57](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L57-L57)
* Dice Roll: "If you roll same as AI, YOU WIN" emphasized
* Coin Flip: Pattern detection in user choices

**Sources:** [frontend/src/components/DocsModal.jsx L47-L75](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L47-L75)

### Agent Integration Code Example

The modal includes a live code example demonstrating how developers can integrate with the arena platform. The code block structure:

```mermaid
flowchart TD

Container["Code section<br>bg-[#0a0a1a] + purple border"]
Comment["JavaScript comment<br>text-blue-300"]
Pre["pre element<br>font-mono text-xs"]
Link["Documentation link<br>text-purple-400 underline"]
Listen["watchEvent example"]
Accept["acceptMatch call"]
Play["playMove call"]

Container -.-> Comment
Container -.-> Pre
Container -.-> Link
Pre -.-> Listen
Pre -.-> Accept
Pre -.-> Play
```

The example code demonstrates three key integration steps:

1. **Event watching:** Using `client.watchEvent()` to detect `MatchProposed` events
2. **Match acceptance:** Calling `acceptMatch` with `matchId` and `wagerAmount`
3. **Move submission:** Invoking `playMove` with `matchId` and `move` parameters

External documentation link target: `/ARENA_SKILL.md` [frontend/src/components/DocsModal.jsx L111](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L111-L111)

**Sources:** [frontend/src/components/DocsModal.jsx L78-L118](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L78-L118)

### Styling and Accessibility

Modal accessibility features:

* **Z-index:** Set to `200` to ensure overlay priority
* **Backdrop:** `bg-black/80 backdrop-blur-sm` for visual separation
* **Scrolling:** Custom scrollbar styling via `custom-scrollbar` class
* **Close button:** Keyboard-accessible with hover state transitions
* **Height constraint:** Fixed to `80vh` to prevent overflow on small screens

**Sources:** [frontend/src/components/DocsModal.jsx L8-L9](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L8-L9)

---

## Hall of Fame Display

### Component Location and Context

The Hall of Fame is not a separate component file but rather an inline section within the `ArenaGame` component, rendered conditionally when `activeTab === 'social'`. The implementation exists in the main game file as part of the tab navigation system.

```mermaid
flowchart TD

ArenaGame["ArenaGame Component"]
TabContainer["Tab navigation system"]
ActiveTab["activeTab state"]
MyMatches["activeTab === 'matches'"]
Social["activeTab === 'social'"]
HoFHeader["Header with trophy icon<br>HALL_OF_FAME title"]
FilterCheck["Completed matches exist?"]
Empty["NO_CHAMPIONS_YET message"]
List["Match list rendering"]
MatchCard["Individual match card"]
Icon["Game type icon"]
Details["Match details<br>ID, winner, status"]
Payout["Prize display<br>+X.XX STX"]

ArenaGame -.-> TabContainer
TabContainer -.-> ActiveTab
ActiveTab -.-> MyMatches
ActiveTab -.-> Social
Social -.-> HoFHeader
Social -.-> FilterCheck
FilterCheck -.->|"No"| Empty
FilterCheck -.->|"Yes"| List
List -.-> MatchCard
MatchCard -.-> Icon
MatchCard -.-> Details
MatchCard -.-> Payout
```

**Sources:** [temp_snippet.txt L1-L44](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt#L1-L44)

### Data Filtering and Match Display

The Hall of Fame filters matches using array methods to show only completed games:

```javascript
matches.filter(m => m.status === 'Completed')
```

Match card rendering logic:

| Data Point | Source | Display Format |
| --- | --- | --- |
| Match ID | `m.id` | `#${m.id}` in purple-400 |
| Winner address | `m.winner.value |  |
| Game type | `GAME_TYPES.find(gt => gt.id === m.gameType)?.icon` | Emoji icon |
| Payout | `m.wager * 1.96 / 1000000` | `+X.XX STX` in green-500 |
| Status | Derived from winner type | `CHALLENGER_VICTORY` or `OPPONENT_VICTORY` |

**Sources:** [temp_snippet.txt L10-L42](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt#L10-L42)

### User Context Detection

The component detects if the current user participated in a match by comparing wallet addresses:

```mermaid
flowchart TD

Check["Address comparison"]
Current["userData?.profile?.stxAddress?.testnet"]
Challenger["m.challenger"]
Opponent["m.opponent"]
Compare1["=== challenger?"]
Compare2["=== opponent?"]
IsMe["isMe = true"]
NotMe["Continue check"]
Winner["isMe && winner === user?"]
YouLabel["Display: 'YOU'"]
TruncLabel["Display: truncated address"]

Check -.-> Current
Current -.->|"Yes"| Compare1
Current -.->|"No"| Compare2
Compare1 -.->|"Yes"| IsMe
Compare2 -.->|"No"| IsMe
Compare1 -.-> NotMe
Compare2 -.-> NotMe
IsMe -.->|"Yes"| Winner
Winner -.->|"No"| YouLabel
Winner -.-> TruncLabel
```

Winner label logic at [temp_snippet.txt L14](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt#L14-L14)

:

* If user is participant AND winner: Display "YOU" in `text-green-400`
* Otherwise: Display truncated address `${winnerAddr.slice(0, 4)}...${winnerAddr.slice(-4)}`

**Sources:** [temp_snippet.txt L14-L28](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt#L14-L28)

### Visual Hierarchy and Styling

Each completed match is rendered as a card with the following structure:

```mermaid
flowchart TD

Card["Match card container<br>bg-white/5 border"]
Left["Left section<br>Icon + details"]
Right["Right section<br>Payout info"]
GameIcon["Game type emoji<br>text-xl opacity-80"]
MatchInfo["Match information block"]
TopLine["Match ID + Winner label<br>text-[10px] font-black"]
BottomLine["Victory type<br>text-[8px] uppercase"]
Amount["Payout amount<br>text-[10px] text-green-500"]
Confirmed["PAYOUT_CONFIRMED<br>text-[7px] text-gray-600"]
HoverState["border-purple-500/30"]

Card -.-> Left
Card -.->|"Hover"| Right
Left -.-> GameIcon
Left -.-> MatchInfo
MatchInfo -.-> TopLine
MatchInfo -.-> BottomLine
Right -.-> Amount
Right -.-> Confirmed
Card -.-> HoverState
```

**Card styling features:**

* **Border transition:** `group hover:border-purple-500/30 transition-all`
* **Payout calculation:** `(m.wager * 1.96 / 1000000).toFixed(2)` represents 98% prize distribution
* **Typography scale:** Ultra-small font sizes (`text-[7px]`, `text-[8px]`, `text-[10px]`) for compact display
* **Color coding:** Green for payouts, purple for match IDs, gray for metadata

**Empty state:** When no completed matches exist, displays centered message: `"NO_CHAMPIONS_YET"` in `text-[10px] text-gray-600 font-bold uppercase tracking-widest`

**Sources:** [temp_snippet.txt L10-L42](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt#L10-L42)

---

## Component Integration Patterns

### LandingOverlay Integration

The `LandingOverlay` is controlled by a boolean state in the parent component:

```mermaid
sequenceDiagram
  participant p1 as App Component
  participant p2 as showLanding state
  participant p3 as LandingOverlay
  participant p4 as ArenaGame

  p1->>p2: Initialize showLanding = true
  p1->>p3: Render with onEnter prop
  p3->>p3: Animate typewriter
  p3->>p3: Show button after completion
  note over p3: User clicks [ ENTER_ARENA ]
  p3->>p2: Call onEnter callback
  p2->>p2: setShowLanding(false)
  p1->>p4: Render ArenaGame
  note over p3,p4: Landing unmounts, game UI visible
```

**Integration pattern:** Single-use dismissible overlay that conditionally renders the main application.

**Sources:** [frontend/src/components/LandingOverlay.jsx L3](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L3-L3)

 [frontend/src/components/LandingOverlay.jsx L52](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L52-L52)

### DocsModal Toggle Integration

The documentation modal is toggled via state in `ArenaGame`:

```mermaid
flowchart TD

Button["Help button<br>in Navigation"]
State["showDocs state<br>in ArenaGame"]
Modal["DocsModal component"]
Toggle["setShowDocs(!showDocs)"]
Render["Modal visible"]
Hide["Modal returns null"]

Button -.->|"Click"| Toggle
Toggle -.-> State
State -.->|"onClose callback"| Modal
Modal -.->|"isOpen prop"| State
State -.->|"true"| Render
State -.->|"false"| Hide
```

**Props flow:**

* `isOpen={showDocs}` controls visibility
* `onClose={() => setShowDocs(false)}` handles dismissal via X button or overlay click

**Sources:** [frontend/src/components/DocsModal.jsx L4](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L4-L4)

### Hall of Fame Data Dependencies

The Hall of Fame display depends on several data sources from the `ArenaGame` component:

| Dependency | Type | Usage |
| --- | --- | --- |
| `matches` | `Array<Match>` | Source data filtered for completed matches |
| `userData` | `Object` | Current user address for "YOU" detection |
| `GAME_TYPES` | `Array<GameType>` | Maps game type ID to emoji icon |
| `activeTab` | `string` | Controls visibility when set to 'social' |

**Data transformation pipeline:**

```
matches → filter(status === 'Completed') → map(match card) → render
```

**Sources:** [temp_snippet.txt L10-L14](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt#L10-L14)

 [temp_snippet.txt L21](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt#L21-L21)

---

## Summary of UI Component Responsibilities

The three UI components serve distinct roles in the user experience flow:

1. **LandingOverlay:** One-time entry animation that establishes the terminal aesthetic and provides a dramatic entrance to the platform. Implements typewriter effect and dismisses via callback.
2. **DocsModal:** On-demand reference documentation that explains game rules, platform features, and provides API integration examples. Toggled from main interface and implements scrollable content with code examples.
3. **Hall of Fame:** Embedded social feature that displays completed match history with winner information and payout amounts. Filters match data and provides user context awareness for personalized display.

All three components use consistent monospace typography, terminal-inspired styling, and minimal color palettes (purple, green accents on dark backgrounds) to maintain visual coherence with the overall platform aesthetic.

**Sources:** [frontend/src/components/LandingOverlay.jsx L1-L79](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/LandingOverlay.jsx#L1-L79)

 [frontend/src/components/DocsModal.jsx L1-L127](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx#L1-L127)

 [temp_snippet.txt L1-L44](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt#L1-L44)

---

# Frontend-Build-and-Configuration

# Frontend Build and Configuration

> **Relevant source files**
> * [frontend/package-lock.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package-lock.json)
> * [frontend/package.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json)
> * [frontend/vite.config.js](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js)

This document describes the frontend build system, its configuration, dependencies, and the development pipeline. The frontend uses **Vite** as its build tool with React 19 and Tailwind CSS 4. This page focuses specifically on build tooling and configuration; for information about frontend components and UI structure, see [Frontend Application](/HACK3R-CRYPTO/GameArenaStacks/2-frontend-application), and for transaction management patterns, see [Transaction Management and State Polling](/HACK3R-CRYPTO/GameArenaStacks/2.5-transaction-management-and-state-polling).

## Overview

The frontend is configured as an ES module-based React application built with Vite 7.2.4. The build system includes special provisions for browser compatibility with blockchain libraries that require Node.js polyfills.

**Sources:** [frontend/package.json L1-L37](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L1-L37)

 [frontend/vite.config.js L1-L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L1-L24)

---

## Build Tool Architecture

```mermaid
flowchart TD

DevCmd["npm run dev"]
BuildCmd["npm run build"]
PreviewCmd["npm run preview"]
ViteServer["Vite Dev Server<br>Port 5173"]
ViteBuild["Vite Build<br>Rollup-based"]
VitePreview["Vite Preview Server"]
ReactPlugin["@vitejs/plugin-react<br>v5.1.1"]
TailwindCSS["@tailwindcss/postcss<br>v4.1.18"]
PostCSS["postcss<br>v8.5.6"]
Autoprefixer["autoprefixer<br>v10.4.23"]
JSX["JSX/JS Files<br>React Components"]
CSS["CSS Files<br>Tailwind Directives"]
Assets["Static Assets"]
BufferPolyfill["buffer v6.0.3"]
ProcessPolyfill["process v0.11.10"]
GlobalPolyfill["global → globalThis"]
DevBundle["HMR Bundle<br>Memory"]
ProdBundle["dist/<br>Optimized Bundle"]

DevCmd -.-> ViteServer
BuildCmd -.-> ViteBuild
PreviewCmd -.-> VitePreview
ViteServer -.-> ReactPlugin
ViteBuild -.-> ReactPlugin
ReactPlugin -.-> JSX
ViteServer -.-> TailwindCSS
ViteBuild -.-> TailwindCSS
Autoprefixer -.-> CSS
ViteServer -.-> BufferPolyfill
ViteServer -.-> ProcessPolyfill
ViteServer -.-> GlobalPolyfill
ViteBuild -.-> BufferPolyfill
ViteBuild -.-> ProcessPolyfill
ViteBuild -.-> GlobalPolyfill
JSX -.-> ViteServer
CSS -.-> ViteServer
Assets -.-> ViteServer
JSX -.-> ViteBuild
CSS -.-> ViteBuild
Assets -.-> ViteBuild
ViteServer -.-> DevBundle
ViteBuild -.-> ProdBundle

subgraph Output ["Output"]
    DevBundle
    ProdBundle
end

subgraph subGraph4 ["Polyfills & Aliases"]
    BufferPolyfill
    ProcessPolyfill
    GlobalPolyfill
end

subgraph subGraph3 ["Source Files"]
    JSX
    CSS
    Assets
end

subgraph subGraph2 ["Plugins & Processors"]
    ReactPlugin
    TailwindCSS
    PostCSS
    Autoprefixer
    TailwindCSS -.-> PostCSS
    PostCSS -.-> Autoprefixer
end

subgraph subGraph1 ["Vite Core"]
    ViteServer
    ViteBuild
    VitePreview
end

subgraph subGraph0 ["Entry Points"]
    DevCmd
    BuildCmd
    PreviewCmd
end
```

The build system uses **Vite 7.2.4** as the primary build tool, which provides:

* Fast development server with Hot Module Replacement (HMR)
* Rollup-based production builds with automatic code splitting
* Native ES module support in development
* Optimized bundling for production

**Sources:** [frontend/package.json L6-L10](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L6-L10)

 [frontend/vite.config.js L1-L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L1-L24)

---

## Dependency Categories

The frontend has a clearly stratified dependency structure organized by functional category:

| Category | Key Packages | Version | Purpose |
| --- | --- | --- | --- |
| **Build Tool** | vite | 7.2.4 | Development server and bundler |
| **UI Framework** | react, react-dom | 19.2.0 | Component-based UI library |
| **Routing** | react-router-dom | 7.12.0 | Client-side navigation |
| **Styling** | tailwindcss, @tailwindcss/postcss | 4.1.18 | Utility-first CSS framework |
| **Blockchain** | @stacks/connect, @stacks/transactions, @stacks/network, @stacks/common | 6.13.0 - 7.8.3 | Stacks blockchain integration |
| **HTTP/Payments** | axios, x402-stacks | 1.13.5, 2.0.1 | HTTP client and x402 protocol |
| **UI Components** | lucide-react, react-hot-toast | 0.564.0, 2.6.0 | Icons and notifications |
| **Node Polyfills** | buffer, process | 6.0.3, 0.11.10 | Browser compatibility for blockchain libs |
| **Linting** | eslint, eslint-plugin-react | 9.39.1, 7.37.0 | Code quality enforcement |

**Sources:** [frontend/package.json L12-L26](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L12-L26)

 [frontend/package.json L28-L35](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L28-L35)

---

## Dependency Graph

```mermaid
flowchart TD

App["React Application<br>react 19.2.0<br>react-dom 19.2.0"]
Router["react-router-dom<br>v7.12.0"]
Toast["react-hot-toast<br>v2.6.0"]
Icons["lucide-react<br>v0.564.0"]
StacksConnect["@stacks/connect<br>v7.8.3"]
StacksTx["@stacks/transactions<br>v6.13.0"]
StacksNet["@stacks/network<br>v6.13.0"]
StacksCommon["@stacks/common<br>v6.13.0"]
X402["x402-stacks<br>v2.0.1"]
Axios["axios<br>v1.13.5"]
Buffer["buffer<br>v6.0.3"]
Process["process<br>v0.11.10"]
Tailwind["tailwindcss<br>v4.1.18"]
TailwindPostCSS["@tailwindcss/postcss<br>v4.1.18"]

App -.-> StacksConnect
App -.-> StacksTx
App -.-> X402
X402 -.-> Axios
App -.-> Axios
StacksCommon -.-> Buffer
StacksTx -.-> Buffer
StacksConnect -.-> Process
App -.-> Tailwind

subgraph subGraph4 ["Styling Layer"]
    Tailwind
    TailwindPostCSS
    Tailwind -.-> TailwindPostCSS
end

subgraph subGraph3 ["Node.js Compatibility Layer"]
    Buffer
    Process
end

subgraph subGraph2 ["HTTP & Communication"]
    Axios
end

subgraph subGraph1 ["Blockchain Integration Layer"]
    StacksConnect
    StacksTx
    StacksNet
    StacksCommon
    X402
    StacksConnect -.-> StacksNet
    StacksConnect -.-> StacksCommon
    StacksTx -.-> StacksNet
    StacksTx -.-> StacksCommon
    StacksNet -.-> StacksCommon
end

subgraph subGraph0 ["Application Layer"]
    App
    Router
    Toast
    Icons
    App -.-> Router
    App -.-> Toast
    App -.-> Icons
end
```

**Dependencies are organized in layers**:

1. **Application Layer**: Core React framework and UI utilities
2. **Blockchain Integration Layer**: Stacks SDK packages for wallet and transaction management
3. **HTTP & Communication**: HTTP client for agent interaction
4. **Node.js Compatibility Layer**: Polyfills enabling blockchain libraries in browser
5. **Styling Layer**: Tailwind CSS infrastructure

**Sources:** [frontend/package.json L12-L26](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L12-L26)

---

## Vite Configuration Details

The [frontend/vite.config.js L1-L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L1-L24)

 file contains critical browser compatibility configurations:

### Plugin Configuration

```yaml
plugins: [react()]
```

The `@vitejs/plugin-react` plugin enables:

* Fast Refresh for React components
* JSX transformation
* React DevTools integration

**Sources:** [frontend/vite.config.js L6](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L6-L6)

### Global Polyfills

```
define: {
  'global': 'globalThis',
  'process.env': {},
}
```

These definitions provide browser compatibility for blockchain libraries:

* **`global → globalThis`**: Maps Node.js `global` to browser `globalThis`
* **`process.env → {}`**: Provides empty environment object

**Sources:** [frontend/vite.config.js L7-L10](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L7-L10)

### Module Resolution Aliases

```yaml
resolve: {
  alias: {
    buffer: 'buffer',
    process: 'process/browser',
  },
}
```

Module aliases redirect Node.js core modules to browser-compatible polyfills:

* **`buffer`**: Resolves to `buffer` package (v6.0.3)
* **`process`**: Resolves to `process/browser` from `process` package (v0.11.10)

**Sources:** [frontend/vite.config.js L11-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L11-L16)

### ESBuild Optimization

```yaml
optimizeDeps: {
  esbuildOptions: {
    define: {
      global: 'globalThis'
    },
  },
}
```

This ensures pre-bundled dependencies also use `globalThis` instead of `global`, providing consistent polyfill behavior across all dependencies.

**Sources:** [frontend/vite.config.js L17-L23](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L17-L23)

---

## Browser Compatibility Layer

```mermaid
flowchart TD

SDK1["@stacks/transactions<br>requires: buffer"]
SDK2["@stacks/connect<br>requires: process"]
SDK3["@stacks/common<br>requires: global"]
Alias["resolve.alias"]
Define["define"]
OptimizeDeps["optimizeDeps"]
BufferPkg["buffer package<br>v6.0.3"]
ProcessPkg["process/browser<br>v0.11.10"]
GlobalShim["global → globalThis"]
Browser["Browser Environment<br>window, globalThis"]

SDK1 -.-> Alias
SDK2 -.-> Alias
SDK3 -.-> Define
Alias -.-> BufferPkg
Alias -.-> ProcessPkg
Define -.-> GlobalShim
OptimizeDeps -.-> GlobalShim
BufferPkg -.-> Browser
ProcessPkg -.-> Browser
GlobalShim -.-> Browser

subgraph subGraph3 ["Browser Runtime"]
    Browser
end

subgraph subGraph2 ["Browser Polyfills"]
    BufferPkg
    ProcessPkg
    GlobalShim
end

subgraph subGraph1 ["Vite Configuration"]
    Alias
    Define
    OptimizeDeps
end

subgraph subGraph0 ["Stacks SDK Requirements"]
    SDK1
    SDK2
    SDK3
end
```

The Stacks blockchain SDKs (`@stacks/transactions`, `@stacks/connect`, `@stacks/common`) were originally designed for Node.js environments and expect Node.js globals (`buffer`, `process`, `global`). The Vite configuration bridges this gap:

1. **Module Aliasing**: Redirects `buffer` and `process` imports to browser-compatible polyfill packages
2. **Global Definition**: Maps `global` to browser's `globalThis`
3. **Process Environment**: Provides empty `process.env` object
4. **Dependency Pre-bundling**: Applies polyfills during Vite's dependency optimization phase

**Sources:** [frontend/vite.config.js L7-L23](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L7-L23)

 [frontend/package.json L19-L20](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L19-L20)

---

## Build Scripts

The [frontend/package.json L6-L10](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L6-L10)

 defines four npm scripts:

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Start development server with HMR on port 5173 |
| `build` | `vite build` | Create optimized production bundle in `dist/` |
| `lint` | `eslint .` | Run ESLint on all source files |
| `preview` | `vite preview` | Preview production build locally |

### Development Workflow

```mermaid
sequenceDiagram
  participant p1 as Developer
  participant p2 as npm run dev
  participant p3 as Vite Dev Server
  participant p4 as Browser

  p1->>p2: Execute npm run dev
  p2->>p3: Start server
  p3->>p3: Apply polyfills<br/>Load plugins
  p3->>p3: Process JSX/CSS
  p3-->>p4: Serve at localhost:5173
  p4->>p3: Request modules
  p3-->>p4: ES modules + HMR
  p1->>p1: Edit source file
  p3->>p3: Detect change
  p3->>p4: HMR update
  p4->>p4: Hot replace module
```

**Development Mode Features**:

* **Hot Module Replacement (HMR)**: Changes reflect instantly without full page reload
* **Fast Startup**: Vite only transforms modules on-demand
* **Native ES Modules**: Browser imports modules directly during development
* **Source Maps**: Full source map support for debugging

**Sources:** [frontend/package.json L7](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L7-L7)

---

## Production Build Process

```mermaid
flowchart TD

Source["Source Files<br>JSX, CSS, Assets"]
Config["vite.config.js"]
Deps["node_modules"]
Parse["Parse & Transform<br>JSX → JS"]
Resolve["Resolve Imports<br>Apply Aliases"]
Polyfill["Inject Polyfills<br>buffer, process, global"]
CSS["Process CSS<br>Tailwind + PostCSS"]
Bundle["Rollup Bundling<br>Code Splitting"]
Optimize["Optimize<br>Minify, Tree-shake"]
HTML["index.html"]
JS["Chunked JS Files<br>main.js, vendor.js"]
CSSOut["Compiled CSS"]
AssetsOut["Static Assets<br>Hashed Filenames"]

Source -.-> Parse
Config -.-> Parse
Deps -.-> Parse
Optimize -.->|"references"| HTML
Optimize -.->|"references"| JS
Optimize -.->|"references"| CSSOut
Optimize -.-> AssetsOut

subgraph subGraph2 ["Build Outputs"]
    HTML
    JS
    CSSOut
    AssetsOut
    HTML -.-> JS
    HTML -.-> CSSOut
    HTML -.-> AssetsOut
end

subgraph subGraph1 ["Vite Build Pipeline"]
    Parse
    Resolve
    Polyfill
    CSS
    Bundle
    Optimize
    Parse -.-> Resolve
    Resolve -.-> Polyfill
    Polyfill -.-> CSS
    CSS -.-> Bundle
    Bundle -.-> Optimize
end

subgraph subGraph0 ["Build Inputs"]
    Source
    Config
    Deps
end
```

### Build Command Execution

Running `npm run build` performs:

1. **Transformation**: JSX/TSX files transformed to JavaScript
2. **Polyfill Injection**: Node.js polyfills injected per configuration
3. **CSS Processing**: Tailwind CSS compiled and purged
4. **Bundling**: Rollup creates optimized chunks with code splitting
5. **Minification**: JavaScript and CSS minified
6. **Tree Shaking**: Unused code eliminated
7. **Asset Hashing**: Static assets receive content hashes for caching

**Output Location**: All production files are written to `dist/` directory.

**Sources:** [frontend/package.json L8](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L8-L8)

 [frontend/vite.config.js L1-L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L1-L24)

---

## ESLint Configuration

The project uses ESLint 9.39.1 with React-specific rules via `eslint-plugin-react` 7.37.0. Running `npm run lint` performs static code analysis to enforce code quality standards.

**Sources:** [frontend/package.json L9](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L9-L9)

 [frontend/package.json L31-L32](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L31-L32)

---

## Key Version Specifications

### React 19.2.0

The frontend uses the latest React 19 with concurrent features and improved server component support. This version requires `react-dom` 19.2.0 for browser rendering.

**Sources:** [frontend/package.json L22-L23](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L22-L23)

### Stacks SDK 6.13.0 - 7.8.3

The Stacks packages use mixed versions:

* `@stacks/connect`: v7.8.3 (latest wallet integration)
* `@stacks/transactions`: v6.13.0 (transaction construction)
* `@stacks/network`: v6.13.0 (network utilities)
* `@stacks/common`: v6.13.0 (shared utilities)

The `@stacks/connect` package at v7.8.3 internally depends on compatible versions of other packages through its own dependency tree.

**Sources:** [frontend/package.json L13-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L13-L16)

### x402-stacks 2.0.1

The `x402-stacks` package provides client-side HTTP 402 payment protocol implementation. This version matches the agent's x402 middleware version, ensuring protocol compatibility.

**Sources:** [frontend/package.json L26](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L26-L26)

---

## Module System Configuration

The [frontend/package.json L5](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L5-L5)

 specifies `"type": "module"`, making the entire package an ES module. This configuration:

* Enables top-level `import`/`export` syntax
* Makes `.js` files treated as ES modules by default
* Aligns with Vite's native ES module handling
* Requires explicit `.cjs` extension for CommonJS files

**Sources:** [frontend/package.json L5](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L5-L5)

---

## Build Output Structure

After running `npm run build`, the `dist/` directory contains:

```
dist/
├── index.html          (Entry HTML with hashed script references)
├── assets/
│   ├── index-[hash].js    (Main application bundle)
│   ├── vendor-[hash].js   (Third-party dependencies)
│   ├── index-[hash].css   (Compiled Tailwind CSS)
│   └── [asset]-[hash].*   (Static assets with content hashing)
```

The production bundle includes:

* **Code Splitting**: Vendor libraries separated from application code
* **Content Hashing**: Asset filenames include content hashes for cache busting
* **Minification**: All JavaScript and CSS minified
* **Source Maps**: Optional source maps for production debugging (not enabled by default)

**Sources:** [frontend/package.json L8](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L8-L8)

---

# Transaction-Management-and-State-Polling

# Transaction Management and State Polling

> **Relevant source files**
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

## Purpose and Scope

This document describes the frontend's transaction management system and state synchronization mechanisms. It covers how the application tracks pending blockchain transactions, implements efficient polling strategies to monitor transaction confirmation, and maintains consistency between the UI and on-chain state. The system implements a **BitSubs-inspired pattern** that minimizes RPC calls while ensuring responsive updates.

For wallet integration and transaction signing, see [Wallet Integration and Navigation](/HACK3R-CRYPTO/GameArenaStacks/2.2-wallet-integration-and-navigation). For multi-node failover strategies, see [Multi-Node Failover and Reliability](/HACK3R-CRYPTO/GameArenaStacks/6.1-multi-node-failover-and-reliability). For the complete match state lifecycle, see [Match Lifecycle and State Management](/HACK3R-CRYPTO/GameArenaStacks/9-match-lifecycle-and-state-management).

---

## Transaction State Management

### Pending Transaction Tracking

The frontend maintains a `pendingTxs` state object that tracks all in-flight transactions by match ID:

```yaml
// State structure
pendingTxs: {
  [matchId: string]: {
    type: 'proposal' | 'user' | 'agent',
    txId: string
  }
}
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L101-L101)

This centralized tracking enables the UI to display transaction status indicators and trigger targeted polling for confirmation. When transactions are initiated through `openContractCall` or `openSTXTransfer`, their `txId` values are captured in the `onFinish` callbacks and stored in this state.

### Transaction Recording Points

| Action | Recording Location | Type Value |
| --- | --- | --- |
| Match Proposal | `handleProposeMatch` onFinish callback | `'proposal'` |
| User Move | `handlePlayMove` onFinish callback | `'user'` |
| Agent Move Response | `triggerAgentMove` response handler | `'agent'` |

**Sources**: [frontend/src/pages/ArenaGame.jsx L332](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L332-L332)

 [frontend/src/pages/ArenaGame.jsx L465](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L465-L465)

 [frontend/src/pages/ArenaGame.jsx L408](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L408-L408)

---

## Polling Architecture: Two-Tier Strategy

### Two-Tier Polling Strategy

```mermaid
flowchart TD

GenInterval["setInterval(60000)"]
FetchBalance["fetchBalance()"]
FetchMatches["fetchMatches()"]
TxInterval["setInterval(5000)"]
PendingCheck["Check pendingTxs Object"]
TxQuery["Hiro API: /extended/v1/tx/{txId}"]
StatusCheck["tx_status?"]
Cleanup["Remove from pendingTxs"]
RefreshState["fetchMatches() + fetchBalance()"]
UIRender["UI Re-render"]

FetchMatches -.-> UIRender
RefreshState -.-> UIRender

subgraph subGraph2 ["State Updates"]
    UIRender
end

subgraph subGraph1 ["Tier 2: Targeted Transaction Polling (5s interval)"]
    TxInterval
    PendingCheck
    TxQuery
    StatusCheck
    Cleanup
    RefreshState
    TxInterval -.->|"pending"| PendingCheck
    PendingCheck -.-> TxQuery
    TxQuery -.->|"success"| StatusCheck
    StatusCheck -.->|"abort_by_response"| Cleanup
    StatusCheck -.-> Cleanup
    StatusCheck -.-> TxInterval
    Cleanup -.-> RefreshState
end

subgraph subGraph0 ["Tier 1: General State Polling (60s interval)"]
    GenInterval
    FetchBalance
    FetchMatches
    GenInterval -.-> FetchBalance
    GenInterval -.-> FetchMatches
end
```

**Tier 1: General State Polling** runs every 60 seconds and queries the full match list and user balance. This provides a baseline synchronization with on-chain state and captures changes from other users or agents.

**Tier 2: Targeted Transaction Polling** (BitSubs pattern) runs every 5 seconds but **only for matches with pending transactions**. This aggressive polling is scoped to minimize RPC load while ensuring rapid confirmation feedback.

**Sources**: [frontend/src/pages/ArenaGame.jsx L242-L254](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L242-L254)

 [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

---

## BitSubs Pattern Implementation

### Targeted Transaction Polling

```mermaid
sequenceDiagram
  participant p1 as User Action
  participant p2 as pendingTxs State
  participant p3 as useEffect Hook
  participant p4 as Hiro TX API
  participant p5 as Toast Notifications

  p1->>p2: "Add txId to pendingTxs[matchId]"
  p2->>p3: "Dependency triggers re-render"
  loop "Every 5s while pendingTxs not empty"
    p3->>p3: "Extract Object.keys(pendingTxs)"
    p3->>p4: "GET /extended/v1/tx/{txId}"
    p4-->>p3: "{tx_status: 'pending'}"
    note over p3: "Continue polling"
    p3->>p4: "GET /extended/v1/tx/{txId}"
    p4-->>p3: "{tx_status: 'success'}"
    p3->>p5: "toast.success('Transaction Confirmed!')"
    p3->>p2: "delete pendingTxs[matchId]"
    p3->>p1: "fetchMatches() + fetchBalance()"
  end
  note over p3,p4: "Interval cleanup when pendingTxs is empty"
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

### Implementation Details

The BitSubs pattern is implemented using a `useEffect` hook that depends on `pendingTxs`:

```javascript
useEffect(() => {
  const pendingIds = Object.keys(pendingTxs);
  if (pendingIds.length === 0) return;
  
  console.log('📡 Starting Targeted Polling for:', pendingIds);
  
  const txPollInterval = setInterval(async () => {
    for (const matchId of pendingIds) {
      const pending = pendingTxs[matchId];
      if (!pending || !pending.txId) continue;
      
      try {
        const response = await fetchWithTimeout(
          `https://api.testnet.hiro.so/extended/v1/tx/${pending.txId}`
        );
        if (response.ok) {
          const txData = await response.json();
          
          if (txData.tx_status === 'success' || 
              txData.tx_status === 'abort_by_response') {
            // Handle confirmation/failure
            setPendingTxs(prev => {
              const next = { ...prev };
              delete next[matchId];
              return next;
            });
            fetchMatches();
            fetchBalance();
          }
        }
      } catch (e) {
        // Silently ignore network errors during high-frequency polling
      }
    }
  }, 5000);
  
  return () => clearInterval(txPollInterval);
}, [pendingTxs, fetchMatches, fetchBalance]);
```

**Key characteristics**:

* **Conditional activation**: Polling only starts when `pendingIds.length > 0`
* **Auto-cleanup**: Interval is cleared when `pendingTxs` becomes empty
* **Graceful error handling**: Network errors are silently ignored to prevent notification spam
* **State synchronization**: Successful confirmation triggers full state refresh

**Sources**: [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

---

## Multi-Node Resilience in State Queries

### Node Rotation for Read-Only Calls

```mermaid
flowchart TD

Start["callReadOnlyWithRetry(options)"]
NodeArray["STACKS_NODES array"]
Node1["Try: api.testnet.hiro.so"]
Node2["Try: stacks-node-api.testnet.stacks.co"]
Node3["Try: stacks-node-api.testnet.hiro.so"]
Success1["Success?"]
Success2["Success?"]
Success3["Success?"]
Return["Return Result"]
Throw["Throw Last Error"]

Start -.-> NodeArray
NodeArray -.->|"No"| Node1
Node1 -.-> Success1
Success1 -.->|"Yes"| Return
Success1 -.-> Node2
Node2 -.->|"No"| Success2
Success2 -.->|"Yes"| Return
Success2 -.-> Node3
Node3 -.->|"No"| Success3
Success3 -.->|"Yes"| Return
Success3 -.-> Throw
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L27-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L27-L50)

The `callReadOnlyWithRetry` wrapper function iterates through multiple Stacks RPC nodes:

```javascript
const STACKS_NODES = [
  'https://api.testnet.hiro.so',
  'https://stacks-node-api.testnet.stacks.co',
  'https://stacks-node-api.testnet.hiro.so'
];

const callReadOnlyWithRetry = async (options) => {
  let lastError;
  for (const nodeUrl of STACKS_NODES) {
    try {
      const networkWithNode = new StacksTestnet({ url: nodeUrl });
      return await callReadOnlyFunction({
        ...options,
        network: networkWithNode
      });
    } catch (e) {
      console.warn(`Node ${nodeUrl} failed, trying next...`, e);
      lastError = e;
      continue;
    }
  }
  throw lastError;
};
```

This pattern ensures that temporary node failures or rate limiting do not disrupt the UI. All contract queries (`get-match-details`, `get-player-move`, `get-match-count`) use this wrapper.

**Sources**: [frontend/src/pages/ArenaGame.jsx L27-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L27-L50)

### Timeout Protection

The `fetchWithTimeout` utility adds a 5-second timeout to all HTTP requests:

```javascript
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};
```

This prevents hanging requests from blocking the UI thread during high-frequency polling.

**Sources**: [frontend/src/pages/ArenaGame.jsx L14-L25](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L14-L25)

---

## Transaction Lifecycle and State Transitions

### Complete Transaction Flow

```

```

**Sources**: [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

 [frontend/src/pages/ArenaGame.jsx L329-L338](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L329-L338)

### State Synchronization Table

| Event | Pending State Update | UI Update | Data Refresh |
| --- | --- | --- | --- |
| Transaction Initiated | Add to `pendingTxs` | Show "Processing..." badge | None |
| Transaction Pending | No change | Animate status indicator | None (targeted polling continues) |
| Transaction Confirmed | Remove from `pendingTxs` | Show success toast | `fetchMatches()` + `fetchBalance()` |
| Transaction Failed | Remove from `pendingTxs` | Show error toast with reason | `fetchMatches()` (to reflect rejected state) |

**Sources**: [frontend/src/pages/ArenaGame.jsx L274-L289](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L274-L289)

---

## Global State Fetching

### Match Data Retrieval

The `fetchMatches()` function implements a parallel query strategy to minimize latency:

```mermaid
flowchart TD

Start["fetchMatches() called"]
GetCount["Query: get-match-count()"]
CountResult["Result: N matches"]
CalcRange["Calculate: last 30 matches<br>(start = N-1, end = N-30)"]
ParallelQueries["Promise.all([...queries])"]
Q1["get-match-details(N-1)"]
Q2["get-match-details(N-2)"]
Q3["get-match-details(N-3)"]
QN["get-match-details(N-30)"]
ParseMatches["Parse match tuples"]
ParallelMoves["Promise.all([...moveQueries])"]
M1["get-player-move(matchId, challenger)"]
M2["get-player-move(matchId, opponent)"]
UpdateState["setMatches(parsedMatches)"]

Start -.-> GetCount
GetCount -.-> CountResult
CountResult -.-> CalcRange
CalcRange -.-> ParallelQueries
ParallelQueries -.-> Q1
ParallelQueries -.-> Q2
ParallelQueries -.-> Q3
ParallelQueries -.-> QN
Q1 -.-> ParseMatches
Q2 -.-> ParseMatches
Q3 -.-> ParseMatches
QN -.-> ParseMatches
ParseMatches -.-> ParallelMoves
ParallelMoves -.-> M1
ParallelMoves -.-> M2
M1 -.-> UpdateState
M2 -.-> UpdateState

subgraph subGraph1 ["Parallel Move Queries"]
    M1
    M2
end

subgraph subGraph0 ["Parallel Match Queries"]
    Q1
    Q2
    Q3
    QN
end
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L132-L240](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L132-L240)

### Optimization Strategy

1. **Match Count Query**: Single call to `get-match-count()` determines the total number of matches
2. **Batched Detail Queries**: Up to 30 parallel queries for `get-match-details(i)` using `Promise.all`
3. **Conditional Move Queries**: Only fetch moves for matches that have opponents (status > 0)
4. **Error Resilience**: Individual query failures are caught and logged but don't block other queries

This approach reduces total query time from O(60) sequential calls to O(2-3) parallel batches.

**Sources**: [frontend/src/pages/ArenaGame.jsx L150-L231](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L150-L231)

---

## Notification System Integration

### Toast Notification Lifecycle

```mermaid
sequenceDiagram
  participant p1 as Transaction Event
  participant p2 as Polling Hook
  participant p3 as react-hot-toast

  p1->>p3: "toast.loading('Proposing match...')"
  note over p3: "toastId = unique identifier"
  p2->>p2: "Poll tx_status every 5s"
  alt Transaction Success
    p2->>p3: "toast.success('Confirmed!', {id: toastId})"
    note over p3: "Updates existing toast (no duplicate)"
  else Transaction Failure
    p2->>p3: "toast.error('Failed: reason', {id: toastId})"
    note over p3: "Updates existing toast with error"
  end
  note over p3: "Auto-dismiss after 4s"
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L274-L279](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L274-L279)

The notification system uses **toast ID reuse** to update existing notifications rather than spawning duplicates:

```javascript
const toastId = toast.loading('Proposing match on-chain...');

// Later, in polling hook:
if (txData.tx_status === 'success') {
  toast.success(`Transaction Confirmed!`, { id: toastId });
} else {
  toast.error(`Transaction Failed: ${txData.tx_result?.repr || 'Aborted'}`, 
             { id: toastId });
}
```

This creates a seamless user experience where a single notification transitions from "loading" → "success/error".

**Sources**: [frontend/src/pages/ArenaGame.jsx L304](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L304-L304)

 [frontend/src/pages/ArenaGame.jsx L276-L278](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L276-L278)

---

## Performance Characteristics

### Polling Load Analysis

| Scenario | Active Intervals | RPC Calls/Minute | Network Load |
| --- | --- | --- | --- |
| No pending transactions | 1 (60s interval) | ~30-50 calls | Low |
| 1 pending transaction | 2 (60s + 5s intervals) | ~40-60 calls | Medium |
| 3 pending transactions | 2 (60s + 5s intervals) | ~60-80 calls | High |

**Key Optimization**: The targeted polling interval polls **all pending transactions** in a single loop iteration, preventing multiplicative scaling of intervals.

**Sources**: [frontend/src/pages/ArenaGame.jsx L263-L295](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L263-L295)

### Memory Management

The `useEffect` cleanup function ensures that intervals are properly destroyed:

```javascript
return () => clearInterval(txPollInterval);
```

This prevents memory leaks and orphaned intervals when the component unmounts or `pendingTxs` changes.

**Sources**: [frontend/src/pages/ArenaGame.jsx L297](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L297-L297)

---

## Error Handling Strategies

### Silent Failure in High-Frequency Polling

During 5-second transaction polling, network errors are intentionally suppressed:

```javascript
try {
  const response = await fetchWithTimeout(...);
  // Process response
} catch (e) {
  // Silently ignore network errors during high-frequency polling
}
```

**Rationale**: Aggressive polling may occasionally encounter transient network failures. Showing error toasts for every failed poll would create notification spam. The system continues polling until success or user intervention.

**Sources**: [frontend/src/pages/ArenaGame.jsx L291-L293](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L291-L293)

### Explicit Failure Handling in User-Initiated Actions

In contrast, user-initiated actions (match proposals, move plays) display explicit error messages:

```
try {
  await openContractCall(...);
} catch (error) {
  console.error(error);
  toast.error('Failed to propose match', { id: toastId });
}
```

This distinction ensures users receive feedback when their actions fail, while background polling remains unobtrusive.

**Sources**: [frontend/src/pages/ArenaGame.jsx L342-L347](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L342-L347)

 [frontend/src/pages/ArenaGame.jsx L476-L480](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L476-L480)

---

## Summary

The transaction management system implements a sophisticated two-tier polling architecture that balances responsiveness with RPC efficiency:

* **General State Polling (60s)**: Maintains baseline synchronization with blockchain state
* **Targeted Transaction Polling (5s)**: Provides rapid feedback for pending user transactions
* **Multi-Node Resilience**: Automatically fails over across three Stacks RPC nodes
* **Parallel Query Batching**: Fetches up to 30 matches concurrently to minimize latency
* **Graceful Degradation**: Silent failure handling during high-frequency polling prevents UI spam

This architecture enables the frontend to provide near-real-time updates while maintaining reasonable network efficiency, supporting the broader GameArena user experience described in [Match Lifecycle and State Management](/HACK3R-CRYPTO/GameArenaStacks/9-match-lifecycle-and-state-management).

---

# AI-Agent-System

# AI Agent System

> **Relevant source files**
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/Procfile](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/Procfile)
> * [agent/README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md)
> * [agent/package.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

## Purpose and Scope

This document describes the autonomous AI agent that participates in GameArena matches as an intelligent opponent. The agent is a self-contained Node.js application that combines strategic gameplay using Markov Chain modeling with automated blockchain interaction and service monetization through the x402 protocol. This page provides an architectural overview of the agent system, its core components, and how they integrate with the broader GameArena ecosystem.

For detailed information on specific subsystems, see:

* Agent installation and deployment: [Agent Setup and Configuration](/HACK3R-CRYPTO/GameArenaStacks/3.1-agent-setup-and-configuration)
* Payment protocol implementation: [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware)
* Strategic AI algorithms: [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy)
* Autonomous blockchain operations: [Chain Monitoring and Auto-Resolution](/HACK3R-CRYPTO/GameArenaStacks/3.4-chain-monitoring-and-auto-resolution)
* HTTP API specification: [Agent API Endpoints](/HACK3R-CRYPTO/GameArenaStacks/3.5-agent-api-endpoints)

**Sources:** [agent/src/ArenaAgent.ts L1-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L1-L482)

 [agent/README.md L1-L41](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L1-L41)

---

## System Architecture

The AI Agent is implemented as an Express.js TypeScript application that operates autonomously on the Stacks blockchain. It functions simultaneously as an HTTP API server and a blockchain monitoring daemon.

### High-Level Agent Architecture

```mermaid
flowchart TD

ExpressApp["Express Application<br>(lines 26-36)"]
X402MW["x402Middleware Function<br>(lines 109-140)"]
OpponentModel["OpponentModel Class<br>(lines 63-102)"]
MonitorChain["monitorChain Function<br>(lines 330-475)"]
AcceptMatch["/accept-match Endpoint<br>(lines 143-183)"]
PlayMove["/play-move Endpoint<br>(lines 186-301)"]
MakeContract["makeContractCall<br>@stacks/transactions"]
BroadcastTx["broadcastTransaction<br>@stacks/transactions"]
CallReadOnly["callReadOnlyFunction<br>@stacks/transactions"]
ArenaPlatform["arena-platform-v2<br>CONTRACT_ADDRESS"]
Functions["accept-match()<br>play-move()<br>resolve-match()<br>get-match-details()"]

ExpressApp -.-> AcceptMatch
ExpressApp -.-> PlayMove
AcceptMatch -.-> X402MW
PlayMove -.-> X402MW
PlayMove -.-> OpponentModel
AcceptMatch -.-> MakeContract
PlayMove -.-> MakeContract
MonitorChain -.-> MakeContract
AcceptMatch -.-> CallReadOnly
PlayMove -.-> CallReadOnly
MonitorChain -.-> CallReadOnly
BroadcastTx -.-> ArenaPlatform
CallReadOnly -.-> ArenaPlatform

subgraph subGraph3 ["Smart Contracts"]
    ArenaPlatform
    Functions
    ArenaPlatform -.-> Functions
end

subgraph subGraph2 ["Blockchain Integration"]
    MakeContract
    BroadcastTx
    CallReadOnly
    MakeContract -.-> BroadcastTx
end

subgraph subGraph1 ["HTTP API Layer"]
    AcceptMatch
    PlayMove
end

subgraph subGraph0 ["ArenaAgent.ts Main Module"]
    ExpressApp
    X402MW
    OpponentModel
    MonitorChain
    MonitorChain -.-> OpponentModel
    MonitorChain -.->|"20s interval"| MonitorChain
    MonitorChain -.-> MonitorChain
    OpponentModel -.-> OpponentModel
end
```

**Sources:** [agent/src/ArenaAgent.ts L26-L36](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L26-L36)

 [agent/src/ArenaAgent.ts L63-L102](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L63-L102)

 [agent/src/ArenaAgent.ts L109-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L140)

 [agent/src/ArenaAgent.ts L143-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L301)

 [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

---

## Core Components

### Configuration and Initialization

The agent loads its configuration from environment variables and initializes core services at startup:

| Configuration Variable | Purpose | Default Value |
| --- | --- | --- |
| `PRIVATE_KEY` | Agent wallet private key for signing transactions | Required |
| `NETWORK_TYPE` | Stacks network selection | `testnet` |
| `CONTRACT_ADDRESS` | Deployed arena-platform-v2 contract | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` |
| `CONTRACT_NAME` | Contract identifier | `arena-platform-v2` |
| `PORT` | HTTP server port | `3000` |

The agent derives its Stacks address from the private key using `getAddressFromPrivateKey()` and initializes a `StacksTestnet` network instance pointing to `https://api.testnet.hiro.so`.

**Sources:** [agent/src/ArenaAgent.ts L39-L52](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L39-L52)

 [agent/.env.example L1-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L1-L16)

---

### OpponentModel: Markov Chain AI

The `OpponentModel` class implements a first-order Markov Chain for opponent pattern recognition and counter-strategy generation. It maintains two data structures:

#### OpponentModel Data Structures

```mermaid
flowchart TD

Transitions["transitions<br>Record<gameType, Record<player, number[][]>><br>(line 64)"]
History["history<br>Record<gameType, Record<player, number>><br>(line 65)"]
Update["update(gameType, player, move)<br>(lines 67-83)"]
Predict["predict(gameType, player)<br>(lines 85-101)"]
RPS["RPS: (predicted + 1) % 3<br>(line 98)"]
Dice["Dice: favor 5 (70%)<br>(line 99)"]
Coin["Coin: adaptive flip<br>(line 100)"]

Update -.-> Transitions
Update -.-> History
Predict -.-> Transitions
Predict -.-> History
Predict -.-> RPS
Predict -.-> Dice
Predict -.-> Coin

subgraph subGraph2 ["Game-Specific Logic"]
    RPS
    Dice
    Coin
end

subgraph Methods ["Methods"]
    Update
    Predict
end

subgraph subGraph0 ["OpponentModel Class State"]
    Transitions
    History
end
```

The `transitions` map tracks move-to-move probabilities as a 2D matrix for each game type and player. The `history` map records each player's most recent move. The `update()` method increments the transition count when observing a move sequence, while `predict()` analyzes the matrix to forecast the opponent's next move and applies game-specific counter-strategies.

**Sources:** [agent/src/ArenaAgent.ts L63-L102](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L63-L102)

---

### x402 Payment Middleware

The `x402Middleware()` function implements the x402-stacks protocol by intercepting HTTP requests and enforcing payment requirements before service execution:

```mermaid
sequenceDiagram
  participant p1 as Frontend Client
  participant p2 as x402Middleware<br/>(lines 109-140)
  participant p3 as Endpoint Handler

  p1->>p2: "POST request (no proof)"
  p2->>p2: "Check x-payment-proof header"
  alt "No payment proof"
    p2->>p2: "Build payment required object<br/>(lines 116-128)"
    p2->>p1: "402 Payment Required<br/>+ X-Payment-Required header"
  else "Valid proof present"
    p2->>p2: "Verify payment (line 138)"
    p2->>p3: "next() - proceed"
    p3->>p1: "200 Success + service result"
  end
```

The middleware constructs a structured payment requirement object containing:

* `scheme`: `"direct-payment"`
* `network`: `"stacks-testnet"`
* `token`: `"STX"`
* `amount`: Service-specific microSTX amount
* `payTo`: `AGENT_ADDRESS`

This object is base64-encoded and returned in the `X-Payment-Required` header, enabling compatible x402 clients to automatically process the payment.

**Sources:** [agent/src/ArenaAgent.ts L109-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L140)

 [agent/README.md L5-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L5-L12)

---

## API Endpoints

### POST /accept-match

Accepts a proposed match on behalf of the agent. Protected by `x402Middleware(1000)`, requiring 1000 microSTX payment.

**Request Body:**

```yaml
{
  matchId: number
}
```

**Process Flow:**

1. Verify x402 payment (1000 microSTX)
2. Construct `accept-match` contract call with `uintCV(matchId)`
3. Broadcast transaction to Stacks network
4. Return transaction ID to client

**Sources:** [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

### POST /play-move

Submits the agent's move for an active match. Protected by `x402Middleware(500)`, requiring 500 microSTX payment.

**Request Body:**

```yaml
{
  matchId: number,
  move?: number  // Optional: if omitted, AI generates move
}
```

**Fairness Verification:**
Before generating or submitting a move, the endpoint performs a critical fairness check by querying `get-player-move()` for the challenger's address. If the challenger has not yet committed their move on-chain, the agent returns HTTP 403 with error code `FAIRNESS_VIOLATION`. This prevents the agent from front-running user moves.

**Sources:** [agent/src/ArenaAgent.ts L186-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L301)

 specifically fairness check at [agent/src/ArenaAgent.ts L193-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L193-L224)

---

## Chain Monitoring and Auto-Resolution

The `monitorChain()` function runs as a background daemon, polling the blockchain every 20 seconds to detect and respond to match state changes:

### Chain Monitoring Flow

```

```

The monitoring loop processes matches in three scenarios:

1. **Both players moved**: Calculate winner using `calculateWinner()` and call `resolve-match()`
2. **Only challenger moved (agent is opponent)**: Update Markov model, predict counter-move, call `play-move()`
3. **No action needed**: Continue to next match

**Sources:** [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

---

## Winner Calculation Logic

The `calculateWinner()` function implements game-specific winner determination:

| Game Type | ID | Winner Logic |
| --- | --- | --- |
| Rock-Paper-Scissors | 0 | Cyclic dominance: Rock beats Scissors, Scissors beats Paper, Paper beats Rock |
| Dice Roll | 1 | Higher number wins |
| Coin Flip | 2 | Challenger's prediction (move1) matches result (move2) |

Draws return `null`, which the monitor defaults to the challenger (friendly behavior for demonstrations).

**Sources:** [agent/src/ArenaAgent.ts L304-L327](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L304-L327)

---

## Technology Stack

The agent leverages the following key dependencies:

| Package | Version | Purpose |
| --- | --- | --- |
| `express` | 4.21.2 | HTTP server framework |
| `@stacks/transactions` | 6.13.0 | Transaction construction and signing |
| `@stacks/network` | 6.13.0 | Network configuration |
| `x402-stacks` | 2.0.1 | x402 protocol middleware |
| `tsx` | 4.21.0 | TypeScript execution without compilation |
| `chalk` | 5.6.2 | Terminal output formatting |

The agent runs on Node.js 18+ and uses TypeScript 5.9.3 for type safety with ESM module format (`"type": "module"`).

**Sources:** [agent/package.json L1-L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L1-L30)

---

## Multi-Node Failover

To ensure high availability, the agent implements fallback logic when fetching nonces for transaction construction. It attempts to query multiple Stacks RPC endpoints sequentially:

```javascript
const nodes = [
    'https://api.testnet.hiro.so',
    'https://stacks-node-api.testnet.stacks.co'
];
```

If the primary node (`api.testnet.hiro.so`) fails or times out (15-second timeout), the agent automatically retries with backup nodes. This resilience pattern ensures the agent can continue operating during network disruptions or rate limiting.

**Sources:** [agent/src/ArenaAgent.ts L246-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L246-L266)

---

## Agent Lifecycle

The complete agent lifecycle from startup to autonomous operation:

```mermaid
sequenceDiagram
  participant p1 as Process Start
  participant p2 as Environment<br/>Configuration
  participant p3 as Express App
  participant p4 as Chain Monitor
  participant p5 as Stacks Network

  p1->>p2: "Load .env variables<br/>(line 24)"
  p2->>p2: "Derive AGENT_ADDRESS<br/>(line 43)"
  p2->>p3: "Initialize app<br/>(line 26)"
  p3->>p3: "Register CORS middleware<br/>(lines 28-36)"
  p3->>p3: "Register endpoints<br/>(lines 143-301)"
  p3->>p4: "app.listen() callback<br/>(lines 477-481)"
  p4->>p4: "Start monitorChain()<br/>(line 480)"
  loop "Every 20 seconds"
    p4->>p5: "Query match count"
    p5-->>p4: "Current count"
    p4->>p5: "Scan recent matches"
    p5-->>p4: "Match details"
  alt "Match needs AI move"
    p4->>p4: "model.predict()"
    p4->>p5: "Broadcast play-move tx"
  else "Match ready for resolution"
    p4->>p4: "calculateWinner()"
    p4->>p5: "Broadcast resolve-match tx"
  end
  end
  note over p3: "Simultaneously handles<br/>HTTP API requests"
```

The agent operates in two parallel modes: (1) serving HTTP API requests with x402 payment verification, and (2) autonomously monitoring the blockchain for matches requiring automated response.

**Sources:** [agent/src/ArenaAgent.ts L477-L481](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L477-L481)

---

## Deployment Configuration

The agent includes a `Procfile` for Heroku/Railway deployment:

```yaml
web: npm start
```

This configuration starts the compiled JavaScript (`dist/ArenaAgent.js`) in production mode. For development, use `npm run ts-start` to execute TypeScript directly with `tsx`.

**Sources:** [agent/Procfile L1-L2](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/Procfile#L1-L2)

 [agent/package.json L7-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L7-L11)

---

# Agent-Setup-and-Configuration

# Agent Setup and Configuration

> **Relevant source files**
> * [agent/Procfile](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/Procfile)
> * [agent/README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md)
> * [agent/agent_keychain.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/agent_keychain.json)
> * [agent/package.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json)
> * [agent/src/config.js](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js)

This document covers the installation, configuration, and deployment of the autonomous AI agent. It includes environment variable setup, wallet configuration, dependency installation, and execution modes. For information about the agent's x402 payment system, see [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware). For details on the AI strategy implementation, see [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy). For API endpoint documentation, see [Agent API Endpoints](/HACK3R-CRYPTO/GameArenaStacks/3.5-agent-api-endpoints).

---

## Purpose and Scope

The agent is a Node.js application that autonomously participates in GameArena matches by:

* Accepting match proposals through an Express API server
* Executing strategic moves using Markov Chain modeling
* Monetizing services via the x402-stacks protocol
* Monitoring the Stacks blockchain for match state changes

This page documents the complete setup process from initial installation to production deployment.

---

## Prerequisites

The agent requires the following runtime environment:

| Requirement | Version | Purpose |
| --- | --- | --- |
| Node.js | 18.x or higher | JavaScript runtime |
| npm | 8.x or higher | Package manager |
| TypeScript | 5.9.3 | Language compiler |
| Stacks Wallet | N/A | Agent identity (private key) |

**Sources:** [agent/package.json L24-L29](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L24-L29)

---

## Installation Process

### Setup Flow Diagram

```mermaid
flowchart TD

Clone["Clone Repository"]
NavAgent["Navigate to /agent directory"]
Install["npm install"]
EnvCreate["Create .env file"]
WalletGen["Generate wallet keychain"]
ConfigReview["Review config.js"]
Build["npm run build"]
Start["npm run ts-start"]
EnvExample[".env.example"]
StacksCLI["@stacks/cli"]
DistDir["dist/ directory"]

Clone -.-> NavAgent
NavAgent -.-> Install
Install -.->|"Create from template"| EnvCreate
EnvCreate -.->|"Generate with"| WalletGen
WalletGen -.-> ConfigReview
ConfigReview -.->|"Compiles to"| Build
Build -.-> Start
EnvCreate -.-> EnvExample
WalletGen -.-> StacksCLI
Build -.-> DistDir
```

**Sources:** [agent/package.json L7-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L7-L11)

 [agent/README.md L34-L38](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L34-L38)

### Step 1: Clone and Navigate

```
git clone https://github.com/HACK3R-CRYPTO/GameArenaStacks.git
cd GameArenaStacks/agent
```

### Step 2: Install Dependencies

The `npm install` command installs both production and development dependencies:

```
npm install
```

This installs packages defined in [agent/package.json L13-L29](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L13-L29)

:

**Production Dependencies:**

* `@stacks/transactions@6.13.0` - Transaction construction
* `@stacks/network@6.13.0` - Network configuration
* `@stacks/common@6.13.0` - Common utilities
* `express@4.21.2` - Web framework
* `x402-stacks@2.0.1` - Payment middleware
* `dotenv@17.2.4` - Environment variable loading
* `chalk@5.6.2` - Terminal styling
* `axios@1.13.5` - HTTP client

**Development Dependencies:**

* `tsx@4.21.0` - TypeScript execution
* `typescript@5.9.3` - TypeScript compiler
* `@types/node@25.2.2` - Node.js type definitions
* `@types/express@4.17.21` - Express type definitions
* `nodemon@3.1.0` - Development auto-reload

**Sources:** [agent/package.json L13-L29](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L13-L29)

---

## Environment Configuration

### Configuration Architecture

```mermaid
flowchart TD

EnvFile[".env<br>(user-created)"]
EnvExample[".env.example<br>(template)"]
ConfigJS["config.js<br>STACKS_CONFIG<br>AGENT_CONFIG"]
DotenvLoader["dotenv.config()"]
AgentTS["ArenaAgent.ts"]
ProcessEnv["process.env"]

EnvFile -.-> DotenvLoader
DotenvLoader -.-> ProcessEnv
ConfigJS -.-> AgentTS

subgraph Runtime ["Runtime"]
    AgentTS
    ProcessEnv
    ProcessEnv -.-> AgentTS
end

subgraph subGraph1 ["Configuration Modules"]
    ConfigJS
    DotenvLoader
end

subgraph subGraph0 ["Environment Files"]
    EnvFile
    EnvExample
    EnvExample -.->|"Copy & customize"| EnvFile
end
```

**Sources:** [agent/package.json L19](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L19-L19)

 [agent/src/config.js L1-L28](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L1-L28)

### Required Environment Variables

Create a `.env` file in the `agent/` directory with the following variables:

| Variable | Description | Example Value |
| --- | --- | --- |
| `STACKS_PRIVATE_KEY` | Agent's Stacks wallet private key | `cc1a5d9041e27cf249d58ca665ec9deccef48f58...` |
| `AGENT_MNEMONIC` | BIP39 mnemonic phrase (optional) | `color cupboard catch survey...` |
| `PORT` | Express server port | `3000` |
| `NODE_ENV` | Execution environment | `development` or `production` |
| `STACKS_NETWORK` | Target network | `testnet` or `mainnet` |

**Example `.env` file:**

```
STACKS_PRIVATE_KEY=cc1a5d9041e27cf249d58ca665ec9deccef48f58f6819df1a7cad39d52319d8901
AGENT_MNEMONIC=color cupboard catch survey leader shoulder firm tumble entry lake resemble flash
PORT=3000
NODE_ENV=development
STACKS_NETWORK=testnet
```

**Sources:** [agent/package.json L19](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L19-L19)

 [agent/agent_keychain.json L8](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/agent_keychain.json#L8-L8)

---

## Wallet Setup and Keychain Generation

### Agent Identity Requirements

The agent requires a Stacks wallet to:

1. Sign and broadcast transactions to accept matches
2. Execute moves in active games
3. Receive prize winnings from successful matches
4. Register identity in the `agent-registry` contract

### Generating a New Wallet

Use the `@stacks/cli` tool to generate a new keychain:

```
npx @stacks/cli make_keychain -t 2>/dev/null | tail -n 1 > agent_keychain.json
```

This generates a JSON object with:

* `mnemonic`: BIP39 seed phrase
* `privateKey`: Hexadecimal private key
* `publicKey`: Compressed public key
* `address`: Stacks address (ST... for testnet)
* `btcAddress`: Bitcoin address
* `wif`: Wallet Import Format key

**Example output** from [agent/agent_keychain.json L8](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/agent_keychain.json#L8-L8)

:

```
{
  "mnemonic": "color cupboard catch survey leader shoulder...",
  "keyInfo": {
    "privateKey": "cc1a5d9041e27cf249d58ca665ec9deccef48f58f6819df1a7cad39d52319d8901",
    "address": "ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA",
    ...
  }
}
```

### Wallet Funding

For testnet deployment, fund the agent's address:

1. Copy the `address` field from `agent_keychain.json`
2. Visit the [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
3. Request test STX tokens
4. Verify balance on [Stacks Explorer](https://explorer.stacks.co/)

The agent needs sufficient STX to:

* Pay transaction fees (~0.001 STX per transaction)
* Wager in matches (minimum 1000 microSTX)
* Register in the agent registry

**Sources:** [agent/agent_keychain.json L1-L9](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/agent_keychain.json#L1-L9)

---

## Configuration Structure

### Configuration Files Mapping

```mermaid
flowchart TD

ConfigJS["config.js"]
StacksConfig["STACKS_CONFIG<br>Line 2-11"]
AgentConfig["AGENT_CONFIG<br>Line 14-22"]
DefaultExport["default export<br>Line 24-27"]
Network["NETWORK: 'testnet'"]
ApiUrl["API_URL: 'api.testnet.hiro.so'"]
Deployer["DEPLOYER_ADDRESS"]
Platform["ARENA_PLATFORM"]
Registry["AGENT_REGISTRY"]
Traits["TRAITS"]
Name["NAME: 'Markov-1'"]
Model["MODEL: 'Markov Chain'"]
Description["DESCRIPTION"]
Port["PORT: 3000"]
Host["HOST: 'localhost'"]

StacksConfig -.-> Network
StacksConfig -.-> ApiUrl
StacksConfig -.-> Deployer
StacksConfig -.-> Platform
StacksConfig -.-> Registry
StacksConfig -.-> Traits
AgentConfig -.-> Name
AgentConfig -.-> Model
AgentConfig -.-> Description
AgentConfig -.-> Port
AgentConfig -.-> Host

subgraph subGraph2 ["AGENT_CONFIG Properties"]
    Name
    Model
    Description
    Port
    Host
end

subgraph subGraph1 ["STACKS_CONFIG Properties"]
    Network
    ApiUrl
    Deployer
    Platform
    Registry
    Traits
end

subgraph subGraph0 ["Static Configuration"]
    ConfigJS
    StacksConfig
    AgentConfig
    DefaultExport
    ConfigJS -.-> StacksConfig
    ConfigJS -.-> AgentConfig
    StacksConfig -.-> DefaultExport
    AgentConfig -.-> DefaultExport
end
```

**Sources:** [agent/src/config.js L1-L28](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L1-L28)

### STACKS_CONFIG Object

Defined in [agent/src/config.js L2-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L2-L11)

 this object contains blockchain-specific settings:

| Property | Value | Purpose |
| --- | --- | --- |
| `NETWORK` | `'testnet'` | Target Stacks network |
| `API_URL` | `'https://api.testnet.hiro.so'` | Primary RPC endpoint |
| `DEPLOYER_ADDRESS` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` | Contract deployer principal |
| `ARENA_PLATFORM` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform` | Game logic contract |
| `AGENT_REGISTRY` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry` | Agent identity contract |
| `TRAITS` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.traits` | Game interface traits |

These values point to the deployed testnet contracts and should not be modified unless deploying to a custom environment.

### AGENT_CONFIG Object

Defined in [agent/src/config.js L14-L22](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L14-L22)

 this object contains agent-specific metadata:

| Property | Value | Purpose |
| --- | --- | --- |
| `NAME` | `'Markov-1'` | Agent display name |
| `MODEL` | `'Markov Chain'` | AI strategy identifier |
| `DESCRIPTION` | AI agent using Markov decision logic | Human-readable description |
| `PORT` | `3000` | Express server port |
| `HOST` | `'localhost'` | Server bind address |

The `NAME` and `MODEL` fields are used when registering the agent in the `agent-registry` contract.

**Sources:** [agent/src/config.js L2-L22](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L2-L22)

---

## Build and Execution

### Execution Modes Diagram

```mermaid
flowchart TD

ProcfileWeb["Procfile: web"]
HerokuStart["npm start"]
BuildCmd["npm run build"]
TSC["tsc compiler"]
DistJS["dist/ArenaAgent.js"]
StartCmd["npm start"]
NodeExec["node dist/ArenaAgent.js"]
TsStartCmd["npm run ts-start"]
TsxDirect["tsx src/ArenaAgent.ts"]
DevCmd["npm run dev"]
Nodemon["nodemon"]
TSX["tsx src/ArenaAgent.ts"]
WatchFiles["Watch *.ts files"]

subgraph Deployment ["Deployment"]
    ProcfileWeb
    HerokuStart
    ProcfileWeb -.-> HerokuStart
end

subgraph subGraph2 ["Production Mode"]
    BuildCmd
    TSC
    DistJS
    StartCmd
    NodeExec
    BuildCmd -.-> TSC
    TSC -.-> DistJS
    StartCmd -.-> NodeExec
    DistJS -.-> NodeExec
end

subgraph subGraph1 ["TypeScript Direct Execution"]
    TsStartCmd
    TsxDirect
    TsStartCmd -.-> TsxDirect
end

subgraph subGraph0 ["Development Mode"]
    DevCmd
    Nodemon
    TSX
    WatchFiles
    DevCmd -.-> Nodemon
    Nodemon -.->|"Auto-restart on change"| TSX
    Nodemon -.-> WatchFiles
    WatchFiles -.-> TSX
end
```

**Sources:** [agent/package.json L7-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L7-L11)

 [agent/Procfile L1](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/Procfile#L1-L1)

### Available NPM Scripts

The [agent/package.json L7-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L7-L11)

 defines the following scripts:

| Script | Command | Purpose |
| --- | --- | --- |
| `npm start` | `node dist/ArenaAgent.js` | Run compiled production code |
| `npm run ts-start` | `tsx src/ArenaAgent.ts` | Direct TypeScript execution (fast dev) |
| `npm run dev` | `nodemon` | Auto-reload development server |
| `npm run build` | `tsc` | Compile TypeScript to JavaScript |

### Development Workflow

For local development with auto-reload:

```
npm run dev
```

This uses `nodemon` to watch TypeScript files and automatically restart the server when changes are detected. The `nodemon` configuration (typically in `nodemon.json` or `package.json`) watches `.ts` files in the `src/` directory.

### Direct TypeScript Execution

For quick testing without compilation:

```
npm run ts-start
```

The `tsx` package [agent/package.json L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L24-L24)

 provides fast TypeScript execution without requiring a build step. This is useful for rapid iteration during development.

### Production Build

Compile TypeScript to JavaScript:

```
npm run build
```

This invokes the TypeScript compiler (`tsc`) which reads `tsconfig.json` configuration and outputs compiled JavaScript to the `dist/` directory. The compiled code includes:

* Type checking validation
* ES module transpilation
* Source map generation (if enabled)

### Running Compiled Code

After building, start the production server:

```
npm start
```

This executes [agent/package.json L8](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L8-L8)

 which runs `node dist/ArenaAgent.js`. The compiled code has faster startup times than TypeScript execution.

**Sources:** [agent/package.json L7-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L7-L11)

 [agent/package.json L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L24-L24)

---

## Deployment Configuration

### Procfile Structure

The [agent/Procfile L1](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/Procfile#L1-L1)

 defines the Heroku deployment process:

```yaml
web: npm start
```

This declares a single `web` process type that executes `npm start`, which runs the compiled JavaScript in `dist/ArenaAgent.js`.

### Deployment Checklist

Before deploying to production (Heroku, Railway, or similar platforms):

1. **Environment Variables**: Configure all required variables in the platform's dashboard
2. **Build Command**: Ensure the platform runs `npm run build` before starting
3. **Start Command**: Set to `npm start` or use the Procfile
4. **Port Binding**: The agent reads `PORT` from `process.env.PORT` (provided by platform)
5. **Funding**: Ensure the agent's wallet has sufficient STX for ongoing operations

### Platform-Specific Configuration

**Heroku:**

```sql
heroku create my-arena-agent
heroku config:set STACKS_PRIVATE_KEY=<your-key>
heroku config:set NODE_ENV=production
git push heroku main
```

**Railway:**

* Connect GitHub repository
* Set environment variables in the dashboard
* Railway auto-detects Node.js and runs `npm install` and `npm start`

**Render:**

* Set Build Command: `npm install && npm run build`
* Set Start Command: `npm start`
* Add environment variables in the dashboard

**Sources:** [agent/Procfile L1](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/Procfile#L1-L1)

---

## Configuration Validation

### Startup Verification

When the agent starts successfully, it should log:

1. **Environment Loaded**: Confirms `.env` file was read
2. **Wallet Initialized**: Displays agent's Stacks address
3. **Contract Connections**: Confirms API connectivity to Stacks network
4. **Express Server Listening**: Shows port binding (e.g., `Listening on port 3000`)
5. **x402 Middleware Active**: Indicates payment verification is enabled

### Common Configuration Issues

| Issue | Symptom | Solution |
| --- | --- | --- |
| Missing `STACKS_PRIVATE_KEY` | Agent crashes with "undefined private key" | Add key to `.env` file |
| Invalid private key format | Transaction signing fails | Regenerate keychain with `@stacks/cli` |
| Port already in use | "EADDRINUSE" error | Change `PORT` in `.env` or kill existing process |
| Network mismatch | Contract calls fail with "not found" | Verify `STACKS_NETWORK` matches contract deployment |
| Insufficient funds | Transactions rejected | Fund agent wallet via testnet faucet |

**Sources:** [agent/package.json L19](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L19-L19)

 [agent/src/config.js L1-L28](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L1-L28)

---

## Next Steps

After completing setup:

1. **Register Agent**: See [Agent Registry Contract](/HACK3R-CRYPTO/GameArenaStacks/4.2-agent-registry-contract) for identity registration
2. **Configure Payment Tiers**: See [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware) for pricing setup
3. **Customize AI Strategy**: See [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy) for model tuning
4. **Enable Monitoring**: See [Chain Monitoring and Auto-Resolution](/HACK3R-CRYPTO/GameArenaStacks/3.4-chain-monitoring-and-auto-resolution) for background processes
5. **Test API Endpoints**: See [Agent API Endpoints](/HACK3R-CRYPTO/GameArenaStacks/3.5-agent-api-endpoints) for endpoint testing

**Sources:** [agent/README.md L1-L41](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L1-L41)

 [agent/package.json L1-L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json#L1-L30)

 [agent/src/config.js L1-L28](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L1-L28)

---

# x402-Payment-Middleware

# x402 Payment Middleware

> **Relevant source files**
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

## Purpose and Scope

This document describes the x402 payment middleware implementation in the GameArenaStacks agent system. The middleware enables machine-to-machine monetization by requiring micro-payments before the agent provides services. This document covers the middleware function implementation, HTTP 402 protocol handling, payment verification logic, and integration with agent API endpoints.

For information about the complete agent architecture, see [AI Agent System](/HACK3R-CRYPTO/GameArenaStacks/3-ai-agent-system). For details on the API endpoints that use this middleware, see [Agent API Endpoints](/HACK3R-CRYPTO/GameArenaStacks/3.5-agent-api-endpoints). For the frontend's client-side x402 integration, see [ArenaGame Component](/HACK3R-CRYPTO/GameArenaStacks/2.1-arenagame-component).

## HTTP 402 Payment Required Protocol

The x402 middleware implements the HTTP 402 status code, traditionally reserved for "Payment Required" scenarios. When a request arrives without valid payment proof, the agent responds with a 402 status and structured payment instructions.

### Payment Request/Response Cycle

```mermaid
sequenceDiagram
  participant p1 as Client<br/>(Frontend)
  participant p2 as x402Middleware<br/>(agent/src/ArenaAgent.ts:109)
  participant p3 as Endpoint Handler<br/>(/accept-match or /play-move)
  participant p4 as Stacks Blockchain

  p1->>p2: "POST /accept-match<br/>{matchId: 123}"
  note over p2: "Check headers:<br/>x-payment-proof<br/>x-stacks-address"
  alt "No payment proof"
    p2->>p1: "HTTP 402 Payment Required<br/>+ X-Payment-Required header"
    note over p1: "User authorizes<br/>STX transfer"
    p1->>p4: "Transfer STX to agent"
    p4-->>p1: "Transaction confirmed"
    p1->>p2: "Retry with<br/>x-payment-proof header"
  end
  p2->>p2: "Verify payment proof<br/>(on-chain validation)"
  p2->>p3: "next() - payment verified"
  p3->>p4: "accept-match(matchId)"
  p4-->>p3: "Transaction broadcast"
  p3->>p1: "{success: true, txid: ...}"
```

**Sources**: [agent/src/ArenaAgent.ts L109-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L140)

 [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

## Middleware Function Implementation

The `x402Middleware` function is a higher-order function that returns Express middleware configured with a specific payment amount.

### Function Signature and Structure

```mermaid
flowchart TD

Factory["x402Middleware(amount: number)"]
Middleware["Express Middleware<br>(req, res, next)"]
CheckHeaders["Check Request Headers"]
ProofPresent["x-payment-proof &&<br>x-stacks-address<br>present?"]
Build402["Build Payment Required Object"]
SetHeader["Set X-Payment-Required header<br>(Base64 encoded)"]
Return402["Return HTTP 402 status"]
Verify["Verify Payment<br>(on-chain validation)"]
LogSuccess["Log payment verification"]
CallNext["next() - proceed to handler"]
PayObj["paymentRequired Object"]
Status["status: 402"]
Error["error: 'Payment Required'"]
Version["x402Version: 2"]
Resource["resource: {url, description}"]
Accepts["accepts: [{scheme, network, token, amount, payTo}]"]

Build402 -.-> PayObj

subgraph subGraph1 ["Payment Required Object Structure"]
    PayObj
    Status
    Error
    Version
    Resource
    Accepts
    PayObj -.-> Status
    PayObj -.-> Error
    PayObj -.-> Version
    PayObj -.-> Resource
    PayObj -.-> Accepts
end

subgraph subGraph0 ["x402Middleware Function"]
    Factory
    Middleware
    CheckHeaders
    ProofPresent
    Build402
    SetHeader
    Return402
    Verify
    LogSuccess
    CallNext
    Factory -.-> Middleware
    Middleware -.->|"Yes"| CheckHeaders
    CheckHeaders -.->|"No"| ProofPresent
    ProofPresent -.-> Build402
    Build402 -.-> SetHeader
    SetHeader -.-> Return402
    ProofPresent -.-> Verify
    Verify -.-> LogSuccess
    LogSuccess -.-> CallNext
end
```

**Sources**: [agent/src/ArenaAgent.ts L109-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L140)

### Payment Required Response Structure

The middleware constructs a standardized payment instruction object when payment proof is absent:

| Field | Type | Description |
| --- | --- | --- |
| `status` | `number` | Always `402` |
| `error` | `string` | `"Payment Required"` |
| `x402Version` | `number` | Protocol version (`2`) |
| `resource` | `object` | `{url: string, description: string}` |
| `accepts` | `array` | Array of payment scheme objects |

**Payment Scheme Object**:

| Field | Type | Example Value |
| --- | --- | --- |
| `scheme` | `string` | `"direct-payment"` |
| `network` | `string` | `"stacks-testnet"` |
| `token` | `string` | `"STX"` |
| `amount` | `string` | `"1000"` (microSTX) |
| `payTo` | `string` | Agent's Stacks address |

**Sources**: [agent/src/ArenaAgent.ts L116-L128](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L116-L128)

## Request Header Validation

The middleware extracts and validates two critical headers from incoming requests:

```mermaid
flowchart TD

Request["Incoming Request"]
ExtractProof["Extract x-payment-proof header"]
ExtractAddr["Extract x-stacks-address header"]
CheckProof["Proof exists?"]
CheckAddr["Address exists?"]
Return402["Return HTTP 402"]
VerifyLogic["Verification Logic"]
Proceed["next() - Continue to handler"]

Request -.-> ExtractProof
Request -.-> ExtractAddr
ExtractProof -.->|"No"| CheckProof
ExtractAddr -.->|"Yes"| CheckAddr
CheckProof -.->|"No"| Return402
CheckAddr -.->|"Yes"| Return402
CheckProof -.-> VerifyLogic
CheckAddr -.-> VerifyLogic
VerifyLogic -.-> Proceed
```

**Header Specifications**:

* **`x-payment-proof`**: Transaction ID or proof of payment completion
* **`x-stacks-address`**: Payer's Stacks address for verification

**Sources**: [agent/src/ArenaAgent.ts L111-L112](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L111-L112)

 [agent/src/ArenaAgent.ts L115-L134](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L115-L134)

## CORS Configuration for x402 Headers

The agent's Express server is configured to allow x402-specific headers in cross-origin requests:

```
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, x-payment-proof, x-stacks-address
```

This configuration at [agent/src/ArenaAgent.ts L28-L36](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L28-L36)

 ensures that browsers do not block the custom payment headers during preflight OPTIONS requests.

**Sources**: [agent/src/ArenaAgent.ts L28-L36](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L28-L36)

## Endpoint Integration

The middleware is applied to two primary API endpoints with different pricing tiers:

### Endpoint Pricing Table

| Endpoint | Middleware Config | Amount (microSTX) | Purpose |
| --- | --- | --- | --- |
| `POST /accept-match` | `x402Middleware(1000)` | 1000 | Agent accepts match proposal |
| `POST /play-move` | `x402Middleware(500)` | 500 | Agent commits game move |

### Endpoint Middleware Application

```mermaid
flowchart TD

AcceptRoute["app.post('/accept-match', ...)"]
MoveRoute["app.post('/play-move', ...)"]
MW1000["x402Middleware(1000)"]
MW500["x402Middleware(500)"]
AcceptHandler["async (req, res) => {<br>  accept-match logic<br>}"]
MoveHandler["async (req, res) => {<br>  play-move logic<br>}"]
Contract["makeContractCall<br>('accept-match')"]
Contract2["makeContractCall<br>('play-move')"]

AcceptRoute -.-> MW1000
MW1000 -.-> AcceptHandler
MoveRoute -.-> MW500
MW500 -.-> MoveHandler
AcceptHandler -.-> Contract
MoveHandler -.-> Contract2

subgraph subGraph2 ["Handler Layer"]
    AcceptHandler
    MoveHandler
end

subgraph subGraph1 ["Middleware Layer"]
    MW1000
    MW500
end

subgraph subGraph0 ["Express App Routes"]
    AcceptRoute
    MoveRoute
end
```

**Sources**: [agent/src/ArenaAgent.ts L143](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L143)

 [agent/src/ArenaAgent.ts L186](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L186)

## Payment Verification Implementation

The current implementation logs payment verification but includes a placeholder for production-level on-chain verification.

### Verification Flow

```css
#mermaid-2hwwr4tei97{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;fill:#333;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-2hwwr4tei97 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-2hwwr4tei97 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-2hwwr4tei97 .error-icon{fill:#dddddd;}#mermaid-2hwwr4tei97 .error-text{fill:#222222;stroke:#222222;}#mermaid-2hwwr4tei97 .edge-thickness-normal{stroke-width:1px;}#mermaid-2hwwr4tei97 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-2hwwr4tei97 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-2hwwr4tei97 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-2hwwr4tei97 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-2hwwr4tei97 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-2hwwr4tei97 .marker{fill:#999;stroke:#999;}#mermaid-2hwwr4tei97 .marker.cross{stroke:#999;}#mermaid-2hwwr4tei97 svg{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;}#mermaid-2hwwr4tei97 p{margin:0;}#mermaid-2hwwr4tei97 defs #statediagram-barbEnd{fill:#999;stroke:#999;}#mermaid-2hwwr4tei97 g.stateGroup text{fill:#dddddd;stroke:none;font-size:10px;}#mermaid-2hwwr4tei97 g.stateGroup text{fill:#333;stroke:none;font-size:10px;}#mermaid-2hwwr4tei97 g.stateGroup .state-title{font-weight:bolder;fill:#333;}#mermaid-2hwwr4tei97 g.stateGroup rect{fill:#ffffff;stroke:#dddddd;}#mermaid-2hwwr4tei97 g.stateGroup line{stroke:#999;stroke-width:1;}#mermaid-2hwwr4tei97 .transition{stroke:#999;stroke-width:1;fill:none;}#mermaid-2hwwr4tei97 .stateGroup .composit{fill:#f4f4f4;border-bottom:1px;}#mermaid-2hwwr4tei97 .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#mermaid-2hwwr4tei97 .state-note{stroke:#e6d280;fill:#fff5ad;}#mermaid-2hwwr4tei97 .state-note text{fill:#333;stroke:none;font-size:10px;}#mermaid-2hwwr4tei97 .stateLabel .box{stroke:none;stroke-width:0;fill:#ffffff;opacity:0.5;}#mermaid-2hwwr4tei97 .edgeLabel .label rect{fill:#ffffff;opacity:0.5;}#mermaid-2hwwr4tei97 .edgeLabel{background-color:#ffffff;text-align:center;}#mermaid-2hwwr4tei97 .edgeLabel p{background-color:#ffffff;}#mermaid-2hwwr4tei97 .edgeLabel rect{opacity:0.5;background-color:#ffffff;fill:#ffffff;}#mermaid-2hwwr4tei97 .edgeLabel .label text{fill:#333;}#mermaid-2hwwr4tei97 .label div .edgeLabel{color:#333;}#mermaid-2hwwr4tei97 .stateLabel text{fill:#333;font-size:10px;font-weight:bold;}#mermaid-2hwwr4tei97 .node circle.state-start{fill:#999;stroke:#999;}#mermaid-2hwwr4tei97 .node .fork-join{fill:#999;stroke:#999;}#mermaid-2hwwr4tei97 .node circle.state-end{fill:#dddddd;stroke:#f4f4f4;stroke-width:1.5;}#mermaid-2hwwr4tei97 .end-state-inner{fill:#f4f4f4;stroke-width:1.5;}#mermaid-2hwwr4tei97 .node rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-2hwwr4tei97 .node polygon{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-2hwwr4tei97 #statediagram-barbEnd{fill:#999;}#mermaid-2hwwr4tei97 .statediagram-cluster rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-2hwwr4tei97 .cluster-label,#mermaid-2hwwr4tei97 .nodeLabel{color:#333;}#mermaid-2hwwr4tei97 .statediagram-cluster rect.outer{rx:5px;ry:5px;}#mermaid-2hwwr4tei97 .statediagram-state .divider{stroke:#dddddd;}#mermaid-2hwwr4tei97 .statediagram-state .title-state{rx:5px;ry:5px;}#mermaid-2hwwr4tei97 .statediagram-cluster.statediagram-cluster .inner{fill:#f4f4f4;}#mermaid-2hwwr4tei97 .statediagram-cluster.statediagram-cluster-alt .inner{fill:#f8f8f8;}#mermaid-2hwwr4tei97 .statediagram-cluster .inner{rx:0;ry:0;}#mermaid-2hwwr4tei97 .statediagram-state rect.basic{rx:5px;ry:5px;}#mermaid-2hwwr4tei97 .statediagram-state rect.divider{stroke-dasharray:10,10;fill:#f8f8f8;}#mermaid-2hwwr4tei97 .note-edge{stroke-dasharray:5;}#mermaid-2hwwr4tei97 .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-2hwwr4tei97 .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-2hwwr4tei97 .statediagram-note text{fill:#333;}#mermaid-2hwwr4tei97 .statediagram-note .nodeLabel{color:#333;}#mermaid-2hwwr4tei97 .statediagram .edgeLabel{color:red;}#mermaid-2hwwr4tei97 #dependencyStart,#mermaid-2hwwr4tei97 #dependencyEnd{fill:#999;stroke:#999;stroke-width:1;}#mermaid-2hwwr4tei97 .statediagramTitleText{text-anchor:middle;font-size:18px;fill:#333;}#mermaid-2hwwr4tei97 :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}"Request arrives""No payment headers""Headers found""Build payment instructions""HTTP 402 response""Validate payment proof""Log verification success""next()""Execute endpoint logic"CheckHeadersHeadersMissingHeadersPresentReturn402VerifyPaymentProduction TODO:Query Stacks APIVerify transactionCheck amount/recipientLogVerificationProceedToHandler
```

**Current Implementation** at [agent/src/ArenaAgent.ts L136-L138](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L136-L138)

:

```javascript
// In production, verify payment proof here
console.log(chalk.green(`✅ Payment verified from ${stacksAddress}`));
next();
```

**Production Enhancement**: The verification logic should query the Stacks blockchain to:

1. Confirm the transaction exists and is confirmed
2. Verify the transfer amount matches the required payment
3. Validate the recipient is the agent's address
4. Ensure the transaction is recent (prevent replay attacks)

**Sources**: [agent/src/ArenaAgent.ts L136-L139](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L136-L139)

## Configuration and Constants

### Agent Address Configuration

The agent's payment recipient address is derived from the private key at startup:

```
AGENT_ADDRESS = getAddressFromPrivateKey(PRIVATE_KEY, TransactionVersion)
```

This address is used in the `payTo` field of all payment instructions. Configuration source: [agent/src/ArenaAgent.ts L43](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L43-L43)

### X-Payment-Required Header Encoding

The payment instructions are Base64-encoded and attached to the response header:

```
res.setHeader(
    X402_HEADERS.PAYMENT_REQUIRED,
    Buffer.from(JSON.stringify(paymentRequired)).toString('base64')
);
```

The `X402_HEADERS.PAYMENT_REQUIRED` constant is imported from the `x402-stacks` package at [agent/src/ArenaAgent.ts L3-L4](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L3-L4)

**Sources**: [agent/src/ArenaAgent.ts L129-L132](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L129-L132)

 [agent/src/ArenaAgent.ts L3-L4](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L3-L4)

## Complete Code Entity Map

```mermaid
flowchart TD

x402pkg["x402-stacks package<br>(npm dependency)"]
X402Headers["X402_HEADERS constant"]
Import["import { X402_HEADERS }<br>from 'x402-stacks'"]
Config["AGENT_ADDRESS<br>(derived from PRIVATE_KEY)"]
Factory["x402Middleware(amount)<br>line 109"]
Middleware["middleware function<br>(req, res, next)"]
Headers["req.headers extraction<br>lines 111-112"]
Build["paymentRequired object<br>lines 116-128"]
SetHdr["res.setHeader()<br>lines 129-132"]
Return["res.status(402).json()<br>line 133"]
Next["next()<br>line 138"]
AcceptEP["app.post('/accept-match')<br>line 143"]
MoveEP["app.post('/play-move')<br>line 186"]
MW1000["x402Middleware(1000)"]
MW500["x402Middleware(500)"]

Import -.-> X402Headers
Factory -.-> MW1000
Factory -.-> MW500

subgraph subGraph2 ["Express Routes"]
    AcceptEP
    MoveEP
    MW1000
    MW500
    AcceptEP -.-> MW1000
    MoveEP -.-> MW500
end

subgraph subGraph1 ["ArenaAgent.ts Module"]
    Import
    Config
    Factory
    Middleware
    Headers
    Build
    SetHdr
    Return
    Next
    Factory -.-> Middleware
    Middleware -.-> Headers
    Middleware -.-> Build
    Middleware -.-> SetHdr
    Middleware -.-> Return
    Middleware -.-> Next
    Config -.-> Build
end

subgraph subGraph0 ["External Dependencies"]
    x402pkg
    X402Headers
    x402pkg -.-> X402Headers
end
```

**Sources**: [agent/src/ArenaAgent.ts L1-L481](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L1-L481)

## Environment Configuration

The x402 middleware requires specific environment variables for operation:

| Variable | Purpose | Example Value |
| --- | --- | --- |
| `PRIVATE_KEY` | Agent's wallet private key | `your_private_key_here` |
| `NETWORK_TYPE` | Stacks network | `testnet` |
| `CONTRACT_ADDRESS` | Platform contract address | `ST3V7NY32G2...` |
| `PORT` | Agent API server port | `3000` |

The `X402_FACILITATOR_URL` is documented in [agent/.env.example L14-L15](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L14-L15)

 for future integration with x402 facilitator services.

**Sources**: [agent/.env.example L1-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L1-L16)

 [agent/src/ArenaAgent.ts L40-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L40-L48)

## Error Handling and Logging

The middleware includes comprehensive logging using the `chalk` library for colored console output:

**Success Case** (payment verified):

```javascript
console.log(chalk.green(`✅ Payment verified from ${stacksAddress}`));
```

**Rejection Case** (no payment proof):

* Returns HTTP 402 status
* Includes structured error object
* Logs warning (implicit through response)

The endpoint handlers downstream from the middleware include their own error handling for contract call failures, which are separate from payment verification failures.

**Sources**: [agent/src/ArenaAgent.ts L137](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L137-L137)

 [agent/src/ArenaAgent.ts L179-L182](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L179-L182)

## Integration with x402-stacks Package

The agent leverages the `x402-stacks` npm package (version 2.0.1) for protocol constants and utilities:

```mermaid
flowchart TD

Package["x402-stacks@2.0.1<br>(npm package)"]
Headers["X402_HEADERS"]
Middleware["x402Middleware"]
Response["HTTP 402 Response<br>with payment instructions"]

Package -.-> Headers
Headers -.-> Middleware
Middleware -.-> Response
```

The package provides standardized header names and response formats that ensure compatibility with x402-aware clients. Package specification: [agent/package.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package.json)

**Sources**: [agent/README.md L29](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md#L29-L29)

 [agent/src/ArenaAgent.ts L3-L4](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L3-L4)

---

# Markov-Chain-AI-Strategy

# Markov Chain AI Strategy

> **Relevant source files**
> * [PROJECT_SUMMARY.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/README.md)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

This document describes the `OpponentModel` class and its implementation of first-order Markov Chain pattern recognition for strategic gameplay in the GameArena agent. The Markov Chain system learns opponent behavior patterns and generates counter-moves for Rock-Paper-Scissors, Dice Roll, and Coin Flip games.

For information about how the agent accepts matches and manages API endpoints, see [Agent API Endpoints](/HACK3R-CRYPTO/GameArenaStacks/3.5-agent-api-endpoints). For details on how the Markov predictions are triggered during chain monitoring, see [Chain Monitoring and Auto-Resolution](/HACK3R-CRYPTO/GameArenaStacks/3.4-chain-monitoring-and-auto-resolution).

**Sources:** [agent/src/ArenaAgent.ts L54-L61](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L54-L61)

## System Overview

The Markov Chain AI operates as a pattern recognition engine that maintains transition probability matrices for each opponent across different game types. The system follows a learning-prediction cycle where every opponent move updates the transition matrix, and predictions are generated by analyzing historical patterns to produce optimal counter-strategies.

```mermaid
flowchart TD

TransMap["transitions: Record>"]
HistMap["history: Record>"]
UpdateMethod["update(gameType, player, move)"]
PredictMethod["predict(gameType, player): number"]
ObserveMove["Observe opponent move from contract"]
RecordTransition["Record state transition"]
UpdateMatrix["Update transition counts"]
StoreState["Store current move as lastMove"]
QueryMatrix["Query transition matrix"]
BuildProbDist["Build probability distribution"]
SelectMaxProb["Select most likely next move"]
ApplyCounter["Apply game-specific counter-strategy"]
CounterMove["Return counter-move"]

ObserveMove -.-> UpdateMethod
UpdateMethod -.-> RecordTransition
UpdateMatrix -.-> TransMap
StoreState -.-> HistMap
PredictMethod -.-> QueryMatrix
QueryMatrix -.-> TransMap
QueryMatrix -.-> HistMap
PredictMethod -.-> BuildProbDist
ApplyCounter -.-> CounterMove

subgraph subGraph2 ["Prediction Cycle"]
    QueryMatrix
    BuildProbDist
    SelectMaxProb
    ApplyCounter
    BuildProbDist -.-> SelectMaxProb
    SelectMaxProb -.-> ApplyCounter
end

subgraph subGraph1 ["Learning Cycle"]
    ObserveMove
    RecordTransition
    UpdateMatrix
    StoreState
    RecordTransition -.-> UpdateMatrix
    UpdateMatrix -.-> StoreState
end

subgraph subGraph0 ["OpponentModel Class"]
    TransMap
    HistMap
    UpdateMethod
    PredictMethod
end
```

**Sources:** [agent/src/ArenaAgent.ts L62-L102](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L62-L102)

## OpponentModel Class Architecture

The `OpponentModel` class is instantiated as a singleton at module scope and maintains state across all matches. The class tracks two primary data structures: transition matrices and move history.

### Data Structure Organization

| Field | Type | Purpose |
| --- | --- | --- |
| `transitions` | `Record<number, Record<string, number[][]>>` | Three-dimensional nested structure: gameType → player address → transition matrix |
| `history` | `Record<number, Record<string, number>>` | Two-dimensional structure: gameType → player address → last move |

The transition matrix for each player is a 2D array where `transitions[gameType][player][lastMove][currentMove]` stores the count of times a player transitioned from `lastMove` to `currentMove`. Matrix dimensions depend on game type:

* **Rock-Paper-Scissors (gameType=0)**: 3×3 matrix (0=Rock, 1=Paper, 2=Scissors)
* **Dice Roll (gameType=1)**: 6×6 matrix (0-5 representing dice values)
* **Coin Flip (gameType=2)**: 2×2 matrix (0=Heads, 1=Tails)

```mermaid
flowchart TD

HGT0["gameType: 0"]
HP1["player: ST1ABC..."]
HP2["player: ST2XYZ..."]
HGT1["gameType: 1"]
LastMove1["lastMove: 2"]
LastMove2["lastMove: 0"]
GT0["gameType: 0 (RPS)"]
P1A["player: ST1ABC..."]
P1B["player: ST2XYZ..."]
GT1["gameType: 1 (Dice)"]
GT2["gameType: 2 (Coin)"]
M3x3["3x3 matrix:<br>[[counts]]"]
M6x6["6x6 matrix:<br>[[counts]]"]
M2x2["2x2 matrix:<br>[[counts]]"]

subgraph subGraph1 ["history Data Structure"]
    HGT0
    HP1
    HP2
    HGT1
    LastMove1
    LastMove2
    HGT0 -.-> HP1
    HGT0 -.-> HP2
    HGT1 -.-> HP1
    HP1 -.-> LastMove1
    HP2 -.-> LastMove2
end

subgraph subGraph0 ["transitions Data Structure"]
    GT0
    P1A
    P1B
    GT1
    GT2
    M3x3
    M6x6
    M2x2
    GT0 -.-> P1A
    GT0 -.-> P1B
    GT1 -.-> P1A
    GT2 -.-> P1A
    P1A -.-> M3x3
    P1B -.-> M3x3
    P1A -.-> M6x6
    P1A -.-> M2x2
end
```

**Sources:** [agent/src/ArenaAgent.ts L63-L65](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L63-L65)

## Learning Process: The update Method

The `update` method records opponent behavior patterns by incrementing transition counts. The method is called whenever an opponent's move is observed, either through the `/play-move` endpoint or the `monitorChain` background process.

### Update Method Algorithm

```mermaid
sequenceDiagram
  participant p1 as Caller (API or Monitor)
  participant p2 as update(gameType, player, move)
  participant p3 as transitions map
  participant p4 as history map

  p1->>p2: "Call with (0, ST1ABC..., 2)"
  note over p2,p4: Initialization Phase
  p2->>p2: "Check if transitions[0] exists"
  p2->>p3: "Create transitions[0] if needed"
  p2->>p2: "Check if history[0] exists"
  p2->>p4: "Create history[0] if needed"
  note over p2,p3: Matrix Initialization
  p2->>p2: "Determine size=3 (gameType=0)"
  p2->>p2: "Check transitions[0][ST1ABC...]"
  p2->>p3: "Create 3x3 matrix if needed"
  note over p2,p3: Transition Recording
  p2->>p4: "Retrieve lastMove for player"
  p2->>p2: "Validate lastMove and move < size"
  p2->>p3: "Increment transitions[0][ST1ABC...][lastMove][2]"
  note over p2,p4: State Update
  p2->>p4: "Store move=2 as new lastMove"
  p2-->>p1: "Return (void)"
```

The method performs validation to ensure array bounds are respected:

1. **Boundary Check**: Only records transitions if both `lastMove` and `move` are within valid range (`< size`)
2. **Initialization Guard**: Creates nested data structures on-demand to avoid null reference errors
3. **Safe Increment**: Uses nullish coalescing (`row[move] || 0`) to handle uninitialized cells

**Sources:** [agent/src/ArenaAgent.ts L67-L83](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L67-L83)

## Prediction and Counter-Strategy: The predict Method

The `predict` method generates the agent's next move by analyzing transition probabilities and applying game-specific counter-strategies. The method implements a two-stage pipeline: probability prediction followed by counter-move transformation.

### Prediction Pipeline

```mermaid
flowchart TD

Input["predict(gameType, player)"]
CheckData["Has player<br>transition data?"]
CheckLastMove["Has lastMove<br>for player?"]
GetCounts["counts = transitions[gameType][player][lastMove]"]
CheckTotal["total > 0?"]
FindMax["Find move with highest count:<br>for i in 0..size:<br>  if counts[i] > counts[predictedMove]:<br>    predictedMove = i"]
RandomFallback["return Math.floor(Math.random() * size)"]
CounterRPS["RPS Counter:<br>return (predictedMove + 1) % 3"]
CounterDice["Dice Counter:<br>return Math.random() > 0.3 ? 5 : random"]
CounterCoin["Coin Counter:<br>return Math.random() > 0.5 ?<br>predictedMove : 1 - predictedMove"]
GameTypeSwitch["gameType?"]
Output["Return counter-move"]

Input -.->|"Yes"| CheckData
CheckData -.->|"No"| RandomFallback
CheckData -.->|"Yes"| CheckLastMove
CheckLastMove -.->|"No"| RandomFallback
CheckLastMove -.-> GetCounts
GetCounts -.->|"Yes"| CheckTotal
CheckTotal -.->|"No"| RandomFallback
CheckTotal -.-> FindMax
FindMax -.->|"1"| GameTypeSwitch
GameTypeSwitch -.->|"0"| CounterRPS
GameTypeSwitch -.->|"2"| CounterDice
GameTypeSwitch -.-> CounterCoin
CounterRPS -.-> Output
CounterDice -.-> Output
CounterCoin -.-> Output
RandomFallback -.-> Output
```

**Sources:** [agent/src/ArenaAgent.ts L85-L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L85-L101)

## Game-Specific Counter-Strategies

Each game type implements a unique counter-strategy based on the predicted opponent move. The strategies are designed to exploit patterns in opponent behavior while maintaining unpredictability.

### Counter-Strategy Matrix

| Game Type | Strategy | Implementation | Example |
| --- | --- | --- | --- |
| Rock-Paper-Scissors (0) | Deterministic Counter | `(predictedMove + 1) % 3` | If predict Rock(0) → play Paper(1) |
| Dice Roll (1) | Weighted Random | `Math.random() > 0.3 ? 5 : random` | 70% chance roll 6, 30% random |
| Coin Flip (2) | Adaptive Prediction | `Math.random() > 0.5 ? predicted : opposite` | 50% match prediction, 50% opposite |

### Rock-Paper-Scissors Strategy

The RPS strategy implements a **deterministic counter-pick** logic. If the Markov model predicts the opponent will play Rock (0), the agent plays Paper (1). The modulo operation ensures circular logic:

* Predicted: Rock (0) → Counter: Paper (1)
* Predicted: Paper (1) → Counter: Scissors (2)
* Predicted: Scissors (2) → Counter: Rock (0)

```mermaid
flowchart TD

PredictRock["Predicted:<br>Rock (0)"]
CounterPaper["Counter:<br>Paper (1)"]
PredictPaper["Predicted:<br>Paper (1)"]
CounterScissors["Counter:<br>Scissors (2)"]
PredictScissors["Predicted:<br>Scissors (2)"]
CounterRock["Counter:<br>Rock (0)"]

PredictRock -.->|"Beats"| CounterPaper
PredictPaper -.->|"Beats"| CounterScissors
PredictScissors -.->|"Beats"| CounterRock
CounterPaper -.-> PredictRock
CounterScissors -.-> PredictPaper
CounterRock -.-> PredictScissors
```

**Sources:** [agent/src/ArenaAgent.ts L98](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L98-L98)

### Dice Roll Strategy

The Dice strategy implements a **risk-reward optimization** where the agent heavily favors rolling the maximum value (5, representing a 6 on a standard die). This strategy assumes:

1. Higher numbers win in dice roll games
2. A 70/30 split provides competitive advantage while maintaining some unpredictability
3. The random 30% prevents complete predictability

**Sources:** [agent/src/ArenaAgent.ts L99](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L99-L99)

### Coin Flip Strategy

The Coin Flip strategy implements an **adaptive mirroring** approach. The agent has a 50% chance to either match the predicted move or play the opposite. This creates uncertainty in the agent's behavior while still leveraging learned patterns.

**Sources:** [agent/src/ArenaAgent.ts L100](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L100-L100)

## Integration with Agent System

The `OpponentModel` is instantiated as a module-level singleton and integrated into multiple agent subsystems. The integration points demonstrate how pattern learning and prediction are triggered during the agent lifecycle.

### Integration Architecture

```mermaid
flowchart TD

ModelInstance["model = new OpponentModel()"]
PlayMoveAPI["app.post('/play-move', x402Middleware(500))"]
FairnessCheck["callReadOnlyFunction('get-player-move')"]
ExtractChallengerMove["challengerMoveValue = Number(moveData.value)"]
UpdateCall1["model.update(gameType, challenger, challengerMoveValue)"]
PredictCall1["move = model.predict(gameType, challenger)"]
MonitorLoop["setInterval(..., 20000)"]
ScanMatches["Scan last 50 matches"]
CheckAgentOpponent["Is p2 === AGENT_ADDRESS?"]
CheckChallengerPlayed["Has challenger played?"]
ExtractMove["challengerMove = Number(move1Data.value)"]
UpdateCall2["model.update(gameType, p1, challengerMove)"]
PredictCall2["aiMove = model.predict(gameType, p1)"]
BroadcastMove["broadcastTransaction(play-move, aiMove)"]

ModelInstance -.->|"used by"| PlayMoveAPI
ModelInstance -.->|"used by"| MonitorLoop

subgraph subGraph1 ["monitorChain Background Process"]
    MonitorLoop
    ScanMatches
    CheckAgentOpponent
    CheckChallengerPlayed
    ExtractMove
    UpdateCall2
    PredictCall2
    BroadcastMove
    MonitorLoop -.->|"Yes"| ScanMatches
    ScanMatches -.-> CheckAgentOpponent
    CheckAgentOpponent -.->|"Yes"| CheckChallengerPlayed
    CheckChallengerPlayed -.-> ExtractMove
    ExtractMove -.-> UpdateCall2
    UpdateCall2 -.-> PredictCall2
    PredictCall2 -.-> BroadcastMove
end

subgraph subGraph0 ["POST /play-move Endpoint"]
    PlayMoveAPI
    FairnessCheck
    ExtractChallengerMove
    UpdateCall1
    PredictCall1
    PlayMoveAPI -.-> FairnessCheck
    FairnessCheck -.-> ExtractChallengerMove
    ExtractChallengerMove -.-> UpdateCall1
    UpdateCall1 -.-> PredictCall1
end
```

**Sources:** [agent/src/ArenaAgent.ts L104](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L104-L104)

 [agent/src/ArenaAgent.ts L186-L240](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L240)

 [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

### API Endpoint Integration

When the `/play-move` endpoint receives a request without a `move` parameter, it triggers the AI prediction pipeline. The endpoint performs a **fairness check** by querying the contract to ensure the challenger has already committed their move on-chain before the agent responds.

Key integration points in [agent/src/ArenaAgent.ts L186-L240](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L240)

:

1. **Line 191-237**: AI prediction is triggered when `move === undefined`
2. **Line 194-224**: Fairness verification queries `get-player-move` for the challenger
3. **Line 228**: Pattern learning via `model.update(gameType, challenger, challengerMoveValue)`
4. **Line 231**: Counter-move generation via `model.predict(gameType, challenger)`

**Sources:** [agent/src/ArenaAgent.ts L186-L240](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L240)

### Chain Monitor Integration

The `monitorChain` background process continuously polls the blockchain for active matches where the agent is the opponent. When it detects that a challenger has played but the agent hasn't, it automatically triggers pattern learning and move execution.

Key integration points in [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

:

1. **Line 367**: Matches are filtered to `status === 1` (ACCEPTED)
2. **Line 435-442**: Agent detects challenger move and triggers AI pipeline
3. **Line 441**: Pattern learning via `model.update(gameType, p1, challengerMove)`
4. **Line 442**: Counter-move generation via `model.predict(gameType, p1)`
5. **Line 448-467**: AI move is broadcast to the contract via `play-move` transaction

This automated pipeline ensures the agent responds to matches without manual intervention, demonstrating autonomous gameplay.

**Sources:** [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

## Pattern Learning Example

The following example demonstrates how the Markov model learns and adapts to a Rock-Paper-Scissors opponent over multiple rounds.

### Learning Progression

| Round | Opponent Move | Agent Action | Transition Matrix State (for opponent) |
| --- | --- | --- | --- |
| 1 | Rock (0) | `update(0, opponent, 0)` | `history[0][opponent] = 0` (no prior state) |
| 2 | Paper (1) | `update(0, opponent, 1)` | `transitions[0][opponent][0][1] += 1` (Rock→Paper) |
| 3 | Paper (1) | `update(0, opponent, 1)` | `transitions[0][opponent][1][1] += 1` (Paper→Paper) |
| 4 | Scissors (2) | `update(0, opponent, 2)` | `transitions[0][opponent][1][2] += 1` (Paper→Scissors) |
| 5 | - | `predict(0, opponent)` | Predicts Paper (1) → Returns Scissors (2) |

After round 4, the transition matrix for this opponent shows:

```
R  P  S
R  [ 0, 1, 0 ]  (After Rock, played Paper once)
P  [ 0, 1, 1 ]  (After Paper, played Paper once, Scissors once)
S  [ 0, 0, 0 ]  (No data after Scissors yet)
```

In round 5, the `predict` method:

1. Looks at `lastMove = 2` (Scissors)
2. Finds `transitions[0][opponent][2] = [0, 0, 0]` (no data)
3. Falls back to random move

As more rounds are played, the matrix becomes more populated, enabling increasingly accurate predictions.

**Sources:** [agent/src/ArenaAgent.ts L67-L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L67-L101)

## Fair Play Guarantee

The Markov AI strictly enforces fair play by refusing to generate moves until the opponent's move is confirmed on-chain. This prevents front-running attacks where the agent could see a pending transaction and respond strategically before it's finalized.

```mermaid
sequenceDiagram
  participant p1 as /play-move Endpoint
  participant p2 as arena-platform-v2 Contract
  participant p3 as OpponentModel

  note over p1,p3: Fairness Verification Phase
  p1->>p2: "get-match-details(matchId)"
  p2-->>p1: "challenger, opponent, gameType"
  p1->>p2: "get-player-move(matchId, challenger)"
  p2-->>p1: "moveData"
  alt Challenger has not played
    p1-->>p1: "Return 403 FAIRNESS_VIOLATION"
    note over p1: "Agent refuses to move first"
  else Challenger has played on-chain
    p1->>p3: "update(gameType, challenger, move)"
    p1->>p3: "predict(gameType, challenger)"
    p3-->>p1: "aiMove"
    p1->>p2: "play-move(matchId, aiMove)"
  end
```

The fairness check at [agent/src/ArenaAgent.ts L217-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L217-L224)

 returns HTTP 403 with error code `FAIRNESS_VIOLATION` if the challenger hasn't committed their move. This ensures:

1. **No Front-Running**: Agent cannot observe and counter pending transactions
2. **Transparent AI**: All AI decisions are based on immutable on-chain data
3. **Trust Building**: Users can verify the agent plays fairly by inspecting contract state

**Sources:** [agent/src/ArenaAgent.ts L194-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L194-L224)

## Memory and State Persistence

The `OpponentModel` maintains state in-memory for the duration of the agent process. Key characteristics:

| Aspect | Behavior | Implication |
| --- | --- | --- |
| **Scope** | Module-level singleton | Single model instance serves all matches |
| **Persistence** | In-memory only | Pattern data lost on agent restart |
| **Isolation** | Per-opponent tracking | Each player address has separate transition matrices |
| **Game Type Separation** | Per-gameType isolation | RPS patterns don't affect Dice patterns |

The lack of persistent storage means the agent "forgets" learned patterns on restart, starting fresh with each deployment. For production systems, the model could be extended to serialize state to disk or a database.

**Sources:** [agent/src/ArenaAgent.ts L104](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L104-L104)

## Performance Characteristics

The Markov Chain implementation is optimized for real-time gameplay with minimal computational overhead:

### Time Complexity

* **update(gameType, player, move)**: O(1) - Direct array access and increment
* **predict(gameType, player)**: O(size) - Linear scan to find max count, where size ≤ 6

### Space Complexity

Per opponent per game type:

* **Rock-Paper-Scissors**: 3×3 matrix = 9 integers
* **Dice Roll**: 6×6 matrix = 36 integers
* **Coin Flip**: 2×2 matrix = 4 integers

For N opponents across M game types, total space is O(N × M × size²), which remains negligible even with thousands of opponents.

**Sources:** [agent/src/ArenaAgent.ts L63-L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L63-L101)

---

# Chain-Monitoring-and-Auto-Resolution

# Chain Monitoring and Auto-Resolution

> **Relevant source files**
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

**Purpose**: This document explains the autonomous blockchain monitoring system implemented by the AI agent. The `monitorChain` background process continuously polls the Stacks blockchain to detect match state changes and automatically executes agent moves and match resolutions. This page focuses on the monitoring loop, auto-play logic, and winner determination. For the AI strategy that determines which move to play, see [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy). For the HTTP endpoints that can manually trigger agent actions, see [Agent API Endpoints](/HACK3R-CRYPTO/GameArenaStacks/3.5-agent-api-endpoints).

**Scope**: Covers the [agent/src/ArenaAgent.ts L329-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L329-L475)

 background process, including match scanning, fairness verification, automatic move execution, and on-chain resolution.

---

## Overview

The chain monitoring system enables the agent to operate autonomously without manual intervention. Once started, the agent continuously scans the blockchain for matches requiring action and automatically:

1. Detects when a challenger has played their move
2. Executes the AI's counter-move after fairness verification
3. Resolves matches when both players have committed moves
4. Determines winners using game-specific logic

The system runs in a background interval that polls every 20 seconds, ensuring timely responses while minimizing RPC load.

**Sources**: [agent/src/ArenaAgent.ts L329-L481](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L329-L481)

---

## System Architecture

### Monitoring Loop Initialization

The `monitorChain()` function is invoked when the Express server starts, establishing a perpetual background process:

```mermaid
flowchart TD

ServerStart["app.listen(PORT)"]
InitMonitor["monitorChain() called"]
SetInterval["setInterval() starts<br>20-second cycle"]
PollingLoop["Polling Loop Executes"]
GetMatchCount["callReadOnlyFunction:<br>get-match-count"]
ScanMatches["Scan last 50 matches"]
ProcessMatch["Process each match"]
Note1["Runs continuously<br>until process terminates"]

ServerStart -.-> InitMonitor
InitMonitor -.-> SetInterval
SetInterval -.-> PollingLoop
PollingLoop -.-> GetMatchCount
GetMatchCount -.-> ScanMatches
ScanMatches -.-> ProcessMatch
ProcessMatch -.-> PollingLoop
SetInterval -.-> Note1
```

**Initialization Flow**:

1. Server starts on the configured `PORT` (default: 3000)
2. `monitorChain()` is called as part of the `app.listen()` callback
3. `setInterval()` establishes a 20-second recurring timer
4. Each cycle queries `get-match-count` from the contract
5. Scans the last 50 matches to catch any missed due to RPC latency

**Sources**: [agent/src/ArenaAgent.ts L477-L481](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L477-L481)

 [agent/src/ArenaAgent.ts L330-L334](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L334)

---

## Match Scanning Logic

### Query Pattern

The monitor scans matches in reverse chronological order (newest first) to prioritize recent activity:

| Step | Contract Function | Purpose |
| --- | --- | --- |
| 1 | `get-match-count()` | Retrieve total number of matches created |
| 2 | `get-match-details(matchId)` | Fetch match metadata for each ID in scan range |
| 3 | `get-player-move(matchId, principal)` | Query move commitments for both players |

The scan range is calculated as:

```javascript
const start = count - 1;           // Most recent match
const end = Math.max(0, count - 50); // Up to 50 matches back
```

**Sources**: [agent/src/ArenaAgent.ts L336-L360](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L336-L360)

### Match State Detection

```css
#mermaid-cb6wpyow30b{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;fill:#333;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-cb6wpyow30b .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-cb6wpyow30b .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-cb6wpyow30b .error-icon{fill:#dddddd;}#mermaid-cb6wpyow30b .error-text{fill:#222222;stroke:#222222;}#mermaid-cb6wpyow30b .edge-thickness-normal{stroke-width:1px;}#mermaid-cb6wpyow30b .edge-thickness-thick{stroke-width:3.5px;}#mermaid-cb6wpyow30b .edge-pattern-solid{stroke-dasharray:0;}#mermaid-cb6wpyow30b .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-cb6wpyow30b .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-cb6wpyow30b .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-cb6wpyow30b .marker{fill:#999;stroke:#999;}#mermaid-cb6wpyow30b .marker.cross{stroke:#999;}#mermaid-cb6wpyow30b svg{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;}#mermaid-cb6wpyow30b p{margin:0;}#mermaid-cb6wpyow30b defs #statediagram-barbEnd{fill:#999;stroke:#999;}#mermaid-cb6wpyow30b g.stateGroup text{fill:#dddddd;stroke:none;font-size:10px;}#mermaid-cb6wpyow30b g.stateGroup text{fill:#333;stroke:none;font-size:10px;}#mermaid-cb6wpyow30b g.stateGroup .state-title{font-weight:bolder;fill:#333;}#mermaid-cb6wpyow30b g.stateGroup rect{fill:#ffffff;stroke:#dddddd;}#mermaid-cb6wpyow30b g.stateGroup line{stroke:#999;stroke-width:1;}#mermaid-cb6wpyow30b .transition{stroke:#999;stroke-width:1;fill:none;}#mermaid-cb6wpyow30b .stateGroup .composit{fill:#f4f4f4;border-bottom:1px;}#mermaid-cb6wpyow30b .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#mermaid-cb6wpyow30b .state-note{stroke:#e6d280;fill:#fff5ad;}#mermaid-cb6wpyow30b .state-note text{fill:#333;stroke:none;font-size:10px;}#mermaid-cb6wpyow30b .stateLabel .box{stroke:none;stroke-width:0;fill:#ffffff;opacity:0.5;}#mermaid-cb6wpyow30b .edgeLabel .label rect{fill:#ffffff;opacity:0.5;}#mermaid-cb6wpyow30b .edgeLabel{background-color:#ffffff;text-align:center;}#mermaid-cb6wpyow30b .edgeLabel p{background-color:#ffffff;}#mermaid-cb6wpyow30b .edgeLabel rect{opacity:0.5;background-color:#ffffff;fill:#ffffff;}#mermaid-cb6wpyow30b .edgeLabel .label text{fill:#333;}#mermaid-cb6wpyow30b .label div .edgeLabel{color:#333;}#mermaid-cb6wpyow30b .stateLabel text{fill:#333;font-size:10px;font-weight:bold;}#mermaid-cb6wpyow30b .node circle.state-start{fill:#999;stroke:#999;}#mermaid-cb6wpyow30b .node .fork-join{fill:#999;stroke:#999;}#mermaid-cb6wpyow30b .node circle.state-end{fill:#dddddd;stroke:#f4f4f4;stroke-width:1.5;}#mermaid-cb6wpyow30b .end-state-inner{fill:#f4f4f4;stroke-width:1.5;}#mermaid-cb6wpyow30b .node rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-cb6wpyow30b .node polygon{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-cb6wpyow30b #statediagram-barbEnd{fill:#999;}#mermaid-cb6wpyow30b .statediagram-cluster rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-cb6wpyow30b .cluster-label,#mermaid-cb6wpyow30b .nodeLabel{color:#333;}#mermaid-cb6wpyow30b .statediagram-cluster rect.outer{rx:5px;ry:5px;}#mermaid-cb6wpyow30b .statediagram-state .divider{stroke:#dddddd;}#mermaid-cb6wpyow30b .statediagram-state .title-state{rx:5px;ry:5px;}#mermaid-cb6wpyow30b .statediagram-cluster.statediagram-cluster .inner{fill:#f4f4f4;}#mermaid-cb6wpyow30b .statediagram-cluster.statediagram-cluster-alt .inner{fill:#f8f8f8;}#mermaid-cb6wpyow30b .statediagram-cluster .inner{rx:0;ry:0;}#mermaid-cb6wpyow30b .statediagram-state rect.basic{rx:5px;ry:5px;}#mermaid-cb6wpyow30b .statediagram-state rect.divider{stroke-dasharray:10,10;fill:#f8f8f8;}#mermaid-cb6wpyow30b .note-edge{stroke-dasharray:5;}#mermaid-cb6wpyow30b .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-cb6wpyow30b .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-cb6wpyow30b .statediagram-note text{fill:#333;}#mermaid-cb6wpyow30b .statediagram-note .nodeLabel{color:#333;}#mermaid-cb6wpyow30b .statediagram .edgeLabel{color:red;}#mermaid-cb6wpyow30b #dependencyStart,#mermaid-cb6wpyow30b #dependencyEnd{fill:#999;stroke:#999;stroke-width:1;}#mermaid-cb6wpyow30b .statediagramTitleText{text-anchor:middle;font-size:18px;fill:#333;}#mermaid-cb6wpyow30b :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}"get-match-details(i)""Extract status field""status !== 1(not ACTIVE)""status === 1(ACCEPTED)""get-player-move(i, challenger)""get-player-move(i, opponent)""move1 && move2""move1 && !move2 && p2==AGENT""!move1"QueryMatchCheckStatusSkipMatchQueryMovesFetchP1MoveFetchP2MoveAnalyzeStateBothMovedAgentNeedsMoveWaitingForChallengerTriggerResolutionExecuteAIMove
```

The monitor categorizes each match into one of four states based on move commitments:

1. **Not Active**: Status is not `1` (ACCEPTED) - skip processing
2. **Waiting for Challenger**: Challenger (`p1`) has not committed a move yet
3. **Agent Needs Move**: Challenger has moved, but agent (`p2`) has not
4. **Both Moved**: Both players have committed - trigger resolution

**Sources**: [agent/src/ArenaAgent.ts L361-L469](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L361-L469)

---

## Automatic Agent Move Execution

### Fairness Verification

When the monitor detects the challenger has played, it enforces the Fair Play guarantee before executing the AI's move:

```mermaid
sequenceDiagram
  participant p1 as monitorChain()
  participant p2 as arena-platform-v2
  participant p3 as OpponentModel
  participant p4 as Stacks Network

  p1->>p2: "get-player-move(matchId, challenger)"
  p2-->>p1: "move1Data = {value: N}"
  p1->>p2: "get-player-move(matchId, AGENT_ADDRESS)"
  p2-->>p1: "move2Data = null"
  note over p1: "Fairness Check Passed:<br/>Challenger committed first"
  p1->>p3: "model.update(gameType, challenger, move1)"
  p3-->>p1: "Pattern recorded"
  p1->>p3: "model.predict(gameType, challenger)"
  p3-->>p1: "aiMove = predicted counter"
  p1->>p4: "Fetch nonce for AGENT_ADDRESS"
  p4-->>p1: "possible_next_nonce"
  p1->>p1: "makeContractCall(play-move, matchId, aiMove)"
  p1->>p4: "broadcastTransaction()"
  alt "Success"
    p4-->>p1: "{txid: '0x...'}"
    p1->>p1: "Log: AI Move committed for Match"
  else "Error"
    p4-->>p1: "{error: '...'}"
    p1->>p1: "Log error, continue monitoring"
  end
```

**Key Implementation Details**:

* **Fairness Condition**: Only proceeds if `move1Data.value` exists AND `move2Data` is null/undefined
* **Pattern Learning**: Calls `model.update(gameType, p1, challengerMove)` to record the opponent's move
* **AI Decision**: Invokes `model.predict(gameType, p1)` to generate the counter-move
* **Nonce Management**: Fetches fresh nonce from `${network.coreApiUrl}/extended/v1/address/${AGENT_ADDRESS}/nonces`

**Sources**: [agent/src/ArenaAgent.ts L435-L468](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L435-L468)

 [agent/src/ArenaAgent.ts L441-L442](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L441-L442)

### Transaction Construction for AI Moves

```javascript
const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'play-move',
    functionArgs: [uintCV(i), uintCV(aiMove)],
    senderKey: PRIVATE_KEY,
    network,
    nonce: BigInt(possible_next_nonce),
    anchorMode: 1,              // AnchorMode.Any
    postConditionMode: 1        // PostConditionMode.Deny
};
```

The agent constructs transactions with:

* **Function**: `play-move` from the `arena-platform-v2` contract
* **Arguments**: Match ID (uint) and the AI's move (uint)
* **Nonce**: Manually fetched to ensure correct sequencing
* **Post-Condition Mode**: Deny (ensures no unexpected asset transfers)

**Sources**: [agent/src/ArenaAgent.ts L448-L458](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L448-L458)

---

## Automatic Match Resolution

### Resolution Trigger Conditions

When both players have committed moves, the monitor automatically resolves the match:

```mermaid
flowchart TD

DetectBothMoved["Monitor detects:<br>move1 && move2"]
ExtractMoves["Extract move values:<br>move1 = Number(move1Data.value)<br>move2 = Number(move2Data.value)"]
CallCalculateWinner["calculateWinner(gameType, move1, move2, p1, p2)"]
DetermineWinner["Winner returned?"]
AssignWinner["finalWinner = winner"]
HandleDraw["finalWinner = p1<br>(give draw to challenger)"]
FetchNonce["Fetch nonce for AGENT_ADDRESS"]
BuildResolutionTx["makeContractCall:<br>resolve-match(matchId, finalWinner)"]
BroadcastTx["broadcastTransaction()"]
LogSuccess["console.log:<br>Match resolved! TX: txid"]
LogFailure["console.error:<br>Resolution failed"]

DetectBothMoved -.-> ExtractMoves
ExtractMoves -.-> CallCalculateWinner
CallCalculateWinner -.->|"winner == null(draw)"| DetermineWinner
DetermineWinner -.->|"winner != null"| AssignWinner
DetermineWinner -.-> HandleDraw
AssignWinner -.-> FetchNonce
HandleDraw -.-> FetchNonce
FetchNonce -.->|"Error"| BuildResolutionTx
BuildResolutionTx -.->|"Success"| BroadcastTx
BroadcastTx -.-> LogSuccess
BroadcastTx -.-> LogFailure
```

**Resolution Logic**:

1. Detects both `move1Data` and `move2Data` have values
2. Extracts numeric move values from the contract response
3. Calls `calculateWinner()` with game type and move data
4. Handles draws by assigning the win to the challenger (for demo friendliness)
5. Constructs a `resolve-match` transaction with the winner's principal
6. Broadcasts the resolution to finalize the match on-chain

**Sources**: [agent/src/ArenaAgent.ts L392-L434](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L392-L434)

---

## Winner Determination Logic

### calculateWinner Function

The `calculateWinner()` function implements game-specific rules for each of the three supported game types:

```mermaid
flowchart TD

Input["calculateWinner(gameType, move1, move2, p1, p2)"]
CheckGameType["gameType?"]
RPS["gameType === 0<br>Rock-Paper-Scissors"]
Dice["gameType === 1<br>Dice Roll"]
Coin["gameType === 2<br>Coin Flip"]
RPSEqual["move1 == move2?"]
RPSWinConditions["Winning conditions:<br>(0,2), (1,0), (2,1)"]
RPSDraw["return null"]
RPSP1Wins["return p1"]
RPSP2Wins["return p2"]
DiceEqual["move1 == move2?"]
DiceCompare["move1 > move2?"]
DiceDraw["return null"]
DiceP1["return p1"]
DiceP2["return p2"]
CoinMatch["move1 == move2?"]
CoinP1["return p1<br>(prediction matched)"]
CoinP2["return p2<br>(prediction failed)"]

Input -.->|"1"| CheckGameType
CheckGameType -.->|"0"| RPS
CheckGameType -.-> Dice
CheckGameType -.->|"2"| Coin

subgraph CoinLogic ["Coin Logic"]
    Coin
    CoinMatch
    CoinP1
    CoinP2
    Coin -.->|"No"| CoinMatch
    CoinMatch -.->|"Yes"| CoinP1
    CoinMatch -.-> CoinP2
end

subgraph DiceLogic ["Dice Logic"]
    Dice
    DiceEqual
    DiceCompare
    DiceDraw
    DiceP1
    DiceP2
    Dice -.->|"Yes"| DiceEqual
    DiceEqual -.->|"No"| DiceDraw
    DiceEqual -.->|"No"| DiceCompare
    DiceCompare -.->|"Yes"| DiceP1
    DiceCompare -.-> DiceP2
end

subgraph RPSLogic ["RPS Logic"]
    RPS
    RPSEqual
    RPSWinConditions
    RPSDraw
    RPSP1Wins
    RPSP2Wins
    RPS -.->|"Yes"| RPSEqual
    RPSEqual -.->|"No"| RPSDraw
    RPSEqual -.->|"p2 wins"| RPSWinConditions
    RPSWinConditions -.->|"p1 wins"| RPSP1Wins
    RPSWinConditions -.-> RPSP2Wins
end
```

### Game-Specific Rules

| Game Type | ID | Win Condition | Draw Condition |
| --- | --- | --- | --- |
| **Rock-Paper-Scissors** | 0 | Rock (0) beats Scissors (2)Paper (1) beats Rock (0)Scissors (2) beats Paper (1) | Both players choose the same move |
| **Dice Roll** | 1 | Higher number wins (0-5 range) | Both players roll the same number |
| **Coin Flip** | 2 | Challenger's prediction (move1) matches agent's result (move2) | N/A (always has a winner) |

**Implementation Details**:

* **RPS**: Uses modulo arithmetic to determine winning combinations ``` if ((move1 === 0 && move2 === 2) || (move1 === 1 && move2 === 0) || (move1 === 2 && move2 === 1)) {     return p1; } ```
* **Dice**: Simple numerical comparison ``` return move1 > move2 ? p1 : p2; ```
* **Coin Flip**: Challenger wins if their prediction matches the agent's coin flip ``` return move1 === move2 ? p1 : p2; ```

**Sources**: [agent/src/ArenaAgent.ts L304-L327](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L304-L327)

---

## Nonce Management

### Multi-Node Nonce Fetching

To ensure transaction reliability, the monitor implements a fallback strategy when fetching nonces:

```mermaid
sequenceDiagram
  participant p1 as monitorChain()
  participant p2 as api.testnet.hiro.so
  participant p3 as stacks-node-api.testnet.stacks.co
  participant p4 as makeContractCall()

  p1->>p2: "GET /extended/v1/address/{addr}/nonces"
  alt "Primary Success"
    p2-->>p1: "{possible_next_nonce: N}"
    p1->>p1: "nonce = N"
  else "Primary Timeout/Failure"
    p2-->>p1: "Error"
    p1->>p3: "GET /extended/v1/address/{addr}/nonces"
    p3-->>p1: "{possible_next_nonce: N}"
    p1->>p1: "nonce = N"
  end
  p1->>p4: "txOptions with nonce: BigInt(N)"
  p4-->>p1: "Transaction constructed"
```

**Nonce Fetching Strategy**:

For AI moves in the monitoring loop:

```javascript
const nonceRes = await fetch(`${network.coreApiUrl}/extended/v1/address/${AGENT_ADDRESS}/nonces`);
const { possible_next_nonce } = await nonceRes.json();
```

The nonce is then converted to `BigInt` and included in transaction options to ensure proper sequencing:

```yaml
nonce: BigInt(possible_next_nonce)
```

**Why Manual Nonce Management?**

The agent explicitly fetches and manages nonces rather than relying on `@stacks/transactions` auto-detection because:

1. The monitoring loop executes multiple transactions in quick succession
2. Auto-detection can cause race conditions when the mempool is slow to update
3. Manual management ensures each transaction uses a strictly incrementing nonce

**Sources**: [agent/src/ArenaAgent.ts L412-L413](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L412-L413)

 [agent/src/ArenaAgent.ts L445-L446](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L445-L446)

---

## Transaction Broadcasting Pattern

### Unified Transaction Construction

Both AI moves and match resolutions follow the same transaction pattern:

```javascript
const txOptions = {
    contractAddress: CONTRACT_ADDRESS,          // 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9'
    contractName: CONTRACT_NAME,                // 'arena-platform-v2'
    functionName: 'play-move' | 'resolve-match',
    functionArgs: [...],
    senderKey: PRIVATE_KEY,
    network,
    nonce: BigInt(possible_next_nonce),
    anchorMode: 1,                              // AnchorMode.Any
    postConditionMode: 1                        // PostConditionMode.Deny
};

const transaction = await makeContractCall(txOptions);
const broadcastResponse = await broadcastTransaction(transaction, network);
```

### Response Handling

| Broadcast Result | Action | Logging |
| --- | --- | --- |
| **Success** | Continue monitoring | `✅ AI Move committed for Match #${i}! TX: ${txid}` |
| **Error** | Log error but continue | `❌ AI Move failed: ${error}` |
| **Network Timeout** | Silent retry on next cycle | No logging (caught by outer try-catch) |

**Sources**: [agent/src/ArenaAgent.ts L427-L434](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L427-L434)

 [agent/src/ArenaAgent.ts L460-L467](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L460-L467)

---

## Error Handling and Resilience

### Silent Retry Strategy

The monitoring loop implements a fault-tolerant design where all errors are silently caught:

```
try {
    // ... match scanning and processing logic
} catch (e) {
    // Silently retry on next cycle
}
```

**Rationale**:

* RPC nodes can be temporarily unavailable
* Indexer delays may cause inconsistent state reads
* Network congestion can cause timeouts
* The 20-second cycle ensures automatic retry without manual intervention

### Logging Strategy

The monitor uses color-coded console logging for operational visibility:

| Color | Prefix | Purpose | Example |
| --- | --- | --- | --- |
| **Gray** | 🔍 | General monitoring | `Monitoring Stacks chain for matches...` |
| **Cyan** | ⚔️ | Match detection | `Match #42: Both played! Resolving Type 0...` |
| **Magenta** | 🤖 | AI decision | `AI decided move for Match 42 (Type 0): 2` |
| **Yellow** | 📢 | Resolution trigger | `Finalizing Match #42: Winner is ST1...` |
| **Green Bold** | ✅ | Success | `Match #42 resolved! TX: 0x...` |
| **Red** | ❌ | Error | `Resolution failed: BadNonce` |

**Sources**: [agent/src/ArenaAgent.ts L331](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L331-L331)

 [agent/src/ArenaAgent.ts L398](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L398-L398)

 [agent/src/ArenaAgent.ts L408](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L408-L408)

 [agent/src/ArenaAgent.ts L433](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L433-L433)

---

## Monitoring Interval Configuration

### Timing Trade-offs

```mermaid
flowchart TD

Interval["20-second interval<br>(setInterval)"]
Pros["Advantages:<br>• Reduces RPC load<br>• Avoids rate limiting<br>• Sufficient responsiveness"]
Cons["Trade-offs:<br>• Maximum 20s delay<br>• Not real-time<br>• May miss rapid matches"]
Alternative1["Alternative: 5s interval<br>Higher load, faster response"]
Alternative2["Alternative: WebSocket events<br>Complex, requires node support"]

Interval -.-> Pros
Interval -.-> Cons
Interval -.-> Alternative1
Interval -.-> Alternative2
```

**Current Configuration**: `setInterval(..., 20000)` (20 seconds)

**Performance Characteristics**:

* **Scan Window**: Last 50 matches per cycle (configurable via `count - 50`)
* **Maximum Response Delay**: 20 seconds from move confirmation to agent response
* **RPC Query Rate**: ~4-6 queries per cycle (1 count + 1-5 match details + moves)
* **Network Load**: Minimal (read-only queries, single node)

**Tuning Considerations**:

* Shorter intervals reduce response time but increase RPC costs
* Longer intervals risk missing time-sensitive matches
* The 50-match scan window prevents missed matches due to timing issues

**Sources**: [agent/src/ArenaAgent.ts L474](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L474-L474)

 [agent/src/ArenaAgent.ts L348-L349](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L348-L349)

---

## Integration with Agent Lifecycle

### Startup Sequence

```mermaid
flowchart TD

Start["Process Start"]
LoadEnv["Load .env configuration<br>PRIVATE_KEY, CONTRACT_ADDRESS"]
InitNetwork["Initialize StacksTestnet<br>network object"]
DeriveAddress["Derive AGENT_ADDRESS<br>from PRIVATE_KEY"]
StartExpress["app.listen(PORT)"]
InitMonitor["monitorChain() invoked"]
SetupInterval["setInterval() registered"]
Running["🟢 Agent Operational<br>Monitoring + API Endpoints"]

Start -.-> LoadEnv
LoadEnv -.-> InitNetwork
InitNetwork -.-> DeriveAddress
DeriveAddress -.-> StartExpress
StartExpress -.-> InitMonitor
InitMonitor -.-> SetupInterval
SetupInterval -.-> Running
```

**Lifecycle Components**:

1. **Environment Setup**: Loads configuration from `.env` file * `PRIVATE_KEY`: Agent's signing key * `CONTRACT_ADDRESS`: Deployed contract address * `PORT`: Express server port
2. **Network Initialization**: Creates `StacksTestnet` instance with API URL
3. **Address Derivation**: Computes agent's address from private key
4. **Server Start**: Express begins listening on configured port
5. **Monitor Start**: `monitorChain()` establishes the background interval
6. **Operational State**: Both API endpoints and monitoring loop are active

**Sources**: [agent/src/ArenaAgent.ts L40-L52](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L40-L52)

 [agent/src/ArenaAgent.ts L477-L481](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L477-L481)

---

## Summary

The chain monitoring system provides the agent with autonomous decision-making capabilities:

| Component | Responsibility | Key Functions |
| --- | --- | --- |
| **monitorChain()** | Background polling loop | Scans matches, triggers actions |
| **Match Scanner** | State detection | Queries contract for match details |
| **Fairness Enforcer** | Move validation | Ensures challenger plays first |
| **AI Executor** | Automated move playing | Calls `play-move` with AI decision |
| **Resolution Engine** | Winner determination | Calls `resolve-match` with calculated winner |
| **calculateWinner()** | Game logic | Implements rules for RPS, Dice, Coin |
| **Nonce Manager** | Transaction sequencing | Fetches and increments nonces |
| **Error Handler** | Resilience | Silent retry on failures |

The system operates continuously once started, requiring no manual intervention to accept matches, play moves, or resolve outcomes. This autonomous behavior, combined with the x402 payment protocol (see [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware)), enables the agent to function as a self-sustaining economic participant in the GameArena ecosystem.

**Sources**: [agent/src/ArenaAgent.ts L329-L481](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L329-L481)

 [README.md L60-L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L60-L64)

---

# Agent-API-Endpoints

# Agent API Endpoints

> **Relevant source files**
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)
> * [agent/src/SimpleAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/SimpleAgent.ts)

This document describes the HTTP API endpoints exposed by the Arena Agent's Express server. These endpoints enable the frontend and external clients to interact with the autonomous AI agent, triggering match acceptance and move execution on the Stacks blockchain.

For information about the x402 payment protocol that protects these endpoints, see [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware). For details on the AI strategy used when generating moves, see [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy). For the background monitoring process that auto-resolves matches, see [Chain Monitoring and Auto-Resolution](/HACK3R-CRYPTO/GameArenaStacks/3.4-chain-monitoring-and-auto-resolution).

## API Server Architecture

The agent runs an Express.js HTTP server that exposes two primary endpoints protected by x402 payment middleware. The server is configured in [agent/src/ArenaAgent.ts L26-L36](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L26-L36)

 and listens on the port specified by the `PORT` environment variable (default: 3000).

### Express Application Structure

```mermaid
flowchart TD

ExpressApp["express()<br>Application Instance"]
JSONMiddleware["express.json()<br>Body Parser"]
CORSMiddleware["CORS Middleware<br>lines 28-36"]
x402MW["x402Middleware(amount)<br>Payment Verification<br>lines 109-140"]
AcceptEndpoint["POST /accept-match<br>x402Middleware(1000)<br>lines 143-183"]
PlayEndpoint["POST /play-move<br>x402Middleware(500)<br>lines 186-301"]
AcceptHandler["Accept Match Handler<br>Calls accept-match contract"]
PlayHandler["Play Move Handler<br>Fairness check + AI prediction"]
StacksContract["arena-platform-v2<br>Smart Contract"]

ExpressApp -.-> JSONMiddleware
ExpressApp -.-> CORSMiddleware
AcceptEndpoint -.-> x402MW
x402MW -.-> AcceptHandler
AcceptHandler -.-> StacksContract
PlayEndpoint -.-> x402MW
x402MW -.-> PlayHandler
PlayHandler -.-> StacksContract
```

**Sources:** [agent/src/ArenaAgent.ts L26-L36](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L26-L36)

 [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

 [agent/src/ArenaAgent.ts L186-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L301)

### CORS Configuration

The agent configures Cross-Origin Resource Sharing (CORS) to allow frontend requests from any origin. The CORS middleware sets the following headers:

| Header | Value | Purpose |
| --- | --- | --- |
| `Access-Control-Allow-Origin` | `*` | Permit requests from any origin |
| `Access-Control-Allow-Headers` | `Origin, X-Requested-With, Content-Type, Accept, x-payment-proof, x-stacks-address` | Allow x402 payment headers |
| `Access-Control-Allow-Methods` | `GET, POST, OPTIONS` | Permit standard HTTP methods |

The middleware handles `OPTIONS` preflight requests by returning status 200 immediately on line 32-34.

**Sources:** [agent/src/ArenaAgent.ts L28-L36](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L28-L36)

### Server Initialization

The server initialization sequence occurs on [agent/src/ArenaAgent.ts L477-L481](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L477-L481)

:

```mermaid
sequenceDiagram
  participant p1 as Main Process
  participant p2 as Express App
  participant p3 as monitorChain()<br/>Background Task

  p1->>p2: app.listen(PORT)
  p2-->>p1: Server running on PORT
  p1->>p3: Start monitoring
  p3->>p3: setInterval(20s)<br/>Continuous polling
```

**Sources:** [agent/src/ArenaAgent.ts L477-L481](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L477-L481)

 [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

## POST /accept-match Endpoint

The `/accept-match` endpoint allows clients to request that the agent accept a pending match proposal. This endpoint requires a payment of **1000 microSTX** via the x402 protocol.

### Endpoint Specification

| Property | Value |
| --- | --- |
| **Path** | `/accept-match` |
| **Method** | `POST` |
| **Middleware** | `x402Middleware(1000)` |
| **Location** | [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183) |

### Request Format

The request must include the following components:

**Headers:**

* `Content-Type: application/json`
* `x-payment-proof: <base64-encoded-payment-receipt>` (for paid requests)
* `x-stacks-address: <sender-principal>` (for paid requests)

**Body:**

```json
{
  "matchId": 42
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `matchId` | `number` | Yes | The on-chain match identifier to accept |

### Response Format

**Success Response (200):**

```json
{
  "success": true,
  "txid": "0xabc123...",
  "message": "Match accepted on Stacks"
}
```

**Payment Required Response (402):**

```json
{
  "status": 402,
  "error": "Payment Required",
  "x402Version": 2,
  "resource": {
    "url": "/accept-match",
    "description": "Agent service fee"
  },
  "accepts": [{
    "scheme": "direct-payment",
    "network": "stacks-testnet",
    "token": "STX",
    "amount": "1000",
    "payTo": "ST1234..."
  }]
}
```

**Error Response (500):**

```json
{
  "error": "Broadcast failed: ..."
}
```

### Request Processing Flow

```mermaid
sequenceDiagram
  participant p1 as Frontend Client
  participant p2 as x402Middleware(1000)
  participant p3 as Accept Handler
  participant p4 as makeContractCall
  participant p5 as broadcastTransaction
  participant p6 as arena-platform-v2

  p1->>p2: POST /accept-match<br/>{matchId}
  alt No payment proof
    p2-->>p1: 402 Payment Required<br/>amount: 1000 μSTX
  else Payment verified
    p2->>p3: next()
    p3->>p3: Extract matchId from body<br/>makeContractCall({<br/>functionName: "accept-match",
    p3->>p4: functionArgs: [uintCV(matchId)]<br/>})
    p4-->>p3: transaction object
    p3->>p5: broadcastTransaction()
    p5->>p6: Transaction broadcast
    p6-->>p5: Transaction included
    p5-->>p3: {txid, ...}
  alt Broadcast success
    p3-->>p1: {success: true, txid}
  else Broadcast error
  else Broadcast error
    p3-->>p1: 500 {error}
  end
  end
```

**Sources:** [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

 [agent/src/ArenaAgent.ts L109-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L140)

### Implementation Details

The handler performs the following steps:

1. **Middleware Verification** (line 143): The `x402Middleware(1000)` validates payment before allowing the handler to execute
2. **Extract matchId** (line 144): Parse `matchId` from the request body
3. **Construct Transaction** (lines 151-161): Build a `makeContractCall` with: * `contractAddress`: `CONTRACT_ADDRESS` environment variable * `contractName`: `"arena-platform-v2"` * `functionName`: `"accept-match"` * `functionArgs`: `[uintCV(matchId)]` * `senderKey`: Agent's `PRIVATE_KEY` * `validateWithKnownAbi`: `false` (disabled to avoid indexer delays) * `anchorMode`: `AnchorMode.Any` * `postConditionMode`: `PostConditionMode.Allow`
4. **Broadcast Transaction** (line 165): Call `broadcastTransaction()` to submit to the Stacks network
5. **Handle Response** (lines 169-178): Check for broadcast errors and return appropriate JSON response

**Sources:** [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

## POST /play-move Endpoint

The `/play-move` endpoint executes a move in an active match. This endpoint requires a payment of **500 microSTX** via the x402 protocol. If no move is provided in the request, the agent uses its Markov Chain AI model to predict and generate an optimal move.

### Endpoint Specification

| Property | Value |
| --- | --- |
| **Path** | `/play-move` |
| **Method** | `POST` |
| **Middleware** | `x402Middleware(500)` |
| **Location** | [agent/src/ArenaAgent.ts L186-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L301) |

### Request Format

**Headers:**

* `Content-Type: application/json`
* `x-payment-proof: <base64-encoded-payment-receipt>` (for paid requests)
* `x-stacks-address: <sender-principal>` (for paid requests)

**Body:**

```json
{
  "matchId": 42,
  "move": 1
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `matchId` | `number` | Yes | The on-chain match identifier |
| `move` | `number` | No | The move value (0-2 for RPS, 0-5 for Dice, 0-1 for Coin). If omitted, AI generates the move |

### Response Format

**Success Response (200):**

```json
{
  "success": true,
  "txId": "0xdef456..."
}
```

**Fairness Violation Response (403):**

```json
{
  "success": false,
  "error": "FAIRNESS_VIOLATION",
  "message": "AI only moves after the human has committed their move on-chain."
}
```

**Error Response (500):**

```json
{
  "error": "Broadcast failed: ..."
}
```

### Fairness Check and AI Prediction Flow

```mermaid
sequenceDiagram
  participant p1 as Frontend Client
  participant p2 as x402Middleware(500)
  participant p3 as Play Move Handler
  participant p4 as callReadOnlyFunction
  participant p5 as OpponentModel
  participant p6 as Contract Call

  p1->>p2: POST /play-move<br/>{matchId, move?}
  p2->>p3: Payment verified
  alt Move provided
    p3->>p3: Use provided move
  else No move (AI mode)
    p3->>p4: get-match-details(matchId)
    p4-->>p3: {challenger, gameType, ...}
    p3->>p4: get-player-move(matchId, challenger)
    p4-->>p3: challengerMove
  alt Challenger has not played
    p3-->>p1: 403 FAIRNESS_VIOLATION
  else Challenger has played
  else Challenger has played
    p3->>p5: model.update(gameType, challenger, challengerMove)
    p5-->>p3: Pattern recorded
    p3->>p5: model.predict(gameType, challenger)
    p5-->>p3: aiMove (counter-strategy)
  end
  end
  p3->>p3: Fetch nonce with failover<br/>makeContractCall({<br/>functionName: "play-move",
  p3->>p6: functionArgs: [matchId, move]<br/>})
  p6-->>p1: {success: true, txId}
```

**Sources:** [agent/src/ArenaAgent.ts L186-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L301)

 [agent/src/ArenaAgent.ts L63-L102](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L63-L102)

### Fairness Check Implementation

The fairness check (lines 194-224) ensures the agent cannot front-run user moves. The process:

1. **Query Match Details** (lines 194-201): Call `get-match-details(matchId)` to retrieve challenger address and game type
2. **Check Challenger Move** (lines 207-214): Call `get-player-move(matchId, challenger)` to verify the challenger has committed a move on-chain
3. **Enforce Fairness** (lines 217-224): If the challenger has not played, return HTTP 403 with error code `FAIRNESS_VIOLATION`
4. **Record and Predict** (lines 227-232): If the challenger has played: * Update the `OpponentModel` with the challenger's move via `model.update()` * Generate a counter-move using `model.predict()`

This ensures the agent **strictly waits** for on-chain move confirmation before responding, preventing any possibility of front-running.

**Sources:** [agent/src/ArenaAgent.ts L194-L236](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L194-L236)

### Nonce Fetching with Multi-Node Failover

The endpoint implements resilient nonce fetching with automatic failover across multiple Stacks RPC nodes (lines 245-266):

```mermaid
flowchart TD

FetchNonce["Fetch Nonce"]
Node1["api.testnet.hiro.so"]
Node2["stacks-node-api.testnet..."]
Success["Use nonce"]
Fallback["Try next node"]

FetchNonce -.-> Node1
Node1 -.->|"Success"| Success
Node1 -.->|"Timeout/Error"| Fallback
Fallback -.-> Node2
Node2 -.->|"Success"| Success
```

The nonce fetching logic:

1. Iterate through the `nodes` array (lines 246-249)
2. For each node, attempt to fetch from `/extended/v1/address/${address}/nonces` with a 15-second timeout
3. On success, extract `possible_next_nonce` and break the loop
4. On failure, log a warning and continue to the next node
5. If all nodes fail, the nonce defaults to 0

**Sources:** [agent/src/ArenaAgent.ts L245-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L245-L266)

### Transaction Construction and Broadcasting

After determining the move and fetching the nonce, the handler constructs and broadcasts the transaction (lines 268-297):

| Transaction Option | Value | Description |
| --- | --- | --- |
| `contractAddress` | `CONTRACT_ADDRESS` env var | Target contract address |
| `contractName` | `"arena-platform-v2"` | Contract name |
| `functionName` | `"play-move"` | Contract function to call |
| `functionArgs` | `[uintCV(matchId), uintCV(move)]` | Match ID and move value |
| `senderKey` | `PRIVATE_KEY` env var | Agent's private key |
| `network` | `StacksTestnet` instance | Network configuration |
| `anchorMode` | `1` (AnchorMode.Any) | Transaction anchor mode |
| `postConditionMode` | `1` (PostConditionMode.Deny) | Strict post-condition enforcement |
| `nonce` | `BigInt(nonce)` | Fetched nonce (if > 0) |

The transaction is then broadcast using `broadcastTransaction()`, which returns either a success response with `txid` or an error.

**Sources:** [agent/src/ArenaAgent.ts L268-L297](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L268-L297)

## Error Handling Patterns

The API implements several error handling patterns across both endpoints:

### Broadcast Errors

When `broadcastTransaction()` returns an error (lines 169-172 for `/accept-match`, lines 290-294 for `/play-move`):

```
if (broadcastResponse.error) {
    console.error(`Broadcast failed: ${broadcastResponse.error}`);
    throw new Error(`Broadcast failed: ${broadcastResponse.error}`);
}
```

The handler logs the error and either throws (in `/accept-match`) or returns a 500 response (in `/play-move`).

### Network Timeout Handling

Network requests use `AbortSignal.timeout(15000)` on line 255 to prevent hanging requests when fetching nonces. If the timeout expires, the request is aborted and the handler attempts the next node.

### Try-Catch Wrappers

Both endpoints wrap their logic in try-catch blocks:

* `/accept-match`: Catches errors on lines 179-182 and returns 500 with error message
* `/play-move`: Catches errors on lines 298-300 and returns 500 with error message

### Fairness Violation Response

The `/play-move` endpoint returns a specific 403 response when the fairness check fails (lines 219-223):

```yaml
return res.status(403).json({
    success: false,
    error: 'FAIRNESS_VIOLATION',
    message: 'AI only moves after the human has committed their move on-chain.'
});
```

This provides clear feedback to clients when attempting to trigger AI moves prematurely.

**Sources:** [agent/src/ArenaAgent.ts L169-L172](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L169-L172)

 [agent/src/ArenaAgent.ts L179-L182](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L179-L182)

 [agent/src/ArenaAgent.ts L219-L223](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L219-L223)

 [agent/src/ArenaAgent.ts L290-L300](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L290-L300)

## Environment Configuration

The API server requires the following environment variables, documented in [agent/.env.example L1-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L1-L16)

:

| Variable | Default | Description |
| --- | --- | --- |
| `PRIVATE_KEY` | *required* | Agent's Stacks wallet private key |
| `NETWORK_TYPE` | `"testnet"` | Network type (`"testnet"` or `"mainnet"`) |
| `CONTRACT_ADDRESS` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` | Deployed contract address |
| `PORT` | `3000` | HTTP server port |
| `X402_FACILITATOR_URL` | `https://v2.x402stacks.xyz` | x402 facilitator endpoint (unused in current implementation) |

These constants are loaded on [agent/src/ArenaAgent.ts L40-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L40-L48)

 and used throughout the API implementation.

**Sources:** [agent/.env.example L1-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L1-L16)

 [agent/src/ArenaAgent.ts L40-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L40-L48)

## API Integration Summary

```mermaid
flowchart TD

Frontend["Frontend<br>ArenaGame Component"]
AcceptAPI["POST /accept-match<br>1000 μSTX fee"]
PlayAPI["POST /play-move<br>500 μSTX fee"]
x402Accept["x402Middleware(1000)"]
x402Play["x402Middleware(500)"]
AcceptLogic["Accept Handler<br>accept-match contract call"]
PlayLogic["Play Handler<br>Fairness check + AI"]
Model["OpponentModel<br>Markov Chain AI"]
Contract["arena-platform-v2<br>Smart Contract"]

Frontend -.->|"Challenge agent"| AcceptAPI
Frontend -.->|"Trigger AI move"| PlayAPI
AcceptAPI -.-> x402Accept
PlayAPI -.-> x402Play
x402Accept -.-> AcceptLogic
x402Play -.-> PlayLogic
PlayLogic -.-> Model
Model -.-> PlayLogic
AcceptLogic -.-> Contract
PlayLogic -.-> Contract
```

The agent's API endpoints serve as the bridge between the frontend user interface and the autonomous agent's blockchain interactions. The x402 middleware ensures all services are monetized, while the fairness checks and Markov Chain AI provide trustworthy and strategic gameplay.

**Sources:** [agent/src/ArenaAgent.ts L143-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L301)

 [agent/src/ArenaAgent.ts L109-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L109-L140)

 [agent/src/ArenaAgent.ts L63-L102](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L63-L102)

---

# Agent-Development-Tools

# Agent Development Tools

> **Relevant source files**
> * [agent/nodemon.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json)
> * [agent/package-lock.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json)
> * [agent/src/debug_match.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts)
> * [agent/src/deploy-contract.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts)

This document describes the development utilities, debugging scripts, and deployment tools available for agent development in the GameArenaStacks ecosystem. These tools facilitate rapid development iteration, on-chain debugging, and smart contract deployment from the agent environment.

For information about agent installation and initial configuration, see [Agent Setup and Configuration](/HACK3R-CRYPTO/GameArenaStacks/3.1-agent-setup-and-configuration). For details about the production agent architecture and API endpoints, see [Agent API Endpoints](/HACK3R-CRYPTO/GameArenaStacks/3.5-agent-api-endpoints).

---

## Development Toolchain Overview

The agent development environment is built on Node.js with TypeScript and includes specialized tools for hot-reloading, on-chain debugging, and contract deployment.

### TypeScript Development Stack

The agent uses a modern TypeScript development stack optimized for rapid iteration:

| Tool | Version | Purpose |
| --- | --- | --- |
| `typescript` | 5.9.3 | Type checking and compilation |
| `tsx` | 4.21.0 | Fast TypeScript execution without pre-compilation |
| `nodemon` | 3.1.0 | File watching and automatic restart on changes |
| `@types/node` | 25.2.2 | Node.js type definitions |
| `@types/express` | 4.17.25 | Express type definitions |

**Sources:** [agent/package-lock.json L20-L26](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L20-L26)

```mermaid
flowchart TD

TSC["typescript<br>v5.9.3<br>Type Checking"]
TSX["tsx<br>v4.21.0<br>TS Execution"]
Nodemon["nodemon<br>v3.1.0<br>Hot Reload"]
TypesNode["@types/node<br>v25.2.2"]
TypesExpress["@types/express<br>v4.17.25"]
ArenaAgent["src/ArenaAgent.ts<br>Main Agent"]
DebugMatch["src/debug_match.ts<br>Debug Script"]
DeployContract["src/deploy-contract.ts<br>Deploy Script"]
NodemonJSON["nodemon.json<br>Watch Config"]
PackageJSON["package.json<br>Scripts"]

NodemonJSON -.->|"exec"| TSX
TSX -.->|"executes"| ArenaAgent
TSX -.->|"executes"| DebugMatch
TSX -.->|"executes"| DeployContract
Nodemon -.->|"watches"| ArenaAgent
Nodemon -.->|"uses"| NodemonJSON
TSC -.->|"validates"| ArenaAgent
TypesNode -.->|"types for"| ArenaAgent
TypesExpress -.->|"types for"| ArenaAgent

subgraph Configuration ["Configuration"]
    NodemonJSON
    PackageJSON
end

subgraph subGraph1 ["Source Files"]
    ArenaAgent
    DebugMatch
    DeployContract
end

subgraph subGraph0 ["Development Dependencies"]
    TSC
    TSX
    Nodemon
    TypesNode
    TypesExpress
end
```

**Title:** Agent Development Toolchain Architecture

**Sources:** [agent/package-lock.json L20-L26](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L20-L26)

 [agent/nodemon.json L1-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json#L1-L12)

---

## Hot Reload Configuration with nodemon

The `nodemon` configuration enables automatic agent restart during development when TypeScript files change.

### nodemon.json Configuration

The agent includes a pre-configured `nodemon.json` that watches the `src` directory for TypeScript file changes:

```json
{
    "watch": ["src"],
    "ext": "ts",
    "ignore": [
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "node_modules"
    ],
    "exec": "tsx src/ArenaAgent.ts"
}
```

**Configuration Details:**

| Field | Value | Purpose |
| --- | --- | --- |
| `watch` | `["src"]` | Monitor all files in the `src` directory |
| `ext` | `"ts"` | Only watch TypeScript files |
| `ignore` | Test files, node_modules | Exclude test files and dependencies |
| `exec` | `"tsx src/ArenaAgent.ts"` | Execute the main agent using `tsx` |

**Sources:** [agent/nodemon.json L1-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json#L1-L12)

### Development Workflow

```mermaid
sequenceDiagram
  participant p1 as Developer
  participant p2 as nodemon
  participant p3 as tsx Runtime
  participant p4 as ArenaAgent.ts
  participant p5 as Stacks Network

  p1->>p2: npm run dev
  p2->>p3: exec tsx src/ArenaAgent.ts
  p3->>p4: Load and execute
  p4->>p5: Connect to testnet
  p4-->>p1: Agent running on port 3001
  note over p1,p4: Developer makes code changes
  p1->>p4: Modify src/ArenaAgent.ts
  p2->>p2: Detect file change
  p2->>p4: Terminate process
  p2->>p3: Restart: tsx src/ArenaAgent.ts
  p3->>p4: Reload with changes
  p4->>p5: Reconnect
  p4-->>p1: Agent restarted with updates
```

**Title:** Hot Reload Development Cycle

**Sources:** [agent/nodemon.json L1-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json#L1-L12)

---

## Debugging Scripts

### debug_match.ts - On-Chain Match State Inspector

The `debug_match.ts` script provides a command-line utility to inspect match state directly from the Stacks blockchain, allowing developers to verify that moves were recorded correctly and troubleshoot match resolution issues.

**Script Structure:**

```mermaid
flowchart TD

Script["debug_match.ts"]
Network["StacksTestnet<br>api.testnet.hiro.so"]
Constants["DEPLOYER<br>CONTRACT"]
GetDetails["get-match-details<br>Read match info"]
GetAgentMove["get-player-move<br>Agent address"]
GetChallengerMove["get-player-move<br>Challenger address"]
GetOpponentMove["get-player-move<br>Opponent address"]
AgentLog["AGENT MOVE: {...}"]
ChallengerLog["CHALLENGER MOVE: {...}"]
OpponentLog["OPPONENT MOVE: {...}"]

Script -.-> Network
Script -.-> Constants
Script -.-> GetDetails
GetAgentMove -.-> AgentLog
GetChallengerMove -.-> ChallengerLog
GetOpponentMove -.-> OpponentLog

subgraph Output ["Output"]
    AgentLog
    ChallengerLog
    OpponentLog
end

subgraph subGraph1 ["Functions Called"]
    GetDetails
    GetAgentMove
    GetChallengerMove
    GetOpponentMove
    GetDetails -.-> GetAgentMove
    GetDetails -.-> GetChallengerMove
    GetDetails -.-> GetOpponentMove
end

subgraph Configuration ["Configuration"]
    Network
    Constants
end
```

**Title:** debug_match.ts Execution Flow

**Sources:** [agent/src/debug_match.ts L1-L73](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts#L1-L73)

**Key Functions:**

1. **checkMoves()** - Main function that queries match state [agent/src/debug_match.ts L9-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts#L9-L70) * Reads match details using `get-match-details` contract function * Extracts challenger and opponent addresses from match details * Queries each player's move using `get-player-move` * Logs all moves in JSON format for inspection

**Usage:**

```
tsx src/debug_match.ts
```

**Configuration Variables:**

| Variable | Value | Purpose |
| --- | --- | --- |
| `network` | `StacksTestnet` at `api.testnet.hiro.so` | Network endpoint |
| `DEPLOYER` | `ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA` | Contract deployer address |
| `CONTRACT` | `arena-platform-v2` | Contract name |
| `matchId` | `2` (hardcoded, can be modified) | Match to inspect |

**Sources:** [agent/src/debug_match.ts L5-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts#L5-L11)

**Example Output:**

The script outputs the move state for all players in a match:

```yaml
Checking match 2 on-chain...
Challenger: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
Opponent: ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA
AGENT MOVE: {"value":{"value":"1"},"type":"(optional uint)"}
CHALLENGER MOVE: {"value":{"value":"2"},"type":"(optional uint)"}
OPPONENT MOVE: {"value":{"value":"1"},"type":"(optional uint)"}
```

**Sources:** [agent/src/debug_match.ts L16-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts#L16-L70)

---

## Contract Deployment Tools

### deploy-contract.ts - Smart Contract Deployment Script

The `deploy-contract.ts` script enables developers to deploy or redeploy smart contracts directly from the agent development environment. This is useful for testing contract modifications or deploying to new environments.

**Deployment Flow:**

```mermaid
sequenceDiagram
  participant p1 as Developer
  participant p2 as deploy-contract.ts
  participant p3 as File System
  participant p4 as Stacks Network

  p1->>p2: tsx src/deploy-contract.ts
  p2->>p2: Load .env (PRIVATE_KEY)
  p2->>p3: Read contract from<br/>../../contracts/contracts/arena-platform.clar
  p3-->>p2: Contract code body<br/>makeContractDeploy({<br/>contractName: 'arena-platform-v2',<br/>codeBody,<br/>senderKey,
  p2->>p2: network<br/>})
  p2->>p4: broadcastTransaction(transaction)
  p4-->>p2: {txid: '0x...'}
  p2-->>p1: ✅ Transaction broadcasted! TXID: 0x...
```

**Title:** Contract Deployment Process

**Sources:** [agent/src/deploy-contract.ts L1-L62](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L1-L62)

**Key Configuration:**

| Parameter | Source | Purpose |
| --- | --- | --- |
| `PRIVATE_KEY` | `.env` file | Signs deployment transaction |
| `network` | `StacksTestnet()` | Target network for deployment |
| `contractPath` | `../../contracts/contracts/arena-platform.clar` | Contract source file |
| `contractName` | `arena-platform-v2` | Name for deployed contract |

**Sources:** [agent/src/deploy-contract.ts L19-L40](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L19-L40)

**Transaction Options:**

The script configures deployment transactions with the following settings:

* **anchorMode:** `AnchorMode.Any` - Can be included in microblock or anchor block
* **postConditionMode:** `PostConditionMode.Allow` - Permits all asset transfers
* **senderKey:** From `PRIVATE_KEY` environment variable
* **network:** `StacksTestnet` instance

**Sources:** [agent/src/deploy-contract.ts L38-L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L38-L45)

**Error Handling:**

The script checks for broadcast errors and displays detailed error information:

```
if (broadcastResponse.error) {
    console.error('Broadcast failed:', broadcastResponse.error);
    console.error('Reason:', broadcastResponse.reason);
    return;
}
```

**Sources:** [agent/src/deploy-contract.ts L50-L54](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L50-L54)

**Usage:**

```markdown
# Ensure PRIVATE_KEY is set in .env
tsx src/deploy-contract.ts
```

---

## TypeScript Execution with tsx

The `tsx` package enables direct execution of TypeScript files without a separate compilation step, significantly speeding up the development cycle.

### tsx Features in Agent Development

```mermaid
flowchart TD

TS2[".ts file"]
TSX["tsx execute"]
TS1[".ts file"]
TSC1["tsc compile"]
JS1[".js file"]
Node1["node execute"]

subgraph subGraph1 ["tsx Workflow"]
    TS2
    TSX
    TS2 -.-> TSX
end

subgraph subGraph0 ["Traditional Workflow"]
    TS1
    TSC1
    JS1
    Node1
    TS1 -.-> TSC1
    TSC1 -.-> JS1
    JS1 -.-> Node1
end
```

**Title:** tsx vs Traditional TypeScript Compilation

**Sources:** [agent/package-lock.json L24](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L24-L24)

**Commands Powered by tsx:**

| Script | Command | Purpose |
| --- | --- | --- |
| Debug Match | `tsx src/debug_match.ts` | Inspect on-chain match state |
| Deploy Contract | `tsx src/deploy-contract.ts` | Deploy smart contracts |
| Run Agent | `tsx src/ArenaAgent.ts` | Execute main agent (via nodemon) |

**Sources:** [agent/nodemon.json L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json#L11-L11)

 [agent/src/debug_match.ts L1](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts#L1-L1)

 [agent/src/deploy-contract.ts L1](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L1-L1)

---

## Development Dependencies

The agent includes comprehensive type definitions for TypeScript development:

```mermaid
flowchart TD

TypesExpress["@types/express<br>v4.17.25"]
TypesNode["@types/node<br>v25.2.2"]
TypesBodyParser["@types/body-parser<br>v1.19.6"]
TypesConnect["@types/connect<br>v3.4.38"]
ArenaAgent["ArenaAgent.ts<br>Express server<br>API endpoints"]
Express["express<br>v4.21.2"]
NodeRuntime["Node.js 18+"]

TypesExpress -.->|"type info"| ArenaAgent
TypesNode -.->|"type info"| ArenaAgent
TypesBodyParser -.->|"type info"| ArenaAgent
TypesConnect -.->|"runtime"| ArenaAgent
Express -.->|"executes"| ArenaAgent
NodeRuntime -.-> ArenaAgent

subgraph subGraph2 ["Runtime Dependencies"]
    Express
    NodeRuntime
end

subgraph subGraph1 ["Agent Code"]
    ArenaAgent
end

subgraph subGraph0 ["Type Definitions"]
    TypesExpress
    TypesNode
    TypesBodyParser
    TypesConnect
end
```

**Title:** TypeScript Type Definitions for Agent Development

**Sources:** [agent/package-lock.json L573-L672](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L573-L672)

### Type Definition Packages

The following type definitions are installed as dev dependencies:

* **@types/express** - Type definitions for Express.js framework [agent/package-lock.json L573-L584](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L573-L584)
* **@types/node** - Type definitions for Node.js runtime [agent/package-lock.json L613-L620](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L613-L620)
* **@types/body-parser** - Type definitions for body-parser middleware [agent/package-lock.json L552-L561](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L552-L561)
* **@types/connect** - Type definitions for Connect middleware [agent/package-lock.json L563-L571](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L563-L571)

These enable full IntelliSense and type checking in IDEs and prevent runtime type errors.

**Sources:** [agent/package-lock.json L20-L26](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L20-L26)

---

## Development Workflow Summary

```mermaid
flowchart TD

Start["Start Development"]
Clone["Clone Repository"]
Install["npm install<br>(installs tsx, nodemon, typescript)"]
ConfigEnv["Configure .env<br>(PRIVATE_KEY, etc.)"]
StartAgent["npm run dev<br>(nodemon + tsx)"]
CodeChange["Modify TypeScript files<br>in src/"]
AutoRestart["nodemon detects change<br>Agent auto-restarts"]
RunDebug["tsx src/debug_match.ts<br>Inspect on-chain state"]
CheckLogs["Review console output<br>Verify moves recorded"]
ModifyContract["Modify contract in<br>../../contracts/"]
Deploy["tsx src/deploy-contract.ts<br>Deploy to testnet"]
WaitConfirm["Wait for blockchain<br>confirmation"]

Start -.-> Clone
ConfigEnv -.-> StartAgent
CodeChange -.-> RunDebug
CheckLogs -.-> CodeChange
CodeChange -.-> ModifyContract
WaitConfirm -.-> StartAgent

subgraph subGraph3 ["Contract Updates"]
    ModifyContract
    Deploy
    WaitConfirm
    ModifyContract -.-> Deploy
    Deploy -.-> WaitConfirm
end

subgraph Debugging ["Debugging"]
    RunDebug
    CheckLogs
    RunDebug -.-> CheckLogs
end

subgraph subGraph1 ["Development Cycle"]
    StartAgent
    CodeChange
    AutoRestart
    StartAgent -.->|"Contract changes?"| CodeChange
    CodeChange -.->|"Need to debug?"| AutoRestart
    AutoRestart -.-> CodeChange
end

subgraph subGraph0 ["Initial Setup"]
    Clone
    Install
    ConfigEnv
    Clone -.-> Install
    Install -.-> ConfigEnv
end
```

**Title:** Complete Agent Development Workflow

**Sources:** [agent/nodemon.json L1-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json#L1-L12)

 [agent/src/debug_match.ts L1-L73](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts#L1-L73)

 [agent/src/deploy-contract.ts L1-L62](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L1-L62)

---

## File Structure Reference

```markdown
agent/
├── package-lock.json      # Locked dependency versions including dev tools
├── nodemon.json           # Hot reload configuration
└── src/
    ├── ArenaAgent.ts      # Main agent implementation
    ├── debug_match.ts     # On-chain state debugging script
    └── deploy-contract.ts # Contract deployment script
```

**Sources:** [agent/package-lock.json L1](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/package-lock.json#L1-L1)

 [agent/nodemon.json L1](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json#L1-L1)

 [agent/src/debug_match.ts L1](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts#L1-L1)

 [agent/src/deploy-contract.ts L1](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L1-L1)

---

# Smart-Contracts

# Smart Contracts

> **Relevant source files**
> * [PROJECT_SUMMARY.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [contracts/deployments/default.testnet-plan.yaml](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml)

## Purpose and Scope

This document provides an overview of the Clarity smart contracts that form the blockchain layer of the GameArenaStacks platform. The contracts are deployed on the Stacks testnet and handle match logic, wagering, agent identity, and game type definitions.

For detailed information about the core game logic contract, see [arena-platform-v2 Contract](/HACK3R-CRYPTO/GameArenaStacks/4.1-arena-platform-v2-contract). For agent identity and registration mechanisms, see [agent-registry Contract](/HACK3R-CRYPTO/GameArenaStacks/4.2-agent-registry-contract). For deployment procedures and testnet addresses, see [Contract Deployment](/HACK3R-CRYPTO/GameArenaStacks/4.3-contract-deployment).

For information about how the frontend interacts with these contracts, see [Frontend Application](/HACK3R-CRYPTO/GameArenaStacks/2-frontend-application). For details on how the agent calls these contracts, see [AI Agent System](/HACK3R-CRYPTO/GameArenaStacks/3-ai-agent-system).

**Sources:** [README.md L54](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L54-L54)

 [PROJECT_SUMMARY.md L39-L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L39-L45)

---

## Contract Architecture

The GameArenaStacks platform consists of three Clarity smart contracts that work together to provide trustless game execution, agent identity, and extensible game type definitions:

| Contract Name | File Name | Primary Purpose | Deployment Cost |
| --- | --- | --- | --- |
| `traits` | `traits.clar` | Define game type interfaces | 3,400 µSTX |
| `agent-registry` | `agent-registry.clar` | Manage on-chain agent identity and discovery | 15,420 µSTX |
| `arena-platform` | `arena-platform.clar` | Execute match logic, handle wagering and payouts | 50,800 µSTX |

All contracts are deployed to the Stacks testnet at deployer address `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` and use Clarity version 2.5.

**Sources:** [contracts/deployments/default.testnet-plan.yaml L1-L31](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L1-L31)

 [README.md L54](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L54-L54)

 [PROJECT_SUMMARY.md L39-L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L39-L45)

---

## Contract Interaction Model

The following diagram illustrates how the three contracts interact with each other and with external participants (human users and AI agents):

```mermaid
flowchart TD

HumanPlayer["Human Player<br>(Stacks Wallet)"]
AIAgent["AI Agent<br>(Autonomous Program)"]
Traits["traits.clar<br>Game Type Interfaces"]
Registry["agent-registry.clar<br>Agent Identity System"]
Arena["arena-platform.clar<br>Match Execution Engine"]

HumanPlayer -.->|"propose-match()"| Arena
HumanPlayer -.->|"play-move()"| Arena
AIAgent -.->|"accept-match()"| Arena
AIAgent -.->|"Prize distribution98% winner / 2% platform"| Arena
AIAgent -.->|"update-metadata()"| Registry
AIAgent -.-> Registry
HumanPlayer -.-> Registry
Arena -.->|"play-move()"| HumanPlayer
Arena -.-> AIAgent

subgraph SmartContracts ["Smart Contracts (Clarity 2.5)"]
    Traits
    Registry
    Arena
    Arena -.->|"Implements"| Registry
    Arena -.->|"register-agent()"| Traits
end

subgraph ExternalActors ["External Participants"]
    HumanPlayer
    AIAgent
end
```

**Key Interaction Patterns:**

1. **Match Proposal Flow:** Human players call `propose-match()` on `arena-platform.clar`, specifying game type, wager amount, and opponent address
2. **Agent Verification:** The arena contract queries `agent-registry.clar` to verify the opponent is a registered agent
3. **Match Acceptance:** AI agents call `accept-match()` to join proposed matches, depositing the required wager
4. **Move Submission:** Both participants call `play-move()` to submit their moves on-chain
5. **Automated Resolution:** The arena contract determines the winner based on game rules and distributes prizes automatically

**Sources:** [README.md L9-L39](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L9-L39)

 [PROJECT_SUMMARY.md L17-L35](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L17-L35)

---

## Deployed Contract Addresses

All contracts are deployed on the Stacks testnet and can be accessed through the following fully-qualified contract identifiers:

```
ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.traits
ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry
ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform
```

The total deployment cost across all three contracts was **69,620 µSTX** (~$0.05 USD at deployment time). All contracts were deployed using anchor-block-only mode to ensure consistency.

**Testnet Explorer Links:**

* Deployer Address: `https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet`

**Sources:** [contracts/deployments/default.testnet-plan.yaml L1-L31](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L1-L31)

 [PROJECT_SUMMARY.md L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L11-L11)

 [PROJECT_SUMMARY.md L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L81-L81)

---

## Contract Data Flow and State Management

The following diagram shows how data flows through the contract layer during a typical match lifecycle:

```mermaid
sequenceDiagram
  participant p1 as Human Player
  participant p2 as arena-platform.clar
  participant p3 as agent-registry.clar
  participant p4 as AI Agent

  note over p1,p4: Phase 1: Match Creation
  p1->>p2: "propose-match(game-type, wager, agent-address)"
  p2->>p3: "get-agent-info(agent-address)"
  p3-->>p2: "agent metadata"
  p2->>p2: "Create match record<br/>Store in matches map"
  p2-->>p1: "ok (match-id)"
  note over p1,p4: Phase 2: Match Acceptance
  p4->>p2: "accept-match(match-id)"
  p2->>p2: "Verify wager amount<br/>Update match status"
  p2-->>p4: "ok true"
  note over p1,p4: Phase 3: Move Submission
  p1->>p2: "play-move(match-id, move)"
  p2->>p2: "Store move in moves map<br/>Check if both moves submitted"
  p2-->>p1: "ok true"
  p4->>p2: "play-move(match-id, move)"
  p2->>p2: "Store move in moves map<br/>Check if both moves submitted"
  p2-->>p4: "ok true"
  note over p1,p4: Phase 4: Automatic Resolution
  p2->>p2: "determine-winner(move1, move2)<br/>Calculate prize distribution"
  p2->>p1: "Transfer 98% of total pot"
  p2->>p2: "Retain 2% platform fee"
  p2->>p2: "Update match as resolved"
```

**Data Storage Maps:**

The `arena-platform.clar` contract maintains several critical data structures:

* **matches map:** Stores match state (participants, wager, status, game type)
* **moves map:** Tracks submitted moves for each participant in each match
* **resolved-matches map:** Records final outcomes and prize distributions

**Sources:** [README.md L40-L47](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L40-L47)

 [PROJECT_SUMMARY.md L40-L44](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L40-L44)

---

## Clarity Design Patterns

The GameArenaStacks contracts implement several Clarity-specific design patterns to ensure security and correctness:

### Post-Conditions for Asset Protection

All functions that transfer STX implement post-conditions to ensure trustless execution. The frontend and agent construct transactions with explicit post-conditions that specify:

* **STX transfer amounts:** Exact amounts transferred from each participant
* **Expected balances:** Post-transaction balance constraints
* **Asset protection:** Prevent unexpected token transfers

For details on how post-conditions are implemented in the frontend, see [Post-Conditions and Asset Protection](/HACK3R-CRYPTO/GameArenaStacks/6.2-post-conditions-and-asset-protection).

### Trait System for Extensibility

The `traits.clar` contract defines trait interfaces that allow for future game type extensions without modifying the core arena platform. This follows the Clarity trait pattern for modular contract design:

```
trait game-trait {
  (define-read-only (game-type) (string-ascii 32))
  (define-read-only (valid-move (move uint)) (response bool uint))
}
```

### Immutable Game Logic

All game resolution logic is implemented as pure functions within the smart contract, ensuring that outcomes are:

* **Deterministic:** Same inputs always produce same outputs
* **Verifiable:** Any party can verify the outcome by replaying the logic
* **Tamper-proof:** Cannot be modified after deployment

**Sources:** [README.md L79-L82](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L79-L82)

 [PROJECT_SUMMARY.md L67-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L67-L70)

 [PROJECT_SUMMARY.md L40-L44](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L40-L44)

---

## Contract Testing and Verification

The contracts include a comprehensive test suite using the Clarinet SDK:

| Test Metric | Result |
| --- | --- |
| Total Unit Tests | 7 |
| Passing Tests | 7 |
| Test Coverage | Match lifecycle, error conditions, prize distribution |

All tests verify:

* Proper state transitions through the match lifecycle
* Correct prize calculations (98% winner, 2% platform)
* Error handling for invalid moves and unauthorized actions
* Agent registry lookups and metadata storage

The test suite uses Vitest with custom Clarinet SDK integration for `simnet` initialization.

**Sources:** [PROJECT_SUMMARY.md L10](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L10-L10)

 [PROJECT_SUMMARY.md L82](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L82-L82)

 [PROJECT_SUMMARY.md L109-L114](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L109-L114)

---

## Integration with x402 Protocol

While the smart contracts themselves do not directly implement x402 payment logic, they are designed to work seamlessly with the x402-monetized agent system:

1. **Match Proposals:** The contract records match proposals on-chain, which the agent detects
2. **Payment Verification:** The agent verifies x402 payments off-chain before calling `accept-match()`
3. **Move Commitment:** After receiving x402 payment for move execution, the agent calls `play-move()`
4. **Prize Distribution:** The contract handles final STX distribution automatically

For details on how x402 payments work with the agent, see [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware). For the complete payment flow, see [x402 Monetization Protocol](/HACK3R-CRYPTO/GameArenaStacks/5-x402-monetization-protocol).

**Sources:** [README.md L58-L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L58-L64)

 [PROJECT_SUMMARY.md L62-L66](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L62-L66)

---

## Security Considerations

The smart contracts implement several security mechanisms:

**Atomic State Updates:** All state changes occur within a single transaction context, preventing partial state corruption.

**Access Control:** Only match participants can submit moves for their matches. The contract verifies `tx-sender` against stored participant addresses.

**Wager Escrow:** STX wagers are held in the contract until match resolution, preventing participants from withdrawing funds mid-match.

**Reentrancy Protection:** Clarity's execution model prevents reentrancy attacks by design.

**Fair Play Enforcement:** The agent system waits for on-chain move confirmation before responding, preventing front-running. See [Fair Play Architecture](/HACK3R-CRYPTO/GameArenaStacks/8-fair-play-architecture) for details.

**Sources:** [README.md L79-L82](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L79-L82)

 [PROJECT_SUMMARY.md L67-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L67-L70)

---

# arena-platform-v2-Contract

# arena-platform-v2 Contract

> **Relevant source files**
> * [PROJECT_SUMMARY.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

## Purpose and Scope

This document provides technical documentation for the `arena-platform-v2` Clarity smart contract, which implements the core game logic, wagering system, and match lifecycle management for the GameArenaStacks platform. The contract is deployed on Stacks testnet at address `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9`.

This page covers the contract's data structures, state transitions, public functions, and prize distribution mechanisms. For agent identity management, see [agent-registry Contract](/HACK3R-CRYPTO/GameArenaStacks/4.2-agent-registry-contract). For frontend integration with the contract, see [ArenaGame Component](/HACK3R-CRYPTO/GameArenaStacks/2.1-arenagame-component). For agent-side contract interactions, see [Chain Monitoring and Auto-Resolution](/HACK3R-CRYPTO/GameArenaStacks/3.4-chain-monitoring-and-auto-resolution).

**Sources**: [agent/src/ArenaAgent.ts L45-L46](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L45-L46)

 [README.md L40-L43](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L40-L43)

---

## Contract Overview

### Deployment Information

| Property | Value |
| --- | --- |
| Contract Name | `arena-platform-v2` |
| Deployer Address | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` |
| Network | Stacks Testnet |
| Language | Clarity 2.5 |
| Deployment Cost | 0.06962 STX |

The contract serves as the immutable game engine for 1v1 wagered matches, enforcing rules for three game types and managing STX transfers between players. All game state is stored on-chain, ensuring transparency and trustless execution.

**Sources**: [agent/src/ArenaAgent.ts L45-L46](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L45-L46)

 [PROJECT_SUMMARY.md L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L11-L11)

 [agent/.env.example L8-L9](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L8-L9)

### Supported Game Types

```mermaid
flowchart TD

GameTypes["Game Types Enum"]
RPS["0: Rock-Paper-Scissors"]
Dice["1: Dice Roll"]
Coin["2: Coin Flip"]
RPSRules["Rules: 0=Rock, 1=Paper, 2=Scissors<br>Counter-move wins"]
DiceRules["Rules: Higher number wins<br>Range: 0-5"]
CoinRules["Rules: Prediction game<br>0=Heads, 1=Tails"]

GameTypes -.-> RPS
GameTypes -.-> Dice
GameTypes -.-> Coin
RPS -.-> RPSRules
Dice -.-> DiceRules
Coin -.-> CoinRules
```

**Sources**: [agent/src/ArenaAgent.ts L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L70-L70)

 [agent/src/ArenaAgent.ts L306-L327](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L306-L327)

 [README.md L66-L71](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L66-L71)

---

## Data Structures

### Match Data Structure

The contract stores match information using a tuple with the following fields:

| Field | Type | Description |
| --- | --- | --- |
| `challenger` | `principal` | Address of the player who proposed the match |
| `opponent` | `(optional principal)` | Address of the accepting player (none until accepted) |
| `game-type` | `uint` | Game type identifier (0, 1, or 2) |
| `wager` | `uint` | Amount in microSTX wagered by each player |
| `status` | `uint` | Current match state (see Match Status Codes) |
| `winner` | `(optional principal)` | Final winner after resolution (none until resolved) |

**Sources**: [agent/src/ArenaAgent.ts L202-L205](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L202-L205)

 [agent/src/ArenaAgent.ts L361-L364](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L361-L364)

### Match Status Codes

```css
#mermaid-1fkutvwmbed{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;fill:#333;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-1fkutvwmbed .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-1fkutvwmbed .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-1fkutvwmbed .error-icon{fill:#dddddd;}#mermaid-1fkutvwmbed .error-text{fill:#222222;stroke:#222222;}#mermaid-1fkutvwmbed .edge-thickness-normal{stroke-width:1px;}#mermaid-1fkutvwmbed .edge-thickness-thick{stroke-width:3.5px;}#mermaid-1fkutvwmbed .edge-pattern-solid{stroke-dasharray:0;}#mermaid-1fkutvwmbed .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-1fkutvwmbed .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-1fkutvwmbed .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-1fkutvwmbed .marker{fill:#999;stroke:#999;}#mermaid-1fkutvwmbed .marker.cross{stroke:#999;}#mermaid-1fkutvwmbed svg{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;}#mermaid-1fkutvwmbed p{margin:0;}#mermaid-1fkutvwmbed defs #statediagram-barbEnd{fill:#999;stroke:#999;}#mermaid-1fkutvwmbed g.stateGroup text{fill:#dddddd;stroke:none;font-size:10px;}#mermaid-1fkutvwmbed g.stateGroup text{fill:#333;stroke:none;font-size:10px;}#mermaid-1fkutvwmbed g.stateGroup .state-title{font-weight:bolder;fill:#333;}#mermaid-1fkutvwmbed g.stateGroup rect{fill:#ffffff;stroke:#dddddd;}#mermaid-1fkutvwmbed g.stateGroup line{stroke:#999;stroke-width:1;}#mermaid-1fkutvwmbed .transition{stroke:#999;stroke-width:1;fill:none;}#mermaid-1fkutvwmbed .stateGroup .composit{fill:#f4f4f4;border-bottom:1px;}#mermaid-1fkutvwmbed .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#mermaid-1fkutvwmbed .state-note{stroke:#e6d280;fill:#fff5ad;}#mermaid-1fkutvwmbed .state-note text{fill:#333;stroke:none;font-size:10px;}#mermaid-1fkutvwmbed .stateLabel .box{stroke:none;stroke-width:0;fill:#ffffff;opacity:0.5;}#mermaid-1fkutvwmbed .edgeLabel .label rect{fill:#ffffff;opacity:0.5;}#mermaid-1fkutvwmbed .edgeLabel{background-color:#ffffff;text-align:center;}#mermaid-1fkutvwmbed .edgeLabel p{background-color:#ffffff;}#mermaid-1fkutvwmbed .edgeLabel rect{opacity:0.5;background-color:#ffffff;fill:#ffffff;}#mermaid-1fkutvwmbed .edgeLabel .label text{fill:#333;}#mermaid-1fkutvwmbed .label div .edgeLabel{color:#333;}#mermaid-1fkutvwmbed .stateLabel text{fill:#333;font-size:10px;font-weight:bold;}#mermaid-1fkutvwmbed .node circle.state-start{fill:#999;stroke:#999;}#mermaid-1fkutvwmbed .node .fork-join{fill:#999;stroke:#999;}#mermaid-1fkutvwmbed .node circle.state-end{fill:#dddddd;stroke:#f4f4f4;stroke-width:1.5;}#mermaid-1fkutvwmbed .end-state-inner{fill:#f4f4f4;stroke-width:1.5;}#mermaid-1fkutvwmbed .node rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-1fkutvwmbed .node polygon{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-1fkutvwmbed #statediagram-barbEnd{fill:#999;}#mermaid-1fkutvwmbed .statediagram-cluster rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-1fkutvwmbed .cluster-label,#mermaid-1fkutvwmbed .nodeLabel{color:#333;}#mermaid-1fkutvwmbed .statediagram-cluster rect.outer{rx:5px;ry:5px;}#mermaid-1fkutvwmbed .statediagram-state .divider{stroke:#dddddd;}#mermaid-1fkutvwmbed .statediagram-state .title-state{rx:5px;ry:5px;}#mermaid-1fkutvwmbed .statediagram-cluster.statediagram-cluster .inner{fill:#f4f4f4;}#mermaid-1fkutvwmbed .statediagram-cluster.statediagram-cluster-alt .inner{fill:#f8f8f8;}#mermaid-1fkutvwmbed .statediagram-cluster .inner{rx:0;ry:0;}#mermaid-1fkutvwmbed .statediagram-state rect.basic{rx:5px;ry:5px;}#mermaid-1fkutvwmbed .statediagram-state rect.divider{stroke-dasharray:10,10;fill:#f8f8f8;}#mermaid-1fkutvwmbed .note-edge{stroke-dasharray:5;}#mermaid-1fkutvwmbed .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-1fkutvwmbed .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-1fkutvwmbed .statediagram-note text{fill:#333;}#mermaid-1fkutvwmbed .statediagram-note .nodeLabel{color:#333;}#mermaid-1fkutvwmbed .statediagram .edgeLabel{color:red;}#mermaid-1fkutvwmbed #dependencyStart,#mermaid-1fkutvwmbed #dependencyEnd{fill:#999;stroke:#999;stroke-width:1;}#mermaid-1fkutvwmbed .statediagramTitleText{text-anchor:middle;font-size:18px;fill:#333;}#mermaid-1fkutvwmbed :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}propose-match()accept-match()resolve-match()STATUS_PROPOSEDSTATUS_ACCEPTEDSTATUS_RESOLVEDstatus = 0challenger fundedopponent = nonestatus = 1both players fundedmoves can be playedstatus = 2winner determinedprizes distributed
```

| Status Code | Name | Description |
| --- | --- | --- |
| `0` | `STATUS-PROPOSED` | Match created by challenger, awaiting opponent acceptance |
| `1` | `STATUS-ACCEPTED` | Both players have joined and wagered, game in progress |
| `2` | `STATUS-RESOLVED` | Match completed with winner determined and prizes distributed |

**Sources**: [agent/src/ArenaAgent.ts L364-L367](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L364-L367)

### Player Move Storage

Player moves are stored separately using a composite key of `(match-id, player-principal)`. The move value is an optional uint that remains `none` until the player submits their move.

**Sources**: [agent/src/ArenaAgent.ts L207-L215](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L207-L215)

 [agent/src/ArenaAgent.ts L372-L387](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L372-L387)

---

## Core Public Functions

### Function Call Patterns

```mermaid
flowchart TD

ProposeMatch["propose-match<br>(game-type, wager)"]
PlayMove1["play-move<br>(match-id, move)"]
AcceptMatch["accept-match<br>(match-id)"]
PlayMove2["play-move<br>(match-id, move)"]
ResolveMatch["resolve-match<br>(match-id, winner)"]
ChallengerEscrow["Contract Escrow"]
OpponentEscrow["Contract Escrow"]
WinnerPayout["Winner Address"]
PlatformFee["Platform Address"]

ProposeMatch -.-> AcceptMatch
AcceptMatch -.->|"STX Transfer"| PlayMove1
PlayMove1 -.-> ResolveMatch
PlayMove2 -.-> ResolveMatch
ProposeMatch -.->|"STX Transfer"| ChallengerEscrow
AcceptMatch -.-> OpponentEscrow
ResolveMatch -.->|"98% Prize"| WinnerPayout
ResolveMatch -.->|"2% Fee"| PlatformFee

subgraph subGraph2 ["Resolution Flow"]
    ResolveMatch
end

subgraph subGraph1 ["Opponent Flow"]
    AcceptMatch
    PlayMove2
    AcceptMatch -.-> PlayMove2
end

subgraph subGraph0 ["Challenger Flow"]
    ProposeMatch
    PlayMove1
end
```

**Sources**: [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

 [agent/src/ArenaAgent.ts L186-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L301)

 [agent/src/ArenaAgent.ts L415-L434](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L415-L434)

### propose-match

```
(define-public (propose-match (game-type uint) (wager uint))
```

Creates a new match with the caller as the challenger. This function:

* Transfers `wager` amount of STX from challenger to the contract
* Creates a match record with `STATUS-PROPOSED`
* Assigns a sequential match ID
* Returns the match ID to the caller

**Parameters**:

* `game-type`: Game type identifier (0, 1, or 2)
* `wager`: Amount in microSTX to wager

**Returns**: `(ok uint)` with the match ID, or error code

**Frontend Usage**: Called when user clicks "Propose Match" after selecting game type and wager amount.

**Sources**: [agent/src/ArenaAgent.ts L151-L161](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L151-L161)

### accept-match

```
(define-public (accept-match (match-id uint))
```

Allows an opponent to accept a proposed match. This function:

* Verifies the match is in `STATUS-PROPOSED` state
* Transfers the same `wager` amount from opponent to contract
* Updates match status to `STATUS-ACCEPTED`
* Records the opponent's principal

**Parameters**:

* `match-id`: The match identifier to accept

**Returns**: `(ok true)` on success, or error code

**Agent Usage**: Called by the AI agent after receiving x402 payment via the `/accept-match` endpoint.

**Sources**: [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

### play-move

```
(define-public (play-move (match-id uint) (move uint))
```

Records a player's move for an active match. This function:

* Verifies the match is in `STATUS-ACCEPTED` state
* Confirms the caller is a participant (challenger or opponent)
* Stores the move value for the player
* Validates the move is within valid range for the game type

**Parameters**:

* `match-id`: The match identifier
* `move`: The player's move value (0-2 for RPS, 0-5 for Dice, 0-1 for Coin)

**Returns**: `(ok true)` on success, or error code

**Fair Play Guarantee**: The agent waits for the challenger's move to be confirmed on-chain before submitting its own move, preventing front-running.

**Sources**: [agent/src/ArenaAgent.ts L186-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L301)

 [agent/src/ArenaAgent.ts L435-L468](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L435-L468)

### resolve-match

```
(define-public (resolve-match (match-id uint) (winner principal))
```

Finalizes a match and distributes prizes. This function:

* Verifies both players have submitted moves
* Updates match status to `STATUS-RESOLVED`
* Transfers 98% of total pot to winner
* Transfers 2% platform fee to contract deployer
* Records the winner in the match record

**Parameters**:

* `match-id`: The match identifier
* `winner`: The principal address of the winning player

**Returns**: `(ok true)` on success, or error code

**Auto-Resolution**: Typically called by the AI agent's `monitorChain` process after detecting both moves on-chain.

**Sources**: [agent/src/ArenaAgent.ts L415-L434](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L415-L434)

 [agent/src/ArenaAgent.ts L396-L409](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L396-L409)

---

## Read-Only Functions

### Contract Query Functions

```mermaid
flowchart TD

GetMatchDetails["get-match-details<br>(match-id)"]
GetMatchCount["get-match-count<br>()"]
GetPlayerMove["get-player-move<br>(match-id, player)"]
Frontend["Frontend<br>State Polling"]
Agent["Agent<br>Chain Monitoring"]
MatchData["Match Data Structure"]
TotalMatches["Total Match Count"]
MoveValue["Player Move Value"]

Frontend -.-> GetMatchDetails
Frontend -.-> GetMatchCount
Frontend -.-> GetPlayerMove
Agent -.-> GetMatchDetails
Agent -.-> GetMatchCount
Agent -.-> GetPlayerMove
GetMatchDetails -.->|"Returns tuple"| MatchData
GetMatchCount -.->|"Returns uint"| TotalMatches
GetPlayerMove -.->|"Returns (optional uint)"| MoveValue

subgraph Callers ["Callers"]
    Frontend
    Agent
end

subgraph subGraph1 ["Move Queries"]
    GetPlayerMove
end

subgraph subGraph0 ["Match Queries"]
    GetMatchDetails
    GetMatchCount
end
```

**Sources**: [agent/src/ArenaAgent.ts L194-L215](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L194-L215)

 [agent/src/ArenaAgent.ts L336-L344](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L336-L344)

 [agent/src/ArenaAgent.ts L352-L360](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L352-L360)

### get-match-details

Returns the complete match data structure for a given match ID.

**Usage in Agent**: [agent/src/ArenaAgent.ts L194-L205](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L194-L205)

**Usage in Frontend**: Used to display match status and participants

### get-match-count

Returns the total number of matches created. Used for iteration and discovery.

**Usage in Agent**: [agent/src/ArenaAgent.ts L336-L344](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L336-L344)

**Usage Pattern**: Agent scans last 50 matches for active games requiring moves or resolution

### get-player-move

Returns the move value submitted by a specific player for a specific match.

**Usage in Agent**: [agent/src/ArenaAgent.ts L207-L215](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L207-L215)

**Fair Play Check**: Agent verifies challenger has played before submitting its own move

**Sources**: [agent/src/ArenaAgent.ts L194-L215](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L194-L215)

 [agent/src/ArenaAgent.ts L336-L360](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L336-L360)

---

## Match Lifecycle

### Complete State Transition Diagram

```python
#mermaid-o1zkpzakjsj{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;fill:#333;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-o1zkpzakjsj .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-o1zkpzakjsj .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-o1zkpzakjsj .error-icon{fill:#dddddd;}#mermaid-o1zkpzakjsj .error-text{fill:#222222;stroke:#222222;}#mermaid-o1zkpzakjsj .edge-thickness-normal{stroke-width:1px;}#mermaid-o1zkpzakjsj .edge-thickness-thick{stroke-width:3.5px;}#mermaid-o1zkpzakjsj .edge-pattern-solid{stroke-dasharray:0;}#mermaid-o1zkpzakjsj .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-o1zkpzakjsj .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-o1zkpzakjsj .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-o1zkpzakjsj .marker{fill:#999;stroke:#999;}#mermaid-o1zkpzakjsj .marker.cross{stroke:#999;}#mermaid-o1zkpzakjsj svg{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;}#mermaid-o1zkpzakjsj p{margin:0;}#mermaid-o1zkpzakjsj defs #statediagram-barbEnd{fill:#999;stroke:#999;}#mermaid-o1zkpzakjsj g.stateGroup text{fill:#dddddd;stroke:none;font-size:10px;}#mermaid-o1zkpzakjsj g.stateGroup text{fill:#333;stroke:none;font-size:10px;}#mermaid-o1zkpzakjsj g.stateGroup .state-title{font-weight:bolder;fill:#333;}#mermaid-o1zkpzakjsj g.stateGroup rect{fill:#ffffff;stroke:#dddddd;}#mermaid-o1zkpzakjsj g.stateGroup line{stroke:#999;stroke-width:1;}#mermaid-o1zkpzakjsj .transition{stroke:#999;stroke-width:1;fill:none;}#mermaid-o1zkpzakjsj .stateGroup .composit{fill:#f4f4f4;border-bottom:1px;}#mermaid-o1zkpzakjsj .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#mermaid-o1zkpzakjsj .state-note{stroke:#e6d280;fill:#fff5ad;}#mermaid-o1zkpzakjsj .state-note text{fill:#333;stroke:none;font-size:10px;}#mermaid-o1zkpzakjsj .stateLabel .box{stroke:none;stroke-width:0;fill:#ffffff;opacity:0.5;}#mermaid-o1zkpzakjsj .edgeLabel .label rect{fill:#ffffff;opacity:0.5;}#mermaid-o1zkpzakjsj .edgeLabel{background-color:#ffffff;text-align:center;}#mermaid-o1zkpzakjsj .edgeLabel p{background-color:#ffffff;}#mermaid-o1zkpzakjsj .edgeLabel rect{opacity:0.5;background-color:#ffffff;fill:#ffffff;}#mermaid-o1zkpzakjsj .edgeLabel .label text{fill:#333;}#mermaid-o1zkpzakjsj .label div .edgeLabel{color:#333;}#mermaid-o1zkpzakjsj .stateLabel text{fill:#333;font-size:10px;font-weight:bold;}#mermaid-o1zkpzakjsj .node circle.state-start{fill:#999;stroke:#999;}#mermaid-o1zkpzakjsj .node .fork-join{fill:#999;stroke:#999;}#mermaid-o1zkpzakjsj .node circle.state-end{fill:#dddddd;stroke:#f4f4f4;stroke-width:1.5;}#mermaid-o1zkpzakjsj .end-state-inner{fill:#f4f4f4;stroke-width:1.5;}#mermaid-o1zkpzakjsj .node rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-o1zkpzakjsj .node polygon{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-o1zkpzakjsj #statediagram-barbEnd{fill:#999;}#mermaid-o1zkpzakjsj .statediagram-cluster rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-o1zkpzakjsj .cluster-label,#mermaid-o1zkpzakjsj .nodeLabel{color:#333;}#mermaid-o1zkpzakjsj .statediagram-cluster rect.outer{rx:5px;ry:5px;}#mermaid-o1zkpzakjsj .statediagram-state .divider{stroke:#dddddd;}#mermaid-o1zkpzakjsj .statediagram-state .title-state{rx:5px;ry:5px;}#mermaid-o1zkpzakjsj .statediagram-cluster.statediagram-cluster .inner{fill:#f4f4f4;}#mermaid-o1zkpzakjsj .statediagram-cluster.statediagram-cluster-alt .inner{fill:#f8f8f8;}#mermaid-o1zkpzakjsj .statediagram-cluster .inner{rx:0;ry:0;}#mermaid-o1zkpzakjsj .statediagram-state rect.basic{rx:5px;ry:5px;}#mermaid-o1zkpzakjsj .statediagram-state rect.divider{stroke-dasharray:10,10;fill:#f8f8f8;}#mermaid-o1zkpzakjsj .note-edge{stroke-dasharray:5;}#mermaid-o1zkpzakjsj .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-o1zkpzakjsj .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-o1zkpzakjsj .statediagram-note text{fill:#333;}#mermaid-o1zkpzakjsj .statediagram-note .nodeLabel{color:#333;}#mermaid-o1zkpzakjsj .statediagram .edgeLabel{color:red;}#mermaid-o1zkpzakjsj #dependencyStart,#mermaid-o1zkpzakjsj #dependencyEnd{fill:#999;stroke:#999;stroke-width:1;}#mermaid-o1zkpzakjsj .statediagramTitleText{text-anchor:middle;font-size:18px;fill:#333;}#mermaid-o1zkpzakjsj :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}propose-match(type, wager)accept-match(id)"Both players funded""play-move(id, move)from challenger""play-move(id, move)from opponent""play-move(id, move)from opponent""play-move(id, move)from challenger""resolve-match(id, winner)"ProposedAcceptedWaitingMovesChallengerPlayedOpponentPlayedBothPlayedResolvedStatus: 0 (PROPOSED)Escrow: 1x wagerOpponent: noneStatus: 1 (ACCEPTED)Escrow: 2x wagerBoth players recordedStatus: 1 (ACCEPTED)Ready for resolutionWinner can be determinedStatus: 2 (RESOLVED)Prizes distributedMatch immutable
```

**Sources**: [agent/src/ArenaAgent.ts L330-L474](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L474)

### Typical Match Timeline

| Step | Action | Actor | Contract State Change |
| --- | --- | --- | --- |
| 1 | Propose match | Challenger (Human/Agent) | Create match record, transfer wager to contract |
| 2 | Accept match | Opponent (Agent/Human) | Update opponent field, transfer wager, set status=1 |
| 3 | Play move | Challenger | Store move for challenger principal |
| 4 | Play move (after fairness wait) | Opponent | Store move for opponent principal |
| 5 | Resolve match | Any participant or agent | Calculate winner, distribute prizes, set status=2 |

**Sources**: [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

 [agent/src/ArenaAgent.ts L186-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L301)

 [agent/src/ArenaAgent.ts L415-L434](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L415-L434)

---

## Prize Distribution

### Distribution Formula

```mermaid
flowchart TD

TotalPot["Total Pot<br>=<br>challenger_wager + opponent_wager"]
WinnerShare["Winner Share<br>98% of pot"]
PlatformFee["Platform Fee<br>2% of pot"]
WinnerAddress["Transfer to<br>winner principal"]
PlatformAddress["Transfer to<br>contract deployer"]
Example["Example:<br>1000 STX wager each<br>Total: 2000 STX"]
ExWinner["Winner: 1960 STX"]
ExPlatform["Platform: 40 STX"]

TotalPot -.-> WinnerShare
TotalPot -.-> PlatformFee
WinnerShare -.-> WinnerAddress
PlatformFee -.-> PlatformAddress
Example -.-> ExWinner
Example -.-> ExPlatform
```

**Sources**: [PROJECT_SUMMARY.md L43](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L43-L43)

 [README.md L40-L43](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L40-L43)

### Post-Conditions in Frontend

The frontend application enforces post-conditions to protect users during match proposal:

* Ensures exactly `wager` amount is transferred from user to contract
* Prevents excessive STX deductions
* Visible to user in wallet confirmation dialog

For detailed post-condition implementation, see [Post-Conditions and Asset Protection](/HACK3R-CRYPTO/GameArenaStacks/6.2-post-conditions-and-asset-protection).

**Sources**: [PROJECT_SUMMARY.md L67-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L67-L70)

---

## Winner Determination Logic

### Game-Specific Rules Implementation

The winner is determined off-chain by the agent's `calculateWinner` function and then committed on-chain via `resolve-match`. The contract trusts the resolution caller to provide the correct winner based on these rules:

#### Rock-Paper-Scissors (game-type = 0)

```
// 0: Rock, 1: Paper, 2: Scissors
if (move1 === move2) return null; // Draw
if ((move1 === 0 && move2 === 2) || 
    (move1 === 1 && move2 === 0) || 
    (move1 === 2 && move2 === 1)) {
    return player1; // Challenger wins
}
return player2; // Opponent wins
```

**Sources**: [agent/src/ArenaAgent.ts L306-L313](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L306-L313)

#### Dice Roll (game-type = 1)

```
// Higher number wins (0-5 range)
if (move1 === move2) return null; // Draw
return move1 > move2 ? player1 : player2;
```

**Sources**: [agent/src/ArenaAgent.ts L315-L318](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L315-L318)

#### Coin Flip (game-type = 2)

```
// Prediction game: 0=Heads, 1=Tails
// Challenger wins if prediction (move1) matches result (move2)
return move1 === move2 ? player1 : player2;
```

**Sources**: [agent/src/ArenaAgent.ts L320-L324](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L320-L324)

### Draw Handling

In case of a draw (equal moves in RPS or Dice), the agent defaults to awarding the challenger to ensure smooth operation during demonstrations. Production implementations should refund both players or implement a rematch mechanism.

**Sources**: [agent/src/ArenaAgent.ts L401-L406](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L401-L406)

---

## Agent Integration Patterns

### Chain Monitoring Loop

The AI agent continuously monitors the contract for matches requiring action:

```mermaid
sequenceDiagram
  participant p1 as Agent monitorChain()
  participant p2 as arena-platform-v2

  loop Every 20 seconds
    p1->>p2: get-match-count()
    p2-->>p1: total count
  loop Last 50 matches
    p1->>p2: get-match-details(i)
    p2-->>p1: match data
  alt Status = ACCEPTED (1)
    p1->>p2: get-player-move(id, challenger)
    p2-->>p1: challenger move
    p1->>p2: get-player-move(id, opponent)
    p2-->>p1: opponent move
  alt Both moves submitted
    p1->>p1: calculateWinner()
    p1->>p2: resolve-match(id, winner)
    p2-->>p1: Prizes distributed
  else Only challenger played AND opponent is
  else Only challenger played AND opponent is
    p1->>p1: Markov AI predict()
    p1->>p2: play-move(id, aiMove)
    p2-->>p1: Move recorded
  end
  end
  end
  end
```

**Sources**: [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

### Fairness Verification

Before playing a move, the agent performs a fairness check:

1. Queries `get-player-move` for the challenger
2. If challenger move is `none`, returns HTTP 403 error
3. Only proceeds with AI move after challenger move is confirmed on-chain

This prevents front-running and ensures the agent cannot see the user's move before committing its own.

**Sources**: [agent/src/ArenaAgent.ts L194-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L194-L224)

 [README.md L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L64-L64)

---

## Error Handling

### Common Error Scenarios

| Error Condition | Contract Response | Mitigation |
| --- | --- | --- |
| Insufficient balance | Transaction fails | Frontend checks balance before proposal |
| Invalid game type | Function returns error | Frontend validates game type selection |
| Match not found | Read-only returns none | Agent handles missing matches gracefully |
| Duplicate move | Function returns error | Frontend disables button after submission |
| Invalid match status | Function returns error | Contract enforces status transitions |

**Sources**: [agent/src/ArenaAgent.ts L169-L172](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L169-L172)

 [agent/src/ArenaAgent.ts L290-L293](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L290-L293)

### Transaction Broadcasting Failures

The agent implements retry logic for failed broadcasts:

* Attempts multiple Stacks RPC nodes
* Logs errors but continues monitoring
* Uses manual nonce fetching for reliability

For detailed resilience architecture, see [Multi-Node Failover and Reliability](/HACK3R-CRYPTO/GameArenaStacks/6.1-multi-node-failover-and-reliability).

**Sources**: [agent/src/ArenaAgent.ts L245-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L245-L266)

 [agent/src/ArenaAgent.ts L430-L432](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L430-L432)

---

## Integration with Agent Registry

The contract integrates with the `agent-registry` contract for identity verification:

```mermaid
flowchart TD

ArenaPlatform["arena-platform-v2<br>Match Logic"]
AgentRegistry["agent-registry<br>Identity System"]
AcceptMatch["accept-match()"]
VerifyAgent["Verify opponent<br>is registered agent"]
AgentMetadata["Agent Metadata<br>- Model version<br>- Endpoint<br>- Creator"]
ProceedMatch["Proceed with<br>match acceptance"]

AcceptMatch -.-> VerifyAgent
VerifyAgent -.->|"Returns registration data"| AgentRegistry
AgentRegistry -.-> AgentMetadata
AgentMetadata -.-> ProceedMatch
```

While not currently enforced at the contract level, the frontend can query the registry to:

* Display agent information to users
* Verify opponent authenticity
* Show AI model version and strategy type

For detailed registry documentation, see [agent-registry Contract](/HACK3R-CRYPTO/GameArenaStacks/4.2-agent-registry-contract).

**Sources**: [README.md L41-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L41-L48)

---

## Contract Deployment

### Testnet Deployment Details

The contract was deployed using Clarinet with the following configuration:

```yaml
# contracts/deployments/default.testnet-plan.yaml
- contract-publish:
    contract-name: arena-platform-v2
    expected-sender: ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9
    cost: 23140
    path: contracts/arena-platform-v2.clar
```

**Network Parameters**:

* Network: Stacks Testnet
* Explorer: [https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet](https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet)
* RPC Endpoints: Multiple nodes with failover support

For deployment instructions, see [Contract Deployment](/HACK3R-CRYPTO/GameArenaStacks/4.3-contract-deployment).

**Sources**: [README.md L40](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L40-L40)

 [PROJECT_SUMMARY.md L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L81-L81)

 [agent/.env.example L8-L9](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L8-L9)

---

## Summary

The `arena-platform-v2` contract provides a trustless, transparent gaming platform with the following key characteristics:

| Feature | Implementation |
| --- | --- |
| **State Management** | Three-state lifecycle (Proposed → Accepted → Resolved) |
| **Asset Security** | Post-conditions protect user funds during transactions |
| **Fair Play** | On-chain move verification prevents front-running |
| **Prize Distribution** | Automated 98/2 split via smart contract logic |
| **Multi-Game Support** | Flexible game-type enum supports RPS, Dice, Coin Flip |
| **Agent Integration** | Read-only functions enable autonomous monitoring |
| **Immutability** | Resolved matches are permanent on-chain records |

The contract serves as the immutable foundation for the GameArenaStacks ecosystem, enabling trustless wagering between human players and autonomous AI agents while ensuring transparent, verifiable game outcomes.

**Sources**: [README.md L1-L86](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L1-L86)

 [PROJECT_SUMMARY.md L1-L142](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L1-L142)

 [agent/src/ArenaAgent.ts L1-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L1-L482)

---

# agent-registry-Contract

# agent-registry Contract

> **Relevant source files**
> * [PROJECT_SUMMARY.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/src/config.js](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js)

## Purpose and Scope

The `agent-registry` contract provides decentralized identity and discovery services for autonomous AI agents participating in the GameArena ecosystem. This contract serves as the "Source of Truth" for verifying that a participant is a registered GameArena AI agent rather than an anonymous actor, enabling trust and discoverability in a decentralized gaming environment.

This document covers the contract's data structures, registration mechanisms, query functions, and integration patterns with the arena platform, frontend, and agent backend. For information about the main game logic and wagering system, see [arena-platform-v2 Contract](/HACK3R-CRYPTO/GameArenaStacks/4.1-arena-platform-v2-contract). For details on agent implementation and operation, see [AI Agent System](/HACK3R-CRYPTO/GameArenaStacks/3-ai-agent-system).

**Sources:** [README.md L41-L49](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L41-L49)

## Contract Architecture

The `agent-registry` contract is deployed at address `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry` on Stacks testnet and implements an EIP-8004-inspired identity system for autonomous agents.

### Core Data Structures

The contract maintains several data maps to track agent identity, metadata, and operational state:

```mermaid
flowchart TD

AgentInfo["agents<br>(principal → agent-data)"]
Metadata["agent-metadata<br>(principal → metadata)"]
Status["agent-status<br>(principal → active/inactive)"]
Creator["agent-creator<br>(principal → creator-principal)"]
Name["name: string-utf8"]
Model["model: string-utf8"]
Desc["description: string-utf8"]
Endpoint["x402-endpoint: string-ascii"]
RegTime["registration-time: uint"]
IsRegistered["is-agent-registered"]
GetInfo["get-agent-info"]
GetActive["get-active-agents"]

AgentInfo -.->|"reads"| Name
AgentInfo -.->|"reads"| Model
AgentInfo -.-> Desc
Metadata -.->|"reads"| Endpoint
Metadata -.->|"reads"| RegTime
IsRegistered -.-> AgentInfo
GetInfo -.-> AgentInfo
GetInfo -.-> Metadata
GetActive -.-> Status

subgraph subGraph2 ["Verification Functions"]
    IsRegistered
    GetInfo
    GetActive
end

subgraph subGraph1 ["Agent Data Fields"]
    Name
    Model
    Desc
    Endpoint
    RegTime
end

subgraph subGraph0 ["agent-registry.clar Data Maps"]
    AgentInfo
    Metadata
    Status
    Creator
end
```

**Sources:** [README.md L43-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L43-L48)

 [agent/src/config.js L14-L22](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L14-L22)

### Integration Points

The contract integrates with three primary system components:

| Component | Integration Type | Purpose |
| --- | --- | --- |
| `arena-platform-v2` | Contract call verification | Validates that match participants are registered agents |
| Frontend (React) | Read-only queries | Discovers active agents for UI display |
| Agent Backend (Node.js) | Write transactions | Registers and updates agent metadata |

**Sources:** [README.md L32-L34](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L32-L34)

## Registration System

### Agent Registration Flow

The registration process allows autonomous agents to establish their on-chain identity:

```mermaid
sequenceDiagram
  participant p1 as AI Agent Backend
  participant p2 as Agent Wallet
  participant p3 as agent-registry.clar
  participant p4 as arena-platform-v2.clar

  note over p1,p3: Phase 1: Initial Registration
  p1->>p1: "Generate wallet keychain"
  p1->>p2: "Fund with testnet STX"
  p1->>p3: "register-agent()<br/>{name, model, description, endpoint}"
  p3->>p3: "Store agent-data map"
  p3->>p3: "Set status: active"
  p3-->>p1: "(ok true)"
  note over p1,p4: Phase 2: Verification in Matches
  p4->>p3: "is-agent-registered(principal)"
  p3-->>p4: "(ok true)"
  p4->>p4: "Allow agent participation"
  note over p1,p3: Phase 3: Metadata Updates
  p1->>p3: "update-agent-metadata()<br/>{new-endpoint, new-description}"
  p3->>p3: "Verify tx-sender == agent"
  p3->>p3: "Update metadata map"
  p3-->>p1: "(ok true)"
```

**Sources:** [README.md L41-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L41-L48)

 [PROJECT_SUMMARY.md L44-L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L44-L45)

### Registration Function Parameters

The `register-agent` function accepts the following parameters:

| Parameter | Type | Description | Example |
| --- | --- | --- | --- |
| `name` | `string-utf8 50` | Human-readable agent identifier | `"Markov-1"` |
| `model` | `string-utf8 50` | AI model type or version | `"Markov Chain"` |
| `description` | `string-utf8 256` | Strategic capabilities description | `"AI agent using Markov decision logic for game strategy"` |
| `x402-endpoint` | `string-ascii 256` | HTTP endpoint for x402 payment routing | `"http://localhost:3000"` |

**Sources:** [agent/src/config.js L14-L22](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L14-L22)

## Query Functions

### Agent Verification

The contract provides verification functions used by the arena platform to validate participants:

```mermaid
flowchart TD

AcceptMatch["accept-match(match-id)"]
IsRegistered["is-agent-registered(principal)"]
AgentsMap["agents map"]
CheckExists["Check if principal exists<br>in agents map"]
CheckStatus["Check if status == active"]
ReturnBool["Return (ok true) or (ok false)"]

AcceptMatch -.->|"verify tx-sender"| IsRegistered
IsRegistered -.->|"err-not-registered"| CheckExists
ReturnBool -.-> AgentsMap
ReturnBool -.->|"if false"| AcceptMatch
AcceptMatch -.-> IsRegistered

subgraph subGraph2 ["Verification Logic"]
    CheckExists
    CheckStatus
    ReturnBool
    CheckExists -.-> CheckStatus
    CheckStatus -.-> ReturnBool
    CheckExists -.-> CheckExists
end

subgraph agent-registry.clar ["agent-registry.clar"]
    IsRegistered
    AgentsMap
    IsRegistered -.-> IsRegistered
end

subgraph arena-platform-v2.clar ["arena-platform-v2.clar"]
    AcceptMatch
end
```

The verification flow ensures only registered agents can accept matches and submit moves, preventing unauthorized participants from entering the gaming ecosystem.

**Sources:** [README.md L45-L46](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L45-L46)

### Discovery Functions

The contract exposes read-only functions for frontend discovery:

```mermaid
flowchart TD

UI["ArenaGame.jsx"]
Discovery["Agent Discovery Logic"]
GetActive["get-active-agents()<br>→ list of principals"]
GetInfo["get-agent-info(principal)<br>→ {name, model, description}"]
GetMetadata["get-agent-metadata(principal)<br>→ {endpoint, reg-time}"]
AgentList["Active Agents List"]
AgentCard["Agent Display Card<br>{name, model, description, endpoint}"]

Discovery -.-> GetActive
GetActive -.->|"2.For each agent"| AgentList
AgentList -.->|"3.For each agent"| GetInfo
AgentList -.-> GetMetadata
GetInfo -.-> AgentCard
GetMetadata -.-> AgentCard
AgentCard -.-> UI

subgraph subGraph2 ["Returned Data Structure"]
    AgentList
    AgentCard
end

subgraph subGraph1 ["agent-registry.clar Read Functions"]
    GetActive
    GetInfo
    GetMetadata
end

subgraph subGraph0 ["Frontend Query Flow"]
    UI
    Discovery
    UI -.->|"1.Query all active"| Discovery
end
```

These functions enable the frontend to dynamically discover agents without hardcoding agent addresses, supporting a truly decentralized agent marketplace.

**Sources:** [README.md L46-L47](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L46-L47)

## x402 Payment Routing

### Endpoint Metadata Storage

The contract stores x402 endpoint metadata to enable payment routing:

```mermaid
flowchart TD

RegTx["register-agent transaction"]
EndpointParam["x402-endpoint:<br>'http://localhost:3000'"]
MetadataMap["agent-metadata map"]
StoredEndpoint["(principal → {endpoint, reg-time})"]
ReadEndpoint["get-agent-metadata(agent-principal)"]
X402Client["x402-stacks client"]
HTTPRequest["POST /accept-match<br>Host: discovered-endpoint"]
PaymentChallenge["HTTP 402 Payment Required"]

EndpointParam -.-> MetadataMap
ReadEndpoint -.-> StoredEndpoint
StoredEndpoint -.-> X402Client
X402Client -.-> HTTPRequest

subgraph subGraph3 ["Payment Flow"]
    HTTPRequest
    PaymentChallenge
    HTTPRequest -.-> PaymentChallenge
end

subgraph subGraph2 ["Frontend Discovery"]
    ReadEndpoint
    X402Client
end

subgraph subGraph1 ["agent-registry.clar Storage"]
    MetadataMap
    StoredEndpoint
    MetadataMap -.-> StoredEndpoint
end

subgraph subGraph0 ["Agent Registration"]
    RegTx
    EndpointParam
    RegTx -.-> EndpointParam
end
```

This architecture ensures the frontend can dynamically discover agent endpoints without centralized configuration, enabling the x402 protocol to route micro-payments to the correct autonomous service.

**Sources:** [README.md L47-L48](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L47-L48)

## Integration with Arena Platform

### Match Participant Verification

The `arena-platform-v2` contract calls the agent registry during critical match operations:

```mermaid
flowchart TD

ProposeMatch["propose-match(game-type, wager)"]
AcceptMatch["accept-match(match-id)"]
PlayMove["play-move(match-id, move-data)"]
IsRegistered["is-agent-registered(tx-sender)"]
GetAgentInfo["get-agent-info(tx-sender)"]
Point1["Human players:<br>No verification required"]
Point2["Agent acceptance:<br>Must be registered"]
Point3["Agent moves:<br>Must be registered"]

ProposeMatch -.->|"verify"| Point1
AcceptMatch -.->|"(ok false)"| Point2
Point2 -.->|"if agent"| IsRegistered
PlayMove -.-> Point3
Point3 -.-> IsRegistered
IsRegistered -.-> AcceptMatch

subgraph subGraph2 ["Verification Points"]
    Point1
    Point2
    Point3
end

subgraph subGraph1 ["agent-registry.clar Verification"]
    IsRegistered
    GetAgentInfo
end

subgraph subGraph0 ["arena-platform-v2.clar Functions"]
    ProposeMatch
    AcceptMatch
    PlayMove
    AcceptMatch -.-> AcceptMatch
    AcceptMatch -.->|"abort witherr-not-registered"| AcceptMatch
    AcceptMatch -.-> AcceptMatch
end
```

This verification layer ensures that only legitimate, registered agents can participate in matches, providing trust and accountability in the decentralized gaming ecosystem.

**Sources:** [README.md L34-L35](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L34-L35)

## Frontend Discovery Implementation

### Dynamic Agent Loading

The frontend queries the registry to populate the agent selection UI:

```mermaid
sequenceDiagram
  participant p1 as ArenaGame Component
  participant p2 as Stacks Connect SDK
  participant p3 as agent-registry.clar
  participant p4 as Stacks RPC Node

  note over p1,p3: Component Mount / Refresh
  p1->>p2: "callReadOnlyFunction()<br/>get-active-agents"
  p2->>p4: "POST /v2/contracts/call-read/testnet"
  p4->>p3: "Execute read-only function"
  p3-->>p4: "List of principals<br/>[SP123..., SP456...]"
  p4-->>p2: "Clarity value response"
  p2-->>p1: "Parsed agent list"
  loop For each agent principal
    p1->>p2: "callReadOnlyFunction()<br/>get-agent-info(principal)"
    p2->>p3: "Query agent metadata"
    p3-->>p2: "{name, model, description, endpoint}"
    p2-->>p1: "Agent details"
    p1->>p1: "Render agent card in UI"
  end
```

This decentralized discovery mechanism eliminates the need for centralized agent directories or hardcoded addresses, enabling permissionless agent participation.

**Sources:** [README.md L32-L33](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L32-L33)

 [README.md L46-L47](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L46-L47)

## Agent Backend Registration

### Startup Registration Process

The agent backend registers itself on startup:

```mermaid
flowchart TD

LoadEnv["Load environment variables<br>AGENT_MNEMONIC"]
DeriveWallet["Derive wallet from mnemonic<br>getStxAddress()"]
CheckFunding["Verify wallet has testnet STX"]
BuildTx["Build register-agent transaction<br>makeContractCall()"]
FunctionArgs["Function args:<br>{NAME, MODEL, DESCRIPTION, ENDPOINT}"]
SignTx["Sign with agent private key"]
BroadcastTx["broadcastTransaction() to RPC"]
ReceiveTx["Receive registration transaction"]
ValidateArgs["Validate string lengths"]
StoreData["Store in agents map"]
SetActive["Set status to active"]
EmitEvent["Emit registration event"]
WaitConfirm["Wait for transaction confirmation"]
LogSuccess["Log 'Agent registered successfully'"]
StartServer["Start Express server on port 3000"]

CheckFunding -.-> BuildTx
BroadcastTx -.-> ReceiveTx
EmitEvent -.-> WaitConfirm

subgraph Confirmation ["Confirmation"]
    WaitConfirm
    LogSuccess
    StartServer
    WaitConfirm -.-> LogSuccess
    LogSuccess -.-> StartServer
end

subgraph agent-registry.clar ["agent-registry.clar"]
    ReceiveTx
    ValidateArgs
    StoreData
    SetActive
    EmitEvent
    ReceiveTx -.-> ValidateArgs
    ValidateArgs -.-> StoreData
    StoreData -.-> SetActive
    SetActive -.-> EmitEvent
end

subgraph subGraph1 ["Registration Transaction"]
    BuildTx
    FunctionArgs
    SignTx
    BroadcastTx
    BuildTx -.-> FunctionArgs
    FunctionArgs -.-> SignTx
    SignTx -.-> BroadcastTx
end

subgraph subGraph0 ["Agent Startup (ArenaAgent.ts)"]
    LoadEnv
    DeriveWallet
    CheckFunding
    LoadEnv -.-> DeriveWallet
    DeriveWallet -.-> CheckFunding
end
```

The agent only begins accepting match requests after successful registration, ensuring all participants in the ecosystem are identifiable and accountable.

**Sources:** [agent/src/config.js L14-L22](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L14-L22)

 [PROJECT_SUMMARY.md L97-L107](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L97-L107)

## Creator Economics and Tracking

### Agent Creator Attribution

The contract tracks the creator (deployer) of each agent to enable future marketplace features:

| Data Field | Type | Purpose |
| --- | --- | --- |
| `agent-creator` | `map principal → principal` | Associates agent principal with creator principal |
| `creation-block` | `uint` | Block height when agent was registered |
| `creator-fee-share` | `uint` | Percentage of agent earnings (future feature) |

This architecture enables potential future features such as:

* Agent marketplaces where creators can monetize their AI strategies
* Revenue sharing between agent operators and original creators
* Reputation systems based on agent performance and creator history
* Versioning and forking of successful agent strategies

**Sources:** [README.md L48-L49](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L48-L49)

## Contract Deployment

### Testnet Deployment Details

The `agent-registry` contract is deployed on Stacks testnet with the following details:

```yaml
Contract Address: ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry
Network: Stacks Testnet
Deployment Cost: ~0.02 STX (part of 0.06962 STX total deployment)
Unit Tests: Covered in contracts/tests/
```

The contract is immutable once deployed and can be queried by any participant without authentication. Write operations (registration, updates) require transaction signatures from the agent's wallet.

**Sources:** [agent/src/config.js L7-L10](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/config.js#L7-L10)

 [PROJECT_SUMMARY.md L9-L13](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L9-L13)

## Security Considerations

### Access Control

The contract implements several security measures:

1. **Self-Registration Only**: Agents can only register themselves using `tx-sender`, preventing unauthorized third-party registration
2. **Update Authorization**: Only the registered agent principal can update its own metadata
3. **Immutable Creator**: The creator field is set once at registration and cannot be changed
4. **Status Management**: Only the contract deployer can deactivate malicious agents

### Trust Model

The agent registry operates under the following trust assumptions:

* **Identity Binding**: A principal (Stacks address) uniquely identifies an agent
* **Endpoint Trust**: The stored x402 endpoint is assumed to be controlled by the agent principal
* **Creator Attribution**: Creators are responsible for the behavior of agents they deploy
* **Arena Verification**: The `arena-platform-v2` contract enforces registry verification before allowing agent participation

**Sources:** [README.md L45-L46](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L45-L46)

## Future Enhancements

Potential extensions to the agent registry system:

1. **Agent Versioning**: Track multiple versions of the same agent with migration paths
2. **Reputation Scores**: On-chain reputation based on match outcomes and user feedback
3. **Strategy Marketplace**: Enable buying/selling of agent AI models with automatic royalties
4. **Multi-Game Support**: Register agents with different capabilities across game types
5. **Dispute Resolution**: Mechanism for handling malicious or buggy agent behavior

These features would build on the existing identity foundation while maintaining backward compatibility with deployed contracts.

**Sources:** [README.md L48-L49](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L48-L49)

 [PROJECT_SUMMARY.md L125-L129](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L125-L129)

---

# Contract-Deployment

# Contract Deployment

> **Relevant source files**
> * [QUICKSTART.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md)
> * [agent/src/deploy-contract.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts)
> * [contracts/deployments/default.testnet-plan.yaml](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml)

## Purpose and Scope

This document describes the process, configuration, and tooling for deploying the GameArenaStacks smart contracts to the Stacks blockchain. It covers the declarative deployment plan used for testnet deployment, the programmatic deployment script for manual deployments, and the deployed contract addresses.

For information about the smart contract logic itself, see [arena-platform-v2 Contract](/HACK3R-CRYPTO/GameArenaStacks/4.1-arena-platform-v2-contract) and [agent-registry Contract](/HACK3R-CRYPTO/GameArenaStacks/4.2-agent-registry-contract). For details on how the frontend and agent interact with these deployed contracts, see [Stacks Blockchain Integration](/HACK3R-CRYPTO/GameArenaStacks/6-stacks-blockchain-integration).

---

## Deployment Architecture

The GameArenaStacks contracts are deployed using a declarative deployment plan managed by Clarinet. The system deploys three contracts in a specific order to handle dependencies, with all contracts deployed from a single deployer address to the Stacks testnet.

**Diagram: Deployment Pipeline**

```mermaid
flowchart TD

PlanFile["default.testnet-plan.yaml<br>Deployment Configuration"]
EnvFile[".env<br>PRIVATE_KEY"]
TraitsFile["contracts/traits.clar<br>Interface Definitions"]
RegistryFile["contracts/agent-registry.clar<br>Agent Identity"]
PlatformFile["contracts/arena-platform.clar<br>Game Logic"]
ClarinctDeploy["clarinet deployments apply<br>Declarative Deployment"]
ScriptDeploy["deploy-contract.ts<br>Programmatic Deployment"]
HiroAPI["api.testnet.hiro.so<br>RPC Node"]
Testnet["Stacks Testnet<br>Blockchain"]
BitcoinNode["bitcoind.testnet.stacks.co<br>Bitcoin Anchor"]
TraitsContract["ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.traits<br>Cost: 3400 µSTX"]
RegistryContract["ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry<br>Cost: 15420 µSTX"]
PlatformContract["ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform<br>Cost: 50800 µSTX"]

PlanFile -.-> ClarinctDeploy
EnvFile -.-> ScriptDeploy
TraitsFile -.-> ClarinctDeploy
RegistryFile -.-> ClarinctDeploy
PlatformFile -.-> ClarinctDeploy
PlatformFile -.-> ScriptDeploy
ClarinctDeploy -.-> HiroAPI
ScriptDeploy -.-> HiroAPI
Testnet -.->|"dependency"| TraitsContract
Testnet -.-> RegistryContract
Testnet -.-> PlatformContract

subgraph subGraph4 ["Deployed Contracts"]
    TraitsContract
    RegistryContract
    PlatformContract
    TraitsContract -.->|"dependency"| RegistryContract
    TraitsContract -.->|"dependency"| PlatformContract
    RegistryContract -.-> PlatformContract
end

subgraph subGraph3 ["Stacks Network"]
    HiroAPI
    Testnet
    BitcoinNode
    HiroAPI -.-> Testnet
    Testnet -.-> BitcoinNode
end

subgraph subGraph2 ["Deployment Methods"]
    ClarinctDeploy
    ScriptDeploy
end

subgraph subGraph1 ["Contract Sources"]
    TraitsFile
    RegistryFile
    PlatformFile
end

subgraph Configuration ["Configuration"]
    PlanFile
    EnvFile
end
```

**Sources**: [contracts/deployments/default.testnet-plan.yaml L1-L32](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L1-L32)

 [agent/src/deploy-contract.ts L1-L62](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L1-L62)

 [QUICKSTART.md L83-L89](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L83-L89)

---

## Deployment Plan Configuration

The primary deployment configuration is defined in the Clarinet deployment plan file, which specifies network parameters, contract deployment order, and transaction costs.

**Deployment Plan Structure**

| Field | Value | Description |
| --- | --- | --- |
| `id` | `0` | Deployment plan identifier |
| `name` | `Testnet deployment` | Human-readable plan name |
| `network` | `testnet` | Target Stacks network |
| `stacks-node` | `https://api.testnet.hiro.so` | Primary RPC endpoint |
| `bitcoin-node` | `http://blockstack:blockstacksystem@bitcoind.testnet.stacks.co:18332` | Bitcoin node for anchor verification |

**Sources**: [contracts/deployments/default.testnet-plan.yaml L1-L5](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L1-L5)

### Batch Configuration

All three contracts are deployed in a single batch (batch `id: 0`) to ensure atomic deployment. Each contract transaction includes:

| Contract Name | Cost (µSTX) | Clarity Version | Anchor Block Only |
| --- | --- | --- | --- |
| `traits` | 3,400 | 2 | `true` |
| `agent-registry` | 15,420 | 2 | `true` |
| `arena-platform` | 50,800 | 2 | `true` |

The `anchor-block-only: true` flag ensures contracts are only included in blocks that are anchored to Bitcoin, providing additional security guarantees.

**Sources**: [contracts/deployments/default.testnet-plan.yaml L6-L32](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L6-L32)

---

## Contract Deployment Order

The contracts must be deployed in a specific sequence due to dependencies. The deployment plan handles this automatically through batch ordering.

**Diagram: Contract Dependency Graph**

```mermaid
flowchart TD

Deployer["Deployer Address<br>ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9"]
Step1["Step 1: Deploy traits<br>Path: contracts/traits.clar<br>Cost: 3400 µSTX"]
Step2["Step 2: Deploy agent-registry<br>Path: contracts/agent-registry.clar<br>Cost: 15420 µSTX"]
Step3["Step 3: Deploy arena-platform<br>Path: contracts/arena-platform.clar<br>Cost: 50800 µSTX"]
TraitContract["traits Contract<br>Provides game-trait interface"]
RegContract["agent-registry Contract<br>Agent registration & metadata"]
PlatContract["arena-platform Contract<br>Match logic & wagering"]

Deployer -.->|"implements"| Step1
Deployer -.-> Step2
Deployer -.->|"implements"| Step3
Step1 -.-> TraitContract
Step2 -.-> RegContract
Step3 -.-> PlatContract

subgraph subGraph0 ["Deployment Order"]
    Step1
    Step2
    Step3
    Step1 -.-> Step2
    Step1 -.->|"uses"| Step3
    Step2 -.-> Step3
end
```

**Sources**: [contracts/deployments/default.testnet-plan.yaml L9-L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L9-L30)

### Dependency Rationale

1. **traits** is deployed first because it defines the `game-trait` interface that other contracts implement or reference
2. **agent-registry** is deployed second as it may reference trait definitions for agent capabilities
3. **arena-platform** is deployed last as it depends on both the trait interface and agent registry for match validation

**Sources**: [contracts/deployments/default.testnet-plan.yaml L10-L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L10-L30)

---

## Programmatic Deployment Script

For manual or CI/CD deployments, the `deploy-contract.ts` script provides a programmatic alternative to the Clarinet deployment plan. This script is particularly useful for deploying contract updates with modified names (e.g., `arena-platform-v2`).

**Diagram: Deployment Script Flow**

```mermaid
sequenceDiagram
  participant p1 as deploy-contract.ts
  participant p2 as .env File
  participant p3 as File System
  participant p4 as @stacks/transactions
  participant p5 as StacksTestnet
  participant p6 as api.testnet.hiro.so

  p1->>p2: Read PRIVATE_KEY
  p2-->>p1: Private key string
  p1->>p3: Read contract file<br/>../../contracts/contracts/arena-platform.clar
  p3-->>p1: Contract source code (codeBody)<br/>makeContractDeploy({
  p1->>p4: contractName: 'arena-platform-v2',<br/>codeBody, senderKey, network})
  p4-->>p1: Signed transaction
  p1->>p4: broadcastTransaction(transaction, network)
  p4->>p6: POST /v2/transactions
  p6-->>p4: {txid: '...', error: null}
  p4-->>p1: Broadcast response
  alt Deployment Success
    p1->>p1: Log TXID and success message
  else Deployment Failure
    p1->>p1: Log error and reason
  end
```

**Sources**: [agent/src/deploy-contract.ts L1-L62](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L1-L62)

### Script Configuration

The deployment script uses the following configuration:

```javascript
// Network configuration
const network = new StacksTestnet();

// Transaction options
const txOptions = {
    contractName: 'arena-platform-v2',
    codeBody,
    senderKey: PRIVATE_KEY,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
};
```

**Key Parameters**:

* **contractName**: The name for the deployed contract (can differ from source filename)
* **codeBody**: Contract source code read from filesystem
* **anchorMode**: `AnchorMode.Any` allows deployment in any block type
* **postConditionMode**: `PostConditionMode.Allow` permits deployment without post-conditions

**Sources**: [agent/src/deploy-contract.ts L24-L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L24-L45)

### Environment Requirements

The script requires:

* `PRIVATE_KEY` environment variable set in `.env` file
* Contract source file at `../../contracts/contracts/arena-platform.clar` relative to script location
* Funded deployer wallet with sufficient STX for transaction fees

**Sources**: [agent/src/deploy-contract.ts L17-L22](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L17-L22)

 [agent/src/deploy-contract.ts L29-L34](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/deploy-contract.ts#L29-L34)

---

## Deployed Contract Addresses

The GameArenaStacks contracts are deployed to Stacks testnet under a single deployer address. All components (frontend, agent) reference these addresses for contract interactions.

### Current Testnet Deployment

| Component | Address | Explorer Link |
| --- | --- | --- |
| **Deployer** | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` | [View on Explorer](https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet) |
| **traits** | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.traits` | Interface definitions |
| **agent-registry** | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry` | Agent identity system |
| **arena-platform** | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform` | Game logic & wagering |

**Sources**: [QUICKSTART.md L85-L87](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L85-L87)

### Contract Identifier Format

Stacks contracts use the format `<deployer-address>.<contract-name>`. This fully-qualified identifier is used throughout the codebase:

* Frontend components reference contracts via these identifiers when constructing transactions
* Agent queries use these identifiers for read-only function calls
* Post-conditions specify these identifiers for asset protection

The single deployer address simplifies contract interactions and ensures consistent trust relationships across the platform.

**Sources**: [QUICKSTART.md L85-L89](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L85-L89)

---

## Deployment Costs and Gas Considerations

Contract deployment on Stacks requires STX for transaction fees. The costs specified in the deployment plan represent the maximum fee budgets for each contract.

### Cost Breakdown

**Diagram: Deployment Cost Analysis**

```mermaid
flowchart TD

Total["Total Deployment Cost<br>69,620 µSTX = 0.06962 STX"]
Traits["traits<br>3,400 µSTX<br>4.9%"]
Registry["agent-registry<br>15,420 µSTX<br>22.1%"]
Platform["arena-platform<br>50,800 µSTX<br>73.0%"]
Size1["Simple interface<br>definitions"]
Size2["Storage maps for<br>agent metadata"]
Size3["Complex game logic<br>& state management"]

Total -.-> Traits
Total -.-> Registry
Total -.-> Platform
Traits -.->|"smallest contract"| Size1
Registry -.->|"medium contract"| Size2
Platform -.->|"largest contract"| Size3
```

**Sources**: [contracts/deployments/default.testnet-plan.yaml L13-L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L13-L30)

### Cost Factors

The deployment cost for each contract is determined by:

1. **Contract Size**: Larger contract source code requires more storage and execution resources
2. **Complexity**: More functions and data structures increase deployment cost
3. **Clarity Version**: Clarity 2 contracts may have different cost profiles than earlier versions

The `arena-platform` contract accounts for 73% of total deployment costs due to its comprehensive match lifecycle logic, wagering system, and prize distribution mechanisms.

**Sources**: [contracts/deployments/default.testnet-plan.yaml L13-L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L13-L30)

---

## Deployment Verification

After deployment, contracts can be verified through multiple methods to ensure successful deployment and correct configuration.

### Verification Methods

| Method | Command/URL | Purpose |
| --- | --- | --- |
| **Explorer** | `https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet` | View all deployed contracts and transactions |
| **CLI Query** | `stacks call_read_only <contract> <function>` | Test contract read-only functions |
| **Frontend Test** | Connect wallet and propose match | End-to-end integration test |
| **Agent Test** | Query agent registry via API | Verify agent can read contract state |

**Sources**: [QUICKSTART.md L89](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L89-L89)

### Post-Deployment Checklist

After deployment, verify:

1. ✅ All three contracts appear in deployer address on block explorer
2. ✅ Contract source code is visible and matches repository
3. ✅ Frontend can connect and read contract state
4. ✅ Agent can call contract functions and broadcast transactions
5. ✅ Test match can be proposed and accepted
6. ✅ Prize distribution executes correctly

**Sources**: [QUICKSTART.md L59-L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L59-L81)

---

## Network Configuration

The deployment plan specifies both Stacks and Bitcoin node endpoints for anchoring verification. This dual-node configuration ensures deployment transactions are properly anchored to Bitcoin for finality.

### Node Endpoints

```
stacks-node: https://api.testnet.hiro.so
bitcoin-node: http://blockstack:blockstacksystem@bitcoind.testnet.stacks.co:18332
```

* **Stacks Node**: Hiro API provides the primary RPC interface for transaction submission and state queries
* **Bitcoin Node**: Used by Clarinet for verifying that anchor blocks are properly committed to Bitcoin

The `anchor-block-only: true` setting ensures all contract deployments wait for Bitcoin anchoring before being considered final, providing the highest security guarantees.

**Sources**: [contracts/deployments/default.testnet-plan.yaml L4-L5](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L4-L5)

 [contracts/deployments/default.testnet-plan.yaml L15-L29](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L15-L29)

---

## Epoch Configuration

The deployment plan specifies `epoch: '2.5'`, indicating these contracts are deployed for Clarity version 2.5 compatibility. This ensures all contracts use the latest language features and security improvements available in the Stacks 2.5 release.

**Sources**: [contracts/deployments/default.testnet-plan.yaml L31](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/deployments/default.testnet-plan.yaml#L31-L31)

---

# x402-Monetization-Protocol

# x402 Monetization Protocol

> **Relevant source files**
> * [PROJECT_SUMMARY.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

## Purpose and Scope

This document describes the implementation of the **x402 payment protocol** within GameArena Stacks, enabling automated machine-to-machine micropayments between the frontend client and the autonomous AI agent. The x402 protocol allows the agent to monetize its services by returning HTTP 402 status codes with payment instructions, which are automatically fulfilled by the frontend before service delivery.

For information about the smart contract layer that handles match wagering and prize distribution, see [arena-platform-v2 Contract](/HACK3R-CRYPTO/GameArenaStacks/4.1-arena-platform-v2-contract). For details about the AI strategy that the agent uses after payment verification, see [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy).

**Key aspects covered:**

* HTTP 402 payment request/response structure
* Agent-side middleware implementation
* Frontend payment automation flow
* On-chain payment verification
* Integration with Stacks Connect wallets

---

## Protocol Architecture

The x402 protocol operates as a challenge-response payment layer between the frontend and agent, where services are gated behind micro-payment requirements verified on the Stacks blockchain.

### High-Level x402 Flow

```mermaid
flowchart TD

Frontend["Frontend<br>(ArenaGame.jsx)"]
Agent["Agent<br>(ArenaAgent.ts)"]
Wallet["Stacks Wallet<br>(Leather/Xverse)"]
Blockchain["Stacks Testnet"]

Frontend -.->|"7.POST /accept-match(x-payment-proof header)"| Agent
Agent -.->|"2.HTTP 402(payment instructions)"| Frontend
Frontend -.->|"8.Verify on-chain"| Wallet
Wallet -.->|"4.STX transfer"| Blockchain
Blockchain -.->|"5.TX confirmation"| Wallet
Wallet -.->|"9.Payment confirmed"| Frontend
Frontend -.->|"1.POST /accept-match(no payment proof)"| Agent
Agent -.->|"3.openSTXTransfer()"| Blockchain
Blockchain -.->|"6.txId"| Agent
Agent -.->|"10.Service delivery"| Frontend
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L350-L398](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L350-L398)

 [agent/src/ArenaAgent.ts L108-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L108-L140)

---

## Agent-Side Implementation

### x402Middleware Function

The agent implements payment gating through the `x402Middleware` function, which wraps Express endpoints and enforces payment requirements.

```mermaid
flowchart TD

Request["HTTP Request<br>(req, res, next)"]
CheckHeaders["Headers contain<br>x-payment-proof<br>& x-stacks-address?"]
Return402["Build 402 Response<br>(paymentRequired object)"]
SetHeader["Set X402_HEADERS.PAYMENT_REQUIRED"]
SendResponse["res.status(402).json()"]
Verify["Verify payment on-chain<br>(production: query Stacks API)"]
LogSuccess["console.log('Payment verified')"]
NextMiddleware["next()"]

Request -.-> CheckHeaders
CheckHeaders -.->|"No"| Return402
Return402 -.-> SetHeader
SetHeader -.-> SendResponse
CheckHeaders -.->|"Yes"| Verify
Verify -.-> LogSuccess
LogSuccess -.-> NextMiddleware
```

**Sources:** [agent/src/ArenaAgent.ts L108-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L108-L140)

#### Payment Required Response Structure

When payment proof is absent, the middleware constructs a standardized 402 response:

| Field | Type | Description |
| --- | --- | --- |
| `status` | `number` | Always `402` |
| `error` | `string` | `"Payment Required"` |
| `x402Version` | `number` | Protocol version (`2`) |
| `resource.url` | `string` | Endpoint path (e.g., `/accept-match`) |
| `resource.description` | `string` | Human-readable service description |
| `accepts[0].scheme` | `string` | `"direct-payment"` |
| `accepts[0].network` | `string` | `"stacks-testnet"` |
| `accepts[0].token` | `string` | `"STX"` |
| `accepts[0].amount` | `string` | Micropayment amount in microSTX |
| `accepts[0].payTo` | `string` | Agent's Stacks address |

**Sources:** [agent/src/ArenaAgent.ts L116-L127](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L116-L127)

#### Endpoint Payment Configuration

The agent defines different payment tiers for various services:

```mermaid
flowchart TD

x402Middleware["x402Middleware(amount)"]
AcceptMatch["/accept-match<br>1000 microSTX"]
PlayMove["/play-move<br>500 microSTX"]

x402Middleware -.-> AcceptMatch
x402Middleware -.-> PlayMove
```

**Implementation:**

* **Match Acceptance:** `app.post('/accept-match', x402Middleware(1000), ...)`
* **Move Execution:** `app.post('/play-move', x402Middleware(500), ...)`

**Sources:** [agent/src/ArenaAgent.ts L143](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L143)

 [agent/src/ArenaAgent.ts L186](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L186)

---

## Frontend-Side Implementation

### Axios Instance Configuration

The frontend creates a pre-configured axios instance that communicates with the agent API:

```javascript
const api = axios.create({ baseURL: AGENT_API_URL });
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L55](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L55-L55)

### Payment Automation Functions

#### handleChallengeAgent: Match Acceptance Flow

The `handleChallengeAgent` function demonstrates the complete x402 payment cycle for match acceptance.

```mermaid
sequenceDiagram
  participant p1 as ArenaGame
  participant p2 as processRequest(headers)
  participant p3 as Agent API
  participant p4 as Stacks Wallet

  p1->>p2: "Initial call (empty headers)"
  p2->>p3: "POST /accept-match"
  alt No Payment Proof
    p3-->>p2: "402 Payment Required"
    p2->>p4: "openSTXTransfer(paymentInfo)"
    p4-->>p2: "onFinish(data.txId)"
    p2->>p2: "setTimeout 2000ms"
    p2->>p2: "Recursive call with headers"
    p2->>p3: "POST /accept-match<br/>(x-payment-proof: txId)"
  end
  alt Payment Verified
    p3-->>p2: "200 OK (success: true)"
    p2->>p1: "toast.success('Agent accepted')"
    p1->>p1: "fetchMatches()"
  end
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L350-L398](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L350-L398)

**Key Implementation Details:**

1. **Recursive Request Pattern:** The `processRequest` function is defined as an async closure that can call itself with updated headers
2. **Error Handling:** `error.response?.status === 402` triggers the payment flow
3. **Payment Proof Header:** After wallet confirmation, retry includes `'x-payment-proof': data.txId`
4. **User Address Header:** `'x-stacks-address': userData.profile.stxAddress.testnet`
5. **Delayed Retry:** `setTimeout(() => processRequest({...}), 2000)` allows on-chain confirmation

**Sources:** [frontend/src/pages/ArenaGame.jsx L366-L389](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L366-L389)

#### triggerAgentMove: AI Move Payment Flow

The `triggerAgentMove` function uses an identical payment automation pattern for requesting AI moves.

```mermaid
flowchart TD

TriggerCall["triggerAgentMove(matchId)"]
ProcessDef["Define processRequest(headers)"]
InitialPost["POST /play-move<br>(no headers)"]
Check402["status === 402?"]
OpenTransfer["openSTXTransfer(paymentInfo)"]
OnFinish["onFinish callback"]
RetryWithProof["processRequest({<br>x-payment-proof: txId,<br>x-stacks-address: address<br>})"]
Success["Update pendingTxs<br>toast.success()"]

TriggerCall -.-> ProcessDef
ProcessDef -.-> InitialPost
InitialPost -.-> Check402
Check402 -.->|"Yes"| OpenTransfer
OpenTransfer -.-> OnFinish
OnFinish -.-> RetryWithProof
Check402 -.->|"No (200)"| Success
RetryWithProof -.-> Check402
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L401-L445](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L401-L445)

**Differences from Match Acceptance:**

* **Amount:** `paymentInfo.accepts[0].amount` is 500 microSTX (vs 1000 for match acceptance)
* **Memo:** `'x402 Agent Move Fee'` (vs `'x402 Agent Fee'`)
* **Post-Processing:** Sets `pendingTxs` with agent's transaction ID from response

**Sources:** [frontend/src/pages/ArenaGame.jsx L413-L432](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L413-L432)

---

## Payment Verification Architecture

### Agent-Side Verification (Current Implementation)

```mermaid
flowchart TD

Headers["Request Headers<br>(x-payment-proof, x-stacks-address)"]
Present["Headers<br>present?"]
Log["console.log('Payment verified')"]
Next["next()"]
Reject["Return 402"]
Note["Note: Production should query<br>Stacks API to verify TX<br>confirms payment to AGENT_ADDRESS"]

Headers -.-> Present
Present -.->|"Yes"| Log
Log -.-> Next
Present -.->|"No"| Reject
```

**Current Behavior:**

* The middleware logs payment verification but does not query the blockchain
* In production, should call Stacks API: `GET /extended/v1/tx/{txId}`
* Verify transaction status is `success` and recipient matches `AGENT_ADDRESS`

**Sources:** [agent/src/ArenaAgent.ts L136-L138](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L136-L138)

### On-Chain Payment Structure

When the frontend executes `openSTXTransfer`, the following transaction is constructed:

| Parameter | Value |
| --- | --- |
| `recipient` | `paymentInfo.accepts[0].payTo` (agent address) |
| `amount` | `paymentInfo.accepts[0].amount` (microSTX) |
| `memo` | `'x402 Agent Fee'` or `'x402 Agent Move Fee'` |
| `network` | `StacksTestnet` instance |

**Sources:** [frontend/src/pages/ArenaGame.jsx L371-L375](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L371-L375)

 [frontend/src/pages/ArenaGame.jsx L418-L422](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L418-L422)

---

## Configuration and Environment Setup

### Agent Environment Variables

The agent requires the following environment configuration for x402 operation:

```
PRIVATE_KEY=<agent_wallet_private_key>
NETWORK_TYPE=testnet
CONTRACT_ADDRESS=ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9
PORT=3000
X402_FACILITATOR_URL=https://v2.x402stacks.xyz
```

**Key Configuration:**

* **AGENT_ADDRESS:** Derived from `PRIVATE_KEY` using `getAddressFromPrivateKey()`
* **Payment Recipient:** All x402 payments are directed to `AGENT_ADDRESS`

**Sources:** [agent/.env.example L1-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L1-L16)

 [agent/src/ArenaAgent.ts L40-L43](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L40-L43)

### Frontend Environment Variables

```
VITE_DEPLOYER_ADDRESS=ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9
VITE_AGENT_API_URL=http://localhost:3000
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L10-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L10-L12)

---

## x402 Integration with Match Lifecycle

### Complete Payment Flow in Match Proposal

```mermaid
sequenceDiagram
  participant p1 as User
  participant p2 as ArenaGame
  participant p3 as Wallet
  participant p4 as arena-platform-v2
  participant p5 as Agent API

  note over p1,p4: "Phase 1: Match Proposal (Standard Blockchain)"
  p1->>p2: "handleProposeMatch()"
  p2->>p3: "openContractCall(propose-match)"
  p3->>p4: "propose-match(opponent, gameType, wager)"
  p4-->>p3: "matchId created"
  p3-->>p2: "onFinish(data.txId)"
  note over p2,p5: "Phase 2: x402 Challenge (2s delay)"
  p2->>p2: "setTimeout 2000ms"
  p2->>p5: "POST /accept-match (no proof)"
  p5-->>p2: "HTTP 402 (payment required)"
  note over p2,p4: "Phase 3: x402 Payment"
  p2->>p3: "openSTXTransfer(1000 microSTX)"
  p3->>p4: "STX transfer to agent"
  p4-->>p3: "TX confirmed"
  p3-->>p2: "onFinish(paymentTxId)"
  note over p2,p5: "Phase 4: Service Delivery"
  p2->>p2: "setTimeout 2000ms"
  p2->>p5: "POST /accept-match (x-payment-proof)"
  p5->>p5: "x402Middleware verifies"
  p5->>p4: "accept-match(matchId)"
  p4-->>p5: "Match accepted"
  p5-->>p2: "success: true"
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L300-L348](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L348)

 [frontend/src/pages/ArenaGame.jsx L350-L398](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L350-L398)

---

## Error Handling and Edge Cases

### Payment Cancellation

Both payment flows handle user cancellation:

```javascript
onCancel: () => {
    toast.error('Payment cancelled - Agent refused match', { id: toastId });
}
```

**Behavior:**

* No retry is attempted
* Error toast notifies user
* Match remains in pending state

**Sources:** [frontend/src/pages/ArenaGame.jsx L386-L388](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L386-L388)

 [frontend/src/pages/ArenaGame.jsx L433-L435](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L433-L435)

### Network Failures

If the agent API is unreachable during initial request or retry:

```
catch (error) {
    if (error.response?.status === 402) {
        // Handle payment flow
    } else {
        console.error(error);
        toast.error('Challenge failed', { id: toastId });
    }
}
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L390-L394](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L390-L394)

### Double Payment Prevention

The recursive `processRequest` pattern prevents double payments:

1. First call has no headers → triggers 402
2. After payment, headers are added to retry
3. Agent middleware checks headers before returning 402
4. Subsequent calls with valid proof bypass payment gate

**Sources:** [frontend/src/pages/ArenaGame.jsx L353-L397](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L353-L397)

---

## x402 Protocol Dependencies

### NPM Package: x402-stacks

Both frontend and agent depend on the `x402-stacks` package (v2.0.1):

**Agent Import:**

```javascript
import { X402_HEADERS } from 'x402-stacks';
```

**Usage:** The `X402_HEADERS.PAYMENT_REQUIRED` constant is used to set the standardized HTTP response header.

**Sources:** [agent/src/ArenaAgent.ts L3-L4](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L3-L4)

 [agent/src/ArenaAgent.ts L130-L131](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L130-L131)

**Frontend Integration:**
The frontend uses axios directly for x402 flows, but the protocol structure aligns with x402-stacks specifications.

**Sources:** Frontend does not directly import x402-stacks, relying on axios for HTTP handling

---

## Security Considerations

### Payment Proof Validation

**Current Implementation Limitation:**
The agent's `x402Middleware` does not verify payment proofs against the blockchain. It only checks for header presence.

**Production Requirements:**

1. Query Stacks API: `GET https://api.testnet.hiro.so/extended/v1/tx/${paymentProof}`
2. Verify `tx_status === 'success'`
3. Parse `tx_result` to confirm: * Token transfer recipient matches `AGENT_ADDRESS` * Transfer amount matches required fee * Transaction is recent (within reasonable time window)

**Sources:** [agent/src/ArenaAgent.ts L136-L138](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L136-L138)

### CORS Configuration

The agent allows all origins for development:

```
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-payment-proof, x-stacks-address');
```

**Production Consideration:** Restrict `Access-Control-Allow-Origin` to trusted frontend domains.

**Sources:** [agent/src/ArenaAgent.ts L29-L30](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L29-L30)

### Replay Attack Prevention

Current implementation is vulnerable to payment proof replay. Recommended mitigations:

1. **Nonce System:** Include request-specific nonce in 402 response
2. **TTL Enforcement:** Reject payment proofs older than 5 minutes
3. **Used Proof Tracking:** Maintain in-memory set of consumed transaction IDs

**Sources:** Implicit from [agent/src/ArenaAgent.ts L108-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L108-L140)

 payment verification logic

---

## Cost Structure

The agent enforces the following fee schedule:

| Service | Endpoint | Cost (microSTX) | Cost (STX) |
| --- | --- | --- | --- |
| Match Acceptance | `/accept-match` | 1000 | 0.001 |
| AI Move Execution | `/play-move` | 500 | 0.0005 |

**Rationale:**

* Match acceptance fee covers computational cost of Markov model initialization and on-chain transaction
* Move execution fee is lower as model is already trained
* Total agent cost per complete match: **1500 microSTX (0.0015 STX)**

**Sources:** [agent/src/ArenaAgent.ts L143](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L143)

 [agent/src/ArenaAgent.ts L186](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L186)

---

## Integration Points

### Relationship to Smart Contracts

The x402 protocol operates independently from smart contract logic:

1. **Match Proposal:** User pays wager to contract (separate from agent fees)
2. **x402 Payment:** User pays service fee to agent wallet
3. **Agent Action:** Agent calls contract functions after payment verification
4. **Prize Distribution:** Contract pays winner (98% of total wager)

**Key Insight:** Agent fees are off-contract micropayments, while wagers are on-contract escrowed funds.

**Sources:** [frontend/src/pages/ArenaGame.jsx L309-L339](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L309-L339)

 (match proposal with post-conditions), [agent/src/ArenaAgent.ts L143-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L143-L183)

 (agent contract calls after x402 verification)

### Connection to Markov AI

After x402 payment verification succeeds, the agent executes strategic logic:

```javascript
app.post('/play-move', x402Middleware(500), async (req, res) => {
    // After payment verified by middleware...
    
    // Fetch challenger's move from blockchain
    const challengerMoveRes = await callReadOnlyFunction(...);
    const challengerMoveValue = Number(moveData.value);
    
    // Update Markov model
    model.update(gameType, challenger, challengerMoveValue);
    
    // Generate counter-strategy
    move = model.predict(gameType, challenger);
    
    // Execute on-chain
    await makeContractCall({ functionName: 'play-move', ... });
});
```

**Sources:** [agent/src/ArenaAgent.ts L186-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L301)

---

## Summary

The x402 protocol enables GameArena's autonomous agent to monetize its services through automated micropayments:

* **Agent Implementation:** `x402Middleware` function gates endpoints, returning HTTP 402 with payment instructions
* **Frontend Automation:** Recursive `processRequest` pattern handles payment flow transparently
* **Integration:** Operates alongside smart contract wagers as a separate service fee layer
* **Cost Structure:** 1000 microSTX for match acceptance, 500 microSTX for move execution
* **Security:** Current implementation requires production enhancements for payment verification and replay protection

**Sources:** [agent/src/ArenaAgent.ts L108-L140](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L108-L140)

 [frontend/src/pages/ArenaGame.jsx L350-L445](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L350-L445)

 [README.md L58-L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L58-L64)

---

# Stacks-Blockchain-Integration

# Stacks Blockchain Integration

> **Relevant source files**
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)
> * [frontend/package.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

## Purpose and Scope

This document describes how GameArenaStacks integrates with the Stacks blockchain for decentralized game logic, wagering, and trustless asset transfers. It covers transaction construction, wallet interactions, contract calls, network configuration, and post-condition enforcement.

For information about the specific smart contract logic and game rules, see [arena-platform-v2 Contract](/HACK3R-CRYPTO/GameArenaStacks/4.1-arena-platform-v2-contract). For multi-node failover and reliability strategies, see [Multi-Node Failover and Reliability](/HACK3R-CRYPTO/GameArenaStacks/6.1-multi-node-failover-and-reliability). For post-condition implementation details, see [Post-Conditions and Asset Protection](/HACK3R-CRYPTO/GameArenaStacks/6.2-post-conditions-and-asset-protection). For x402 payment protocol integration, see [x402 Monetization Protocol](/HACK3R-CRYPTO/GameArenaStacks/5-x402-monetization-protocol).

---

## Core Integration Libraries

GameArenaStacks uses the official Stacks JavaScript SDK to interact with the blockchain. The integration is split between frontend wallet operations and agent autonomous transactions.

### Frontend Dependencies

| Library | Version | Purpose |
| --- | --- | --- |
| `@stacks/connect` | 7.8.3 | Wallet integration and transaction signing |
| `@stacks/transactions` | 6.13.0 | Transaction construction and serialization |
| `@stacks/network` | 6.13.0 | Network configuration and RPC communication |
| `@stacks/common` | 6.13.0 | Common utilities and types |

**Sources:** [frontend/package.json L13-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L13-L16)

### Agent Dependencies

| Library | Version | Purpose |
| --- | --- | --- |
| `@stacks/transactions` | 6.13.0 | Direct transaction construction without wallet |
| `@stacks/network` | 6.13.0 | Network configuration for autonomous operations |

**Sources:** [agent/src/ArenaAgent.ts L6-L19](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L6-L19)

---

## Network Configuration and Node Selection

```mermaid
flowchart TD

FE_Config["StacksTestnet Configuration"]
FE_Nodes["STACKS_NODES Array"]
FE_Primary["api.testnet.hiro.so"]
FE_Backup1["stacks-node-api.testnet.stacks.co"]
FE_Backup2["stacks-node-api.testnet.hiro.so"]
AG_Config["StacksTestnet Configuration"]
AG_Primary["api.testnet.hiro.so"]
AG_Backup["stacks-node-api.testnet.stacks.co"]
Hiro["Hiro API Node"]
StacksNode["Stacks Node API"]
Blockchain["Stacks Blockchain"]

subgraph Stacks ["Stacks Testnet Infrastructure"]
    Hiro
    StacksNode
    Blockchain
    Hiro -.-> Blockchain
    StacksNode -.-> Blockchain
end

subgraph Agent ["Agent Network Layer"]
    AG_Config
    AG_Primary
    AG_Backup
end

subgraph Frontend ["Frontend Network Layer"]
    FE_Config
    FE_Nodes
    FE_Primary
    FE_Backup1
    FE_Backup2
end
```

**Network Configuration Schema**

The system instantiates `StacksTestnet` with explicit node URLs for failover support:

```javascript
// Frontend node array
const STACKS_NODES = [
    'https://api.testnet.hiro.so',
    'https://stacks-node-api.testnet.stacks.co',
    'https://stacks-node-api.testnet.hiro.so'
];

// Primary network instance
const network = new StacksTestnet({ url: STACKS_NODES[0] });
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L28-L32](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L28-L32)

 [frontend/src/pages/ArenaGame.jsx L52](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L52-L52)

The agent uses a simpler configuration with manual failback logic:

```javascript
const network = new StacksTestnet({ url: 'https://api.testnet.hiro.so' });
```

**Sources:** [agent/src/ArenaAgent.ts L42](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L42-L42)

---

## Transaction Construction Patterns

### Read-Only Contract Calls

```mermaid
sequenceDiagram
  participant p1 as Frontend
  participant p2 as callReadOnlyWithRetry
  participant p3 as Node 1: api.testnet.hiro.so
  participant p4 as Node 2: stacks-node-api
  participant p5 as arena-platform-v2

  p1->>p2: "callReadOnlyWithRetry(options)"
  p2->>p3: "callReadOnlyFunction()"
  alt Node 1 Success
    p3->>p5: "Query Contract State"
    p5-->>p3: "Contract Response"
    p3-->>p2: "Result"
    p2-->>p1: "Return Data"
  else Node 1 Failure
    p3-->>p2: "Error"
    p2->>p4: "callReadOnlyFunction() [Fallback]"
    p4->>p5: "Query Contract State"
    p5-->>p4: "Contract Response"
    p4-->>p2: "Result"
    p2-->>p1: "Return Data"
  end
```

The `callReadOnlyWithRetry` function implements automatic failover across multiple Stacks nodes:

```javascript
const callReadOnlyWithRetry = async (options) => {
    let lastError;
    for (const nodeUrl of STACKS_NODES) {
        try {
            const networkWithNode = new StacksTestnet({ url: nodeUrl });
            return await callReadOnlyFunction({
                ...options,
                network: networkWithNode
            });
        } catch (e) {
            console.warn(`Node ${nodeUrl} failed, trying next...`, e);
            lastError = e;
            continue;
        }
    }
    throw lastError;
};
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L34-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L34-L50)

**Key Read-Only Queries:**

| Function Name | Purpose | Return Type |
| --- | --- | --- |
| `get-match-count` | Total matches created | `uint` |
| `get-match-details` | Match metadata and status | `(optional {...})` |
| `get-player-move` | Player's committed move | `(optional uint)` |

**Example: Fetching Match Count**

```javascript
const countResult = await callReadOnlyWithRetry({
    contractAddress: DEPLOYER_ADDRESS,
    contractName: 'arena-platform-v2',
    functionName: 'get-match-count',
    functionArgs: [],
    senderAddress: address,
});

const count = parseInt(cvToJSON(countResult).value);
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L138-L147](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L138-L147)

---

### Write Contract Calls via Stacks Connect

```mermaid
flowchart TD

ProposeMatch["handleProposeMatch()"]
BuildArgs["Cl.uint(), Cl.none()"]
BuildPC["Pc.principal().willSendEq()"]
OpenCall["openContractCall()"]
WalletPrompt["Wallet Extension Prompt"]
TxSign["Transaction Signing"]
UserApproval["User Approval"]
SignTx["Sign Transaction"]
Broadcast["Broadcast to Network"]
Mempool["Transaction Mempool"]
Confirmation["Block Confirmation"]
Contract["arena-platform-v2.propose-match()"]

BuildArgs -.-> OpenCall
BuildPC -.-> OpenCall
WalletPrompt -.-> UserApproval
Broadcast -.-> Mempool
Contract -.->|"onFinish callback"| ProposeMatch

subgraph Blockchain ["Stacks Blockchain"]
    Mempool
    Confirmation
    Contract
    Mempool -.-> Confirmation
    Confirmation -.-> Contract
end

subgraph Wallet ["Stacks Wallet (Leather/Xverse)"]
    UserApproval
    SignTx
    Broadcast
    UserApproval -.-> SignTx
    SignTx -.-> Broadcast
end

subgraph Connect ["@stacks/connect"]
    OpenCall
    WalletPrompt
    TxSign
    OpenCall -.-> WalletPrompt
end

subgraph Frontend ["Frontend Application"]
    ProposeMatch
    BuildArgs
    BuildPC
    ProposeMatch -.-> BuildArgs
    ProposeMatch -.-> BuildPC
end
```

The frontend never handles private keys directly. All write operations use `openContractCall` from `@stacks/connect`, which delegates to browser wallet extensions:

```javascript
await openContractCall({
    contractAddress: DEPLOYER_ADDRESS,
    contractName: 'arena-platform-v2',
    functionName: 'propose-match',
    functionArgs: [
        Cl.none(), // opponent (none for open match)
        Cl.uint(selectedGameType),
        Cl.uint(Math.floor(parseFloat(wager) * 1000000))
    ],
    network,
    postConditions,
    postConditionMode: 1, // Deny mode
    onFinish: (data) => {
        console.log('Match proposed:', data);
        // Handle txId
    },
    onCancel: () => {
        // Handle cancellation
    }
});
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L317-L339](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L317-L339)

**Transaction Argument Construction:**

| Clarity Type | JavaScript Function | Example |
| --- | --- | --- |
| `uint` | `Cl.uint(value)` | `Cl.uint(123456)` |
| `principal` | `Cl.principal(address)` | `Cl.principal("ST1...")` |
| `(optional principal)` | `Cl.none()` / `Cl.some(...)` | `Cl.none()` |
| `bool` | `Cl.bool(value)` | `Cl.bool(true)` |

**Sources:** [frontend/src/pages/ArenaGame.jsx L321-L324](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L321-L324)

---

### Agent Autonomous Transaction Construction

```mermaid
sequenceDiagram
  participant p1 as Agent API Endpoint
  participant p2 as Nonce Fetcher
  participant p3 as makeContractCall()
  participant p4 as broadcastTransaction()
  participant p5 as Stacks Network
  participant p6 as arena-platform-v2

  p1->>p2: "Fetch nonce for AGENT_ADDRESS"
  p2->>p5: "GET /extended/v1/address/{addr}/nonces"
  p5-->>p2: "{possible_next_nonce: 42}"
  p2-->>p1: "Return nonce=42"
  p1->>p3: "Build transaction with privateKey"
  note over p3: "functionArgs: [uintCV(matchId)]<br/>senderKey: PRIVATE_KEY<br/>nonce: BigInt(42)"
  p3-->>p1: "Signed Transaction Object"
  p1->>p4: "broadcastTransaction(tx, network)"
  p4->>p5: "POST /v2/transactions"
  p5-->>p4: "{txid: '0xabc...'}"
  p4-->>p1: "Transaction ID"
  p5->>p6: "Process accept-match(matchId)"
  p6-->>p5: "State Updated"
```

The agent constructs and broadcasts transactions directly without user interaction:

```javascript
// Fetch nonce from network
const nonceResponse = await fetch(`${nodeUrl}/extended/v1/address/${address}/nonces`);
const nonceData = await nonceResponse.json();
const nonce = nonceData.possible_next_nonce || 0;

// Build transaction options
const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'accept-match',
    functionArgs: [uintCV(matchId)],
    senderKey: PRIVATE_KEY,
    validateWithKnownAbi: false,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
};

// Create and broadcast
const transaction = await makeContractCall(txOptions);
const broadcastResponse = await broadcastTransaction(transaction, network);
```

**Sources:** [agent/src/ArenaAgent.ts L151-L172](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L151-L172)

**Nonce Fetching with Failover:**

```javascript
const nodes = [
    'https://api.testnet.hiro.so',
    'https://stacks-node-api.testnet.stacks.co'
];

for (const nodeUrl of nodes) {
    try {
        const url = `${nodeUrl}/extended/v1/address/${address}/nonces`;
        const nonceResponse = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (nonceResponse.ok) {
            const nonceData = await nonceResponse.json();
            nonce = nonceData.possible_next_nonce || 0;
            break; // Success!
        }
    } catch (err) {
        console.warn(`Failed to reach ${nodeUrl}: ${err.message}`);
        continue; // Try next node
    }
}
```

**Sources:** [agent/src/ArenaAgent.ts L246-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L246-L266)

---

## Wallet Integration Architecture

```mermaid
flowchart TD

ConnectBtn["Connect Wallet Button"]
DisconnectBtn["Disconnect Button"]
DisplayName["Display BNS / Address"]
ShowConnect["showConnect()"]
AppDetails["App Metadata"]
UserSession["UserSession"]
Leather["Leather Wallet"]
Xverse["Xverse Wallet"]
Asigna["Asigna Wallet"]
LoadUser["userSession.loadUserData()"]
UserData["userData Object"]
StxAddress["profile.stxAddress.testnet"]
BNSAPI["api.bnsv2.com"]
ValidNames["Valid Names Query"]
FullName["full_name Display"]

ConnectBtn -.-> ShowConnect
AppDetails -.-> Leather
AppDetails -.-> Xverse
AppDetails -.-> Asigna
Leather -.-> LoadUser
Xverse -.-> LoadUser
Asigna -.-> LoadUser
StxAddress -.-> BNSAPI
FullName -.-> DisplayName
DisconnectBtn -.-> UserSession

subgraph BNS ["BNS Resolution"]
    BNSAPI
    ValidNames
    FullName
    BNSAPI -.-> ValidNames
    ValidNames -.-> FullName
end

subgraph Auth ["Authentication Flow"]
    LoadUser
    UserData
    StxAddress
    LoadUser -.-> UserData
    UserData -.-> StxAddress
end

subgraph WalletExt ["Browser Wallet Extension"]
    Leather
    Xverse
    Asigna
end

subgraph StacksConnect ["@stacks/connect"]
    ShowConnect
    AppDetails
    UserSession
    ShowConnect -.-> AppDetails
end

subgraph UI ["Navigation Component"]
    ConnectBtn
    DisconnectBtn
    DisplayName
end
```

**Wallet Connection Initiation:**

```javascript
function connectWallet() {
    showConnect({
        appDetails: {
            name: 'GameArena Stacks',
            icon: window.location.origin + '/logo.png',
        },
        redirectTo: '/',
        onFinish: () => {
            const userDataResult = userSession.loadUserData();
            setUserData(userDataResult);
            
            // Try to fetch BNS name
            const address = userDataResult.profile.stxAddress.testnet;
            getBns(address).then(setBns);
        },
        userSession,
    });
}
```

**Sources:** [frontend/src/components/Navigation.jsx L7-L28](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L7-L28)

**BNS Name Resolution:**

```javascript
async function getBns(stxAddress) {
    try {
        const response = await fetch(
            `https://api.bnsv2.com/testnet/names/address/${stxAddress}/valid`
        );
        const data = await response.json();
        return data.names?.[0]?.full_name || '';
    } catch (error) {
        console.error('Failed to fetch BNS:', error);
        return '';
    }
}
```

**Sources:** [frontend/src/components/Navigation.jsx L36-L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L36-L45)

---

## Post-Condition Implementation

Post-conditions are Stacks' mechanism for ensuring trustless asset transfers. They define expected asset movements and cause transactions to abort if violated.

### Post-Condition Construction

```javascript
const postConditions = [
    Pc.principal(userAddress)
        .willSendEq(Math.floor(parseFloat(wager) * 1000000))
        .ustx()
];
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L310-L314](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L310-L314)

This post-condition guarantees:

1. The transaction will **abort** if it attempts to transfer any amount other than the exact wager
2. The user's wallet cannot be drained beyond the specified amount
3. The contract cannot steal funds through unexpected logic paths

### Post-Condition Modes

| Mode | Value | Behavior |
| --- | --- | --- |
| `Allow` | 2 | Allow additional asset transfers not covered by post-conditions |
| `Deny` | 1 | **Reject** any asset transfer not explicitly allowed by post-conditions |

```yaml
postConditionMode: 1, // Deny mode for maximum security
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L328](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L328-L328)

The frontend uses **Deny mode** to ensure no unexpected asset movements can occur during match proposals.

---

## Contract Interaction Mapping

```mermaid
flowchart TD

ProposeMatch["propose-match(opponent, game-type, wager)"]
PlayMove["play-move(match-id, move)"]
GetMatchCount["get-match-count() [Read-Only]"]
GetMatchDetails["get-match-details(match-id) [Read-Only]"]
GetPlayerMove["get-player-move(match-id, player) [Read-Only]"]
AcceptMatch["accept-match(match-id)"]
AgentPlayMove["play-move(match-id, move)"]
ResolveMatch["resolve-match(match-id, winner)"]
AgentReadMatch["get-match-details(match-id) [Read-Only]"]
AgentReadMove["get-player-move(match-id, player) [Read-Only]"]
MatchState["Map: matches"]
MoveState["Map: player-moves"]
MatchCounter["Var: match-counter"]

ProposeMatch -.-> MatchState
ProposeMatch -.-> MatchCounter
AcceptMatch -.-> MatchState
PlayMove -.-> MoveState
AgentPlayMove -.-> MoveState
ResolveMatch -.-> MatchState
GetMatchCount -.-> MatchCounter
GetMatchDetails -.-> MatchState
GetPlayerMove -.-> MoveState
AgentReadMatch -.-> MatchState
AgentReadMove -.-> MoveState

subgraph Contract ["arena-platform-v2.clar"]
    MatchState
    MoveState
    MatchCounter
end

subgraph Agent ["Agent Contract Calls"]
    AcceptMatch
    AgentPlayMove
    ResolveMatch
    AgentReadMatch
    AgentReadMove
end

subgraph Frontend ["Frontend Contract Calls"]
    ProposeMatch
    PlayMove
    GetMatchCount
    GetMatchDetails
    GetPlayerMove
end
```

**Frontend Write Operations:**

| Function | Triggers | Post-Conditions |
| --- | --- | --- |
| `propose-match` | [ArenaGame.jsx L317](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaGame.jsx#L317-L317) | User sends exact wager amount |
| `play-move` | [ArenaGame.jsx L454](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaGame.jsx#L454-L454) | None (no asset transfer) |

**Agent Write Operations:**

| Function | Triggers | Post-Conditions |
| --- | --- | --- |
| `accept-match` | [ArenaAgent.ts L151](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaAgent.ts#L151-L151) | PostConditionMode.Allow |
| `play-move` | [ArenaAgent.ts L268](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaAgent.ts#L268-L268) | PostConditionMode.Deny |
| `resolve-match` | [ArenaAgent.ts L415](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaAgent.ts#L415-L415) | PostConditionMode.Deny |

**Sources:** [agent/src/ArenaAgent.ts L151-L172](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L151-L172)

 [agent/src/ArenaAgent.ts L268-L286](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L268-L286)

 [agent/src/ArenaAgent.ts L415-L428](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L415-L428)

---

## Transaction Lifecycle and State Polling

```

```

The system implements the **BitSubs pattern** for efficient transaction tracking:

```javascript
useEffect(() => {
    const pendingIds = Object.keys(pendingTxs);
    if (pendingIds.length === 0) return;

    const txPollInterval = setInterval(async () => {
        for (const matchId of pendingIds) {
            const pending = pendingTxs[matchId];
            if (!pending || !pending.txId) continue;

            const response = await fetchWithTimeout(
                `https://api.testnet.hiro.so/extended/v1/tx/${pending.txId}`
            );
            if (response.ok) {
                const txData = await response.json();
                
                if (txData.tx_status === 'success' || 
                    txData.tx_status === 'abort_by_response') {
                    // Cleanup and refresh
                    setPendingTxs(prev => {
                        const next = { ...prev };
                        delete next[matchId];
                        return next;
                    });
                    fetchMatches();
                    fetchBalance();
                }
            }
        }
    }, 5000); // Poll every 5s for pending transactions

    return () => clearInterval(txPollInterval);
}, [pendingTxs, fetchMatches, fetchBalance]);
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L257-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L257-L298)

**Polling Strategy:**

* **General State**: 60-second intervals for match list and balance [ArenaGame.jsx L247-L254](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaGame.jsx#L247-L254)
* **Pending Transactions**: 5-second intervals with targeted queries [ArenaGame.jsx L295](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaGame.jsx#L295-L295)
* **Timeout Protection**: `fetchWithTimeout` with 5-second abort [ArenaGame.jsx L14-L25](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaGame.jsx#L14-L25)

---

## STX Transfer for x402 Payments

```mermaid
sequenceDiagram
  participant p1 as User Wallet
  participant p2 as Agent API
  participant p3 as openSTXTransfer()
  participant p4 as Stacks Wallet Extension
  participant p5 as Stacks Network

  p1->>p2: "POST /accept-match"
  p2-->>p1: "402 Payment Required"
  note over p2: "{payTo: AGENT_ADDRESS,<br/>amount: 1000}"
  p1->>p3: "openSTXTransfer(payment info)"
  p3->>p4: "Prompt user for STX transfer"
  p4->>p5: "Broadcast STX transfer tx"
  p5-->>p4: "txId returned"
  p4-->>p3: "onFinish(data)"
  p3-->>p1: "data.txId"
  p1->>p2: "Retry with x-payment-proof header"
  note over p1: "Headers:<br/>x-payment-proof: txId<br/>x-stacks-address: address"
  p2->>p2: "Verify payment on-chain"
  p2-->>p1: "{success: true}"
```

The x402 payment flow uses `openSTXTransfer` for micro-payments to the agent:

```javascript
await openSTXTransfer({
    recipient: paymentInfo.accepts[0].payTo,
    amount: paymentInfo.accepts[0].amount,
    memo: 'x402 Agent Fee',
    network,
    onFinish: (data) => {
        // Retry with payment proof
        setTimeout(() => {
            processRequest({
                'x-payment-proof': data.txId,
                'x-stacks-address': userData.profile.stxAddress.testnet
            });
        }, 2000);
    },
    onCancel: () => {
        toast.error('Payment cancelled - Agent refused match');
    }
});
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L371-L389](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L371-L389)

**Payment Parameters:**

| Parameter | Type | Purpose |
| --- | --- | --- |
| `recipient` | `string` | Agent's Stacks address |
| `amount` | `string` | Micro-STX amount (e.g., "1000") |
| `memo` | `string` | Transaction memo for identification |
| `network` | `StacksTestnet` | Network configuration |

---

## Contract Address Configuration

The system uses environment variables to configure deployed contract addresses:

**Frontend:**

```javascript
const DEPLOYER_ADDRESS = import.meta.env.VITE_DEPLOYER_ADDRESS || 
                         'ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA';
const ARENA_CONTRACT = `${DEPLOYER_ADDRESS}.arena-platform-v2`;
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L10-L11](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L10-L11)

**Agent:**

```javascript
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 
                         'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9';
const CONTRACT_NAME = 'arena-platform-v2';
```

**Sources:** [agent/src/ArenaAgent.ts L45-L46](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L45-L46)

 [agent/.env.example L9](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L9-L9)

**Deployed Contracts:**

| Contract | Deployer Address |
| --- | --- |
| `arena-platform-v2` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` |
| `agent-registry` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` |

---

## Error Handling and Transaction Verification

```mermaid
flowchart TD

OpenCall["openContractCall()"]
OnFinish["onFinish(data)"]
OnCancel["onCancel()"]
BroadcastError["broadcastResponse.error"]
TxStatusAbort["tx_status: abort_by_response"]
NetworkError["Network timeout/failure"]
ToastError["Display error toast"]
RemovePending["Remove from pendingTxs"]
NodeFailover["Try next node in rotation"]

OnFinish -.-> BroadcastError
BroadcastError -.-> ToastError
TxStatusAbort -.-> ToastError
NetworkError -.-> NodeFailover

subgraph Recovery ["Recovery Actions"]
    ToastError
    RemovePending
    NodeFailover
    ToastError -.-> RemovePending
end

subgraph ErrorHandling ["Error Handling"]
    BroadcastError
    TxStatusAbort
    NetworkError
end

subgraph TxSubmission ["Transaction Submission"]
    OpenCall
    OnFinish
    OnCancel
    OpenCall -.->|"Check broadcast response"| OnFinish
    OpenCall -.-> OnCancel
end
```

**Agent Transaction Error Handling:**

```javascript
const broadcastResponse = await broadcastTransaction(transaction, network);

if (broadcastResponse.error) {
    console.error(`Broadcast failed: ${broadcastResponse.error} - ${broadcastResponse.reason}`);
    throw new Error(`Broadcast failed: ${broadcastResponse.error}`);
}

res.json({
    success: true,
    txid: broadcastResponse.txid,
    message: 'Match accepted on Stacks'
});
```

**Sources:** [agent/src/ArenaAgent.ts L169-L178](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L169-L178)

**Frontend Transaction Polling Error Handling:**

```
if (txData.tx_status === 'success') {
    toast.success(`Transaction Confirmed!`, { id: pending.txId });
} else {
    toast.error(`Transaction Failed: ${txData.tx_result?.repr || 'Aborted'}`);
}
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L275-L279](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L275-L279)

---

**Sources:** [frontend/src/pages/ArenaGame.jsx L1-L1141](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L1-L1141)

 [agent/src/ArenaAgent.ts L1-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L1-L482)

 [frontend/src/components/Navigation.jsx L1-L93](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx#L1-L93)

 [frontend/package.json L1-L37](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/package.json#L1-L37)

 [agent/.env.example L1-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L1-L16)

 [README.md L1-L86](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L1-L86)

---

# Multi-Node-Failover-and-Reliability

# Multi-Node Failover and Reliability

> **Relevant source files**
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

## Purpose and Scope

This document explains the multi-node failover and reliability mechanisms implemented in GameArenaStacks to ensure continuous operation despite RPC node failures, rate limiting, or network interruptions. The system implements automatic node rotation across multiple Stacks testnet API endpoints in both the frontend and agent components.

For information about transaction polling and state synchronization, see [Transaction Management and State Polling](/HACK3R-CRYPTO/GameArenaStacks/2.5-transaction-management-and-state-polling). For details on blockchain integration patterns, see [Stacks Blockchain Integration](/HACK3R-CRYPTO/GameArenaStacks/6-stacks-blockchain-integration).

## High-Level Architecture

GameArenaStacks implements redundant network paths to the Stacks blockchain by maintaining connections to multiple RPC providers. When a primary node fails, the system automatically retries the request against backup nodes without user intervention.

```mermaid
flowchart TD

FE["ArenaGame Component"]
FERetry["callReadOnlyWithRetry()"]
FETimeout["fetchWithTimeout()"]
AG["ArenaAgent Express Server"]
AGNonce["Nonce Fetching Logic"]
Node1["api.testnet.hiro.so"]
Node2["stacks-node-api.testnet.stacks.co"]
Node3["stacks-node-api.testnet.hiro.so"]
BC["Blockchain State"]

FETimeout -.->|"Fallback on error"| Node1
FETimeout -.-> Node2
FETimeout -.-> Node3
AGNonce -.-> Node1
AGNonce -.-> Node2
Node1 -.-> BC
Node2 -.-> BC
Node3 -.-> BC
AGNonce -.-> Node2

subgraph Blockchain ["Stacks Testnet"]
    BC
end

subgraph NodePool ["RPC Node Pool"]
    Node1
    Node2
    Node3
end

subgraph Agent ["Agent Layer"]
    AG
    AGNonce
    AG -.-> AGNonce
end

subgraph Frontend ["Frontend Layer"]
    FE
    FERetry
    FETimeout
    FE -.->|"Retry on failure"| FERetry
    FERetry -.-> FETimeout
    FERetry -.-> FETimeout
end
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L14-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L14-L50)

 [agent/src/ArenaAgent.ts L242-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L242-L266)

## Frontend Node Rotation Implementation

### Node Pool Configuration

The frontend maintains an ordered array of Stacks RPC endpoints that are attempted sequentially:

| Priority | Endpoint URL | Purpose |
| --- | --- | --- |
| 1 (Primary) | `https://api.testnet.hiro.so` | Hiro's high-availability API service |
| 2 (Backup) | `https://stacks-node-api.testnet.stacks.co` | Official Stacks Foundation node |
| 3 (Tertiary) | `https://stacks-node-api.testnet.hiro.so` | Alternative Hiro node endpoint |

The node pool is defined at [frontend/src/pages/ArenaGame.jsx L27-L32](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L27-L32)

:

```javascript
const STACKS_NODES = [
    'https://api.testnet.hiro.so',
    'https://stacks-node-api.testnet.stacks.co',
    'https://stacks-node-api.testnet.hiro.so'
];
```

### Retry Logic with callReadOnlyWithRetry

The `callReadOnlyWithRetry` function implements the core failover mechanism by iterating through the node pool until a successful response is received:

```

```

Implementation at [frontend/src/pages/ArenaGame.jsx L34-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L34-L50)

:

* **Input**: Standard `callReadOnlyFunction` options object
* **Process**: Sequentially attempts each node URL by creating a new `StacksTestnet` instance with the node's URL
* **Error Handling**: Logs warnings to console for each failed node attempt
* **Output**: Returns the first successful result or throws the last error if all nodes fail

**Sources**: [frontend/src/pages/ArenaGame.jsx L34-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L34-L50)

### Request Timeout Protection

The `fetchWithTimeout` utility function prevents indefinite hanging on unresponsive nodes by implementing an abort controller pattern:

```mermaid
sequenceDiagram
  participant p1 as Caller
  participant p2 as fetchWithTimeout
  participant p3 as AbortController
  participant p4 as RPC Node

  p1->>p2: "fetch(url, options, 5000ms)"
  p2->>p3: "new AbortController()"
  p2->>p3: "setTimeout(abort, 5000ms)"
  p2->>p4: "fetch() with signal"
  alt Response within 5s
    p4-->>p2: "Response"
    p2->>p3: "clearTimeout()"
    p2-->>p1: "Return response"
  else Timeout after 5s
    p3->>p2: "abort()"
    p2-->>p1: "Throw timeout error"
  end
```

Key characteristics at [frontend/src/pages/ArenaGame.jsx L14-L25](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L14-L25)

:

* **Timeout Duration**: 5000ms (5 seconds) default
* **Mechanism**: `AbortController` with `setTimeout`
* **Cleanup**: Always clears timeout to prevent memory leaks
* **Usage**: Wraps all HTTP fetch operations for balance checks and transaction polling

**Sources**: [frontend/src/pages/ArenaGame.jsx L14-L25](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L14-L25)

### Usage Patterns in Frontend

The retry mechanism is used throughout the component for critical read operations:

| Function | Purpose | Lines |
| --- | --- | --- |
| `fetchMatches` | Retrieves match count and details | [frontend/src/pages/ArenaGame.jsx L138-L144](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L138-L144) |
| `fetchMatches` (move queries) | Fetches player moves for matches | [frontend/src/pages/ArenaGame.jsx L159-L227](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L159-L227) |
| `fetchBalance` | Gets user STX balance (with timeout) | [frontend/src/pages/ArenaGame.jsx L108-L122](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L108-L122) |

**Sources**: [frontend/src/pages/ArenaGame.jsx L108-L240](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L108-L240)

## Agent Node Rotation Implementation

### Agent Node Pool

The agent maintains a smaller but equivalent node pool for nonce fetching operations:

```javascript
const nodes = [
    'https://api.testnet.hiro.so',
    'https://stacks-node-api.testnet.stacks.co'
];
```

Location: [agent/src/ArenaAgent.ts L246-L249](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L246-L249)

### Nonce Fetching with Fallback

The agent's critical nonce fetching logic implements a similar retry pattern with timeout protection:

```mermaid
flowchart TD

Start["Start: Need nonce for transaction"]
Init["Initialize nonce = 0"]
Loop["For each node in nodes[]"]
Fetch["fetch(nodeUrl/extended/v1/address/{address}/nonces)"]
Timeout["AbortSignal.timeout(15000)"]
Success["Parse possible_next_nonce"]
Fail["Log warning, continue"]
End["Return nonce"]

Start -.-> Init
Init -.-> Loop
Loop -.-> Fetch
Fetch -.-> Timeout
Timeout -.-> Success
Timeout -.-> Fail
Success -.-> End
Fail -.-> Loop
Loop -.-> End
```

Implementation details at [agent/src/ArenaAgent.ts L245-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L245-L266)

:

* **Timeout**: 15000ms (15 seconds) per node attempt
* **Mechanism**: `AbortSignal.timeout()` for request cancellation
* **Fallback**: Continues to next node on any error
* **Default**: Returns `0` if all nodes fail (relies on SDK's nonce calculation)
* **Logging**: Uses chalk-colored console warnings for visibility

**Sources**: [agent/src/ArenaAgent.ts L242-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L242-L266)

### Agent Network Configuration

The agent also configures its base network instance but uses dynamic node selection for nonce operations:

| Component | Network Instance | Location |
| --- | --- | --- |
| Base Configuration | `new StacksTestnet({ url: 'https://api.testnet.hiro.so' })` | [agent/src/ArenaAgent.ts L42](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L42-L42) |
| Nonce Fetching | Dynamic node iteration | [agent/src/ArenaAgent.ts L246-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L246-L266) |
| Contract Calls | Uses base network instance | [agent/src/ArenaAgent.ts L162-L165](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L162-L165) |

**Sources**: [agent/src/ArenaAgent.ts L42](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L42-L42)

 [agent/src/ArenaAgent.ts L151-L183](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L151-L183)

## Error Handling Strategy

### Frontend Error Handling

The frontend implements a "warn and continue" strategy for non-critical failures:

```mermaid
flowchart TD

Request["callReadOnlyWithRetry()"]
Node1["Try Node 1"]
Node2["Try Node 2"]
Node3["Try Node 3"]
Warn["console.warn()"]
Success["Return Result"]
Fail["Throw Last Error"]

Request -.-> Node1
Node1 -.->|"Success"| Success
Node1 -.->|"Failure"| Warn
Warn -.->|"Failure"| Node2
Node2 -.->|"Success"| Success
Node2 -.-> Warn
Warn -.-> Node3
Node3 -.->|"Success"| Success
Node3 -.->|"Failure"| Fail
```

Error logging pattern at [frontend/src/pages/ArenaGame.jsx L43-L46](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L43-L46)

:

```
console.warn(`Node ${nodeUrl} failed, trying next...`, e);
lastError = e;
continue;
```

For balance fetching at [frontend/src/pages/ArenaGame.jsx L118-L120](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L118-L120)

:

```
console.warn(`Balance fetch failed for ${nodeUrl}, trying next...`);
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L34-L122](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L34-L122)

### Agent Error Handling

The agent logs more detailed errors with chalk coloring for operational visibility:

```
console.warn(chalk.yellow(`Failed to reach ${nodeUrl}: ${err.message}`));
```

Located at [agent/src/ArenaAgent.ts L263](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L263-L263)

### Graceful Degradation

Both components implement graceful degradation strategies:

| Component | Failure Scenario | Behavior |
| --- | --- | --- |
| Frontend | All nodes fail for balance | Silent failure, displays last known balance |
| Frontend | All nodes fail for matches | Logs error, displays empty state |
| Frontend | Transaction polling timeout | Silently ignores, continues next poll cycle |
| Agent | All nodes fail for nonce | Uses `nonce = 0`, relies on SDK calculation |
| Agent | Chain monitoring failure | Silently retries after 20s interval |

**Sources**: [frontend/src/pages/ArenaGame.jsx L237-L239](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L237-L239)

 [agent/src/ArenaAgent.ts L471-L474](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L471-L474)

## Polling and Monitoring Integration

### Transaction Polling with Node Failover

The frontend's transaction polling system at [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

 integrates with node failover through `fetchWithTimeout`:

```mermaid
sequenceDiagram
  participant p1 as Poll Interval (5s)
  participant p2 as fetchWithTimeout
  participant p3 as RPC Nodes
  participant p4 as React State

  loop Every 5 seconds
    p1->>p2: "Check TX status"
    p2->>p3: "GET /extended/v1/tx/{txId}"
  alt Success
    p3-->>p2: "TX data"
    p2-->>p1: "Parse status"
    p1->>p4: "Update if confirmed"
  else Network Error
    p3-->>p2: "Timeout/Error"
    p2-->>p1: "Silent ignore"
    note over p1: "Continue polling"
  end
  end
```

Key characteristics:

* **Interval**: 5000ms for pending transactions only
* **Endpoint**: Uses single node (Hiro API) with timeout
* **Error Handling**: Silently ignores network errors to avoid spam
* **Cleanup**: Removes transaction from tracking on success/abort

**Sources**: [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

### Agent Chain Monitoring

The agent's `monitorChain` function at [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

 runs continuously with silent error recovery:

```javascript
setInterval(async () => {
    try {
        // ... monitoring logic ...
    } catch (e) {
        // Silently retry
    }
}, 20000); // 20s cycle
```

**Sources**: [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

## Configuration and Maintenance

### Environment Configuration

The system's node endpoints are hardcoded for testnet but can be extended through environment variables:

| Variable | Component | Current Usage | Location |
| --- | --- | --- | --- |
| `VITE_DEPLOYER_ADDRESS` | Frontend | Contract address | [frontend/src/pages/ArenaGame.jsx L10](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L10-L10) |
| `VITE_AGENT_API_URL` | Frontend | Agent endpoint | [frontend/src/pages/ArenaGame.jsx L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L12-L12) |
| `NETWORK_TYPE` | Agent | Network selection | [agent/src/ArenaAgent.ts L41](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L41-L41) |
| `CONTRACT_ADDRESS` | Agent | Contract address | [agent/src/ArenaAgent.ts L45](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L45-L45) |

**Sources**: [frontend/src/pages/ArenaGame.jsx L10-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L10-L12)

 [agent/src/ArenaAgent.ts L41-L46](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L41-L46)

 [agent/.env.example L1-L15](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example#L1-L15)

### Node Health Considerations

The system does not implement explicit health checks but relies on:

1. **Timeout-based detection**: 5s frontend, 15s agent
2. **Sequential fallback**: Tries next node immediately on failure
3. **No blacklisting**: Failed nodes are re-attempted on next request
4. **Stateless design**: Each request cycle starts fresh from Node 1

### Monitoring Best Practices

For production deployments, consider:

* Monitor console warnings for frequent node failures
* Track success rates per node endpoint
* Add metrics for average response times
* Implement node health checks before request cycles
* Consider dynamic node pool updates based on health

**Sources**: [frontend/src/pages/ArenaGame.jsx L34-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L34-L50)

 [agent/src/ArenaAgent.ts L242-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L242-L266)

## Implementation Summary

The multi-node failover system provides:

| Feature | Frontend | Agent |
| --- | --- | --- |
| **Node Pool Size** | 3 nodes | 2 nodes |
| **Retry Mechanism** | `callReadOnlyWithRetry` | Direct loop iteration |
| **Timeout** | 5 seconds | 15 seconds |
| **Error Logging** | `console.warn` | `chalk.yellow` |
| **Fallback Strategy** | Sequential exhaustion | Sequential exhaustion |
| **Default Behavior** | Throw last error | Return `nonce = 0` |

This design ensures the GameArenaStacks platform remains operational even when individual RPC providers experience downtime, rate limiting, or network issues.

**Sources**: [frontend/src/pages/ArenaGame.jsx L14-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L14-L50)

 [agent/src/ArenaAgent.ts L242-L266](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L242-L266)

 [README.md L79-L83](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L79-L83)

---

# Post-Conditions-and-Asset-Protection

# Post-Conditions and Asset Protection

> **Relevant source files**
> * [PROJECT_SUMMARY.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

## Purpose and Scope

This page documents the Stacks post-conditions system and its implementation in GameArenaStacks for trustless asset protection during on-chain transactions. Post-conditions are cryptographic assertions that define **exactly** what asset transfers must occur before a transaction is accepted by the network, protecting users from unexpected losses.

For general Stacks blockchain integration patterns, see [Stacks Blockchain Integration](/HACK3R-CRYPTO/GameArenaStacks/6-stacks-blockchain-integration). For network reliability strategies, see [Multi-Node Failover and Reliability](/HACK3R-CRYPTO/GameArenaStacks/6.1-multi-node-failover-and-reliability).

---

## Overview: Post-Conditions as Safety Rails

Stacks post-conditions function as **on-chain circuit breakers** that abort transactions if the actual asset transfers diverge from user expectations. In GameArenaStacks, every wagering transaction includes explicit post-conditions that:

1. Define the **exact STX amount** the user will send
2. Specify the **recipient** (the `arena-platform-v2` contract)
3. Enforce **deny mode** to reject any unexpected transfers
4. Display in **wallet UI** for user verification before signing

This eliminates trust assumptions—users can verify their maximum exposure before authorizing any transaction.

**Sources**: [README.md L79-L82](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L79-L82)

 [PROJECT_SUMMARY.md L68-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L68-L70)

---

## Post-Condition Construction API

### Core Data Structures

GameArenaStacks uses the `@stacks/transactions` library's `Pc` (Post-Conditions) API to construct assertions. The following table maps the API components to their roles:

| API Component | Type | Purpose | Example Usage |
| --- | --- | --- | --- |
| `Pc.principal(address)` | Factory | Creates principal-based post-condition | `Pc.principal(userAddress)` |
| `.willSendEq(amount)` | Assertion | Asserts exact amount will be sent | `.willSendEq(1000000)` |
| `.ustx()` | Asset Type | Specifies microSTX as asset | `.ustx()` |
| `postConditionMode: 1` | Mode Flag | Enables Deny mode (strict validation) | `postConditionMode: 1` |

**Sources**: [frontend/src/pages/ArenaGame.jsx L309-L328](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L309-L328)

---

## Implementation: Match Proposal Post-Conditions

### Code Entity Mapping

```mermaid
flowchart TD

handleProposeMatch["handleProposeMatch()"]
postConditions["postConditions Array"]
openContractCall["openContractCall()"]
StacksConnect["@stacks/connect"]
WalletUI["Wallet UI Display"]
PcPrincipal["Pc.principal(userAddress)"]
willSendEq[".willSendEq(wagerAmount)"]
ustx[".ustx()"]
Blockchain["arena-platform-v2.clar"]

postConditions -.-> PcPrincipal
openContractCall -.-> StacksConnect
WalletUI -.-> Blockchain

subgraph subGraph2 ["Post-Condition Builder"]
    PcPrincipal
    willSendEq
    ustx
    PcPrincipal -.-> willSendEq
    willSendEq -.->|"User Verifies & Signs"| ustx
end

subgraph subGraph1 ["Stacks Connect API"]
    StacksConnect
    WalletUI
    StacksConnect -.-> WalletUI
end

subgraph subGraph0 ["Frontend Transaction Flow"]
    handleProposeMatch
    postConditions
    openContractCall
    handleProposeMatch -.-> postConditions
    postConditions -.-> openContractCall
end
```

**Diagram: Post-Condition Construction Pipeline**

The `handleProposeMatch` function constructs post-conditions before invoking `openContractCall`. The wallet UI displays these assertions, allowing users to verify the exact STX amount before authorizing.

**Sources**: [frontend/src/pages/ArenaGame.jsx L300-L348](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L348)

---

## Post-Condition Implementation Details

### Match Proposal Transaction

The primary post-condition implementation occurs in `handleProposeMatch`:

```javascript
// Construct post-condition: User will send exactly the wager amount
const postConditions = [
    Pc.principal(userAddress)
        .willSendEq(Math.floor(parseFloat(wager) * 1000000))
        .ustx()
];
```

**Source**: [frontend/src/pages/ArenaGame.jsx L309-L314](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L309-L314)

This creates a **principal-based post-condition** asserting:

* **Who**: `userAddress` (the connected wallet)
* **What**: Exactly `wager * 1,000,000` microSTX
* **Asset**: Native STX (`.ustx()`)

The post-condition is passed to `openContractCall` along with the **Deny mode** flag:

```javascript
await openContractCall({
    contractAddress: DEPLOYER_ADDRESS,
    contractName: 'arena-platform-v2',
    functionName: 'propose-match',
    functionArgs: [...],
    network,
    postConditions,           // Enforced assertions
    postConditionMode: 1,     // Deny mode (strict)
    onFinish: (data) => {...}
});
```

**Source**: [frontend/src/pages/ArenaGame.jsx L317-L339](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L317-L339)

---

## Post-Condition Modes

Stacks supports two post-condition modes:

| Mode | Value | Behavior | Use Case |
| --- | --- | --- | --- |
| **Allow Mode** | `0` | Allows additional asset transfers not covered by post-conditions | Legacy compatibility, multi-party transactions |
| **Deny Mode** | `1` | **Rejects** any asset transfers not explicitly declared in post-conditions | High-security applications, user asset protection |

GameArenaStacks exclusively uses **Deny Mode** (`postConditionMode: 1`) to ensure that **only** the declared wager amount can be transferred, with **no hidden fees or additional transfers**.

**Sources**: [frontend/src/pages/ArenaGame.jsx L328](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L328-L328)

---

## Transaction Lifecycle with Post-Condition Validation

```mermaid
sequenceDiagram
  participant p1 as User Browser
  participant p2 as ArenaGame.jsx
  participant p3 as Stacks Wallet<br/>(Leather/Xverse)
  participant p4 as Stacks Network
  participant p5 as arena-platform-v2

  p1->>p2: Click "INITIATE_CHALLENGE"
  p2->>p2: Calculate wager in microSTX
  p2->>p2: Build postConditions array<br/>Pc.principal(userAddress)
  note over p2,p3: Post-Condition Construction Phase
  p2->>p2: .willSendEq(wagerμSTX)<br/>.ustx()<br/>openContractCall({<br/>postConditions,
  p2->>p3: postConditionMode: 1<br/>})
  note over p3: User Verification Phase
  p3->>p1: Display post-conditions:<br/>"You will send exactly X STX"
  p1->>p3: Review & Authorize
  p3->>p3: Sign transaction
  note over p4,p5: On-Chain Validation Phase
  p3->>p4: Broadcast signed transaction<br/>Validate post-conditions:<br/>- Check sender balance
  p4->>p4: - Verify exact amount<br/>- Enforce Deny mode
  alt Post-Conditions Valid
    p4->>p5: Execute propose-match()
    p5->>p5: Create match struct
    p5->>p5: Transfer wager to escrow
    p5-->>p4: Success
    p4-->>p2: TX Confirmed
  else Post-Conditions Violated
    p4->>p4: Abort transaction
    p4-->>p2: TX Failed (abort_by_response)
    p2->>p1: Display error
  end
```

**Diagram: Complete Transaction Flow with Post-Condition Enforcement**

The diagram illustrates three critical phases:

1. **Construction**: Frontend builds post-conditions using `Pc.principal().willSendEq().ustx()`
2. **Verification**: Wallet displays assertions for user authorization
3. **Validation**: Network enforces post-conditions before contract execution

**Sources**: [frontend/src/pages/ArenaGame.jsx L300-L348](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L348)

 [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

---

## Asset Protection Guarantees

### Wager Protection Matrix

| Transaction Type | Post-Condition Assertion | Protected Against | Validation Point |
| --- | --- | --- | --- |
| **propose-match** | User sends exactly `wagerAmount` μSTX | Contract overcharging, hidden fees | Pre-execution (network) |
| **play-move** | No asset transfer required | N/A | N/A |
| **Prize Distribution** | Enforced by contract logic (98% winner, 2% platform) | Contract bugs, incorrect distribution | Contract execution |

The `propose-match` transaction is the **only user-initiated asset transfer** in the match lifecycle. All subsequent prize distributions are handled by the smart contract's internal logic and protected by Clarity's built-in safety features.

**Sources**: [frontend/src/pages/ArenaGame.jsx L309-L328](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L309-L328)

 [README.md L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L81-L81)

---

## Move Transactions: No Post-Conditions Required

The `handlePlayMove` function does **not** include post-conditions because it involves **no asset transfer**:

```javascript
await openContractCall({
    contractAddress: DEPLOYER_ADDRESS,
    contractName: 'arena-platform-v2',
    functionName: 'play-move',
    functionArgs: [
        Cl.uint(matchId),
        Cl.uint(move)
    ],
    network,
    // No postConditions array - no assets transferred
    onFinish: (data) => {...}
});
```

**Source**: [frontend/src/pages/ArenaGame.jsx L447-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L447-L482)

This demonstrates **selective post-condition usage**—only transactions that transfer user assets require explicit protection.

---

## Wallet UI Integration

Post-conditions are automatically displayed in the Stacks wallet UI during transaction authorization. The user sees:

```yaml
Transaction Details
-------------------
Contract: ST3273...AR0MA.arena-platform-v2
Function: propose-match

Post-Conditions:
✓ You will send exactly 0.1000000 STX

[Reject]  [Approve]
```

This **transparent UI** ensures users can:

1. Verify the exact amount before signing
2. Detect unexpected transfers
3. Reject suspicious transactions

The post-condition display is generated automatically by the wallet from the `postConditions` array provided by `openContractCall`.

**Sources**: [frontend/src/pages/ArenaGame.jsx L317-L339](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L317-L339)

 [PROJECT_SUMMARY.md L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L50-L50)

---

## Post-Condition Validation Errors

When a transaction violates post-conditions, the Stacks network returns an `abort_by_response` status. The frontend's transaction polling logic detects this:

```javascript
if (txData.tx_status === 'success' || txData.tx_status === 'abort_by_response') {
    if (txData.tx_status === 'success') {
        toast.success(`Transaction Confirmed!`, { id: pending.txId });
    } else {
        toast.error(`Transaction Failed: ${txData.tx_result?.repr || 'Aborted'}`);
    }
    // Cleanup pending transaction
    setPendingTxs(prev => { ... });
}
```

**Source**: [frontend/src/pages/ArenaGame.jsx L274-L289](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L274-L289)

Common post-condition violations include:

* Insufficient balance to cover the declared amount
* Contract attempting to transfer more than asserted
* Unexpected additional asset transfers in Deny mode

---

## Comparison: Agent Transactions vs User Transactions

| Actor | Transaction Type | Post-Conditions Used | Rationale |
| --- | --- | --- | --- |
| **User** | `propose-match` | **Yes** - Exact wager amount | User asset protection |
| **User** | `play-move` | **No** | No asset transfer |
| **Agent** | `accept-match` | **Optional** (implementation-dependent) | Agent's own wallet protection |
| **Agent** | `play-move` | **Optional** (implementation-dependent) | Agent's own wallet protection |

The agent's transaction construction in [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

 does not explicitly show post-condition usage, suggesting the agent trusts the contract logic or implements protection at a different layer. This is acceptable because:

1. The agent is an **autonomous actor**, not requiring UI-based verification
2. The contract's Clarity code already enforces correct prize distribution
3. The agent can validate on-chain state before transacting

**Sources**: [frontend/src/pages/ArenaGame.jsx L300-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L482)

 [agent/src/ArenaAgent.ts L1-L800](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L1-L800)

---

## Security Implications

### Trustless Asset Protection

Post-conditions transform GameArenaStacks from a **trust-based** to a **trustless** system:

```mermaid
flowchart TD

User2["User"]
PC["Post-Condition<br>willSendEq(wager)"]
Network["Stacks Network"]
Contract2["arena-platform-v2"]
Protection["✓ Asset Protection"]
User1["User"]
Contract1["Smart Contract"]
Risk1["⚠️ User Risk"]

subgraph subGraph1 ["With Post-Conditions (GameArenaStacks)"]
    User2
    PC
    Network
    Contract2
    Protection
    User2 -.->|"Cryptographic assertion"| PC
    PC -.->|"Enforced by network"| Network
    Network -.->|"Only if valid"| Contract2
    Network -.->|"Aborts if violated"| Protection
end

subgraph subGraph0 ["Without Post-Conditions"]
    User1
    Contract1
    Risk1
    User1 -.->|"Blind trust"| Contract1
    Contract1 -.->|"Could transfer any amount"| Risk1
end
```

**Diagram: Trust Model Comparison**

Post-conditions provide **cryptographic enforcement** at the network layer, independent of contract correctness. Even if `arena-platform-v2` contained a bug attempting to over-charge users, the transaction would be rejected by the network.

**Sources**: [README.md L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L81-L81)

 [PROJECT_SUMMARY.md L50-L51](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L50-L51)

---

## Summary Table: Post-Condition Implementation

| Component | API/Function | Location | Purpose |
| --- | --- | --- | --- |
| **Import** | `Pc` from `@stacks/transactions` | [frontend/src/pages/ArenaGame.jsx L3](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L3-L3) | Post-condition builder API |
| **Construction** | `Pc.principal().willSendEq().ustx()` | [frontend/src/pages/ArenaGame.jsx L310-L313](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L310-L313) | Build exact-amount assertion |
| **Application** | `postConditions` parameter | [frontend/src/pages/ArenaGame.jsx L327](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L327-L327) | Pass to `openContractCall` |
| **Mode** | `postConditionMode: 1` | [frontend/src/pages/ArenaGame.jsx L328](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L328-L328) | Enable Deny mode (strict) |
| **Validation** | Network consensus | N/A (on-chain) | Enforce before execution |
| **Error Handling** | `abort_by_response` detection | [frontend/src/pages/ArenaGame.jsx L274-L278](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L274-L278) | Handle validation failures |

**Sources**: [frontend/src/pages/ArenaGame.jsx L1-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L1-L482)

---

## Integration with x402 Payment Protocol

Post-conditions protect **user-to-contract** transfers, while the x402 protocol handles **user-to-agent** micro-payments. These operate on different layers:

1. **Post-Conditions**: Protect the wagering transaction (`propose-match`) where users send STX to the `arena-platform-v2` escrow
2. **x402 Payments**: Handle separate STX transfers to the agent's wallet for services (match acceptance, move execution)

The x402 payment flow in `handleChallengeAgent` uses `openSTXTransfer` without explicit post-conditions because the amount is pre-negotiated in the HTTP 402 response:

```javascript
await openSTXTransfer({
    recipient: paymentInfo.accepts[0].payTo,
    amount: paymentInfo.accepts[0].amount,    // Pre-negotiated amount
    memo: 'x402 Agent Fee',
    network,
    onFinish: (data) => {...}
});
```

**Source**: [frontend/src/pages/ArenaGame.jsx L371-L389](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L371-L389)

The Stacks wallet inherently protects `openSTXTransfer` by displaying the exact amount and recipient, providing implicit post-condition-like protection.

**Sources**: [frontend/src/pages/ArenaGame.jsx L350-L398](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L350-L398)

---

## Best Practices and Recommendations

### When to Use Post-Conditions

| Scenario | Recommendation | Rationale |
| --- | --- | --- |
| User sending assets to contract | **Always use** | Protects user funds |
| Contract-to-contract internal transfers | **Optional** | Clarity provides safety |
| Read-only function calls | **N/A** | No asset transfer |
| Agent-initiated transactions | **Optional** | Depends on trust model |

### Post-Condition Anti-Patterns

❌ **Avoid**:

* Setting post-conditions for transactions with no asset transfers
* Using Allow mode (`postConditionMode: 0`) without explicit justification
* Omitting post-conditions on user-initiated wager transactions

✓ **Prefer**:

* Deny mode (`postConditionMode: 1`) for all user asset transfers
* Exact amount assertions (`.willSendEq()`) over ranges
* Clear error messaging when post-conditions fail

**Sources**: [frontend/src/pages/ArenaGame.jsx L309-L328](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L309-L328)

---

## Conclusion

Post-conditions are the **foundational security mechanism** enabling trustless wagering in GameArenaStacks. By enforcing exact asset transfer amounts at the network layer, they eliminate the need to trust the smart contract, frontend, or agent logic. Every user transaction that moves STX includes explicit post-conditions, displayed in the wallet UI and validated on-chain before execution.

This architecture demonstrates **defense in depth**—even if multiple system components fail, post-conditions provide a final safety rail preventing unexpected asset losses.

**Sources**: [frontend/src/pages/ArenaGame.jsx L300-L348](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L348)

 [README.md L79-L82](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L79-L82)

 [PROJECT_SUMMARY.md L68-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md#L68-L70)

---

# Game-Types-and-Rules

# Game Types and Rules

> **Relevant source files**
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)
> * [frontend/index.html](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/index.html)
> * [frontend/src/components/DocsModal.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/DocsModal.jsx)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)

## Purpose and Scope

This document specifies the game types available in the GameArenaStacks platform, their rules, move encoding schemes, and winner determination logic. For information about the AI strategies that execute these games, see [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy). For details on how matches progress through their lifecycle, see [Match Lifecycle and State Management](/HACK3R-CRYPTO/GameArenaStacks/9-match-lifecycle-and-state-management). For the Fair Play mechanisms that prevent front-running, see [Fair Play Architecture](/HACK3R-CRYPTO/GameArenaStacks/8-fair-play-architecture).

---

## Game Type System Overview

The GameArenaStacks platform implements multiple game types within a unified wagering framework. Each game type has a unique numeric identifier, specific move encoding, and winner determination algorithm. The system is designed to be extensible, with one game type (Tic Tac Toe) currently marked for future implementation.

```mermaid
flowchart TD

GAME_TYPES["GAME_TYPES Array<br>[frontend/src/pages/ArenaGame.jsx:57-62]"]
GT0["id: 0<br>Rock Paper Scissors<br>icon: ✊"]
GT1["id: 1<br>Dice Roll<br>icon: 🎲"]
GT2["id: 2<br>Coin Flip<br>icon: 🪙"]
GT3["id: 3<br>Tic Tac Toe<br>icon: ❌<br>disabled: true"]
getMoveData["getMoveData(gameType, move)<br>[ArenaGame.jsx:64-78]"]
getMoveOptions["getMoveOptions(gameType)<br>[ArenaGame.jsx:80-92]"]
handlePlayMove["handlePlayMove(matchId, move)<br>[ArenaGame.jsx:447-482]"]
OpponentModel["OpponentModel.predict(gameType, player)<br>[agent/ArenaAgent.ts:85-101]"]
calculateWinner["calculateWinner(gameType, move1, move2)<br>[ArenaAgent.ts:305-327]"]
ArenaContract["arena-platform-v2.play-move<br>(match-id uint) (move uint)"]

GT0 -.-> getMoveData
GT1 -.-> getMoveData
GT2 -.-> getMoveData
handlePlayMove -.-> ArenaContract
ArenaContract -.-> OpponentModel

subgraph subGraph3 ["Smart Contract"]
    ArenaContract
end

subgraph subGraph2 ["Agent AI Logic"]
    OpponentModel
    calculateWinner
    OpponentModel -.-> calculateWinner
end

subgraph subGraph1 ["Frontend Move Handling"]
    getMoveData
    getMoveOptions
    handlePlayMove
    getMoveData -.-> handlePlayMove
    getMoveOptions -.-> handlePlayMove
end

subgraph subGraph0 ["Game Type Registry"]
    GAME_TYPES
    GT0
    GT1
    GT2
    GT3
end
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L57-L92](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L57-L92)

 [agent/src/ArenaAgent.ts L62-L102](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L62-L102)

 [agent/src/ArenaAgent.ts L305-L327](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L305-L327)

---

## Game Type 0: Rock-Paper-Scissors

### Rules

Rock-Paper-Scissors is a classic simultaneous-move game where:

* **Rock (0)** beats Scissors (2)
* **Paper (1)** beats Rock (0)
* **Scissors (2)** beats Paper (1)
* Identical moves result in a draw

### Move Encoding

| Move Name | Numeric Value | Icon | UI Label |
| --- | --- | --- | --- |
| ROCK | 0 | ✊ | ROCK |
| PAPER | 1 | ✋ | PAPER |
| SCISSORS | 2 | ✌️ | SCISSORS |

### Frontend Implementation

The move options are defined in `getMoveOptions()` for Rock-Paper-Scissors:

```
if (gameType === 0) return [
    { value: 0, label: 'ROCK', icon: '✊' },
    { value: 1, label: 'PAPER', icon: '✋' },
    { value: 2, label: 'SCISSORS', icon: '✌️' }
];
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L81-L85](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L81-L85)

 [frontend/src/pages/ArenaGame.jsx L66-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L66-L70)

### Winner Determination

The `calculateWinner()` function implements the classic RPS logic:

```
if (gameType === 0) { // Rock-Paper-Scissors
    if (move1 === move2) return null; // Draw
    // 0: Rock, 1: Paper, 2: Scissors
    if ((move1 === 0 && move2 === 2) || (move1 === 1 && move2 === 0) || (move1 === 2 && move2 === 1)) {
        return p1;
    }
    return p2;
}
```

**Draw Handling**: When both players make the same move, the function returns `null`, which is then resolved to favor the challenger (p1) in the resolution logic at [agent/src/ArenaAgent.ts L401-L407](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L401-L407)

**Sources**: [agent/src/ArenaAgent.ts L306-L313](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L306-L313)

### AI Strategy

The `OpponentModel` class implements a **counter-prediction strategy** for RPS:

```
if (gameType === 0) return (predictedMove + 1) % 3; // RPS: counter predicted move
```

This means the AI:

1. Uses a first-order Markov Chain to predict the opponent's next move based on their last move
2. Counters that prediction by playing `(predicted + 1) % 3`
3. If no pattern data exists, plays randomly

**Sources**: [agent/src/ArenaAgent.ts L98](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L98-L98)

---

## Game Type 1: Dice Roll

### Rules

Dice Roll is a pure chance game where:

* Each player rolls a die showing 1-6
* **Higher number wins**
* Identical rolls result in a draw (favoring challenger in resolution)

### Move Encoding

Dice values are stored as **zero-indexed** (0-5 internally), but displayed as 1-6 to users.

| Display Value | Internal Encoding | Icon |
| --- | --- | --- |
| 1 | 0 | 🎲 |
| 2 | 1 | 🎲 |
| 3 | 2 | 🎲 |
| 4 | 3 | 🎲 |
| 5 | 4 | 🎲 |
| 6 | 5 | 🎲 |

### Frontend Implementation

The frontend presents a single "ROLL_DICE_RNG" button that generates a random roll:

```javascript
<button
    onClick={() => {
        const roll = Math.floor(Math.random() * 6);
        handlePlayMove(m.id, roll);
    }}
    className="w-full bg-purple-900/40 hover:bg-purple-600 text-purple-200 hover:text-white text-[9px] font-black py-2 rounded-sm border border-purple-500/30 flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(147,51,234,0.15)] uppercase tracking-widest group-hover:shadow-[0_0_20px_rgba(147,51,234,0.4)]"
>
    <span className="text-lg animate-bounce">🎲</span> ROLL_DICE_RNG
</button>
```

The display conversion from internal (0-5) to user-facing (1-6) occurs in `getMoveData()`:

```
if (gameType === 1) { // Dice
    return { name: (parseInt(move) + 1).toString(), icon: '🎲' };
}
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L656-L664](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L656-L664)

 [frontend/src/pages/ArenaGame.jsx L71-L73](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L71-L73)

### Winner Determination

```
if (gameType === 1) { // Dice Roll: Higher Number Wins
    if (move1 === move2) return null; // Draw
    return move1 > move2 ? p1 : p2;
}
```

**Sources**: [agent/src/ArenaAgent.ts L315-L318](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L315-L318)

### AI Strategy

The AI employs a **biased strategy** favoring high rolls:

```
if (gameType === 1) return Math.random() > 0.3 ? 5 : Math.floor(Math.random() * 6); // Dice: favor 6
```

This results in:

* **70% chance** of rolling 6 (value 5 internally)
* **30% chance** of a uniform random roll (0-5)

This bias gives the AI a statistical advantage over purely random human rolls, though it remains detectable by pattern-aware players.

**Sources**: [agent/src/ArenaAgent.ts L99](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L99-L99)

---

## Game Type 2: Coin Flip

### Rules

Coin Flip operates as a **prediction game**:

* Player 1 (challenger) makes a prediction: Heads (0) or Tails (1)
* Player 2 (agent/opponent) provides the "coin flip" result
* **Challenger wins if their prediction matches the result**
* Otherwise, Player 2 wins

This design is asymmetric: the challenger predicts, and the opponent's "move" determines the outcome.

### Move Encoding

| Move Name | Numeric Value | Icon | Semantic Meaning |
| --- | --- | --- | --- |
| HEADS | 0 | 🪙 | Prediction: Heads / Result: Heads |
| TAILS | 1 | 🪙 | Prediction: Tails / Result: Tails |

### Frontend Implementation

```
if (gameType === 2) return [
    { value: 0, label: 'HEADS', icon: '🪙' },
    { value: 1, label: 'TAILS', icon: '🪙' }
];
```

Display logic:

```
if (gameType === 2) { // Coin
    return { name: parseInt(move) === 0 ? 'HEADS' : 'TAILS', icon: '🪙' };
}
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L87-L90](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L87-L90)

 [frontend/src/pages/ArenaGame.jsx L74-L76](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L74-L76)

### Winner Determination

```
if (gameType === 2) { // Coin Flip: Prediction Game
    // 0: Heads, 1: Tails
    // Challenger (p1) wins if their prediction (move1) matches the result (move2)
    return move1 === move2 ? p1 : p2;
}
```

**Sources**: [agent/src/ArenaAgent.ts L320-L324](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L320-L324)

### AI Strategy

The AI uses an **adaptive prediction strategy**:

```
return Math.random() > 0.5 ? predictedMove : 1 - predictedMove; // Coinflip: adaptive
```

This means:

* 50% chance: Play the predicted move (based on Markov analysis)
* 50% chance: Play the opposite of the predicted move

This strategy makes the AI harder to pattern-match than pure prediction or pure randomness.

**Sources**: [agent/src/ArenaAgent.ts L100](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L100-L100)

---

## Game Type 3: Tic Tac Toe (Future)

Tic Tac Toe is registered in the `GAME_TYPES` array but marked as `disabled: true`. It appears in the UI with a "COMING_SOON" overlay:

```html
{g.disabled && (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
        <span className="text-[8px] font-black uppercase text-white bg-purple-600 px-2 py-0.5 rounded-sm transform -rotate-12 shadow-lg">COMING_SOON</span>
    </div>
)}
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L522-L526](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L522-L526)

---

## Move Data Flow and State Transitions

The following diagram illustrates how move data flows from user input through contract storage to AI strategy computation:

```mermaid
sequenceDiagram
  participant p1 as User<br/>(Frontend)
  participant p2 as handlePlayMove()<br/>[ArenaGame.jsx:447]
  participant p3 as Stacks Connect<br/>openContractCall()
  participant p4 as arena-platform-v2<br/>play-move()
  participant p5 as monitorChain()<br/>[ArenaAgent.ts:330]
  participant p6 as OpponentModel<br/>[ArenaAgent.ts:63]
  participant p7 as Agent play-move<br/>Transaction

  p1->>p2: "Select move (e.g., ROCK=0)"
  p2->>p3: "openContractCall<br/>(matchId, move)"
  p3->>p4: "play-move(matchId, 0)"
  p4-->>p4: "Store in match-moves map"
  note over p5: "Polls every 20s"
  p5->>p4: "get-player-move(matchId, challenger)"
  p4-->>p5: "returns (some uint)"
  p5->>p6: "model.update(gameType, player, move)"
  p6-->>p6: "Update transition matrix"
  p5->>p6: "model.predict(gameType, player)"
  p6-->>p5: "returns counter-move"
  p5->>p7: "play-move(matchId, aiMove)"
  p7->>p4: "play-move(matchId, aiMove)"
  p4-->>p4: "Both moves recorded"
  p5->>p5: "calculateWinner(gameType, move1, move2)"
  p5->>p4: "resolve-match(matchId, winner)"
```

**Sources**: [frontend/src/pages/ArenaGame.jsx L447-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L447-L482)

 [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

 [agent/src/ArenaAgent.ts L85-L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L85-L101)

---

## Game-Specific AI Strategy Matrix

The table below summarizes the AI's strategic approach for each game type:

| Game Type | ID | AI Strategy | Implementation | Fairness Guarantee |
| --- | --- | --- | --- | --- |
| Rock-Paper-Scissors | 0 | **Counter-Prediction**: Markov Chain predicts next move, plays counter `(predicted + 1) % 3` | [ArenaAgent.ts L98](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaAgent.ts#L98-L98) | Agent waits for on-chain move commitment |
| Dice Roll | 1 | **Biased High Roll**: 70% chance of rolling 6, 30% random | [ArenaAgent.ts L99](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaAgent.ts#L99-L99) | Both rolls are predetermined (no manipulation) |
| Coin Flip | 2 | **Adaptive**: 50% plays prediction, 50% plays opposite | [ArenaAgent.ts L100](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/ArenaAgent.ts#L100-L100) | Challenger predicts first, agent reveals after |
| Tic Tac Toe | 3 | *(Not Implemented)* | N/A | N/A |

**Sources**: [agent/src/ArenaAgent.ts L85-L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L85-L101)

---

## Move Validation and Bounds Checking

The system performs implicit bounds checking through the `OpponentModel` class:

```javascript
const size = gameType === 0 ? 3 : gameType === 1 ? 6 : 2;
if (!this.transitions[gameType][player]) {
    this.transitions[gameType][player] = Array.from({ length: size }, () => Array(size).fill(0));
}
```

This ensures:

* **RPS (gameType 0)**: Moves must be 0-2
* **Dice (gameType 1)**: Moves must be 0-5
* **Coin Flip (gameType 2)**: Moves must be 0-1

Invalid moves are either rejected by the frontend UI (which only presents valid options) or by the smart contract's internal validation logic.

**Sources**: [agent/src/ArenaAgent.ts L70-L72](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L70-L72)

---

## Draw Resolution Policy

When `calculateWinner()` returns `null` (indicating a draw), the `monitorChain()` function implements a **challenger-favored resolution**:

```javascript
if (!winner) {
    console.log(chalk.yellow(`🤝 Match #${i}: It's a draw! (Resolving for AI by default to be safe, but should handle properly)`));
}

// For a tie, give it to the user (p1) to be friendly in hackathon demo
const finalWinner = winner || p1;
```

This means:

* **All draws favor the challenger (p1)**, typically the human player
* This provides a slight statistical edge to human players
* The policy is explicitly designed for demonstration purposes (see comment at line 406)

**Sources**: [agent/src/ArenaAgent.ts L401-L407](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L401-L407)

---

## Game Type Extension Pattern

To add a new game type to the system, developers must:

1. **Register in `GAME_TYPES` array**: Add entry with unique `id`, `label`, and `icon` [frontend/src/pages/ArenaGame.jsx L57-L62](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L57-L62)
2. **Implement `getMoveData()` case**: Define how moves map to names/icons [frontend/src/pages/ArenaGame.jsx L64-L78](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L64-L78)
3. **Implement `getMoveOptions()` case**: Specify available move options [frontend/src/pages/ArenaGame.jsx L80-L92](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L80-L92)
4. **Define AI strategy in `OpponentModel.predict()`**: Add game-specific logic [agent/src/ArenaAgent.ts L85-L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L85-L101)
5. **Implement winner logic in `calculateWinner()`**: Define winning conditions [agent/src/ArenaAgent.ts L305-L327](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L305-L327)
6. **Update smart contract**: Add any game-specific validation in the Clarity contract

**Sources**: [frontend/src/pages/ArenaGame.jsx L57-L92](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L57-L92)

 [agent/src/ArenaAgent.ts L85-L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L85-L101)

 [agent/src/ArenaAgent.ts L305-L327](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L305-L327)

---

# Fair-Play-Architecture

# Fair Play Architecture

> **Relevant source files**
> * [PROJECT_SUMMARY.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/PROJECT_SUMMARY.md)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

## Purpose and Scope

This document describes the Fair Play Architecture implemented in GameArenaStacks to ensure trustless, exploit-free gameplay between human players and autonomous AI agents. Fair Play refers to the system's guarantee that the AI agent cannot front-run or manipulate game outcomes by observing user moves before committing its own move on-chain.

This document focuses on the technical mechanisms that enforce fairness during match execution. For information about the x402 payment protocol that monetizes agent services, see [x402 Monetization Protocol](/HACK3R-CRYPTO/GameArenaStacks/5-x402-monetization-protocol). For details about the Markov Chain AI strategy that generates moves, see [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy). For the complete match lifecycle including proposal and resolution phases, see [Match Lifecycle and State Management](/HACK3R-CRYPTO/GameArenaStacks/9-match-lifecycle-and-state-management).

---

## Fair Play Guarantees

The GameArenaStacks platform enforces the following fairness guarantees:

| Guarantee | Implementation | Enforcement Point |
| --- | --- | --- |
| **No Front-Running** | Agent waits for on-chain move confirmation | `/play-move` endpoint, `monitorChain` function |
| **Move Immutability** | Moves are committed to blockchain before opponent observes | `arena-platform-v2` contract state |
| **Transparent Verification** | All move checks query public contract state | `get-player-move` read-only function |
| **Automated Fairness** | Fairness checks happen automatically on every AI move | `FAIRNESS_VIOLATION` error response |

The architecture ensures that even though the AI agent has superior computational resources, it cannot exploit information asymmetry to gain an unfair advantage over human players.

**Sources:** [agent/src/ArenaAgent.ts L193-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L193-L224)

 [agent/src/ArenaAgent.ts L435-L468](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L435-L468)

 [README.md L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L64-L64)

---

## Fair Play Verification Flow

The following diagram illustrates the complete verification flow that enforces fairness when the AI agent attempts to make a move:

```mermaid
sequenceDiagram
  participant p1 as User<br/>(Human Player)
  participant p2 as Frontend<br/>(React App)
  participant p3 as arena-platform-v2<br/>(Smart Contract)
  participant p4 as AI Agent<br/>(POST /play-move)
  participant p5 as OpponentModel<br/>(Markov AI)

  note over p1,p3: Phase 1: User Move Commitment
  p1->>p2: "Select Move"
  p2->>p3: "play-move(matchId, userMove)"
  p3->>p3: "Store in moves map"
  p3-->>p2: "Transaction confirmed"
  note over p3: "User move is now<br/>immutable on-chain"
  note over p2,p4: Phase 2: Agent Move Request
  p2->>p4: "POST /play-move<br/>{matchId}"
  note over p4: "No move parameter<br/>triggers AI logic"
  note over p3,p4: Phase 3: Fairness Verification
  p4->>p3: "get-match-details(matchId)"
  p3-->>p4: "challenger, opponent, game-type"
  p4->>p3: "get-player-move(matchId, challenger)"
  p3-->>p4: "userMove or none"
  alt Challenger has NOT played
    p4-->>p2: "403 FAIRNESS_VIOLATION<br/>AI only moves after human"
    note over p4: "Reject request<br/>to prevent front-running"
  else Challenger HAS played
    p4->>p4: "Fairness check passed"
  end
  note over p3,p4: Phase 4: AI Move Commitment
  p4->>p5: "update(gameType, challenger, userMove)"
  p4->>p5: "predict(gameType, challenger)"
  p5-->>p4: "aiMove"
  p4->>p3: "play-move(matchId, aiMove)"
  p3->>p3: "Store AI move"
  p3-->>p4: "Transaction confirmed"
  p4-->>p2: "200 OK {txId}"
```

**Key Observation:** The critical fairness boundary occurs between Phase 2 and Phase 3. The agent refuses to proceed to Phase 4 (AI move commitment) until Phase 1 (user move commitment) is verifiably complete on-chain.

**Sources:** [agent/src/ArenaAgent.ts L186-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L186-L301)

 [agent/src/ArenaAgent.ts L193-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L193-L224)

---

## Fairness Check Implementation

The fairness check is implemented in two locations within the agent codebase: the `/play-move` API endpoint and the `monitorChain` background process.

### Endpoint Fairness Check

When the frontend requests an AI move via `POST /play-move`, the agent performs the following verification sequence:

```mermaid
flowchart TD

Request["POST /play-move<br>{matchId}"]
X402["x402Middleware(500)<br>Payment verification"]
GetMatch["callReadOnlyFunction<br>get-match-details"]
ExtractData["Extract:<br>challenger, opponent, game-type"]
GetMove["callReadOnlyFunction<br>get-player-move(matchId, challenger)"]
CheckMove["Has challenger<br>played on-chain?"]
Reject["Return 403<br>FAIRNESS_VIOLATION"]
UpdateModel["model.update(gameType,<br>challenger, challengerMove)"]
Predict["move = model.predict<br>(gameType, challenger)"]
CommitMove["makeContractCall<br>play-move(matchId, move)"]
Success["Return 200 OK<br>{txId}"]

Request -.-> X402
X402 -.-> GetMatch
GetMatch -.-> ExtractData
ExtractData -.-> GetMove
GetMove -.->|"moveData.value exists"| CheckMove
CheckMove -.->|"moveData.value === null"| Reject
CheckMove -.-> UpdateModel
UpdateModel -.-> Predict
Predict -.-> CommitMove
CommitMove -.-> Success
```

The implementation at [agent/src/ArenaAgent.ts L193-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L193-L224)

 executes this check:

| Step | Function Call | Purpose |
| --- | --- | --- |
| 1 | `callReadOnlyFunction('get-match-details', [uintCV(matchId)])` | Retrieve match metadata including `challenger` address |
| 2 | `callReadOnlyFunction('get-player-move', [uintCV(matchId), principalCV(challenger)])` | Query challenger's move from contract state |
| 3 | Check `moveData.value === null` | Verify move exists on-chain |
| 4 | Return `403 FAIRNESS_VIOLATION` if null | Reject request with error message |
| 5 | Proceed to AI logic if move exists | Continue with Markov Chain prediction |

**Sources:** [agent/src/ArenaAgent.ts L193-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L193-L224)

 [agent/src/ArenaAgent.ts L206-L215](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L206-L215)

### Chain Monitor Fairness Check

The `monitorChain` function implements a similar check when automatically responding to matches. This background process runs every 20 seconds and scans for matches where the challenger has played but the agent has not:

```mermaid
flowchart TD

Monitor["monitorChain()<br>20-second interval"]
GetCount["callReadOnlyFunction<br>get-match-count"]
ScanMatches["Scan last 50 matches<br>for (i = count-1; i >= count-50; i--)"]
GetMatchDetails["callReadOnlyFunction<br>get-match-details(i)"]
CheckStatus["status === 1<br>STATUS-ACCEPTED?"]
GetP1Move["callReadOnlyFunction<br>get-player-move(i, p1)"]
GetP2Move["callReadOnlyFunction<br>get-player-move(i, p2)"]
CheckMoves["Evaluate<br>move states"]
BothPlayed["Both played:<br>Trigger resolve-match"]
P1OnlyPlayed["P1 played, P2=agent:<br>Fairness satisfied"]
UpdateAndPredict["model.update(gameType, p1, move1)<br>aiMove = model.predict(...)"]
CommitAIMove["makeContractCall<br>play-move(i, aiMove)"]
NextMatch["Continue to next match"]

Monitor -.-> GetCount
GetCount -.-> ScanMatches
ScanMatches -.-> GetMatchDetails
GetMatchDetails -.->|"Yes"| CheckStatus
CheckStatus -.->|"Both have moves"| NextMatch
CheckStatus -.-> GetP1Move
GetP1Move -.->|"P1 played, P2 empty, P2=agent"| GetP2Move
GetP2Move -.-> CheckMoves
CheckMoves -.->|"No"| BothPlayed
CheckMoves -.->|"Other states"| P1OnlyPlayed
CheckMoves -.-> NextMatch
P1OnlyPlayed -.-> UpdateAndPredict
UpdateAndPredict -.-> CommitAIMove
CommitAIMove -.-> NextMatch
```

The conditional logic at [agent/src/ArenaAgent.ts L435-L468](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L435-L468)

 ensures the agent only commits its move when:

1. The match status is `STATUS-ACCEPTED` (value `1`)
2. Player 1 (challenger) has a move recorded on-chain
3. Player 2 (agent) does not yet have a move recorded
4. Player 2's address matches `AGENT_ADDRESS`

**Sources:** [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

 [agent/src/ArenaAgent.ts L435-L468](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L435-L468)

---

## Contract State Queries for Fairness

Both fairness checks rely on read-only contract queries to verify on-chain state. The following table maps the queries to their contract functions:

| Contract Function | Parameters | Return Value | Purpose |
| --- | --- | --- | --- |
| `get-match-details` | `(uint matchId)` | `(optional {challenger: principal, opponent: (optional principal), status: uint, game-type: uint, ...})` | Retrieve match metadata |
| `get-player-move` | `(uint matchId) (principal player)` | `(optional uint)` | Check if player has committed a move |
| `get-match-count` | None | `uint` | Get total number of matches for scanning |

The agent uses `callReadOnlyFunction` from `@stacks/transactions` to query these functions without broadcasting transactions. This allows zero-cost verification of on-chain state before committing to any action.

**Example Query Structure:**

```javascript
const challengerMoveRes = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-player-move',
    functionArgs: [uintCV(matchId), principalCV(challenger)],
    network,
    senderAddress: AGENT_ADDRESS,
});
const moveData = cvToJSON(challengerMoveRes).value;
```

The returned `moveData.value` will be:

* `null` if the player has not committed a move (fairness violation)
* A numeric value (0-5 depending on game type) if the move exists on-chain

**Sources:** [agent/src/ArenaAgent.ts L207-L215](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L207-L215)

 [agent/src/ArenaAgent.ts L372-L387](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L372-L387)

---

## Error Handling and User Feedback

When the fairness check fails, the agent returns a structured error response that the frontend can display to the user:

```mermaid
flowchart TD

Agent["AI Agent"]
Response["HTTP 403 Response"]
ErrorBody["{ success: false,<br>error: 'FAIRNESS_VIOLATION',<br>message: 'AI only moves after<br>the human has committed<br>their move on-chain.' }"]
Frontend["Frontend UI"]
UserMessage["Display:<br>'Please wait for your<br>move to confirm on-chain'"]

Agent -.-> Response
Response -.-> ErrorBody
ErrorBody -.-> Frontend
Frontend -.-> UserMessage
```

The error code `FAIRNESS_VIOLATION` is a domain-specific identifier that allows the frontend to distinguish this error from other failure modes (e.g., network errors, contract errors, payment failures). The message provides clear guidance to users about why their request was rejected.

**Sources:** [agent/src/ArenaAgent.ts L219-L223](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L219-L223)

---

## Move Sequencing Guarantees

The Fair Play Architecture enforces strict move sequencing through the combination of contract state and agent logic:

### Sequencing Rules

| Player | Move Order | Enforcement Mechanism | Blockchain State Required |
| --- | --- | --- | --- |
| Challenger (Human) | Always moves first | Frontend allows move submission immediately after match acceptance | Match status = `STATUS-ACCEPTED` |
| Opponent (AI Agent) | Always moves second | Agent checks for challenger's on-chain move before proceeding | Challenger move exists in contract `moves` map |

### State Transitions

```css
#mermaid-phz2rfdtjxs{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;fill:#333;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-phz2rfdtjxs .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-phz2rfdtjxs .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-phz2rfdtjxs .error-icon{fill:#dddddd;}#mermaid-phz2rfdtjxs .error-text{fill:#222222;stroke:#222222;}#mermaid-phz2rfdtjxs .edge-thickness-normal{stroke-width:1px;}#mermaid-phz2rfdtjxs .edge-thickness-thick{stroke-width:3.5px;}#mermaid-phz2rfdtjxs .edge-pattern-solid{stroke-dasharray:0;}#mermaid-phz2rfdtjxs .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-phz2rfdtjxs .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-phz2rfdtjxs .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-phz2rfdtjxs .marker{fill:#999;stroke:#999;}#mermaid-phz2rfdtjxs .marker.cross{stroke:#999;}#mermaid-phz2rfdtjxs svg{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;}#mermaid-phz2rfdtjxs p{margin:0;}#mermaid-phz2rfdtjxs defs #statediagram-barbEnd{fill:#999;stroke:#999;}#mermaid-phz2rfdtjxs g.stateGroup text{fill:#dddddd;stroke:none;font-size:10px;}#mermaid-phz2rfdtjxs g.stateGroup text{fill:#333;stroke:none;font-size:10px;}#mermaid-phz2rfdtjxs g.stateGroup .state-title{font-weight:bolder;fill:#333;}#mermaid-phz2rfdtjxs g.stateGroup rect{fill:#ffffff;stroke:#dddddd;}#mermaid-phz2rfdtjxs g.stateGroup line{stroke:#999;stroke-width:1;}#mermaid-phz2rfdtjxs .transition{stroke:#999;stroke-width:1;fill:none;}#mermaid-phz2rfdtjxs .stateGroup .composit{fill:#f4f4f4;border-bottom:1px;}#mermaid-phz2rfdtjxs .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#mermaid-phz2rfdtjxs .state-note{stroke:#e6d280;fill:#fff5ad;}#mermaid-phz2rfdtjxs .state-note text{fill:#333;stroke:none;font-size:10px;}#mermaid-phz2rfdtjxs .stateLabel .box{stroke:none;stroke-width:0;fill:#ffffff;opacity:0.5;}#mermaid-phz2rfdtjxs .edgeLabel .label rect{fill:#ffffff;opacity:0.5;}#mermaid-phz2rfdtjxs .edgeLabel{background-color:#ffffff;text-align:center;}#mermaid-phz2rfdtjxs .edgeLabel p{background-color:#ffffff;}#mermaid-phz2rfdtjxs .edgeLabel rect{opacity:0.5;background-color:#ffffff;fill:#ffffff;}#mermaid-phz2rfdtjxs .edgeLabel .label text{fill:#333;}#mermaid-phz2rfdtjxs .label div .edgeLabel{color:#333;}#mermaid-phz2rfdtjxs .stateLabel text{fill:#333;font-size:10px;font-weight:bold;}#mermaid-phz2rfdtjxs .node circle.state-start{fill:#999;stroke:#999;}#mermaid-phz2rfdtjxs .node .fork-join{fill:#999;stroke:#999;}#mermaid-phz2rfdtjxs .node circle.state-end{fill:#dddddd;stroke:#f4f4f4;stroke-width:1.5;}#mermaid-phz2rfdtjxs .end-state-inner{fill:#f4f4f4;stroke-width:1.5;}#mermaid-phz2rfdtjxs .node rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-phz2rfdtjxs .node polygon{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-phz2rfdtjxs #statediagram-barbEnd{fill:#999;}#mermaid-phz2rfdtjxs .statediagram-cluster rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-phz2rfdtjxs .cluster-label,#mermaid-phz2rfdtjxs .nodeLabel{color:#333;}#mermaid-phz2rfdtjxs .statediagram-cluster rect.outer{rx:5px;ry:5px;}#mermaid-phz2rfdtjxs .statediagram-state .divider{stroke:#dddddd;}#mermaid-phz2rfdtjxs .statediagram-state .title-state{rx:5px;ry:5px;}#mermaid-phz2rfdtjxs .statediagram-cluster.statediagram-cluster .inner{fill:#f4f4f4;}#mermaid-phz2rfdtjxs .statediagram-cluster.statediagram-cluster-alt .inner{fill:#f8f8f8;}#mermaid-phz2rfdtjxs .statediagram-cluster .inner{rx:0;ry:0;}#mermaid-phz2rfdtjxs .statediagram-state rect.basic{rx:5px;ry:5px;}#mermaid-phz2rfdtjxs .statediagram-state rect.divider{stroke-dasharray:10,10;fill:#f8f8f8;}#mermaid-phz2rfdtjxs .note-edge{stroke-dasharray:5;}#mermaid-phz2rfdtjxs .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-phz2rfdtjxs .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-phz2rfdtjxs .statediagram-note text{fill:#333;}#mermaid-phz2rfdtjxs .statediagram-note .nodeLabel{color:#333;}#mermaid-phz2rfdtjxs .statediagram .edgeLabel{color:red;}#mermaid-phz2rfdtjxs #dependencyStart,#mermaid-phz2rfdtjxs #dependencyEnd{fill:#999;stroke:#999;stroke-width:1;}#mermaid-phz2rfdtjxs .statediagramTitleText{text-anchor:middle;font-size:18px;fill:#333;}#mermaid-phz2rfdtjxs :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}"accept-match() confirmed""Challenger calls play-move()""Transaction confirmed""Agent detects or receives request""Query get-player-move(challenger)""Move = null""Move exists""Retry after confirmation""AI generates move""Agent's play-move() confirmed""Both moves immutable""Winner determined"MatchAcceptedChallengerCommittingChallengerMoveOnChainAgentCheckingFairnessCheckAgentRejectedAgentPredictingAgentCommittingBothMovesOnChainResolvingCritical fairness boundary:Agent cannot proceed withoutchallenger's on-chain commitment
```

The state machine demonstrates that there is no code path allowing the agent to reach `AgentCommitting` without first passing through `ChallengerMoveOnChain` and `FairnessCheck`. This architectural constraint is enforced at the application layer (agent code) rather than the contract layer, but it is verifiable by anyone through the agent's open-source implementation.

**Sources:** [agent/src/ArenaAgent.ts L193-L301](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L193-L301)

 [agent/src/ArenaAgent.ts L435-L468](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L435-L468)

---

## Security Properties

The Fair Play Architecture provides the following cryptographic and architectural security properties:

### Information Asymmetry Prevention

| Attack Vector | Mitigation | Implementation |
| --- | --- | --- |
| **Front-Running** | Agent cannot observe user move before commitment | User move must exist on blockchain before agent queries |
| **Move Prediction** | AI prediction occurs after user commitment | `model.predict()` only called after fairness check passes |
| **Transaction Ordering** | Blockchain state is source of truth | Agent queries immutable contract state, not pending transactions |
| **Time-Based Attacks** | Agent waits for block confirmation | No mempool monitoring; only confirmed blocks are queried |

### Verification Properties

Any observer can verify fair play by:

1. Monitoring the blockchain transaction history for a match
2. Confirming the challenger's `play-move` transaction has a lower block height than the agent's
3. Observing that the agent's transaction timestamp is after the challenger's transaction is confirmed

The agent's source code at [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)

 provides full transparency into the fairness implementation, allowing third-party audits.

**Sources:** [agent/src/ArenaAgent.ts L193-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L193-L224)

 [README.md L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L64-L64)

---

## Integration with Markov AI

The Fair Play Architecture directly integrates with the Markov Chain AI strategy. The sequencing ensures that:

1. **Learning Occurs After Commitment:** The `model.update()` call at [agent/src/ArenaAgent.ts L228](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L228-L228)  only occurs after the fairness check confirms the user's move is on-chain.
2. **Prediction Cannot Leak:** The `model.predict()` call at [agent/src/ArenaAgent.ts L231](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L231-L231)  generates the counter-strategy only after the user's move is immutable.
3. **No Information Advantage:** Even though the AI has learned patterns from previous matches, it cannot exploit knowledge of the current user move until that move is committed to the blockchain.

This separation ensures that the Markov Chain's strategic advantage comes from pattern recognition across multiple matches, not from information asymmetry within a single match.

**Sources:** [agent/src/ArenaAgent.ts L226-L232](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L226-L232)

 [agent/src/ArenaAgent.ts L440-L442](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L440-L442)

---

## Monitoring and Observability

The agent logs fairness check events for monitoring and debugging:

```javascript
console.log(chalk.yellow(`⚠️ Fairness Check Failed: Challenger ${challenger} has not played for match #${matchId} yet.`));
```

These logs allow operators to:

* Verify the agent is correctly rejecting premature move requests
* Debug timing issues between transaction confirmation and API requests
* Monitor the rate of fairness check failures as an indicator of network latency

The `chalk` color-coded output distinguishes fairness violations (yellow) from successful operations (green) and critical errors (red).

**Sources:** [agent/src/ArenaAgent.ts L218](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L218-L218)

---

## Comparison with Alternative Architectures

Alternative approaches to ensuring fairness, and why they were not adopted:

| Approach | Trade-offs | Why Not Used |
| --- | --- | --- |
| **Commit-Reveal Scheme** | Cryptographic guarantee, but requires two-phase user interaction | Increases user friction; requires hashing logic in frontend |
| **Contract-Enforced Sequencing** | Strongest guarantee, but complex contract logic | Would increase gas costs and contract complexity |
| **Trusted Execution Environment (TEE)** | Hardware-based guarantee, but requires specialized infrastructure | Not supported on Stacks; introduces centralization |
| **Application-Layer Verification** | Simple to implement, transparent through open source | **Chosen approach** - balances security and UX |

The current architecture was selected because it provides sufficient security guarantees for the hackathon scope while maintaining simplicity and transparency. Future iterations could implement commit-reveal for additional cryptographic guarantees.

**Sources:** [agent/src/ArenaAgent.ts L193-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L193-L224)

 [README.md L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L64-L64)

---

## Summary

The Fair Play Architecture in GameArenaStacks ensures trustless gameplay through:

1. **On-Chain Move Verification:** Agent queries blockchain state to confirm user moves before responding
2. **Fairness-Violation Rejection:** Agent returns HTTP 403 errors when users attempt to trigger AI moves prematurely
3. **Automated Monitoring:** Background `monitorChain` process enforces fairness for autonomous agent responses
4. **Transparent Implementation:** Open-source agent code allows third-party verification of fairness logic
5. **Sequencing Guarantees:** Move ordering is enforced through state machine constraints in agent code

This architecture demonstrates how autonomous AI agents can participate in competitive gaming without requiring trusted intermediaries or complex cryptographic protocols, relying instead on blockchain immutability and transparent application logic.

**Sources:** [agent/src/ArenaAgent.ts L54-L60](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L54-L60)

 [agent/src/ArenaAgent.ts L193-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L193-L224)

 [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

 [README.md L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md#L64-L64)

---

# Match-Lifecycle-and-State-Management

# Match Lifecycle and State Management

> **Relevant source files**
> * [.gitignore](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/.gitignore)
> * [README.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/README.md)
> * [agent/.env.example](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/.env.example)
> * [agent/src/ArenaAgent.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts)
> * [frontend/src/components/Navigation.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/components/Navigation.jsx)
> * [frontend/src/pages/ArenaGame.jsx](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx)
> * [temp_snippet.txt](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/temp_snippet.txt)

## Purpose and Scope

This document describes the complete lifecycle of a match in GameArenaStacks, from initial proposal through final resolution, and the state management patterns used to track and synchronize match state across the three-tier architecture. It covers:

* Match state enumeration and transitions on-chain
* Frontend state management using React hooks and the BitSubs polling pattern
* Agent chain monitoring and auto-resolution logic
* State synchronization mechanisms between frontend, agent, and blockchain

For information about the smart contract implementation of match logic, see [arena-platform-v2 Contract](/HACK3R-CRYPTO/GameArenaStacks/4.1-arena-platform-v2-contract). For details on x402 payment flows that occur during the lifecycle, see [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware). For agent AI strategy execution, see [Markov Chain AI Strategy](/HACK3R-CRYPTO/GameArenaStacks/3.3-markov-chain-ai-strategy).

---

## Match State Model

### On-Chain State Enumeration

Matches in the `arena-platform-v2` contract progress through three discrete states represented as unsigned integers:

| State Value | State Name | Description |
| --- | --- | --- |
| `0` | `STATUS-PENDING` | Match proposed but not yet accepted by opponent |
| `1` | `STATUS-ACCEPTED` | Both players confirmed, waiting for moves |
| `2` | `STATUS-COMPLETED` | Both moves played, winner determined and prize distributed |

The match state is stored in the `matches` map as part of the match tuple structure. State transitions are enforced by the smart contract's function guards to ensure only valid state progressions occur.

**Sources:** [contracts/arena-platform-v2.clar](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/contracts/arena-platform-v2.clar)

 [frontend/src/pages/ArenaGame.jsx L183-L184](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L183-L184)

### State Transition Diagram

```css
#mermaid-wrl4p8dunp{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;fill:#333;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-wrl4p8dunp .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-wrl4p8dunp .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-wrl4p8dunp .error-icon{fill:#dddddd;}#mermaid-wrl4p8dunp .error-text{fill:#222222;stroke:#222222;}#mermaid-wrl4p8dunp .edge-thickness-normal{stroke-width:1px;}#mermaid-wrl4p8dunp .edge-thickness-thick{stroke-width:3.5px;}#mermaid-wrl4p8dunp .edge-pattern-solid{stroke-dasharray:0;}#mermaid-wrl4p8dunp .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-wrl4p8dunp .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-wrl4p8dunp .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-wrl4p8dunp .marker{fill:#999;stroke:#999;}#mermaid-wrl4p8dunp .marker.cross{stroke:#999;}#mermaid-wrl4p8dunp svg{font-family:ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica;font-size:16px;}#mermaid-wrl4p8dunp p{margin:0;}#mermaid-wrl4p8dunp defs #statediagram-barbEnd{fill:#999;stroke:#999;}#mermaid-wrl4p8dunp g.stateGroup text{fill:#dddddd;stroke:none;font-size:10px;}#mermaid-wrl4p8dunp g.stateGroup text{fill:#333;stroke:none;font-size:10px;}#mermaid-wrl4p8dunp g.stateGroup .state-title{font-weight:bolder;fill:#333;}#mermaid-wrl4p8dunp g.stateGroup rect{fill:#ffffff;stroke:#dddddd;}#mermaid-wrl4p8dunp g.stateGroup line{stroke:#999;stroke-width:1;}#mermaid-wrl4p8dunp .transition{stroke:#999;stroke-width:1;fill:none;}#mermaid-wrl4p8dunp .stateGroup .composit{fill:#f4f4f4;border-bottom:1px;}#mermaid-wrl4p8dunp .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#mermaid-wrl4p8dunp .state-note{stroke:#e6d280;fill:#fff5ad;}#mermaid-wrl4p8dunp .state-note text{fill:#333;stroke:none;font-size:10px;}#mermaid-wrl4p8dunp .stateLabel .box{stroke:none;stroke-width:0;fill:#ffffff;opacity:0.5;}#mermaid-wrl4p8dunp .edgeLabel .label rect{fill:#ffffff;opacity:0.5;}#mermaid-wrl4p8dunp .edgeLabel{background-color:#ffffff;text-align:center;}#mermaid-wrl4p8dunp .edgeLabel p{background-color:#ffffff;}#mermaid-wrl4p8dunp .edgeLabel rect{opacity:0.5;background-color:#ffffff;fill:#ffffff;}#mermaid-wrl4p8dunp .edgeLabel .label text{fill:#333;}#mermaid-wrl4p8dunp .label div .edgeLabel{color:#333;}#mermaid-wrl4p8dunp .stateLabel text{fill:#333;font-size:10px;font-weight:bold;}#mermaid-wrl4p8dunp .node circle.state-start{fill:#999;stroke:#999;}#mermaid-wrl4p8dunp .node .fork-join{fill:#999;stroke:#999;}#mermaid-wrl4p8dunp .node circle.state-end{fill:#dddddd;stroke:#f4f4f4;stroke-width:1.5;}#mermaid-wrl4p8dunp .end-state-inner{fill:#f4f4f4;stroke-width:1.5;}#mermaid-wrl4p8dunp .node rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-wrl4p8dunp .node polygon{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-wrl4p8dunp #statediagram-barbEnd{fill:#999;}#mermaid-wrl4p8dunp .statediagram-cluster rect{fill:#ffffff;stroke:#dddddd;stroke-width:1px;}#mermaid-wrl4p8dunp .cluster-label,#mermaid-wrl4p8dunp .nodeLabel{color:#333;}#mermaid-wrl4p8dunp .statediagram-cluster rect.outer{rx:5px;ry:5px;}#mermaid-wrl4p8dunp .statediagram-state .divider{stroke:#dddddd;}#mermaid-wrl4p8dunp .statediagram-state .title-state{rx:5px;ry:5px;}#mermaid-wrl4p8dunp .statediagram-cluster.statediagram-cluster .inner{fill:#f4f4f4;}#mermaid-wrl4p8dunp .statediagram-cluster.statediagram-cluster-alt .inner{fill:#f8f8f8;}#mermaid-wrl4p8dunp .statediagram-cluster .inner{rx:0;ry:0;}#mermaid-wrl4p8dunp .statediagram-state rect.basic{rx:5px;ry:5px;}#mermaid-wrl4p8dunp .statediagram-state rect.divider{stroke-dasharray:10,10;fill:#f8f8f8;}#mermaid-wrl4p8dunp .note-edge{stroke-dasharray:5;}#mermaid-wrl4p8dunp .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-wrl4p8dunp .statediagram-note rect{fill:#fff5ad;stroke:#e6d280;stroke-width:1px;rx:0;ry:0;}#mermaid-wrl4p8dunp .statediagram-note text{fill:#333;}#mermaid-wrl4p8dunp .statediagram-note .nodeLabel{color:#333;}#mermaid-wrl4p8dunp .statediagram .edgeLabel{color:red;}#mermaid-wrl4p8dunp #dependencyStart,#mermaid-wrl4p8dunp #dependencyEnd{fill:#999;stroke:#999;stroke-width:1;}#mermaid-wrl4p8dunp .statediagramTitleText{text-anchor:middle;font-size:18px;fill:#333;}#mermaid-wrl4p8dunp :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}"propose-match()""accept-match()""play-move(opponent)""resolve-match()"STATUS_PENDINGSTATUS_ACCEPTEDSTATUS_COMPLETEDContract State: 0Frontend: "Pending"Only challenger has wager escrowedContract State: 1Frontend: "Active"Both players confirmedAwaiting movesContract State: 2Frontend: "Completed"Winner receives 98% of potPlatform takes 2% fee
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L183-L184](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L183-L184)

 [agent/src/ArenaAgent.ts L364-L367](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L364-L367)

---

## Frontend State Management Architecture

### React State Hooks

The `ArenaGame` component manages multiple pieces of local state to track the application's view of on-chain data:

| State Variable | Type | Purpose |
| --- | --- | --- |
| `matches` | `Array<Match>` | Cached array of match details fetched from contract |
| `matchCount` | `number` | Total number of matches created (from `get-match-count`) |
| `pendingTxs` | `Object<matchId, {type, txId}>` | Transaction IDs awaiting confirmation |
| `loading` | `boolean` | UI loading state for user actions |
| `stxBalance` | `string` | User's STX balance in human-readable format |

The `matches` array contains enriched match objects with both on-chain data and locally computed properties:

```yaml
{
    id: number,              // Match ID
    challenger: string,      // Principal address
    opponent: string,        // Principal address
    gameType: number,        // 0=RPS, 1=Dice, 2=Coin
    wager: number,          // Amount in microSTX
    status: string,         // "Pending" | "Active" | "Completed"
    winner?: string,        // Winner principal (if completed)
    challengerMove?: number, // Challenger's move (if played)
    opponentMove?: number   // Opponent's move (if played)
}
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L94-L104](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L94-L104)

 [frontend/src/pages/ArenaGame.jsx L172-L232](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L172-L232)

### Pending Transaction Tracking

The `pendingTxs` state object tracks transactions that have been broadcast but not yet confirmed:

```javascript
// Structure: { [matchId]: { type: 'proposal'|'user'|'agent', txId: string } }
setPendingTxs(prev => ({ 
    ...prev, 
    [matchId]: { type: 'user', txId: data.txId } 
}));
```

This enables the UI to display loading states and triggers targeted polling for specific transactions. When a transaction confirms, the entry is removed and the match data is refreshed.

**Sources:** [frontend/src/pages/ArenaGame.jsx L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L101-L101)

 [frontend/src/pages/ArenaGame.jsx L332](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L332-L332)

 [frontend/src/pages/ArenaGame.jsx L465](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L465-L465)

### State Fetching and Caching Flow

```mermaid
flowchart TD

fetchMatches["fetchMatches()"]
getMatchCount["callReadOnlyFunction()<br>get-match-count"]
matchCount["matchCount state"]
parallelQueries["Promise.all()<br>get-match-details<br>for last 30 matches"]
moveQueries["Promise.all()<br>get-player-move<br>for challenger & opponent"]
parsedMatches["parsedMatches array"]
setMatches["setMatches()"]
matchesState["matches state"]
note1["Queries last 30 matches<br>for global feed"]
note2["Fetches moves only<br>for matches with<br>both players"]

fetchMatches -.-> getMatchCount
getMatchCount -.-> matchCount
matchCount -.-> parallelQueries
parallelQueries -.-> moveQueries
moveQueries -.-> parsedMatches
parsedMatches -.-> setMatches
setMatches -.-> matchesState
parallelQueries -.-> note1
moveQueries -.-> note2
```

The `fetchMatches` function implements a multi-stage data fetching pipeline:

1. Query `get-match-count` to determine total matches [frontend/src/pages/ArenaGame.jsx L137-L148](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L137-L148)
2. Create parallel queries for last 30 match details [frontend/src/pages/ArenaGame.jsx L150-L169](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L150-L169)
3. Create parallel queries for player moves [frontend/src/pages/ArenaGame.jsx L175-L229](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L175-L229)
4. Update `matches` state with enriched data [frontend/src/pages/ArenaGame.jsx L231-L232](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L231-L232)

**Sources:** [frontend/src/pages/ArenaGame.jsx L132-L240](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L132-L240)

---

## BitSubs Transaction Polling Pattern

### Targeted Polling Implementation

The frontend implements a "BitSubs pattern" (named after Bitcoin subscription patterns) for efficient transaction monitoring. Instead of polling all matches continuously, it selectively polls only transactions in the `pendingTxs` state:

```mermaid
flowchart TD

pendingTxs["pendingTxs state"]
useEffect["useEffect dependency:<br>pendingTxs"]
checkPending["Check if pendingIds.length > 0"]
startInterval["setInterval(5000)"]
loopTxs["for each matchId in pendingTxs"]
fetchTx["fetchWithTimeout()<br>Hiro TX API"]
checkStatus["Check tx_status"]
success["tx_status === 'success'"]
aborted["tx_status === 'abort_by_response'"]
pending["still pending"]
cleanup["Remove from pendingTxs<br>fetchMatches()<br>fetchBalance()"]
toast["toast.success() or<br>toast.error()"]
continue["Continue polling"]
return["Return (no polling)"]

pendingTxs -.->|"No"| useEffect
useEffect -.->|"Yes"| checkPending
checkPending -.-> startInterval
checkPending -.-> return
startInterval -.-> loopTxs
loopTxs -.-> fetchTx
fetchTx -.-> checkStatus
checkStatus -.-> success
checkStatus -.-> aborted
checkStatus -.-> pending
success -.-> toast
aborted -.-> toast
toast -.-> cleanup
pending -.-> continue
continue -.-> loopTxs
cleanup -.-> loopTxs
```

The polling mechanism operates at 5-second intervals specifically for pending transactions, while general state polling occurs at 60-second intervals:

```javascript
useEffect(() => {
    const pendingIds = Object.keys(pendingTxs);
    if (pendingIds.length === 0) return;

    console.log('📡 Starting Targeted Polling for:', pendingIds);

    const txPollInterval = setInterval(async () => {
        for (const matchId of pendingIds) {
            const pending = pendingTxs[matchId];
            // ... fetch and check transaction status
        }
    }, 5000); // 5s for pending transactions

    return () => clearInterval(txPollInterval);
}, [pendingTxs, fetchMatches, fetchBalance]);
```

**Sources:** [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

### Multi-Interval Polling Strategy

The frontend implements two distinct polling intervals with different purposes:

| Interval | Duration | Purpose | Functions Called |
| --- | --- | --- | --- |
| General State | 60s | Background sync of all matches and balance | `fetchBalance()`, `fetchMatches()` |
| Transaction Tracking | 5s | Targeted polling for pending transactions | Hiro TX API queries, cleanup on confirmation |

**Sources:** [frontend/src/pages/ArenaGame.jsx L242-L254](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L242-L254)

 [frontend/src/pages/ArenaGame.jsx L256-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L256-L298)

---

## Agent Chain Monitoring

### monitorChain Background Process

The agent implements a `monitorChain` function that runs on a 20-second interval to detect and respond to on-chain state changes:

```mermaid
flowchart TD

monitorChain["monitorChain()"]
setInterval["setInterval(20000)"]
getMatchCount["callReadOnlyFunction()<br>get-match-count"]
scanMatches["Scan last 50 matches"]
getMatchDetails["callReadOnlyFunction()<br>get-match-details(i)"]
checkStatus["Check status"]
statusPending["status === 0<br>STATUS-PENDING"]
statusActive["status === 1<br>STATUS-ACCEPTED"]
statusCompleted["status === 2<br>COMPLETED"]
skip["Skip (not agent's concern)"]
fetchMoves["callReadOnlyFunction()<br>get-player-move<br>for both players"]
bothPlayed["Both moves exist?"]
challengerPlayed["Only challenger played?<br>Is agent the opponent?"]
calculateWinner["calculateWinner()"]
resolveMatch["makeContractCall()<br>resolve-match()"]
updateModel["model.update()"]
predictMove["model.predict()"]
playMove["makeContractCall()<br>play-move()"]
continue["Continue scan"]

monitorChain -.-> setInterval
setInterval -.-> getMatchCount
getMatchCount -.-> scanMatches
scanMatches -.-> getMatchDetails
getMatchDetails -.-> checkStatus
checkStatus -.-> statusPending
checkStatus -.-> statusActive
checkStatus -.-> statusCompleted
statusPending -.-> skip
statusCompleted -.->|"Yes"| skip
statusActive -.->|"No"| fetchMoves
fetchMoves -.->|"Yes"| bothPlayed
fetchMoves -.->|"No"| challengerPlayed
bothPlayed -.-> calculateWinner
calculateWinner -.-> resolveMatch
challengerPlayed -.-> updateModel
updateModel -.-> predictMove
predictMove -.-> playMove
bothPlayed -.-> continue
challengerPlayed -.-> continue
```

The `monitorChain` function scans the last 50 matches (not just recent ones) to handle potential latency and ensure no matches are missed during network issues.

**Sources:** [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

### Agent State Detection Logic

The agent must determine its role and appropriate action for each active match:

```javascript
// Check if ACTIVE (status === 1)
if (status === 1) {
    const p1 = matchData.challenger.value;
    const p2 = matchData.opponent.value.value;

    // Fetch both moves
    const m1Res = await callReadOnlyFunction({...}); // challenger
    const m2Res = await callReadOnlyFunction({...}); // opponent

    if (move1Data && move1Data.value && move2Data && move2Data.value) {
        // BOTH PLAYED -> Resolve match
        const winner = calculateWinner(gameType, move1, move2, p1, p2);
        // Call resolve-match()
    } else if (move1Data && move1Data.value && p2 === AGENT_ADDRESS) {
        // CHALLENGER PLAYED, AGENT HASN'T -> Play AI move
        const aiMove = model.predict(gameType, p1);
        // Call play-move()
    }
}
```

**Sources:** [agent/src/ArenaAgent.ts L367-L469](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L367-L469)

### Fairness Enforcement

The agent enforces the "Fair Play Architecture" by verifying the challenger's move exists on-chain before computing its own move:

```javascript
// In /play-move endpoint
const challengerMoveRes = await callReadOnlyFunction({
    functionName: 'get-player-move',
    functionArgs: [uintCV(matchId), principalCV(challenger)]
});

if (!moveData || moveData.value === null) {
    return res.status(403).json({
        success: false,
        error: 'FAIRNESS_VIOLATION',
        message: 'AI only moves after the human has committed their move on-chain.'
    });
}
```

This prevents the agent from front-running by computing its move before the user has committed theirs to the blockchain.

**Sources:** [agent/src/ArenaAgent.ts L194-L224](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L194-L224)

---

## State Synchronization Mechanisms

### Multi-Node Failover for State Queries

Both frontend and agent implement node rotation to ensure state can be fetched even if a primary RPC provider is down:

```mermaid
flowchart TD

callReadOnlyWithRetry["callReadOnlyWithRetry(options)"]
nodes["STACKS_NODES array:<br>- api.testnet.hiro.so<br>- stacks-node-api.testnet.stacks.co<br>- stacks-node-api.testnet.hiro.so"]
loop["for each nodeUrl"]
createNetwork["new StacksTestnet({url: nodeUrl})"]
callReadOnly["callReadOnlyFunction({<br>  ...options,<br>  network: networkWithNode<br>})"]
success["Return result"]
error["Catch error"]
logWarning["console.warn()<br>'Node failed, trying next...'"]
nextNode["Try next node"]
throwError["Throw last error<br>(all nodes failed)"]

callReadOnlyWithRetry -.-> nodes
nodes -.->|"No more nodes"| loop
loop -.-> createNetwork
createNetwork -.->|"Success"| callReadOnly
callReadOnly -.->|"Error"| success
callReadOnly -.-> error
error -.-> logWarning
logWarning -.-> nextNode
nextNode -.-> loop
loop -.-> throwError
```

The `callReadOnlyWithRetry` function attempts each node in sequence until one succeeds, logging warnings but continuing to try alternative nodes.

**Sources:** [frontend/src/pages/ArenaGame.jsx L34-L50](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L34-L50)

 [frontend/src/pages/ArenaGame.jsx L27-L32](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L27-L32)

### State Consistency Model

GameArenaStacks implements **eventual consistency** with optimistic UI updates:

1. **User Action**: User initiates transaction via Stacks Connect
2. **Optimistic Update**: Transaction ID added to `pendingTxs` immediately
3. **UI Feedback**: Loading state displayed for that specific match
4. **Polling**: BitSubs pattern polls transaction status every 5s
5. **Confirmation**: On success, `pendingTxs` cleared and full state refresh triggered
6. **Agent Response**: Agent's `monitorChain` detects change within 20s

The maximum staleness of displayed state is bounded by the 60-second general polling interval for non-pending matches.

**Sources:** [frontend/src/pages/ArenaGame.jsx L242-L298](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L242-L298)

 [agent/src/ArenaAgent.ts L333-L474](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L333-L474)

---

## Complete Match Lifecycle Flow

### End-to-End State Transitions

```mermaid
sequenceDiagram
  participant p1 as User<br/>(Frontend State)
  participant p2 as ArenaGame<br/>Component
  participant p3 as arena-platform-v2<br/>Contract
  participant p4 as monitorChain()<br/>Process

  note over p1,p4: Phase 1: Match Proposal (STATUS-PENDING)
  p1->>p2: "handleProposeMatch()"
  p2->>p2: "setLoading(true)"
  p2->>p3: "openContractCall()<br/>propose-match()"
  p3-->>p2: "onFinish(data.txId)"
  p2->>p2: "setPendingTxs({[matchCount]: {type: 'proposal', txId}})"
  p2->>p2: "5s BitSubs polling starts"
  note over p2: "TX confirms"
  p2->>p2: "Remove from pendingTxs<br/>fetchMatches()"
  p2-->>p1: "Match
  note over p1,p4: Phase 2: Agent Acceptance (STATUS-ACCEPTED)
  p2->>p4: "POST /accept-match<br/>(with x402 payment)"
  p4->>p3: "makeContractCall()<br/>accept-match(matchId)"
  p3-->>p4: "TX broadcast success"
  p4-->>p2: "{success: true, txid}"
  note over p2: "fetchMatches() updates"
  p2-->>p1: "Match
  note over p1,p4: Phase 3: User Move (ACTIVE)
  p1->>p2: "handlePlayMove(matchId, move)"
  p2->>p3: "openContractCall()<br/>play-move(matchId, move)"
  p3-->>p2: "onFinish(data.txId)"
  p2->>p2: "setPendingTxs({[matchId]: {type: 'user', txId}})"
  p2->>p2: "BitSubs polling (5s)"
  note over p2: "TX confirms"
  p2->>p2: "fetchMatches()<br/>shows challengerMove"
  p2-->>p1: "challengerMove displayed,<br/>waiting for opponent"
  note over p1,p4: Phase 4: Agent Move Detection (ACTIVE)
  p4->>p4: "monitorChain() 20s tick"
  p4->>p3: "get-match-details(matchId)"
  p4->>p3: "get-player-move(matchId, challenger)"
  note over p4: "Challenger move exists"
  p4->>p4: "model.update(gameType, challenger, move)"
  p4->>p4: "aiMove = model.predict()"
  p4->>p3: "makeContractCall()<br/>play-move(matchId, aiMove)"
  p3-->>p4: "TX broadcast success"
  note over p2: "fetchMatches() next 60s tick"
  p2-->>p1: "Both moves displayed"
  note over p1,p4: Phase 5: Auto-Resolution (COMPLETED)
  p4->>p4: "monitorChain() detects<br/>both moves present"
  p4->>p4: "winner = calculateWinner()"
  p4->>p3: "makeContractCall()<br/>resolve-match(matchId, winner)"
  p3-->>p4: "Prize distributed (98%)"
  note over p2: "fetchMatches() + fetchBalance()"
  p2-->>p1: "Match
```

This sequence shows how state transitions propagate through the system, with the frontend maintaining optimistic UI state via `pendingTxs`, the blockchain serving as the source of truth, and the agent autonomously responding to state changes through periodic monitoring.

**Sources:** [frontend/src/pages/ArenaGame.jsx L300-L482](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L300-L482)

 [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

### State Lifecycle Summary Table

| Lifecycle Stage | Frontend State | Contract State | Agent Action | Duration |
| --- | --- | --- | --- | --- |
| User proposes match | `loading=true`, then `pendingTxs[id]={proposal}` | `STATUS-PENDING` (0) | None | ~5s TX confirm |
| Agent accepts match | Match appears in `matches` as "Pending" | `STATUS-ACCEPTED` (1) | x402 payment verified, `accept-match()` called | ~2s x402 + ~5s TX |
| User plays move | `pendingTxs[id]={user, txId}`, then `challengerMove` set | Player move recorded | None | ~5s TX confirm |
| Agent plays move | `opponentMove` appears in next `fetchMatches()` | Both moves recorded | `monitorChain()` detects, `play-move()` called | ~20s detection + ~5s TX |
| Auto-resolution | Winner and prize shown in `matches` | `STATUS-COMPLETED` (2) | `calculateWinner()`, `resolve-match()` called | ~20s detection + ~5s TX |
| Hall of Fame display | Filtered to `status==='Completed'` | Final state | None | Permanent |

**Sources:** [frontend/src/pages/ArenaGame.jsx L183-L240](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/src/pages/ArenaGame.jsx#L183-L240)

 [agent/src/ArenaAgent.ts L330-L475](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/ArenaAgent.ts#L330-L475)

---

# Development-and-Testing-Guide

# Development and Testing Guide

> **Relevant source files**
> * [QUICKSTART.md](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md)
> * [agent/nodemon.json](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json)
> * [agent/src/debug_match.ts](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts)
> * [frontend/vite.config.js](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js)

This document provides comprehensive guidance for developers working on GameArenaStacks. It covers environment setup, development workflows, testing procedures, debugging utilities, and troubleshooting common issues. For contract deployment information, see [Contract Deployment](/HACK3R-CRYPTO/GameArenaStacks/4.3-contract-deployment). For agent-specific configuration details, see [Agent Setup and Configuration](/HACK3R-CRYPTO/GameArenaStacks/3.1-agent-setup-and-configuration).

---

## Prerequisites

The following tools and resources are required before beginning development:

| Requirement | Version | Purpose |
| --- | --- | --- |
| Node.js | 18+ | Runtime for both frontend and agent |
| npm | Bundled with Node.js | Package management |
| Stacks Wallet | Latest | Leather, Xverse, or Asigna for testing |
| Testnet STX | Variable | Funding matches and agent operations |
| Git | Any recent | Version control |

**Obtaining Testnet STX:**

* Stacks Testnet Faucet: [https://explorer.hiro.so/sandbox/faucet?chain=testnet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
* Required for: Agent wallet funding, user wallet funding, match wagering
* Recommended minimum: 10 STX for agent wallet, 5 STX for user wallet

**Sources**: [QUICKSTART.md L4-L7](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L4-L7)

---

## Initial Repository Setup

### Cloning and Directory Structure

```
git clone https://github.com/HACK3R-CRYPTO/GameArenaStacks.git
cd GameArenaStacks
```

The repository contains three primary directories:

```markdown
GameArenaStacks/
├── frontend/          # React + Vite application
├── agent/             # Express + x402 autonomous agent
└── contracts/         # Clarity smart contracts
```

**Sources**: [QUICKSTART.md L11-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L11-L16)

---

## Agent Development Environment

### Installation and Configuration

```
cd agent
npm install
```

### Generating Agent Wallet

The agent requires its own Stacks wallet for autonomous transaction signing:

```
npx @stacks/cli make_keychain -t > agent_wallet.json
```

This generates a JSON file containing:

* `mnemonic`: 24-word seed phrase
* `keyInfo.privateKey`: Required for `.env` configuration
* `keyInfo.address`: Agent's Stacks address (must be funded)

### Environment Configuration

Create `.env` from template:

```
cp .env.example .env
```

Required environment variables:

| Variable | Description | Example |
| --- | --- | --- |
| `PRIVATE_KEY` | Agent's private key from `agent_wallet.json` | Hex string |
| `PORT` | Express server port | `3002` |
| `DEPLOYER` | Contract deployer address | Testnet address |
| `CONTRACT_NAME` | Arena platform contract name | `arena-platform-v2` |

**Funding the Agent Wallet:**

1. Copy the `address` value from `agent_wallet.json`
2. Visit the Stacks testnet faucet
3. Request 10+ STX to fund agent operations (match acceptance, moves, x402 payments)

**Sources**: [QUICKSTART.md L18-L43](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L18-L43)

### Development Mode with Hot Reload

The agent uses `nodemon` with `tsx` for TypeScript execution with automatic reloading:

```
npm run dev
```

The `nodemon` configuration watches TypeScript files and restarts on changes:

```mermaid
flowchart TD

SrcFiles["src/*.ts files"]
Nodemon["nodemon process"]
TSX["tsx executor"]
ArenaAgent["ArenaAgent.ts entry point"]

SrcFiles -.->|"File change detected"| Nodemon
Nodemon -.->|"Restarts"| TSX
TSX -.->|"Compiles & executes"| ArenaAgent
```

**Configuration Details** ([agent/nodemon.json L1-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json#L1-L12)

):

* `watch`: Monitors `src/` directory
* `ext`: Watches `.ts` file extensions
* `ignore`: Excludes test files and `node_modules`
* `exec`: Runs `tsx src/ArenaAgent.ts` on changes

**Sources**: [agent/nodemon.json L1-L12](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/nodemon.json#L1-L12)

 [QUICKSTART.md L40-L43](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L40-L43)

---

## Frontend Development Environment

### Installation

```
cd frontend
npm install
```

### Key Dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| `react` | 19.2.0 | UI framework |
| `vite` | 7.2.4 | Build tool and dev server |
| `@stacks/connect` | 7.8.3 | Wallet integration |
| `@stacks/transactions` | 6.13.0 | Transaction construction |
| `x402-stacks` | 2.0.1 | x402 payment client |
| `tailwindcss` | 4.1.18 | Styling framework |

### Development Server

```
npm run dev
```

Access at: [http://localhost:5173](http://localhost:5173)

**Sources**: [QUICKSTART.md L45-L57](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L45-L57)

### Vite Configuration

The frontend uses custom Vite configuration to support Stacks libraries in browser environments:

**Polyfills Configuration** ([frontend/vite.config.js L7-L16](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L7-L16)

):

* `global` aliased to `globalThis` for Node.js compatibility
* `buffer` polyfill for cryptographic operations
* `process/browser` for environment variable access
* `esbuildOptions.define` ensures consistent global object

These polyfills are required because Stacks.js libraries were originally designed for Node.js environments and use Node.js-specific globals.

**Sources**: [frontend/vite.config.js L1-L25](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/frontend/vite.config.js#L1-L25)

---

## Running the Complete Development Stack

### Startup Sequence

```mermaid
flowchart TD

Start["Development Start"]
AgentTerminal["Terminal 1:<br>agent/"]
FrontendTerminal["Terminal 2:<br>frontend/"]
AgentInstall["npm install"]
AgentEnv["Configure .env"]
AgentFund["Fund agent wallet"]
AgentRun["npm run dev"]
FrontendInstall["npm install"]
FrontendRun["npm run dev"]
AgentReady["Agent listening on :3002<br>monitorChain active"]
FrontendReady["Frontend on :5173<br>Wallet connection ready"]
Testing["Begin Testing"]

Start -.-> AgentTerminal
Start -.-> FrontendTerminal
AgentTerminal -.-> AgentInstall
AgentInstall -.-> AgentEnv
AgentEnv -.-> AgentFund
AgentFund -.-> AgentRun
AgentRun -.-> AgentReady
FrontendTerminal -.-> FrontendInstall
FrontendInstall -.-> FrontendRun
FrontendRun -.-> FrontendReady
AgentReady -.-> Testing
FrontendReady -.-> Testing
```

### Verification Checklist

After starting both services, verify:

**Agent Service ([http://localhost:3002](http://localhost:3002)):**

* Server responds to health checks
* Console shows `monitorChain started`
* No errors in terminal output
* Agent wallet address has sufficient testnet STX

**Frontend Service ([http://localhost:5173](http://localhost:5173)):**

* Page loads without errors
* Browser console shows no critical errors
* Wallet connection button is visible
* Network requests use correct contract addresses

**Sources**: [QUICKSTART.md L18-L57](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L18-L57)

---

## Complete Testing Workflow

### End-to-End Match Flow

The following sequence represents a complete development testing cycle:

```mermaid
sequenceDiagram
  participant p1 as Developer<br/>(Browser)
  participant p2 as Frontend<br/>:5173
  participant p3 as Stacks Wallet<br/>(Leather/Xverse)
  participant p4 as Agent<br/>:3002
  participant p5 as Stacks Testnet

  note over p1,p5: Phase 1: Wallet Connection
  p1->>p2: "Load http://localhost:5173"
  p2->>p1: "Landing overlay displayed"
  p1->>p2: "Click Connect Wallet"
  p2->>p3: "authenticate() call"
  p3->>p1: "Wallet popup"
  p1->>p3: "Approve connection"
  p3->>p2: "UserData returned"
  p2->>p1: "Show game interface"
  note over p1,p5: Phase 2: Match Proposal
  p1->>p2: "Select RPS, wager 100000 μSTX"
  p1->>p2: "Click PROPOSE_MATCH_VIA_STX"
  p2->>p3: "openContractCall()<br/>propose-match()"
  p3->>p1: "Transaction approval"
  p1->>p3: "Confirm transaction"
  p3->>p5: "Broadcast tx"
  p5->>p2: "matchId created"
  p2->>p1: "Show pending match"
  note over p1,p5: Phase 3: x402 Agent Acceptance
  p4->>p5: "monitorChain polls<br/>new matches"
  p4->>p4: "Detect match proposal"
  p2->>p4: "POST /accept-match"
  p4->>p2: "HTTP 402 Payment Required"
  p2->>p3: "STX transfer 1000 μSTX"
  p3->>p5: "Payment broadcast"
  p2->>p4: "Retry with x-payment-proof"
  p4->>p5: "accept-match(matchId)"
  p5->>p2: "Match accepted"
  p2->>p1: "Show active match"
  note over p1,p5: Phase 4: Gameplay
  p1->>p2: "Select Rock"
  p2->>p3: "play-move(matchId, 0)"
  p3->>p5: "Broadcast move"
  p5->>p4: "Move detected"
  p4->>p4: "Markov prediction"
  p4->>p5: "play-move(matchId, aiMove)"
  p5->>p5: "Resolve winner"
  p5->>p2: "Prize distributed"
  p2->>p1: "Display result in Hall of Fame"
```

### Manual Testing Steps

**1. Wallet Connection** ([QUICKSTART.md L61-L64](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L61-L64)

):

* Click "Connect Wallet" button
* Select Leather, Xverse, or Asigna
* Approve connection request
* Verify wallet address appears in Navigation component

**2. Match Proposal** ([QUICKSTART.md L66-L70](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L66-L70)

):

* Select game type: Rock-Paper-Scissors, Dice Roll, or Coin Flip
* Set wager amount (default: 100000 microSTX = 0.1 STX)
* Click "PROPOSE_MATCH_VIA_STX"
* Confirm transaction in wallet popup
* Wait for transaction confirmation (~30-60 seconds)

**3. Agent Acceptance** ([QUICKSTART.md L72-L75](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L72-L75)

):

* Agent's `monitorChain` detects match automatically
* x402 payment flow initiates (1000 microSTX)
* Agent broadcasts `accept-match` transaction
* Match status updates to "Active"

**4. Gameplay** ([QUICKSTART.md L77-L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L77-L81)

):

* Make move selection (Rock=0, Paper=1, Scissors=2)
* Click "Play Move" button
* Confirm transaction
* Agent responds with Markov Chain-predicted counter-move
* Match resolves on-chain
* Winner receives 98% of total pot
* Result displays in Hall of Fame component

**Sources**: [QUICKSTART.md L59-L81](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L59-L81)

---

## Debugging Tools and Utilities

### Match State Inspector

The agent includes a debugging utility for inspecting on-chain match state:

**File**: `agent/src/debug_match.ts`

**Functionality** ([agent/src/debug_match.ts L9-L72](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts#L9-L72)

):

1. Queries `get-match-details` for match metadata
2. Retrieves `get-player-move` for both challenger and opponent
3. Displays raw contract response data in JSON format
4. Extracts player addresses from match details

**Usage**:

```markdown
cd agent
# Edit debug_match.ts to set matchId
npx tsx src/debug_match.ts
```

**Sample Output**:

```json
{
  "AGENT MOVE": { "value": { "value": 2 } },
  "Challenger": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "Opponent": "ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA",
  "CHALLENGER MOVE": { "value": { "value": 0 } }
}
```

**Key Functions Used**:

* `callReadOnlyFunction` from `@stacks/transactions`
* `cvToJSON` for Clarity value deserialization
* `uintCV`, `principalCV` for argument construction

**Sources**: [agent/src/debug_match.ts L1-L73](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/agent/src/debug_match.ts#L1-L73)

### Browser Developer Tools

**Frontend Debugging**:

Chrome DevTools provides several useful panels:

| Panel | Purpose | Key Information |
| --- | --- | --- |
| Console | JavaScript errors, logs | x402 payment flows, transaction IDs |
| Network | HTTP requests | Agent API calls, Stacks RPC queries |
| Application | Storage | Wallet connection state, cached data |
| React DevTools | Component state | ArenaGame state, match data |

**Common Debug Points**:

* `ArenaGame.jsx` console logs for transaction tracking
* `x402-stacks` payment verification logs
* Stacks Connect wallet interaction logs

**Agent Debugging**:

The Express server logs all requests and key operations:

```
[Express] POST /accept-match - matchId: 5
[x402] Payment required: 1000 microSTX
[x402] Payment verified: tx abc123...
[ArenaAgent] Accepting match 5
[monitorChain] Detected user move in match 5
[OpponentModel] Predicting counter-move
[ArenaAgent] Playing move 1 in match 5
```

**Sources**: [QUICKSTART.md L93-L106](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L93-L106)

---

## Common Development Workflows

### Testing New Game Logic

```mermaid
flowchart TD

Modify["Modify OpponentModel.predict()"]
Restart["Restart agent:<br>nodemon auto-restarts"]
Frontend["Refresh frontend"]
ProposeMa["Propose new match"]
PlayGame["Play through match"]
Observe["Observe AI strategy"]
Iterate["Adjust algorithm"]

Modify -.-> Restart
Restart -.-> Frontend
Frontend -.-> ProposeMa
ProposeMa -.-> PlayGame
PlayGame -.-> Observe
Observe -.-> Iterate
Iterate -.-> Modify
```

**Workflow Steps**:

1. Edit `agent/src/ArenaAgent.ts` OpponentModel class
2. Save file (nodemon automatically restarts)
3. Propose new match from frontend
4. Play through match to test new strategy
5. Inspect agent logs for prediction logic
6. Iterate on algorithm

### Testing x402 Payment Flow

**Scenario: Verify payment verification logic**

1. Set breakpoint in `agent/src/ArenaAgent.ts` x402 middleware
2. Trigger match acceptance from frontend
3. Observe HTTP 402 response
4. Verify payment transaction on Stacks explorer
5. Confirm agent retries after payment proof
6. Validate `accept-match` transaction broadcast

### Testing Contract Interactions

**Scenario: Verify contract read operations**

The frontend uses `callReadOnlyWithRetry` for resilient contract queries:

```markdown
# Monitor network tab in Chrome DevTools
# Filter by: api.testnet.hiro.so
# Observe POST requests to /v2/contracts/call-read/
```

**Key Read-Only Functions**:

* `get-match-details(matchId)`
* `get-player-move(matchId, player)`
* `get-agent-profile(agentAddress)`
* `get-total-matches()`

**Sources**: [QUICKSTART.md L108-L130](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L108-L130)

---

## Deployed Testnet Contracts

All development testing uses contracts deployed on Stacks Testnet:

| Contract | Address | Purpose |
| --- | --- | --- |
| Deployer | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9` | Contract owner |
| `arena-platform-v2` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform-v2` | Game logic and wagering |
| `agent-registry` | `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry` | Agent identity system |

**Explorer Links**:

* Deployer account: [https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet](https://explorer.hiro.so/address/ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9?chain=testnet)
* Contract transactions: Filter by "Contract Call" type
* Match events: View contract events tab

**Sources**: [QUICKSTART.md L83-L89](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L83-L89)

---

## Troubleshooting Common Issues

### Agent Not Responding

**Symptoms**:

* Match remains in "Proposed" state
* No agent acceptance transaction
* Frontend shows "Waiting for agent..."

**Diagnosis**:

| Check | Command/Action | Expected Result |
| --- | --- | --- |
| Agent running | `ps aux \| grep tsx` | Process found |
| Agent logs | Terminal output | "monitorChain started" |
| Agent wallet | Check balance on explorer | > 1 STX available |
| Network connectivity | `curl http://localhost:3002` | Server responds |

**Solutions**:

1. Restart agent: `npm run dev`
2. Fund agent wallet from faucet
3. Verify `.env` PRIVATE_KEY is correct
4. Check console for error messages

**Sources**: [QUICKSTART.md L93-L96](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L93-L96)

### Transaction Failing

**Symptoms**:

* Wallet rejects transaction
* "Insufficient funds" error
* Transaction broadcast fails

**Common Causes**:

```mermaid
flowchart TD

TxFail["Transaction Failure"]
InsufficientSTX["Insufficient STX"]
InvalidWager["Invalid wager amount"]
NetworkIssue["Network/RPC issue"]
NonceError["Nonce conflict"]
FundWallet["Get testnet STX<br>from faucet"]
CheckMin["Verify wager > 0<br>Check decimals"]
RetryTx["Retry transaction<br>Check RPC node"]
WaitConfirm["Wait for pending<br>tx confirmation"]

TxFail -.-> InsufficientSTX
TxFail -.-> InvalidWager
TxFail -.-> NetworkIssue
TxFail -.-> NonceError
InsufficientSTX -.-> FundWallet
InvalidWager -.-> CheckMin
NetworkIssue -.-> RetryTx
NonceError -.-> WaitConfirm
```

**Verification Steps**:

1. Check wallet balance > wager amount + fees
2. Verify wager is positive integer (microSTX)
3. Confirm network is set to "testnet"
4. Wait for pending transactions to confirm
5. Try alternative RPC node (frontend has built-in failover)

**Sources**: [QUICKSTART.md L98-L101](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L98-L101)

### Wallet Connection Issues

**Symptoms**:

* "Connect Wallet" button unresponsive
* Wallet popup doesn't appear
* Connection disconnects immediately

**Solutions**:

1. **Browser Cache**: Clear cache and reload page
2. **Wallet Extension**: Ensure Leather/Xverse is installed and updated
3. **Network Selection**: Verify wallet is set to Testnet
4. **Try Alternative Wallet**: Test with different wallet provider
5. **Page Refresh**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

**Sources**: [QUICKSTART.md L103-L106](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L103-L106)

### Development Environment Issues

**Node.js Version Mismatch**:

```python
# Check current version
node --version

# Should output: v18.x.x or higher
# If lower, install Node.js 18+ from nodejs.org
```

**Port Conflicts**:

```markdown
# Check if port 3002 is in use
lsof -i :3002

# Kill process if needed
kill -9 <PID>
```

**Dependency Installation Failures**:

```markdown
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Sources**: [QUICKSTART.md L4-L7](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L4-L7)

---

## Development Best Practices

### Code Organization

**Agent Structure**:

```markdown
agent/src/
├── ArenaAgent.ts          # Main entry point, Express server
├── debug_match.ts         # Debugging utility
└── [future utilities]
```

**Frontend Structure**:

```javascript
frontend/src/
├── pages/
│   └── ArenaGame.jsx      # Main game component
├── components/
│   ├── Navigation.jsx     # Wallet integration
│   ├── Landing.jsx        # Entry overlay
│   ├── DocsModal.jsx      # Documentation
│   └── HallOfFame.jsx     # Results display
└── App.jsx                # Root component
```

### Testing Checklist

Before committing changes:

* Agent starts without errors (`npm run dev`)
* Frontend builds successfully (`npm run build`)
* Wallet connection works with Leather and Xverse
* Match proposal completes on-chain
* x402 payment flow functions correctly
* Agent accepts matches automatically
* Moves are recorded on-chain
* Match resolution distributes prizes correctly
* Hall of Fame displays results
* No console errors in browser

### Performance Monitoring

**Agent Performance**:

* Monitor `monitorChain` polling frequency (default: 30 seconds)
* Check transaction broadcast latency
* Verify Markov prediction computation time

**Frontend Performance**:

* Monitor Stacks RPC query response times
* Check transaction polling frequency
* Verify BitSubs subscription efficiency

**Sources**: [QUICKSTART.md L108-L130](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L108-L130)

---

## Additional Resources

### Documentation References

| Resource | Description | Link Format |
| --- | --- | --- |
| Project Overview | High-level system architecture | [GameArenaStacks Overview](/HACK3R-CRYPTO/GameArenaStacks/1-gamearenastacks-overview) |
| Agent Configuration | Environment setup details | [Agent Setup and Configuration](/HACK3R-CRYPTO/GameArenaStacks/3.1-agent-setup-and-configuration) |
| x402 Protocol | Payment middleware documentation | [x402 Payment Middleware](/HACK3R-CRYPTO/GameArenaStacks/3.2-x402-payment-middleware) |
| Smart Contracts | Contract API reference | [arena-platform-v2 Contract](/HACK3R-CRYPTO/GameArenaStacks/4.1-arena-platform-v2-contract) |
| Match Lifecycle | Complete state transitions | [Match Lifecycle and State Management](/HACK3R-CRYPTO/GameArenaStacks/9-match-lifecycle-and-state-management) |

### External Documentation

* **Stacks Documentation**: [https://docs.stacks.co](https://docs.stacks.co)
* **x402 Protocol**: [https://x402stacks.xyz](https://x402stacks.xyz)
* **Stacks.js SDK**: [https://stacks.js.org](https://stacks.js.org)
* **Clarity Language**: [https://docs.stacks.co/clarity](https://docs.stacks.co/clarity)

### Support Channels

* **GitHub Repository**: [https://github.com/HACK3R-CRYPTO/GameArenaStacks](https://github.com/HACK3R-CRYPTO/GameArenaStacks)
* **Issue Tracker**: Report bugs and feature requests
* **Discussions**: Community support and questions

**Sources**: [QUICKSTART.md L132-L142](https://github.com/HACK3R-CRYPTO/GameArenaStacks/blob/23ba68fb/QUICKSTART.md#L132-L142)