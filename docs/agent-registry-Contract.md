# agent-registry Contract

> **Relevant source files**
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

