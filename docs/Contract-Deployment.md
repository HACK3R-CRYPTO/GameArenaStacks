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