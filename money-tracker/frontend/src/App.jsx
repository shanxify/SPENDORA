import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import MerchantMapping from './pages/MerchantMapping';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
