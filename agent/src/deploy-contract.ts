import {
    makeContractDeploy,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent dir if needed, or current
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY is missing in .env');
}

const network = new StacksTestnet();

async function deploy() {
    console.log('Deploying arena-platform-v2...');

    // Path to contract file
    const contractPath = path.resolve(__dirname, '../../contracts/contracts/arena-platform.clar');

    if (!fs.existsSync(contractPath)) {
        throw new Error(`Contract file not found at ${contractPath}`);
    }

    const codeBody = fs.readFileSync(contractPath, 'utf8');

    const txOptions = {
        contractName: 'arena-platform-v2',
        codeBody,
        senderKey: PRIVATE_KEY,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractDeploy(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
        console.error('Broadcast failed:', broadcastResponse.error);
        console.error('Reason:', broadcastResponse.reason);
        return;
    }

    const txId = broadcastResponse.txid;
    console.log(`✅ Transaction broadcasted! TXID: ${txId}`);
    console.log(`Wait for confirmation...`);
}

deploy().catch(console.error);
