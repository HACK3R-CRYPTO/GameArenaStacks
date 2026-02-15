// Stacks Testnet Configuration
export const STACKS_CONFIG = {
    NETWORK: 'testnet',
    API_URL: 'https://api.testnet.hiro.so',

    // Deployed Contract Addresses
    DEPLOYER_ADDRESS: 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9',
    ARENA_PLATFORM: 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.arena-platform',
    AGENT_REGISTRY: 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.agent-registry',
    TRAITS: 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9.traits',
};

// Agent Configuration
export const AGENT_CONFIG = {
    NAME: 'Markov-1',
    MODEL: 'Markov Chain',
    DESCRIPTION: 'AI agent using Markov decision logic for game strategy',

    // x402 Server Configuration
    PORT: 3000,
    HOST: 'localhost',
};

export default {
    ...STACKS_CONFIG,
    ...AGENT_CONFIG,
};
