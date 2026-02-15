
import { callReadOnlyFunction, cvToJSON, uintCV, principalCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

const network = new StacksTestnet({ url: 'https://api.testnet.hiro.so' });
const DEPLOYER = 'ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA';
const CONTRACT = 'arena-platform-v2';

async function checkMoves() {
    const matchId = 2;
    const agentAddress = 'ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA';
    // User address from match details hex: ST190LVSB7220NREESX2R6N0A89Q9BPD519A0A8H7 (calculated from hex)
    // Actually, I'll just check if ANY move is registered for the known addresses.
    const userAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

    console.log(`Checking match ${matchId} on-chain...`);

    try {
        const agentMove = await callReadOnlyFunction({
            contractAddress: DEPLOYER,
            contractName: CONTRACT,
            functionName: 'get-player-move',
            functionArgs: [uintCV(matchId), principalCV(agentAddress)],
            network,
            senderAddress: DEPLOYER
        });
        console.log('AGENT MOVE:', JSON.stringify(cvToJSON(agentMove)));

        // Try getting the challenger address from match details first
        const matchDetails = await callReadOnlyFunction({
            contractAddress: DEPLOYER,
            contractName: CONTRACT,
            functionName: 'get-match-details',
            functionArgs: [uintCV(matchId)],
            network,
            senderAddress: DEPLOYER
        });
        const details = cvToJSON(matchDetails).value;
        const challenger = details.value.challenger.value;
        const opponent = details.value.opponent.value?.value;

        console.log(`Challenger: ${challenger}`);
        console.log(`Opponent: ${opponent}`);

        const challengerMove = await callReadOnlyFunction({
            contractAddress: DEPLOYER,
            contractName: CONTRACT,
            functionName: 'get-player-move',
            functionArgs: [uintCV(matchId), principalCV(challenger)],
            network,
            senderAddress: DEPLOYER
        });
        console.log('CHALLENGER MOVE:', JSON.stringify(cvToJSON(challengerMove)));

        if (opponent) {
            const opponentMove = await callReadOnlyFunction({
                contractAddress: DEPLOYER,
                contractName: CONTRACT,
                functionName: 'get-player-move',
                functionArgs: [uintCV(matchId), principalCV(opponent)],
                network,
                senderAddress: DEPLOYER
            });
            console.log('OPPONENT MOVE:', JSON.stringify(cvToJSON(opponentMove)));
        }

    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

checkMoves();
