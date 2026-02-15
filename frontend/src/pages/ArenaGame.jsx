import React, { useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCw, BookOpen, HelpCircle, X } from 'lucide-react';
import { Cl, Pc, callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { openContractCall, openSTXTransfer } from '@stacks/connect';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Testnet Configuration (Updated to match actual deployment)
const DEPLOYER_ADDRESS = import.meta.env.VITE_DEPLOYER_ADDRESS || 'ST3273FDNHADRB84GK2C0GWQQW9WXZGR1V5GAR0MA';
const ARENA_CONTRACT = `${DEPLOYER_ADDRESS}.arena-platform-v2`;
const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:3000';

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

// Stacks Node Rotation for reliability
const STACKS_NODES = [
    'https://api.testnet.hiro.so',
    'https://stacks-node-api.testnet.stacks.co',
    'https://stacks-node-api.testnet.hiro.so'
];

const callReadOnlyWithRetry = async (options) => {
    let lastError;
    for (const nodeUrl of STACKS_NODES) {
        try {
            const networkWithNode = new StacksTestnet({ url: nodeUrl });
            return await callReadOnlyFunction({
                ...options,
                network: networkWithNode
            });
        } catch (e) {
            console.warn(`Node ${nodeUrl} failed, trying next...`, e);
            lastError = e;
            continue;
        }
    }
    throw lastError;
};

const network = new StacksTestnet({ url: STACKS_NODES[0] });

// Axios instance with x402 automation
const api = axios.create({ baseURL: AGENT_API_URL });

const GAME_TYPES = [
    { id: 0, label: 'Rock Paper Scissors', icon: '✊' },
    { id: 1, label: 'Dice Roll', icon: '🎲' },
    { id: 2, label: 'Coin Flip', icon: '🪙' },
];

const getMoveData = (gameType, move) => {
    if (move === undefined || move === null) return { name: '?', icon: '🎮' };
    if (gameType === 0) { // RPS
        const names = ['ROCK', 'PAPER', 'SCISSORS'];
        const icons = ['✊', '✋', '✌️'];
        return { name: names[move] || '?', icon: icons[move] || '🎮' };
    }
    if (gameType === 1) { // Dice
        return { name: (parseInt(move) + 1).toString(), icon: '🎲' };
    }
    if (gameType === 2) { // Coin
        return { name: parseInt(move) === 0 ? 'HEADS' : 'TAILS', icon: '🪙' };
    }
    return { name: '?', icon: '🎮' };
};

const getMoveOptions = (gameType) => {
    if (gameType === 0) return [
        { value: 0, label: 'ROCK', icon: '✊' },
        { value: 1, label: 'PAPER', icon: '✋' },
        { value: 2, label: 'SCISSORS', icon: '✌️' }
    ];
    if (gameType === 1) return [1, 2, 3, 4, 5, 6].map(v => ({ value: v - 1, label: v.toString(), icon: '🎲' }));
    if (gameType === 2) return [
        { value: 0, label: 'HEADS', icon: '🪙' },
        { value: 1, label: 'TAILS', icon: '🪙' }
    ];
    return [];
};

const ArenaGame = ({ userSession, userData }) => {
    const [stxBalance, setStxBalance] = useState('0');
    const [wager, setWager] = useState('0.1'); // Wager in STX
    const [selectedGameType, setSelectedGameType] = useState(0);
    const [matches, setMatches] = useState([]);
    const [matchCount, setMatchCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pendingTxs, setPendingTxs] = useState({}); // { [matchId]: { type: 'user'|'agent', txId: string } }
    const [agentOnline, setAgentOnline] = useState(true);
    const [showHelp, setShowHelp] = useState(false);



    const fetchBalance = useCallback(async () => {
        if (!userData) return;
        const address = userData.profile.stxAddress.testnet;
        for (const nodeUrl of STACKS_NODES) {
            try {
                const response = await fetchWithTimeout(`${nodeUrl}/extended/v1/address/${address}/balances`);
                if (!response.ok) throw new Error('Balance fetch failed');
                const data = await response.json();
                setStxBalance((parseInt(data.stx.balance) / 1000000).toFixed(2));
                return; // Success
            } catch (e) {
                console.warn(`Balance fetch failed for ${nodeUrl}, trying next...`);
            }
        }
    }, [userData]);

    useEffect(() => {
        if (userData) {
            fetchBalance();
        }
        const interval = setInterval(fetchBalance, 60000); // 60s for general balance
        return () => clearInterval(interval);
    }, [fetchBalance, userData]);

    const fetchMatches = useCallback(async () => {
        if (!userData) return;
        const address = userData.profile.stxAddress.testnet;

        try {
            // Get match counter
            const countResult = await callReadOnlyWithRetry({
                contractAddress: DEPLOYER_ADDRESS,
                contractName: 'arena-platform-v2',
                functionName: 'get-match-count',
                functionArgs: [],
                senderAddress: address,
            });

            const count = parseInt(cvToJSON(countResult).value);
            console.log('Total matches:', count);
            setMatchCount(count);

            if (count > 0) {
                // Fetch last 20 matches in parallel for global feed
                const limit = 20;
                const start = count - 1;
                const end = Math.max(0, count - limit);

                const queries = [];
                for (let i = start; i >= end; i--) {
                    queries.push(
                        callReadOnlyWithRetry({
                            contractAddress: DEPLOYER_ADDRESS,
                            contractName: 'arena-platform-v2',
                            functionName: 'get-match-details',
                            functionArgs: [uintCV(i)],
                            senderAddress: address,
                        })
                            .then(res => ({ id: i, res }))
                            .catch(e => ({ id: i, error: e }))
                    );
                }

                const results = await Promise.all(queries);
                const parsedMatches = [];

                // Parallel fetch for moves for relevant matches
                const moveQueries = [];

                results.forEach(({ id, res, error }) => {
                    if (error || !res) return;

                    const tupleRes = cvToJSON(res).value;
                    if (tupleRes && tupleRes.value) {
                        const matchData = tupleRes.value;
                        const status = parseInt(matchData.status.value);
                        const statusText = status === 0 ? 'Pending' : status === 1 ? 'Active' : 'Completed';
                        const challenger = matchData.challenger.value;
                        const opponent = matchData.opponent.value?.value;

                        const match = {
                            id: id,
                            challenger,
                            opponent,
                            gameType: parseInt(matchData['game-type'].value),
                            wager: parseInt(matchData.wager.value),
                            status: statusText,
                            winner: matchData.winner.value?.value
                        };
                        parsedMatches.push(match);

                        // Fetch challenger move
                        moveQueries.push(
                            callReadOnlyWithRetry({
                                contractAddress: DEPLOYER_ADDRESS,
                                contractName: 'arena-platform-v2',
                                functionName: 'get-player-move',
                                functionArgs: [uintCV(id), Cl.principal(challenger)],
                                senderAddress: challenger,
                            }).then(moveRes => {
                                const val = cvToJSON(moveRes).value;
                                if (val) match.challengerMove = parseInt(val.value);
                            }).catch(() => { })
                        );

                        // Fetch opponent move if exists
                        if (opponent) {
                            moveQueries.push(
                                callReadOnlyWithRetry({
                                    contractAddress: DEPLOYER_ADDRESS,
                                    contractName: 'arena-platform-v2',
                                    functionName: 'get-player-move',
                                    functionArgs: [uintCV(id), Cl.principal(opponent)],
                                    senderAddress: opponent,
                                }).then(moveRes => {
                                    const val = cvToJSON(moveRes).value;
                                    if (val) match.opponentMove = parseInt(val.value);
                                }).catch(() => { })
                            );
                        }
                    }
                });

                await Promise.all(moveQueries);
                setMatches(parsedMatches);
            } else {
                setMatches([]);
            }

        } catch (e) {
            console.error('Failed to fetch matches', e);
        }
    }, [userData, pendingTxs]);

    useEffect(() => {
        if (userData) {
            fetchBalance();
            fetchMatches();
        }
        const interval = setInterval(() => {
            if (userData) {
                fetchBalance();
                fetchMatches();
            }
        }, 60000); // 60s polling for global state
        return () => clearInterval(interval);
    }, [userData, fetchBalance, fetchMatches]);

    // Targeted Transaction Polling (BitSubs Pattern)
    useEffect(() => {
        const pendingIds = Object.keys(pendingTxs);
        if (pendingIds.length === 0) return;

        console.log('📡 Starting Targeted Polling for:', pendingIds);

        const txPollInterval = setInterval(async () => {
            for (const matchId of pendingIds) {
                const pending = pendingTxs[matchId];
                if (!pending || !pending.txId) continue;

                try {
                    const response = await fetchWithTimeout(`https://api.testnet.hiro.so/extended/v1/tx/${pending.txId}`);
                    if (response.ok) {
                        const txData = await response.json();
                        console.log(`🔍 TX ${pending.txId.slice(0, 10)} status: ${txData.tx_status}`);

                        if (txData.tx_status === 'success' || txData.tx_status === 'abort_by_response') {
                            if (txData.tx_status === 'success') {
                                toast.success(`Transaction Confirmed!`, { id: pending.txId });
                            } else {
                                toast.error(`Transaction Failed: ${txData.tx_result?.repr || 'Aborted'}`);
                            }

                            // Cleanup and refresh
                            setPendingTxs(prev => {
                                const next = { ...prev };
                                delete next[matchId];
                                return next;
                            });
                            fetchMatches();
                            fetchBalance();
                        }
                    }
                } catch (e) {
                    // Silently ignore network errors during high-frequency polling
                }
            }
        }, 5000); // Poll every 5s for pending transactions

        return () => clearInterval(txPollInterval);
    }, [pendingTxs, fetchMatches, fetchBalance]);

    const handleProposeMatch = async () => {
        if (!userData) return toast.error('Connect wallet first');

        setLoading(true);
        const toastId = toast.loading('Proposing match on-chain...');

        try {
            const userAddress = userData.profile.stxAddress.testnet;

            // Post-condition: User will send exactly the wager amount
            const postConditions = [
                Pc.principal(userAddress)
                    .willSendEq(Math.floor(parseFloat(wager) * 1000000))
                    .ustx()
            ];

            // Call propose-match function
            await openContractCall({
                contractAddress: DEPLOYER_ADDRESS,
                contractName: 'arena-platform-v2',
                functionName: 'propose-match',
                functionArgs: [
                    Cl.none(), // opponent (none for open match)
                    Cl.uint(selectedGameType), // game-type
                    Cl.uint(Math.floor(parseFloat(wager) * 1000000)) // wager in microSTX
                ],
                network,
                postConditions,
                postConditionMode: 1, // Deny mode
                onFinish: (data) => {
                    console.log('Match proposed:', data);
                    toast.success('Match proposed! TX: ' + data.txId, { id: toastId });
                    setPendingTxs(prev => ({ ...prev, [matchCount]: { type: 'proposal', txId: data.txId } }));
                    // Use current matchCount as the new match ID (since it's next)
                    setTimeout(() => handleChallengeAgent(data.txId, matchCount), 2000);
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

    const handleChallengeAgent = async (matchTxId, predictedMatchId) => {
        const toastId = toast.loading(`Challenging agent for Match #${predictedMatchId}...`);

        const processRequest = async (headers = {}) => {
            try {
                const response = await api.post('/accept-match', {
                    matchId: predictedMatchId,
                    matchTxId,
                    wager: Math.floor(parseFloat(wager) * 1000000)
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

    // New function to handle triggering Agent move with x402 support
    const triggerAgentMove = async (matchId) => {
        const toastId = toast.loading(`Signaling Agent to play for Match #${matchId}...`);

        const processRequest = async (headers = {}) => {
            try {
                const response = await api.post('/play-move', { matchId }, { headers });
                if (response.data.txId) {
                    setPendingTxs(prev => ({ ...prev, [matchId]: { type: 'agent', txId: response.data.txId } }));
                }
                toast.success('Agent signaled to play!', { id: toastId });
                fetchMatches();
            } catch (error) {
                if (error.response?.status === 402) {
                    const paymentInfo = error.response.data;
                    toast.loading(`x402: Agent Move Fee (${paymentInfo.accepts[0].amount} microSTX)`, { id: toastId });

                    // Trigger wallet payment
                    await openSTXTransfer({
                        recipient: paymentInfo.accepts[0].payTo,
                        amount: paymentInfo.accepts[0].amount,
                        memo: 'x402 Agent Move Fee',
                        network,
                        onFinish: (data) => {
                            toast.loading('Payment sent! Re-signaling agent...', { id: toastId });
                            // Retry with payment proof
                            setTimeout(() => {
                                processRequest({
                                    'x-payment-proof': data.txId,
                                    'x-stacks-address': userData.profile.stxAddress.testnet
                                });
                            }, 2000);
                        },
                        onCancel: () => {
                            toast.error('Payment cancelled', { id: toastId });
                        }
                    });
                } else {
                    console.error(error);
                    toast.error('Failed to signal agent', { id: toastId });
                }
            }
        };

        await processRequest();
    };

    const handlePlayMove = async (matchId, move) => {
        setLoading(true);
        const match = matches.find(m => m.id === matchId);
        const moveName = getMoveData(match?.gameType ?? 0, move).name;
        const toastId = toast.loading(`Playing move: ${moveName}...`);

        try {
            await openContractCall({
                contractAddress: DEPLOYER_ADDRESS,
                contractName: 'arena-platform-v2',
                functionName: 'play-move',
                functionArgs: [
                    Cl.uint(matchId),
                    Cl.uint(move)
                ],
                network,
                onFinish: (data) => {
                    toast.success('Move played! TX: ' + data.txId, { id: toastId });
                    setPendingTxs(prev => ({ ...prev, [matchId]: { type: 'user', txId: data.txId } }));

                    // Trigger agent to play/resolve with proper x402 handling
                    setTimeout(() => {
                        triggerAgentMove(matchId);
                    }, 5000);
                },
                onCancel: () => {
                    toast.error('Move cancelled', { id: toastId });
                }
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to play move', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-mono text-gray-300 h-full overflow-hidden flex flex-col max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch grow overflow-hidden pb-4 max-h-[calc(100vh-80px)]">
                {/* Center Content: Challenge AI */}
                <div className="lg:col-span-8 h-full">
                    <div className="bg-[#060606] border border-white/10 rounded overflow-hidden shadow-2xl relative h-full flex flex-col justify-center">
                        <div className="px-12 text-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent">
                            <div className="w-20 h-20 mx-auto bg-purple-900/20 rounded-full border border-purple-500/30 flex items-center justify-center text-4xl mb-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20">
                                🤖
                            </div>
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Challenge_The_AI</h2>
                                <button
                                    onClick={() => setShowHelp(true)}
                                    className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-purple-400 transition-all border border-white/5"
                                    title="How to Play"
                                >
                                    <HelpCircle size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed mb-6 font-medium">
                                Autonomous agent initialized. Select game type to begin your wager-based challenge.
                            </p>

                            {/* Game Selection */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {GAME_TYPES.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => setSelectedGameType(g.id)}
                                        className={`p-6 rounded-sm border-2 transition-all group flex flex-col items-center gap-3 ${selectedGameType === g.id
                                            ? 'bg-purple-950/30 border-purple-500 ring-4 ring-purple-500/10'
                                            : 'bg-black border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`text-4xl transition-transform ${selectedGameType === g.id ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>{g.icon}</div>
                                        <div className={`text-[10px] uppercase font-black tracking-widest ${selectedGameType === g.id ? 'text-white' : 'text-gray-600'}`}>
                                            {g.label.replace(' ', '-').replace(' ', '-')}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Wager Controls */}
                            <div className="max-w-md mx-auto bg-black/50 border border-white/5 p-6 rounded-sm mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-left">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Wager Amount</label>
                                        <div className="flex items-center gap-3">
                                            <span className="text-purple-500 font-black text-lg italic uppercase">STX</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={wager}
                                                onChange={(e) => setWager(e.target.value)}
                                                className="bg-transparent text-3xl font-black text-white focus:outline-none w-28 border-b border-white/10 focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Potential Win</div>
                                        <div className="text-green-500 font-black text-lg">{(parseFloat(wager) * 1.96).toFixed(3)} <span className="text-[8px] uppercase">STX</span></div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleProposeMatch}
                                disabled={loading || !userData}
                                className="w-full max-w-md py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-sm text-lg font-black transition-all uppercase tracking-widest shadow-[0_0_50px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute top-1 right-2 text-[8px] text-purple-200 font-bold tracking-tighter animate-pulse">POWERED_BY_X402</div>
                                <span className="flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>EXECUTING...</>
                                    ) : (
                                        <>INITIATE_CHALLENGE</>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                    {/* Your Matches Section */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded overflow-hidden flex flex-col h-[45%]">
                        <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/5">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">YOUR_MATCHES</h3>
                            <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                                {matches.filter(m => {
                                    const userAddr = userData?.profile?.stxAddress?.testnet;
                                    return m.challenger === userAddr || m.opponent === userAddr;
                                }).filter(m => m.status === 'Active').length} ACTIVE
                            </span>
                        </div>
                        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar grow">
                            {(() => {
                                const userAddr = userData?.profile?.stxAddress?.testnet;
                                const myMatches = matches.filter(m => m.challenger === userAddr || m.opponent === userAddr);

                                if (myMatches.length === 0) {
                                    return <div className="text-center py-8 text-[10px] text-gray-600 font-bold uppercase tracking-widest">EMPTY_HISTORY</div>;
                                }

                                return myMatches.map(m => {
                                    const isPending = pendingTxs[m.id];
                                    const isWin = m.status === 'Completed' && m.winner === userAddr;
                                    const isLoss = m.status === 'Completed' && m.winner && m.winner !== userAddr;
                                    const myMove = m.challenger === userAddr ? m.challengerMove : m.opponentMove;
                                    const opponentMove = m.challenger === userAddr ? m.opponentMove : m.challengerMove;

                                    return (
                                        <div key={m.id} className="bg-white/5 border border-white/5 rounded p-3 relative overflow-hidden group hover:border-white/20 transition-all">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex gap-3 items-center">
                                                    <div className="text-2xl opacity-80">{GAME_TYPES.find(gt => gt.id === m.gameType)?.icon || '🎮'}</div>
                                                    <div>
                                                        <div className="text-xs font-black text-white flex items-center gap-2">
                                                            #{m.id}
                                                            {m.status === 'Completed' ? (
                                                                <span className="text-[8px] text-purple-400 font-bold">
                                                                    [{getMoveData(m.gameType, myMove).name} VS {getMoveData(m.gameType, opponentMove).name}]
                                                                </span>
                                                            ) : (
                                                                myMove !== undefined && <span className="text-[8px] text-purple-400 font-bold">[{getMoveData(m.gameType, myMove).name}]</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{m.status}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-purple-500 flex items-center justify-end gap-1">
                                                        {(m.wager / 1000000).toFixed(1)} <span className="text-[8px] font-bold">STX</span>
                                                    </div>
                                                    {m.status === 'Active' && !isPending && (
                                                        <button
                                                            onClick={() => {/* Scroll or Handle Move */ }}
                                                            className="mt-2 bg-purple-600 hover:bg-purple-500 text-[8px] font-black px-3 py-1 rounded-sm text-white uppercase tracking-tighter transition-all shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                                                        >
                                                            {myMove !== undefined ? 'WAITING_OPPONENT' : 'PLAY_MOVE'}
                                                        </button>
                                                    )}
                                                    {isWin && (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(34,197,94,0.3)]">YOU WON</span>
                                                            <span className="text-[6px] text-gray-600 font-bold uppercase tracking-tighter">X402_AUTH_PAYOUT</span>
                                                        </div>
                                                    )}
                                                    {isLoss && (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded">YOU LOST</span>
                                                            <span className="text-[6px] text-gray-600 font-bold uppercase tracking-tighter">X402_SETTLED</span>
                                                        </div>
                                                    )}
                                                    {isPending && <span className="text-[8px] font-black text-cyan-500 animate-pulse uppercase">PROCESSING_X402...</span>}
                                                </div>
                                            </div>

                                            {/* Inline Move Picker for Active Match - only if I haven't played */}
                                            {m.status === 'Active' && !isPending && myMove === undefined && (
                                                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5">
                                                    {getMoveOptions(m.gameType).map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handlePlayMove(m.id, opt.value)}
                                                            className="bg-black hover:bg-white/5 text-[8px] font-bold py-1.5 rounded border border-white/5 text-gray-400 flex items-center justify-center gap-1 transition-colors"
                                                        >
                                                            <span className="opacity-50">{opt.icon}</span> {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Global History Feed */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded overflow-hidden flex flex-col h-[55%]">
                        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                                ON_CHAIN_EVENTS
                            </h3>
                            <div className="flex gap-3 text-[8px] font-black text-gray-600 uppercase">
                                <span className="text-purple-500 border-b border-purple-500">LIVE_HISTORY</span>
                                <span className="hover:text-gray-400 cursor-pointer">HALL_OF_FAME</span>
                            </div>
                        </div>
                        <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar grow">
                            {matches.length === 0 ? (
                                <div className="h-full py-12 flex items-center justify-center text-[10px] text-gray-700 italic font-bold uppercase tracking-widest">
                                    SYNCHRONIZING_BLOCKCHAIN...
                                </div>
                            ) : (
                                matches.map(m => {
                                    const isMe = userData?.profile?.stxAddress?.testnet === m.challenger || userData?.profile?.stxAddress?.testnet === m.opponent;
                                    const isWin = m.status === 'Completed' && (m.winner === m.challenger || m.winner === m.opponent);

                                    const challengerMoveStr = getMoveData(m.gameType, m.challengerMove).name;
                                    const opponentMoveStr = getMoveData(m.gameType, m.opponentMove).name;

                                    return (
                                        <div key={m.id} className="text-[10px] border-b border-white/5 pb-3 last:border-0 hover:bg-white/5 transition-all p-1 rounded-sm cursor-default">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-gray-600 font-bold tracking-tighter">#{m.id}</span>
                                                <div className="flex gap-2 items-center">
                                                    {m.status === 'Completed' ? (
                                                        <div className="flex gap-1 items-center bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                                            <span className="text-purple-400 text-[8px] font-black">{challengerMoveStr}</span>
                                                            <span className="text-gray-600 text-[7px] font-bold">VS</span>
                                                            <span className="text-purple-400 text-[8px] font-black">{opponentMoveStr}</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {m.challengerMove !== undefined && <span className="text-purple-500/50 text-[8px] font-black">{challengerMoveStr}</span>}
                                                            {m.opponentMove !== undefined && <span className="text-purple-500/50 text-[8px] font-black">{opponentMoveStr}</span>}
                                                        </>
                                                    )}
                                                    <span className="text-gray-600 font-bold uppercase italic ml-1">{GAME_TYPES.find(gt => gt.id === m.gameType)?.label || 'BATTLE'}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={isMe && m.challenger === userData?.profile?.stxAddress?.testnet ? 'text-purple-500 font-black' : 'text-gray-400'}>
                                                            {isMe && m.challenger === userData?.profile?.stxAddress?.testnet ? 'YOU' : `${m.challenger.slice(0, 4)}...${m.challenger.slice(-4)}`}
                                                        </span>
                                                        <span className="text-gray-700 font-bold">vs</span>
                                                        <span className={isMe && m.opponent === userData?.profile?.stxAddress?.testnet ? 'text-purple-500 font-black' : 'text-gray-400'}>
                                                            {isMe && m.opponent === userData?.profile?.stxAddress?.testnet ? 'YOU' : (m.opponent ? `${m.opponent.slice(0, 4)}...${m.opponent.slice(-4)}` : '0x2E...7Ad1')}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-500 font-black tracking-widest uppercase">{(m.wager / 1000000).toFixed(2)} STX</div>
                                                </div>
                                                <div className="text-right">
                                                    {m.status === 'Completed' ? (
                                                        <span className={`px-2 py-0.5 rounded-sm font-black italic shadow-[0_0_10px_rgba(0,0,0,0.5)] ${m.winner === m.challenger ? 'bg-purple-600 text-white' : 'bg-red-900/40 text-red-500 border border-red-500/20'}`}>
                                                            {m.winner === m.challenger ? 'CHALLENGER_WIN' : (m.winner === m.opponent ? 'OPPONENT_WIN' : 'AI_WIN')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-600 uppercase font-black tracking-tighter bg-white/5 px-2 py-0.5 rounded-sm border border-white/5">
                                                            {m.status === 'Active' ? 'WAITING...' : 'PENDING'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div >
            {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
        </div >
    );
};

// Help Overlay Component
const HelpOverlay = ({ onClose }) => (
    <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-lg max-w-lg w-full p-8 shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 tracking-tighter">
                <HelpCircle className="text-purple-500" /> ARENA_GUIDE
            </h2>
            <div className="space-y-6 text-sm">
                <div>
                    <h3 className="text-purple-400 font-bold uppercase mb-2 text-xs tracking-widest">Rock-Paper-Scissors</h3>
                    <p className="text-gray-400 leading-relaxed">
                        Standard rules: Rock beats Scissors, Scissors beats Paper, Paper beats Rock. Winner takes the pot minus 2% fee.
                    </p>
                </div>
                <div>
                    <h3 className="text-purple-400 font-bold uppercase mb-2 text-xs tracking-widest">Dice Roll</h3>
                    <p className="text-gray-400 leading-relaxed">
                        Both players roll a 6-sided die. Higher number Wins. If rolls are equal, it defaults to p1 or resolves based on parity.
                    </p>
                </div>
                <div>
                    <h3 className="text-purple-400 font-bold uppercase mb-2 text-xs tracking-widest">Coin Flip</h3>
                    <p className="text-gray-400 leading-relaxed">
                        A prediction game. You (Challenger) choose Heads or Tails. If your choice matches the AI's result, you Win!
                    </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-600 italic">
                        All matches use x402 protocol for agent automation and are secured by Stacks smart contracts.
                    </p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="w-full mt-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest text-xs transition-all"
            >
                UNDERSTOOD
            </button>
        </div>
    </div>
);

export default ArenaGame;
