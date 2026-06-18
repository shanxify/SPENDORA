import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import MerchantMapping from './pages/MerchantMapping';
import Login from './pages/Login';
import SoftAurora from './components/SoftAurora';
import IntroLoader from './components/IntroLoader';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [introLoading, setIntroLoading] = useState(true);

  // Show intro loader first (existing behavior — keep this)
  if (introLoading) {
    return <IntroLoader onFinish={() => setIntroLoading(false)} />;
  }

  // Wait for auth check to complete
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#060010'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(124,58,237,0.3)',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in — show login page only
  if (!user) {
    return <Login />;
  }

  // Logged in — show full app
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Router>
        <div className="relative min-h-screen bg-[#060010]">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <SoftAurora
              speed={0.6}
              scale={1.5}
              brightness={1}
              color1="#c084fc"
              color2="#6366f1"
              noiseFrequency={2.5}
              noiseAmplitude={1}
              bandHeight={0.5}
              bandSpread={1}
              octaveDecay={0.1}
              layerOffset={0}
              colorSpeed={1}
              enableMouseInteraction={false}
            />
          </div>
          <div className="relative z-10">
            <div className="flex h-screen bg-[#0A0A0F] text-text-primary font-sans overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto pl-60">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/merchants" element={<MerchantMapping />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </Router>
    </motion.div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
