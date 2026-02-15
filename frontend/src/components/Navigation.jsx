import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { showConnect } from '@stacks/connect';

function Navigation({ userSession, userData, setUserData }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (userData) {
      const address = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
      setDisplayName(`${address.slice(0, 6)}...${address.slice(-4)}`);
    } else {
      setDisplayName('');
    }
  }, [userData]);

  const handleConnect = () => {
    showConnect({
      appDetails: {
        name: 'Arena Agent Stacks',
        icon: window.location.origin + '/favicon.ico',
      },
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const handleDisconnect = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: 'Arena' },
    { path: 'https://docs.x402stacks.xyz/', label: 'x402 Docs', external: true }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1000px] mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group no-underline">
          <div className="w-8 h-8 flex items-center justify-center rounded bg-purple-900/20 border border-purple-500/30">
            <span className="text-xl">⚔️</span>
          </div>
          <span className="font-mono text-lg font-bold text-white tracking-tight">ARENA_STACKS</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            link.external ? (
              <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-purple-400 hover:text-purple-300 transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.path} to={link.path} className={`font-mono text-sm tracking-wide transition-colors ${isActivePath(link.path) ? 'text-purple-400' : 'text-gray-500 hover:text-white'}`}>
                {link.label}
              </Link>
            )
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {userData ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="font-mono text-xs text-gray-300">{displayName}</span>
              </div>
              <button className="text-gray-500 hover:text-red-400 transition-colors" onClick={handleDisconnect} title="Disconnect">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          ) : (
            <button className="btn-primary px-5 py-2 rounded text-sm font-bold font-mono" onClick={handleConnect}>CONNECT_WALLET</button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
