import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserSession, AppConfig } from '@stacks/connect';

import Navigation from './components/Navigation';
import ArenaGame from './pages/ArenaGame';
import LandingOverlay from './components/LandingOverlay';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((data) => {
        setUserData(data);
      });
    }
  }, []);

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(13, 13, 25, 0.9)',
          border: '1px solid rgba(0, 212, 255, 0.1)',
          color: '#fff',
          fontFamily: 'Orbitron, sans-serif',
        },
      }} />

      {/* Splash Screen */}
      {showSplash && (
        <LandingOverlay onEnter={() => setShowSplash(false)} />
      )}

      <Router>
        <div className="h-screen relative bg-[#050505] text-gray-200 selection:bg-purple-500/30 overflow-hidden flex flex-col">
          <Navigation userSession={userSession} userData={userData} setUserData={setUserData} />

          <div className="relative z-10 pt-16 grow overflow-hidden">
            <div className={`h-full ${showSplash ? 'blur-sm opacity-50 grayscale' : 'blur-0 opacity-100 grayscale-0'} transition-all duration-1000`}>
              <Routes>
                <Route path="/" element={<ArenaGame userSession={userSession} userData={userData} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </>
  );
}

export default App;
