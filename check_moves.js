
const { callReadOnlyFunction, cvToJSON, uintCV, principalCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');

const network = new StacksTestnet({ url: 'https://api.testnet.hiro.so' });
const DEPLOYER = 'ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA';
const CONTRACT = 'arena-platform-v2';

async function checkMoves() {
    const matchId = 2;
    const agentAddress = 'ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA';
    const userAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Default test address, will adjust if needed

    console.log(`Checking match ${matchId}...`);

    try {
        const agentMove = await callReadOnlyFunction({
            contractAddress: DEPLOYER,
            contractName: CONTRACT,
            functionName: 'get-player-move',
            functionArgs: [uintCV(matchId), principalCV(agentAddress)],
            network,
            senderAddress: DEPLOYER
        });
        console.log('Agent Move:', JSON.stringify(cvToJSON(agentMove)));

        const userMove = await callReadOnlyFunction({
            contractAddress: DEPLOYER,
            contractName: CONTRACT,
            functionName: 'get-player-move',
            functionArgs: [uintCV(matchId), principalCV(userAddress)],
            network,
            senderAddress: DEPLOYER
        });
        console.log('User Move:', JSON.stringify(cvToJSON(userMove)));

    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkMoves();
