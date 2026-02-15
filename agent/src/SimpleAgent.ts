import express from 'express';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    uintCV,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// CONFIG
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const network = STACKS_TESTNET;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9';
const CONTRACT_NAME = 'arena-platform';
const PORT = process.env.PORT || 3000;

console.log(chalk.blue(`🤖 Arena Stacks Agent starting...`));
console.log(chalk.gray(`Network: Testnet`));
console.log(chalk.gray(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`));

// Simple endpoint to accept match
app.post('/accept-match', async (req, res) => {
    const { matchTxId, wager } = req.body;

    console.log(chalk.green(`📨 Received match acceptance request`));
    console.log(chalk.gray(`Match TX: ${matchTxId}`));
    console.log(chalk.gray(`Wager: ${wager} microSTX`));

    try {
        // For now, just return success
        // In production, this would call accept-match on the contract
        res.json({
            success: true,
            message: 'Agent ready to accept match',
            note: 'x402 integration pending - manual contract call required'
        });
    } catch (error) {
        console.error(chalk.red('Error:'), error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', agent: 'Arena Stacks Agent' });
});

app.listen(PORT, () => {
    console.log(chalk.green.bold(`🚀 Arena Agent API listening on port ${PORT}`));
    console.log(chalk.gray(`Endpoints: /accept-match, /health`));
    console.log(chalk.yellow(`⚠️  x402 integration pending - using simplified version for testing`));
});
