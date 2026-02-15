import { describe, expect, it, beforeAll } from 'vitest';
import { Cl } from '@stacks/transactions';

describe('ArenaPlatform Match Lifecycle', () => {
    let accounts: Map<string, string>;
    let deployer: string;
    let wallet1: string;
    let wallet2: string;

    beforeAll(() => {
        accounts = simnet.getAccounts();
        deployer = accounts.get('deployer')!;
        wallet1 = accounts.get('wallet_1')!;
        wallet2 = accounts.get('wallet_2')!;
    });

    it('should allow a player to propose a match', () => {
        const wager = 1000;
        const gameType = 0; // RPS

        const { result } = simnet.callPublicFn(
            'arena-platform',
            'propose-match',
            [Cl.none(), Cl.uint(gameType), Cl.uint(wager)],
            wallet1
        );

        expect(result).toBeOk(Cl.uint(0)); // First match ID should be 0

        const matchDetails = simnet.getDataVar('arena-platform', 'match-counter');
        expect(matchDetails).toBeUint(1);
    });

    it('should allow another player to accept an open match', () => {
        // First propose
        simnet.callPublicFn(
            'arena-platform',
            'propose-match',
            [Cl.none(), Cl.uint(0), Cl.uint(1000)],
            wallet1
        );

        // Then accept
        const { result } = simnet.callPublicFn(
            'arena-platform',
            'accept-match',
            [Cl.uint(0)],
            wallet2
        );

        expect(result).toBeOk(Cl.bool(true));
    });

    it('should allow players to play moves in an accepted match', () => {
        // Setup accepted match
        simnet.callPublicFn('arena-platform', 'propose-match', [Cl.none(), Cl.uint(0), Cl.uint(1000)], wallet1);
        simnet.callPublicFn('arena-platform', 'accept-match', [Cl.uint(0)], wallet2);

        // Challenger plays
        const res1 = simnet.callPublicFn('arena-platform', 'play-move', [Cl.uint(0), Cl.uint(1)], wallet1);
        expect(res1.result).toBeOk(Cl.bool(true));

        // Opponent plays
        const res2 = simnet.callPublicFn('arena-platform', 'play-move', [Cl.uint(0), Cl.uint(2)], wallet2);
        expect(res2.result).toBeOk(Cl.bool(true));
    });

    it('should allow the contract owner to resolve a match', () => {
        // Setup
        simnet.callPublicFn('arena-platform', 'propose-match', [Cl.none(), Cl.uint(0), Cl.uint(1000)], wallet1);
        simnet.callPublicFn('arena-platform', 'accept-match', [Cl.uint(0)], wallet2);
        simnet.callPublicFn('arena-platform', 'play-move', [Cl.uint(0), Cl.uint(1)], wallet1);
        simnet.callPublicFn('arena-platform', 'play-move', [Cl.uint(0), Cl.uint(2)], wallet2);

        // Resolve
        const { result } = simnet.callPublicFn(
            'arena-platform',
            'resolve-match',
            [Cl.uint(0), Cl.principal(wallet2)],
            deployer
        );

        expect(result).toBeOk(Cl.bool(true));
    });

    it('should prevent non-owners from resolving matches', () => {
        simnet.callPublicFn('arena-platform', 'propose-match', [Cl.none(), Cl.uint(0), Cl.uint(1000)], wallet1);
        simnet.callPublicFn('arena-platform', 'accept-match', [Cl.uint(0)], wallet2);

        const { result } = simnet.callPublicFn(
            'arena-platform',
            'resolve-match',
            [Cl.uint(0), Cl.principal(wallet2)],
            wallet1
        );

        expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
});
