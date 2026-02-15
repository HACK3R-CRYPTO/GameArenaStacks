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