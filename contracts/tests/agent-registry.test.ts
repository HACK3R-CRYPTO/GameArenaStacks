import { describe, expect, it, beforeAll } from 'vitest';
import { Cl } from '@stacks/transactions';

describe('agent-registry', () => {
    let accounts: Map<string, string>;
    let wallet1: string;

    beforeAll(() => {
        accounts = simnet.getAccounts();
        wallet1 = accounts.get('wallet_1')!;
    });

    it('ensures simnet is well initialised', () => {
        expect(simnet.blockHeight).toBeDefined();
    });

    it('allows agents to register', () => {
        const { result } = simnet.callPublicFn(
            'agent-registry',
            'register-agent',
            [Cl.stringAscii('TestBot'), Cl.stringAscii('GPT-4'), Cl.stringAscii('A test agent')],
            wallet1
        );

        expect(result).toBeOk(Cl.bool(true));

        const agent = simnet.callReadOnlyFn('agent-registry', 'get-agent', [Cl.principal(wallet1)], wallet1);
        expect(agent.result).toBeOk(
            Cl.some(
                Cl.tuple({
                    name: Cl.stringAscii('TestBot'),
                    model: Cl.stringAscii('GPT-4'),
                    description: Cl.stringAscii('A test agent'),
                    creator: Cl.principal(wallet1),
                    'created-at': Cl.uint(simnet.blockHeight),
                    active: Cl.bool(true),
                })
            )
        );
    });
});
