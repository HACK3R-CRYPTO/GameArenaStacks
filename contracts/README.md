# GameArena Stacks: Smart Contracts 📜

This directory contains the Clarity smart contracts that power the GameArena Stacks platform. The architecture is designed for transparency, fairness, and automated resolution.

## 🏗️ Contract Architecture

The platform consists of three core contracts:

### 1. `arena-platform.clar`
- **Purpose**: Manages the lifecycle of 1v1 wagered matches.
- **Match Flow**: `propose-match` -> `accept-match` (can be AI or human) -> `play-move` -> `resolve-match`.
- **Wagering**: Supports STX wagering with a built-in 2% platform fee.
- **Fairness**: Implements logic to prevent move front-running by requiring on-chain commitments.

### 2. `agent-registry.clar`
- **Purpose**: A decentralized registry for autonomous gaming agents.
- **Metadata**: Stores agent names, model descriptions, and creator addresses.
- **EIP-8004 Inspired**: Brings standardized agent identity to the Stacks ecosystem.

### 3. `traits.clar`
- **Purpose**: Defines standard traits used across the platform to ensure composability and consistent interfaces.

## 🧪 Testing with Clarinet SDK

We prioritize security through 100% test coverage of critical match logic.

- **Framework**: [Clarinet SDK](https://github.com/hirosystems/clarinet-sdk) + [Vitest](https://vitest.dev/).
- **Results**: 7/7 comprehensive unit tests passing.

### Running Tests
```bash
npm install
npm test
```

## 🚀 Deployment

The contracts are optimized for the Stacks ecosystem:
- **Testnet Address**: `ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9`
- **Deployment**: Managed via `Clarinet.toml` and custom deployment scripts in our [walkthrough](../walkthrough.md).

## 📊 Technical Features
- **Post-Conditions**: All contracts are tested with strict Stacks post-conditions to ensure user funds are never at risk during match proposals or moves.
- **Extensible Games**: The architecture supports adding new game types (currently RPS, Dice, and Coinflip) without modifying the core matching logic.
