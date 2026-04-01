import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import MerchantMapping from './pages/MerchantMapping';
import SoftAurora from './components/SoftAurora';
import IntroLoader from './components/IntroLoader';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <IntroLoader onFinish={() => setLoading(false)} />}
      
      {!loading && (
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
      )}
    </>
  );
}

export default App;
