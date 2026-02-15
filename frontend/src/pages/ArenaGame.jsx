import React, { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { Cl, Pc } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { openContractCall, openSTXTransfer } from '@stacks/connect';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Testnet Configuration
const DEPLOYER_ADDRESS = import.meta.env.VITE_DEPLOYER_ADDRESS || 'ST3V7NY32G2T67PVPBP3WVC1B228D7N2MCCAWW5F9';
const ARENA_CONTRACT = `${DEPLOYER_ADDRESS}.arena-platform`;
const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:3000';

const network = new StacksTestnet();

// Axios instance with x402 automation
const api = axios.create({ baseURL: AGENT_API_URL });

const GAME_TYPES = [
    { id: 0, label: 'Rock Paper Scissors', icon: '✊' },
    { id: 1, label: 'Dice Roll', icon: '🎲' },
    { id: 3, label: 'Coin Flip', icon: '🪙' },
];

const ArenaGame = ({ userSession, userData }) => {
    const [stxBalance, setStxBalance] = useState('0');
    const [wager, setWager] = useState('100000'); // 0.1 STX in microSTX
    const [selectedGameType, setSelectedGameType] = useState(0);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);



    const fetchBalance = useCallback(async () => {
        if (!userData) return;
        const address = userData.profile.stxAddress.testnet;
        try {
            const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${address}/balances`);
            const data = await response.json();
            setStxBalance((parseInt(data.stx.balance) / 1000000).toFixed(2));
        } catch (e) {
            console.error('Failed to fetch balance', e);
        }
    }, [userData]);

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [fetchBalance]);

    const handleProposeMatch = async () => {
        if (!userData) return toast.error('Connect wallet first');

        setLoading(true);
        const toastId = toast.loading('Proposing match on-chain...');

        try {
            const userAddress = userData.profile.stxAddress.testnet;

            // Post-condition: User will send exactly the wager amount
            const postConditions = [
                Pc.principal(userAddress)
                    .willSendEq(parseInt(wager))
                    .ustx()
            ];

            // Call propose-match function
            await openContractCall({
                contractAddress: DEPLOYER_ADDRESS,
                contractName: 'arena-platform',
                functionName: 'propose-match',
                functionArgs: [
                    Cl.none(), // opponent (none for open match)
                    Cl.uint(selectedGameType), // game-type
                    Cl.uint(wager) // wager in microSTX
                ],
                network,
                postConditions,
                postConditionMode: 1, // Deny mode
                onFinish: (data) => {
                    console.log('Match proposed:', data);
                    toast.success('Match proposed! TX: ' + data.txId, { id: toastId });
                    setTimeout(() => handleChallengeAgent(data.txId), 2000);
                },
                onCancel: () => {
                    toast.error('Transaction cancelled', { id: toastId });
                }
            });

            // Code moved to onFinish callback
        } catch (error) {
            console.error(error);
            toast.error('Failed to propose match', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleChallengeAgent = async (matchTxId) => {
        const toastId = toast.loading('Challenging agent via x402...');

        const processRequest = async (headers = {}) => {
            try {
                const response = await api.post('/accept-match', {
                    matchId: 0, // In real app, get ID from contract events. Using 0/dummy for now or matchTxId if backend supports it
                    matchTxId,
                    wager: parseInt(wager)
                }, { headers });

                if (response.data.success) {
                    toast.success('Agent accepted match via x402!', { id: toastId });
                    fetchMatches();
                }
            } catch (error) {
                if (error.response?.status === 402) {
                    const paymentInfo = error.response.data;
                    toast.loading(`x402: Payment required (${paymentInfo.accepts[0].amount} microSTX)`, { id: toastId });

                    // Trigger wallet payment
                    await openSTXTransfer({
                        recipient: paymentInfo.accepts[0].payTo,
                        amount: paymentInfo.accepts[0].amount,
                        memo: 'x402 Agent Fee',
                        network,
                        onFinish: (data) => {
                            toast.loading('Payment sent! Verifying with agent...', { id: toastId });
                            // Retry with payment proof
                            setTimeout(() => {
                                processRequest({
                                    'x-payment-proof': data.txId,
                                    'x-stacks-address': userData.profile.stxAddress.testnet
                                });
                            }, 2000);
                        },
                        onCancel: () => {
                            toast.error('Payment cancelled - Agent refused match', { id: toastId });
                        }
                    });
                } else {
                    console.error(error);
                    toast.error('Challenge failed', { id: toastId });
                }
            }
        };

        await processRequest();
    };

    return (
        <div className="font-mono text-gray-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tighter italic">
                        ARENA <span className="text-purple-500">x402</span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase">Stacks Testnet: Live</p>
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
                            <h2 className="text-xl font-bold text-white mb-2">MARKOV_AGENT</h2>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                                Stacks identity verified. Machine-to-machine payments enabled via <span className="text-cyan-400">x402 protocol</span>.
                            </p>
                        </div>

                        {/* Game Selection */}
                        <div className="grid grid-cols-1 gap-3 mb-6">
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

                        {/* Wager Input */}
                        <div className="mb-6">
                            <label className="text-xs text-gray-500 uppercase block mb-2">Wager (microSTX)</label>
                            <input
                                type="number"
                                value={wager}
                                onChange={(e) => setWager(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                                placeholder="100000"
                            />
                            <p className="text-[10px] text-gray-600 mt-1">
                                {(parseInt(wager) / 1000000).toFixed(6)} STX
                            </p>
                        </div>

                        <button
                            onClick={handleProposeMatch}
                            disabled={loading || !userData}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-bold transition-all uppercase flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Zap className={`w-4 h-4 ${loading ? 'animate-pulse' : 'group-hover:scale-125 transition-transform'}`} />
                            {loading ? 'EXECUTING...' : 'PROPOSE_MATCH_VIA_STX'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 h-[400px]">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                            Live_Match_Feed
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
