# GameArena Stacks: x402-Monetized Autonomous Gaming 🚀

GameArenaStacks is a decentralized gaming platform that enables 1v1 wagering matches between human players and autonomous AI agents on the Stacks blockchain. The system implements three core innovations:

1.  **x402 Monetization Protocol** - Autonomous agents charge micro-payments for their services using HTTP 402 status codes.
2.  **Markov Chain AI** - Strategic opponent modeling that learns player patterns and generates counter-strategies.
3.  **Trustless Execution** - Clarity smart contracts enforce immutable game rules with post-conditions protecting user assets.

## 🏗️ Three-Tier Architecture

GameArenaStacks implements a layered architecture where each tier has distinct responsibilities:

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

subgraph Blockchain ["Tier 3: Blockchain (Stacks)"]
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

### Tier Responsibilities

| Tier | Components | Primary Responsibilities | Key Technologies |
| --- | --- | --- | --- |
| **Frontend** | `ArenaGame.jsx`, `Navigation.jsx` | User interface, wallet integration, x402 payment client | React 19, Vite 7, `@stacks/connect` |
| **Agent** | `ArenaAgent.ts`, `OpponentModel` | x402 payment server, Markov AI strategy, chain monitoring | Node.js 18+, Express 4, `x402-stacks` |
| **Blockchain** | `arena-platform-v2.clar`, `agent-registry.clar` | Game logic enforcement, wagering, agent identity | Clarity 2.5, Stacks Testnet |

## 📚 Documentation Portal

Detailed technical documentation is organized in the [docs/](./docs/) directory:

- **[🚀 Getting Started](./docs/Getting-Started.md)**: Environment setup and quickstart guide.
- **[🏗️ System Architecture](./docs/System-Architecture.md)**: Deep dive into the three-tier design.
- **[🤖 AI Agent System](./docs/AI-Agent-System.md)**: Markov Chain strategy and x402 monetization.
- **[🎮 Frontend Application](./docs/Frontend-Application.md)**: React UI, wallet integration, and x402 client.
- **[📜 Smart Contracts](./docs/Smart-Contracts.md)**: Clarity contracts for match logic and identity.
- **[💸 x402 Monetization](./docs/x402-Monetization-Protocol.md)**: The protocol enabling machine-to-machine payments.

## 🕹️ Game Universe

GameArena supports adaptive AI counter-strategies for:
1.  **Rock-Paper-Scissors**: The classic battle of intuition.
2.  **Dice Roll**: A high-stakes risk game (Higher number wins).
3.  **Coin Flip**: A prediction-based challenge (Heads/Tails).

## 🚀 Quick Start

1.  **Start Agent**: `cd agent && npm install && npm run dev`
2.  **Start Frontend**: `cd frontend && npm install && npm run dev`
3.  **Run Tests**: `cd contracts && clarinet check`

---
*Built for the x402 Stacks Hackathon.*