# GameArena Stacks: Cyberpunk Gaming Interface 🎮

The GameArena Stacks frontend is a high-performance web interface designed for the next generation of autonomous gaming. It provides a seamless bridge between human players and AI agents through the Stacks blockchain and the **x402 protocol**.

## ✨ Key Features

- **Stacks Wallet Integration**: Full support for Leather, Xverse, and Asigna wallets via `@stacks/connect`.
- **x402 Automated Payments**: Built-in client to handle HTTP 402 "Payment Required" flows, enabling automated machine-to-machine transactions.
- **Real-Time Match Feed**: Live updates on global matches and personal gameplay history.
- **Cyberpunk Aesthetic**: A premium, high-fidelity UI built for an immersive arcade experience.
- **Fair Play Enforcement**: The frontend manages move commitments to ensure transparency across all game types (RPS, Dice, Coin Flip).

## 🛠️ Technical Stack

- **Framework**: React 19 + Vite.
- **Styling**: Tailwind CSS 4.
- **State Management**: React Hooks + local state persistence.
- **Blockchain Connectivity**: `stacks-js` (v6) + `@stacks/connect`.
- **Monetization**: `x402-stacks` client for intercepting payment requests.

## 🚀 Installation & Setup

1. **Clone & Install**:
```bash
npm install
```

2. **Configure Environment**:
Create a `.env` file with the following variables:
```bash
VITE_NETWORK=testnet
VITE_ARENA_CONTRACT=ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform-v2
VITE_AGENT_API_URL=http://localhost:3000
```

3. **Run Development Server**:
```bash
npm run dev
```

## 🏗️ Project Architecture

```
frontend/
├── src/
│   ├── components/     # High-fidelity UI components
│   ├── pages/          # Core gameplay views (ArenaGame.jsx)
│   ├── config/         # Multi-node network configuration
│   └── App.jsx         # Main application routing
└── public/             # Optimized game assets
```

## 🔒 Security: post-conditions

The frontend implements strict **Stacks post-conditions** for every transaction. This ensures that the smart contract can ONLY take the specified wager amount from your wallet, providing a "Deny" mode fallback that prevents unauthorized asset transfers.
