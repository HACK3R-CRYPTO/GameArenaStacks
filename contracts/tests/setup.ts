import { initSimnet } from '@stacks/clarinet-sdk';
import { getClarinetVitestsArgv } from '@stacks/clarinet-sdk/vitest';

// Initialize simnet and make it globally available
const simnetInstance = await initSimnet();
(globalThis as any).simnet = simnetInstance;

// Initialize global options for clarinet SDK
(globalThis as any).options = {
    clarinet: {
        ...getClarinetVitestsArgv(),
        manifestPath: './Clarinet.toml',
        initBeforeEach: false,
    },
};
