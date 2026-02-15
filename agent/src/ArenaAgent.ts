import express from 'express';
import { paymentMiddleware, getPayment, STXtoMicroSTX } from 'x402-stacks/express';
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
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const app = express();
app.use(express.json());

// CONFIG
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const NETWORK_TYPE = process.env.NETWORK_TYPE || 'testnet'; // 'mainnet' or 'testnet'
const network = NETWORK_TYPE === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const AGENT_ADDRESS = getAddressFromPrivateKey(PRIVATE_KEY, NETWORK_TYPE === 'mainnet' ? TransactionVersion.Mainnet : TransactionVersion.Testnet);

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9';
const CONTRACT_NAME = 'arena-platform';

const PORT = process.env.PORT || 3000;

console.log(chalk.blue(`🤖 Arena Stacks Agent starting...`));
console.log(chalk.blue(`Wallet: ${AGENT_ADDRESS}`));

// AI Logic: Markov Chain for Opponent Modeling (Ported)
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
        if (gameType === 0) return (predictedMove + 1) % 3; // RPS counter
        if (gameType === 1) return Math.random() > 0.3 ? 5 : Math.floor(Math.random() * 6); // Dice favor 6
        return Math.random() > 0.5 ? predictedMove : 1 - predictedMove; // Coinflip
    }
}

const model = new OpponentModel();

// x402 Endpoints
app.post('/accept-match',
    paymentMiddleware({
        amount: STXtoMicroSTX(0.001), // Fee to use the agent
        payTo: AGENT_ADDRESS,
        network: NETWORK_TYPE as any,
        facilitatorUrl: 'https://v2.x402stacks.xyz'
    }),
    async (req, res) => {
        const { matchId } = req.body;
        const payment = getPayment(req);

        console.log(chalk.green(`Payment verified: ${payment.transactionId}`));

        try {
            // Call Clarity Contract to accept match
            const txOptions = {
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'accept-match',
                functionArgs: [uintCV(matchId)],
                senderKey: PRIVATE_KEY,
                validateWithKnownAbi: true,
                network,
                anchorMode: AnchorMode.Any,
                postConditionMode: PostConditionMode.Allow,
            };

            const transaction = await makeContractCall(txOptions);
            const broadcastResponse = await broadcastTransaction(transaction, network);

            res.json({
                success: true,
                txid: broadcastResponse.txid,
                message: 'Match accepted on Stacks'
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
);

app.post('/play-move',
    paymentMiddleware({
        amount: STXtoMicroSTX(0.0005),
        payTo: AGENT_ADDRESS,
        network: NETWORK_TYPE as any,
        facilitatorUrl: 'https://v2.x402stacks.xyz'
    }),
    async (req, res) => {
        const { matchId, move } = req.body;

        try {
            const txOptions = {
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'play-move',
                functionArgs: [uintCV(matchId), uintCV(move)],
                senderKey: PRIVATE_KEY,
                network,
                anchorMode: AnchorMode.Any,
                postConditionMode: PostConditionMode.Allow,
            };

            const transaction = await makeContractCall(txOptions);
            const broadcastResponse = await broadcastTransaction(transaction, network);

            res.json({
                success: true,
                txid: broadcastResponse.txid
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Block Monitoring (instead of EVM real-time events)
async function monitorChain() {
    console.log(chalk.gray('Monitoring Stacks chain for matches...'));
    // In a real hackathon project, we'd use a Stacks API websocket or poll the API
    // For this MVP, we poll the matchCounter and check state
    setInterval(async () => {
        try {
            const options = {
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-match-details', // Need to check how to get match counter
                functionArgs: [uintCV(0)], // Placeholder
                network,
                senderAddress: AGENT_ADDRESS,
            };
            // Logic to scan matches...
        } catch (e) {
            // console.error(e);
        }
    }, 10000);
}

app.listen(PORT, () => {
    console.log(chalk.green.bold(`🚀 Arena Agent API listening on port ${PORT}`));
    console.log(chalk.gray(`x402 endpoints ready: /accept-match, /play-move`));
    monitorChain();
});
