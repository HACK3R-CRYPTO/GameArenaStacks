import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Zap } from 'lucide-react';
import {
    uintCV,
    noneCV,
    someCV,
    principalCV,
    callReadOnlyFunction,
    cvToJSON,
    standardPrincipalCV
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import axios from 'axios';
import { setupX402 } from 'x402-stacks/client';
import { toast } from 'react-hot-toast';

// Constants
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'arena-platform';
const AGENT_API_URL = 'http://localhost:3000'; // Agent's x402 API

const NETWORK_TYPE = 'testnet';
const network = NETWORK_TYPE === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

// Axios instance with x402 automation
const api = axios.create({ baseURL: AGENT_API_URL });

const GAME_TYPES = [
    { id: 0, label: 'Rock Paper Scissors', icon: '✊' },
    { id: 1, label: 'Dice Roll', icon: '🎲' },
    { id: 3, label: 'Coin Flip', icon: '🪙' }
];

const ArenaGame = ({ userSession, userData }) => {
    const [stxBalance, setStxBalance] = useState('0');
    const [wager, setWager] = useState('0.1');
    const [selectedGameType, setSelectedGameType] = useState(0);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initialize x402 client once userSession is available
    useEffect(() => {
        if (userSession) {
            setupX402(api, {
                userSession,
                network: NETWORK_TYPE
            });
        }
    }, [userSession]);

    const fetchBalance = useCallback(async () => {
        if (!userData) return;
        const address = userData.profile.stxAddress[NETWORK_TYPE];
        try {
            const response = await fetch(`https://stacks-node-api.${NETWORK_TYPE}.stacks.co/extended/v1/address/${address}/balances`);
            const data = await response.json();
            setStxBalance((parseInt(data.stx.balance) / 1000000).toFixed(2));
        } catch (e) {
            console.error('Failed to fetch balance', e);
        }
    }, [userData]);

    const fetchMatches = useCallback(async () => {
        try {
            // Read from Clarity contract
            const result = await callReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-match-details', // Assuming we have a helper or scan
                functionArgs: [uintCV(0)],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });
            // Parse result...
        } catch (e) {
            // console.error(e);
        }
    }, []);

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [fetchBalance]);

    const handleChallengeAgent = async () => {
        if (!userData) return toast.error('Connect wallet first');

        setLoading(true);
        const toastId = toast.loading('Initiating x402 challenge flow...');

        try {
            // This call will trigger the x402 payment flow automatically via setupX402
            const response = await api.post('/accept-match', {
                matchId: 0, // Placeholder
            });

            if (response.data.success) {
                toast.success('Agent accepted match via x402 payment!', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Challenge failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-mono text-gray-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tighter italic">
                        ARENA <span className="text-purple-500">x402</span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase">Stacks Migration Phase: Live</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-[#0a0a0a] border border-white/10 px-4 py-2 rounded">
                        <span className="text-[10px] text-gray-500 block uppercase">STX Balance</span>
                        <div className="text-white font-bold text-sm">{stxBalance} <span className="text-purple-500">STX</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-50"></div>

                        <div className="mb-8 text-center">
                            <div className="w-16 h-16 mx-auto bg-purple-900/20 rounded-full border border-purple-500/30 flex items-center justify-center text-3xl mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                🤖
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">NEURAL_ARENA_AGENT</h2>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                                Stacks identity verified. Machine-to-machine payments enabled via <span className="text-cyan-400">x402 protocol</span>.
                            </p>
                        </div>

                        {/* Game Selection */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {GAME_TYPES.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => setSelectedGameType(g.id)}
                                    className={`p-4 rounded border transition-all ${selectedGameType === g.id
                                        ? 'bg-purple-900/20 border-purple-500 text-white'
                                        : 'bg-black border-white/5 text-gray-500 hover:border-white/20'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{g.icon}</div>
                                    <div className="text-[10px] uppercase font-bold">{g.label}</div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleChallengeAgent}
                            disabled={loading || !userData}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-bold transition-all uppercase flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(147,51,234,0.3)]"
                        >
                            <Zap className={`w-4 h-4 ${loading ? 'animate-pulse' : 'group-hover:scale-125 transition-transform'}`} />
                            {loading ? 'EXECUTING_X402...' : 'CHALLENGE_AGENT_VIA_STX'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 h-[400px]">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                            Live_Protocol_Feed
                        </h3>
                        {/* Placeholder for real-time matches */}
                        <div className="h-full flex items-center justify-center text-[10px] text-gray-600 italic">
                            SCANNING_STACKS_BLOCKS...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArenaGame;
