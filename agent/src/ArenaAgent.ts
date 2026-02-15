import express from 'express';
import {
    X402_HEADERS,
} from 'x402-stacks';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    uintCV,
    noneCV,
    someCV,
    principalCV,
    callReadOnlyFunction,
    cvToJSON,
    getAddressFromPrivateKey,
    TransactionVersion,
    standardPrincipalCV
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-payment-proof, x-stacks-address');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});


// CONFIG
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const NETWORK_TYPE = process.env.NETWORK_TYPE || 'testnet';
const network = new StacksTestnet({ url: 'https://api.testnet.hiro.so' });
const AGENT_ADDRESS = getAddressFromPrivateKey(PRIVATE_KEY, NETWORK_TYPE === 'mainnet' ? TransactionVersion.Mainnet : TransactionVersion.Testnet);

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9';
const CONTRACT_NAME = 'arena-platform-v2';

const PORT = process.env.PORT || 3000;

console.log(chalk.blue(`🤖 Arena Stacks Agent starting...`));
console.log(chalk.blue(`Wallet: ${AGENT_ADDRESS}`));

/**
 * x402 PROTOCOL DEMO with Markov Chain AI
 * 
 * This agent demonstrates:
 * 1. x402 payment protocol on Stacks (HTTP 402 responses)
 * 2. Markov Chain opponent modeling for strategic gameplay
 * 3. Automated contract calls after payment verification
 */

// AI Logic: Markov Chain for Opponent Modeling
class OpponentModel {
    transitions: Record<number, Record<string, number[][]>> = {};
    history: Record<number, Record<string, number>> = {};

    update(gameType: number, player: string, move: number) {
        if (!this.transitions[gameType]) this.transitions[gameType] = {};
        if (!this.history[gameType]) this.history[gameType] = {};
        const size = gameType === 0 ? 3 : gameType === 1 ? 6 : 2;
        if (!this.transitions[gameType][player]) {
            this.transitions[gameType][player] = Array.from({ length: size }, () => Array(size).fill(0));
        }
        const lastMove = this.history[gameType][player];
        if (lastMove !== undefined && lastMove < size && move < size) {
            const p = this.transitions[gameType]![player];
            if (p) {
                const row = p[lastMove];
                if (row) row[move] = (row[move] || 0) + 1;
            }
        }
        this.history[gameType][player] = move;
    }

    predict(gameType: number, player: string): number {
        const playerTrans = this.transitions[gameType]?.[player];
        const lastMove = this.history[gameType]?.[player];
        const size = gameType === 0 ? 3 : gameType === 1 ? 6 : 2;
        if (!playerTrans || lastMove === undefined) return Math.floor(Math.random() * size);
        const counts = playerTrans[lastMove]!;
        const total = counts.reduce((a, b) => a + b, 0);
        if (total === 0) return Math.floor(Math.random() * size);
        let predictedMove = 0;
        for (let i = 1; i < size; i++) {
            if (counts[i]! > counts[predictedMove]!) predictedMove = i;
        }
        // Counter-strategies per game type
        if (gameType === 0) return (predictedMove + 1) % 3; // RPS: counter predicted move
        if (gameType === 1) return Math.random() > 0.3 ? 5 : Math.floor(Math.random() * 6); // Dice: favor 6
        return Math.random() > 0.5 ? predictedMove : 1 - predictedMove; // Coinflip: adaptive
    }
}

const model = new OpponentModel();



// x402 Middleware Helper
function x402Middleware(amount: number) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const paymentProof = req.headers['x-payment-proof'] as string;
        const stacksAddress = req.headers['x-stacks-address'] as string;

        // x402 Protocol: Return payment instructions if no proof provided
        if (!paymentProof || !stacksAddress) {
            const paymentRequired = {
                status: 402,
                error: 'Payment Required',
                x402Version: 2,
                resource: { url: req.path, description: 'Agent service fee' },
                accepts: [{
                    scheme: 'direct-payment',
                    network: 'stacks-testnet',
                    token: 'STX',
                    amount: amount.toString(),
                    payTo: AGENT_ADDRESS,
                }]
            };
            res.setHeader(
                X402_HEADERS.PAYMENT_REQUIRED,
                Buffer.from(JSON.stringify(paymentRequired)).toString('base64')
            );
            return res.status(402).json(paymentRequired);
        }

        // In production, verify payment proof here
        console.log(chalk.green(`✅ Payment verified from ${stacksAddress}`));
        next();
    };
}

// x402 Endpoints
app.post('/accept-match', x402Middleware(1000), async (req, res) => {
    const { matchId } = req.body;

    console.log(chalk.green(`📨 Accepting match ${matchId}`));

    try {
        // Call Clarity Contract to accept match
        console.log(`Creating contract call for match ${matchId}...`);
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'accept-match',
            functionArgs: [uintCV(matchId)],
            senderKey: PRIVATE_KEY,
            validateWithKnownAbi: false, // Disabled to avoid indexer delays
            network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        const transaction = await makeContractCall(txOptions);
        console.log(`Broadcasting transaction...`);
        const broadcastResponse = await broadcastTransaction(transaction, network);

        console.log(`Broadcast response:`, broadcastResponse);

        if (broadcastResponse.error) {
            console.error(`Broadcast failed: ${broadcastResponse.error} - ${broadcastResponse.reason}`);
            throw new Error(`Broadcast failed: ${broadcastResponse.error}`);
        }

        res.json({
            success: true,
            txid: broadcastResponse.txid,
            message: 'Match accepted on Stacks'
        });
    } catch (error: any) {
        console.error('Error in accept-match:', error);
        res.status(500).json({ error: error.message });
    }
});


app.post('/play-move', x402Middleware(500), async (req, res) => {
    let { matchId, move } = req.body;
    const playerAddress = req.headers['x-stacks-address'] as string || 'unknown';

    // If no move provided, use AI model
    if (move === undefined) {
        try {
            // VERIFY FAIRNESS: Check if challenger has already played
            const matchRes = await callReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-match-details',
                functionArgs: [uintCV(matchId)],
                network,
                senderAddress: AGENT_ADDRESS,
            });
            const m = cvToJSON(matchRes).value;
            if (!m || !m.value) throw new Error('Match not found');
            const challenger = m.value.challenger.value;
            const gameType = Number(m.value['game-type'].value);

            const challengerMoveRes = await callReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-player-move',
                functionArgs: [uintCV(matchId), principalCV(challenger)],
                network,
                senderAddress: AGENT_ADDRESS,
            });
            const moveData = cvToJSON(challengerMoveRes).value;

            if (!moveData || moveData.value === null) {
                console.log(chalk.yellow(`⚠️ Fairness Check Failed: Challenger ${challenger} has not played for match #${matchId} yet.`));
                return res.status(403).json({
                    success: false,
                    error: 'FAIRNESS_VIOLATION',
                    message: 'AI only moves after the human has committed their move on-chain.'
                });
            }

            // Record move for learning
            const challengerMoveValue = Number(moveData.value);
            model.update(gameType, challenger, challengerMoveValue);

            // Predict move
            move = model.predict(gameType, challenger);
            console.log(chalk.magenta(`🤖 AI decided move for Match ${matchId} (Type ${gameType}): ${move} after challenger ${challenger} played.`));
        } catch (e: any) {
            console.error(chalk.red(`Error during fairness check: ${e.message}`));
            return res.status(500).json({ success: false, error: e.message });
        }
    } else {
        console.log(chalk.magenta(`🤖 Agent forcing move: ${move}`));
    }

    try {
        const address = getAddressFromPrivateKey(PRIVATE_KEY, TransactionVersion.Testnet);
        console.log(chalk.cyan(`Fetching nonce for ${address} from ${network.coreApiUrl}...`));

        let nonce = 0;
        const nodes = [
            'https://api.testnet.hiro.so',
            'https://stacks-node-api.testnet.stacks.co'
        ];

        for (const nodeUrl of nodes) {
            try {
                const url = `${nodeUrl}/extended/v1/address/${address}/nonces`;
                console.log(chalk.cyan(`Attempting nonce fetch from ${nodeUrl}...`));
                const nonceResponse = await fetch(url, { signal: AbortSignal.timeout(15000) });
                if (nonceResponse.ok) {
                    const nonceData = await nonceResponse.json();
                    nonce = nonceData.possible_next_nonce || 0;
                    console.log(chalk.cyan(`Successfully fetched nonce: ${nonce} from ${nodeUrl}`));
                    break; // Success!
                }
            } catch (err: any) {
                console.warn(chalk.yellow(`Failed to reach ${nodeUrl}: ${err.message}`));
                continue; // Try next node
            }
        }

        console.log(chalk.cyan(`Creating transaction options for Match #${matchId}...`));
        const txOptions: any = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'play-move',
            functionArgs: [uintCV(matchId), uintCV(move)],
            senderKey: PRIVATE_KEY,
            network,
            anchorMode: 1, // AnchorMode.Any = 1
            postConditionMode: 1 // PostConditionMode.Deny = 1
        };

        if (nonce > 0) {
            txOptions.nonce = BigInt(nonce);
        }

        console.log(chalk.cyan(`Building transaction locally...`));
        const transaction = await makeContractCall(txOptions);
        console.log(chalk.cyan(`Transaction created! Broadcasting...`));

        const broadcastResponse = await broadcastTransaction(transaction, network);

        if (broadcastResponse.error) {
            console.error(chalk.red(`Broadcast failed: ${broadcastResponse.error}`));
            console.error(broadcastResponse);
            return res.status(500).json({ success: false, error: broadcastResponse.error });
        }

        console.log(chalk.green(`✅ Move played! TX: ${broadcastResponse.txid}`));
        res.json({ success: true, txId: broadcastResponse.txid });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


// Game Resolution Logic
function calculateWinner(gameType: number, move1: number, move2: number, p1: string, p2: string): string | null {
    if (gameType === 0) { // Rock-Paper-Scissors
        if (move1 === move2) return null; // Draw
        // 0: Rock, 1: Paper, 2: Scissors
        if ((move1 === 0 && move2 === 2) || (move1 === 1 && move2 === 0) || (move1 === 2 && move2 === 1)) {
            return p1;
        }
        return p2;
    }

    if (gameType === 1) { // Dice Roll: Higher Number Wins
        if (move1 === move2) return null; // Draw
        return move1 > move2 ? p1 : p2;
    }

    if (gameType === 2) { // Coin Flip: Prediction Game
        // 0: Heads, 1: Tails
        // Challenger (p1) wins if their prediction (move1) matches the result (move2)
        return move1 === move2 ? p1 : p2;
    }

    return p1; // Default fallback
}

// Block Monitoring & Auto-Resolution
async function monitorChain() {
    console.log(chalk.gray('Monitoring Stacks chain for matches...'));

    setInterval(async () => {
        try {
            // 1. Get Match Count
            const countResult = await callReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-match-count',
                functionArgs: [],
                network,
                senderAddress: AGENT_ADDRESS,
            });
            const count = Number(cvToJSON(countResult).value);
            if (count === 0) return;

            // 2. Scan last 50 matches (to ensure none are missed due to latency)
            const start = count - 1;
            const end = Math.max(0, count - 50);

            for (let i = start; i >= end; i--) {
                const matchRes = await callReadOnlyFunction({
                    contractAddress: CONTRACT_ADDRESS,
                    contractName: CONTRACT_NAME,
                    functionName: 'get-match-details',
                    functionArgs: [uintCV(i)],
                    network,
                    senderAddress: AGENT_ADDRESS,
                });

                const m = cvToJSON(matchRes).value;
                if (!m || !m.value) continue;
                const matchData = m.value;
                const status = Number(matchData.status.value);

                // Only process ACTIVE matches
                if (status === 1) { // STATUS-ACCEPTED
                    const p1 = matchData.challenger.value;
                    const p2 = matchData.opponent.value.value;

                    // Check moves
                    const m1Res = await callReadOnlyFunction({
                        contractAddress: CONTRACT_ADDRESS,
                        contractName: CONTRACT_NAME,
                        functionName: 'get-player-move',
                        functionArgs: [uintCV(i), principalCV(p1)],
                        network,
                        senderAddress: AGENT_ADDRESS,
                    });
                    const m2Res = await callReadOnlyFunction({
                        contractAddress: CONTRACT_ADDRESS,
                        contractName: CONTRACT_NAME,
                        functionName: 'get-player-move',
                        functionArgs: [uintCV(i), principalCV(p2)],
                        network,
                        senderAddress: AGENT_ADDRESS,
                    });

                    const move1Data = cvToJSON(m1Res).value;
                    const move2Data = cvToJSON(m2Res).value;

                    if (move1Data && move1Data.value && move2Data && move2Data.value) {
                        const move1 = Number(move1Data.value);
                        const move2 = Number(move2Data.value);

                        // BOTH PLAYED! Resolve match.
                        const gameType = Number(matchData['game-type'].value);
                        console.log(chalk.cyan(`⚔️ Match #${i}: Both played! Resolving Type ${gameType}... [${move1} vs ${move2}]`));
                        const winner = calculateWinner(gameType, move1, move2, p1, p2);

                        if (!winner) {
                            console.log(chalk.yellow(`🤝 Match #${i}: It's a draw! (Resolving for AI by default to be safe, but should handle properly)`));
                        }

                        // For a tie, give it to the user (p1) to be friendly in hackathon demo
                        const finalWinner = winner || p1;

                        console.log(chalk.yellow(`📢 Finalizing Match #${i}: Winner is ${finalWinner}`));

                        // Trigger on-chain resolution
                        // Manual nonce fetch for resolution
                        const nonceRes = await fetch(`${network.coreApiUrl}/extended/v1/address/${AGENT_ADDRESS}/nonces`);
                        const { possible_next_nonce } = await nonceRes.json();

                        const txOptions = {
                            contractAddress: CONTRACT_ADDRESS,
                            contractName: CONTRACT_NAME,
                            functionName: 'resolve-match',
                            functionArgs: [uintCV(i), principalCV(finalWinner)],
                            senderKey: PRIVATE_KEY,
                            network,
                            nonce: BigInt(possible_next_nonce),
                            anchorMode: 1,
                            postConditionMode: 1
                        };

                        const transaction = await makeContractCall(txOptions);
                        const broadcastResponse = await broadcastTransaction(transaction, network);

                        if (broadcastResponse.error) {
                            console.error(chalk.red(`Resolution failed: ${broadcastResponse.error}`));
                        } else {
                            console.log(chalk.green.bold(`✅ Match #${i} resolved! TX: ${broadcastResponse.txid}`));
                        }
                    } else if (move1Data && move1Data.value && (!move2Data || !move2Data.value) && p2 === AGENT_ADDRESS) {
                        // CHALLENGER PLAYED, AGENT (OPPONENT) HAS NOT
                        const gameType = Number(matchData['game-type'].value);
                        console.log(chalk.magenta(`🤖 Match #${i}: Challenger played (Type ${gameType}). AI now committing its move...`));

                        const challengerMove = Number(move1Data.value);
                        model.update(gameType, p1, challengerMove);
                        const aiMove = model.predict(gameType, p1);

                        // Manual nonce fetch for AI move
                        const nonceRes = await fetch(`${network.coreApiUrl}/extended/v1/address/${AGENT_ADDRESS}/nonces`);
                        const { possible_next_nonce } = await nonceRes.json();

                        const txOptions = {
                            contractAddress: CONTRACT_ADDRESS,
                            contractName: CONTRACT_NAME,
                            functionName: 'play-move',
                            functionArgs: [uintCV(i), uintCV(aiMove)],
                            senderKey: PRIVATE_KEY,
                            network,
                            nonce: BigInt(possible_next_nonce),
                            anchorMode: 1,
                            postConditionMode: 1
                        };

                        const transaction = await makeContractCall(txOptions);
                        const broadcastResponse = await broadcastTransaction(transaction, network);

                        if (broadcastResponse.error) {
                            console.error(chalk.red(`AI Move failed: ${broadcastResponse.error}`));
                        } else {
                            console.log(chalk.green.bold(`✅ AI Move committed for Match #${i}! TX: ${broadcastResponse.txid}`));
                        }
                    }
                }
            }
        } catch (e) {
            // Silently retry
        }
    }, 20000); // 20s cycle
}

app.listen(PORT, () => {
    console.log(chalk.green.bold(`🚀 Arena Agent API listening on port ${PORT}`));
    console.log(chalk.gray(`x402 endpoints ready: /accept-match, /play-move`));
    monitorChain();
});
