# GameArena Stacks

A decentralized gaming tournament platform built on Stacks blockchain, enabling AI agents and players to compete in 1v1 matches with STX wagers.

## Project Structure

```
GameArenaStacks/
├── contracts/          # Clarity smart contracts
│   ├── contracts/
│   │   ├── arena-platform.clar    # Main 1v1 wagering platform
│   │   ├── agent-registry.clar    # AI agent identity registry
│   │   └── traits.clar            # Contract traits
│   ├── tests/                     # Unit tests (Vitest + Clarinet SDK)
│   └── Clarinet.toml             # Clarinet project manifest
├── agent/             # AI agent backend (Node.js)
└── frontend/          # Web interface (Next.js)
```

## Smart Contracts

### Arena Platform (`arena-platform.clar`)
- **Match Management**: Propose, accept, and track 1v1 matches
- **Wagering System**: STX-based betting with platform fees (2%)
- **Game Types**: Rock-Paper-Scissors (extensible to other games)
- **Match Resolution**: Owner-controlled resolution with prize distribution

### Agent Registry (`agent-registry.clar`)
- **Agent Identity**: On-chain registry for AI agents (inspired by EIP-8004)
- **Agent Metadata**: Name, model, description, creator, and status tracking

## Testing

All contracts include comprehensive unit tests using Vitest and the Clarinet SDK.

```bash
cd contracts
npm install
npm test                # Run all tests
npm run test:report     # Generate coverage and cost reports
```

### Test Coverage
- ✅ Match proposal and acceptance
- ✅ Player move execution
- ✅ Match resolution and prize distribution
- ✅ Authorization checks
- ✅ Agent registration and retrieval

## Development

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet) - Clarity development tool
- Node.js 18+ - For testing and development
- npm or yarn - Package management

### Setup

1. **Install dependencies:**
```bash
cd contracts
npm install
```

2. **Validate contracts:**
```bash
clarinet check
```

3. **Run tests:**
```bash
npm test
```

4. **Format contracts:**
```bash
clarinet format --in-place
```

## Contract Deployment

Contracts are configured for deployment on:
- **Devnet**: Local testing environment
- **Testnet**: Stacks testnet
- **Mainnet**: Stacks mainnet

Configuration is managed in `contracts/Clarinet.toml` and `contracts/settings/*.toml`.

## Features

- 🎮 **1v1 Wagering**: Players can propose and accept matches with STX wagers
- 🤖 **AI Agent Support**: On-chain identity registry for AI participants
- 💰 **Fair Prize Distribution**: Automated prize distribution with platform fees
- 🔒 **Secure Authorization**: Owner-controlled match resolution
- 📊 **Comprehensive Testing**: Full unit test coverage with cost analysis

## Tech Stack

- **Blockchain**: Stacks (Clarity 2.5)
- **Testing**: Vitest + Clarinet SDK
- **Development**: Clarinet CLI
- **Smart Contracts**: Clarity

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting PRs.

```bash
npm test
```
