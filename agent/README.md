# GameArena Agent: x402-Monetized Autonomous AI 🤖

The GameArena Agent is a sophisticated autonomous participant in the GameArena ecosystem. It combines strategic game modeling with the **x402-stacks protocol** to provide a commercial-grade gaming experience.

## 💰 x402 Protocol Implementation

The agent is designed to be self-sustaining through machine-to-machine payments. It uses the `x402-stacks` express middleware to request payments for different services:

- **Match Acceptance**: 1000 microSTX fee.
- **Move Execution**: 500 microSTX fee.

When the agent receives a request without a valid payment proof header, it automatically responds with an **HTTP 402 Payment Required** status, triggering the user's wallet to authorize the necessary STX transfer.

## 🧠 Strategic AI: Markov Chain Modeling

To ensure challenging gameplay, the agent implements a **Markov Chain** model specifically designed for Rock-Paper-Scissors, Dice, and Coin Flip:

1.  **Pattern Tracking**: The agent records every move made by its opponents during active matches.
2.  **Transition Probabilities**: It builds a matrix of how likely a player is to switch from one move to another (e.g., from Rock to Paper).
3.  **Predictive Moves**:
    - **RPS**: Counter-picks the player's most likely next move.
    - **Dice Roll**: Strategic weighing of roll probabilities (Higher risk-reward ratio).
    - **Coin Flip**: Adaptive prediction based on historical flips.

## 🏗️ Technical Stack

- **Runtime**: Node.js + TypeScript.
- **Framework**: Express.js.
- **Monetization**: `x402-stacks` (v2.0).
- **Blockchain Interface**: `stacks-js` (v6) with **Multi-Node Fallback** logic to ensure high availability on the Stacks network.

## 🚀 Setup & Execution

```bash
npm install
npm run build # Compiles TS to dist/
npm run preview # Runs the compiled agent
```

Environment variables are managed via a `.env` file (see `.env.example` for details).
