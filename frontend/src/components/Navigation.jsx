import { useState, useEffect } from 'react';
import { showConnect } from '@stacks/connect';

const Navigation = ({ userSession, userData, setUserData }) => {
  const [bns, setBns] = useState('');

  async function connectWallet() {
    try {
      showConnect({
        appDetails: {
          name: 'GameArena Stacks',
          icon: window.location.origin + '/logo.png',
        },
        redirectTo: '/',
        onFinish: () => {
          const userDataResult = userSession.loadUserData();
          setUserData(userDataResult);

          // Try to fetch BNS name
          const address = userDataResult.profile.stxAddress.testnet;
          getBns(address).then(setBns);
        },
        userSession,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }

  async function disconnectWallet() {
    userSession.signUserOut();
    setUserData(null);
    setBns('');
  }

  async function getBns(stxAddress) {
    try {
      const response = await fetch(`https://api.bnsv2.com/testnet/names/address/${stxAddress}/valid`);
      const data = await response.json();
      return data.names?.[0]?.full_name || '';
    } catch (error) {
      console.error('Failed to fetch BNS:', error);
      return '';
    }
  }

  const displayName = () => {
    if (!userData) return null;
    if (bns) return bns;
    const address = userData.profile.stxAddress.testnet;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1000px] mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🦞</div>
          <div>
            <h1 className="text-white font-bold tracking-tight">ARENA_CHAMPION</h1>
            <p className="text-[10px] text-gray-600 uppercase">Stacks Testnet</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {userData ? (
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 bg-purple-900/20 border border-purple-500/30 text-purple-400 rounded text-sm font-mono hover:bg-purple-900/30 transition-all"
            >
              {displayName()}
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-bold uppercase tracking-wider transition-all"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
