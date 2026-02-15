
import { makeContractCall, broadcastTransaction, uintCV, principalCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

const network = new StacksTestnet({ url: 'https://api.testnet.hiro.so' });
const DEPLOYER = 'ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA';
const CONTRACT = 'arena-platform-v2';
const PRIVATE_KEY = 'cc1a5d9041e27cf249d58ca665ec9deccef48f58f6819df1a7cad39d52319d8901';

async function resolveManual() {
    const matchId = 2;
    const winner = 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9'; // The user won (Rock vs Scissors)

    console.log(`Manually resolving match ${matchId}...`);

    try {
        const txOptions = {
            contractAddress: DEPLOYER,
            contractName: CONTRACT,
            functionName: 'resolve-match',
            functionArgs: [uintCV(matchId), principalCV(winner)],
            senderKey: PRIVATE_KEY,
            network,
            anchorMode: 1,
            postConditionMode: 1
        };

        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, network);

        if (broadcastResponse.error) {
            console.error('Resolution failed:', broadcastResponse.error);
        } else {
            console.log('✅ Match resolved! TX:', broadcastResponse.txid);
        }
    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

resolveManual();
