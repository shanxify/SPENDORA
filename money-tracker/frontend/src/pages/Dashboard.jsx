import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowDown, ArrowUp, Activity, Hash, FilterX } from 'lucide-react';
import Client from '../api/client';
import TopNav from '../components/Layout/TopNav';
import StatCard from '../components/Dashboard/StatCard';
import CategoryBreakdown from '../components/Dashboard/CategoryBreakdown';
import MonthlySummary from '../components/Dashboard/MonthlySummary';
import SpendingPieChart from '../components/Charts/SpendingPieChart';
import MonthlyBarChart from '../components/Charts/MonthlyBarChart';
import BorderGlow from '../components/BorderGlow';
import GlareHover from '../components/GlareHover';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [openingBalance, setOpeningBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("openingBalance");
    if (saved !== null) {
      setOpeningBalance(Number(saved));
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log("FILTER:", fromDate, toDate);
      const [txRes, catRes] = await Promise.all([
        Client.getTransactions({
          fromDate,
          toDate,
          page: 1,
          limit: 1000
        }),
        Client.getCategories()
      ]);
      setTransactions(txRes.data || []);
      setApiCategories(catRes || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetDates = () => {
    setFromDate("");
    setToDate("");
  };

  // Re-calculate stats on the frontend
  const stats = useMemo(() => {
    const debits = transactions.filter(t => t.type === 'debit' && t.status !== 'Failed');
    const credits = transactions.filter(t => t.type === 'credit' && t.status !== 'Failed');

    const expenses = debits.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const income = credits.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const net = (openingBalance || 0) + income - expenses;

    const totals = {
      expenses: Math.round(expenses * 100) / 100,
      income: Math.round(income * 100) / 100,
      net: Math.round(net * 100) / 100,
      transactionCount: transactions.length
    };

    // Category Breakdown
    const breakdown = {};
    debits.forEach(t => {
      const cat = t.category || 'Uncategorized';
      if (!breakdown[cat]) breakdown[cat] = { name: cat, total: 0, count: 0 };
      breakdown[cat].total += parseFloat(t.amount) || 0;
      breakdown[cat].count++;
    });

    let grandTotal = 0;
    Object.values(breakdown).forEach(c => grandTotal += c.total);

    const FALLBACK_COLORS = [
      '#FF6B6B', '#FECB5A', '#4ECDC4', '#C7F464', 
      '#81D4FA', '#B39DDB', '#FFAB91', '#A5D6A7', 
      '#F48FB1', '#80CBC4', '#9FA8DA', '#FFCC80',
      '#FF8A65', '#4DB6AC', '#BA68C8', '#AED581'
    ];
    const usedColors = new Set();
    
    // Sort first so largest categories get colors assigned first
    const sortedCategories = Object.values(breakdown).sort((a, b) => b.total - a.total);
    
    const categoryBreakdown = sortedCategories.map((cat, index) => {
      const dbCat = apiCategories.find(c => c.name === cat.name);
      let color = dbCat ? dbCat.color : null;
      
      // If no color, default gray, or already used -> pull from premium palette
      if (!color || color === '#95A5A6' || usedColors.has(color)) {
        color = FALLBACK_COLORS.find(c => !usedColors.has(c)) || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
      }
      
      usedColors.add(color);

      return {
        ...cat,
        total: Math.round(cat.total * 100) / 100,
        percentage: grandTotal > 0 ? ((cat.total / grandTotal) * 100).toFixed(1) : "0",
        color
      };
    });

    // Monthly Data
    const monthly = {};
    transactions.filter(t => t.status !== 'Failed').forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (!monthly[key]) monthly[key] = { key, label, debit: 0, credit: 0, count: 0 };
      
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'debit') monthly[key].debit += amt;
      else monthly[key].credit += amt;
      monthly[key].count++;
    });

    const monthlyData = Object.values(monthly)
      .map(m => ({
        ...m,
        debit: Math.round(m.debit * 100) / 100,
        credit: Math.round(m.credit * 100) / 100
      }))
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);

    // Top Merchants
    const merchantMap = {};
    debits.forEach(t => {
      const key = t.normalizedMerchant || t.merchant;
      if (!merchantMap[key]) merchantMap[key] = { display: t.merchant, category: t.category, total: 0, count: 0 };
      merchantMap[key].total += parseFloat(t.amount) || 0;
      merchantMap[key].count++;
    });

    const topMerchants = Object.values(merchantMap)
      .map(m => ({ ...m, total: Math.round(m.total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Recent transactions
    const recentTransactions = [...transactions]
      .filter(t => t.status !== 'Failed')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return { totals, categoryBreakdown, monthlyData, topMerchants, recentTransactions };
  }, [transactions, apiCategories, openingBalance]);

  return (
    <div className="min-h-full bg-primary-bg pb-10">
      <TopNav 
        title="Dashboard"
        meta={`Last updated: ${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`}
        actions={
          <GlareHover
            background="transparent"
            borderRadius="8px"
            borderColor="#2A2A3E"
            glareColor="#ffffff"
            glareOpacity={0.2}
            glareAngle={-30}
            glareSize={200}
            transitionDuration={600}
            width="auto"
            height="auto"
            style={{ width: 'auto', height: 'auto' }}
          >
            <button onClick={fetchData} className="btn-secondary text-sm">
              Refresh
            </button>
          </GlareHover>
        }
      />
      
      <div className="px-6 lg:px-10 py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* DATE RANGE FILTER */}
        <div className="glass-panel p-4 flex flex-wrap gap-4 items-end border-border-light shadow-xl shadow-black/50">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">From Date</label>
            <input 
              type="date" 
              className="bg-primary-bg border border-border text-text-primary px-3 py-2 rounded-lg 
                         focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent 
                         transition-all appearance-none"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">To Date</label>
            <input 
              type="date" 
              className="bg-primary-bg border border-border text-text-primary px-3 py-2 rounded-lg 
                         focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent 
                         transition-all appearance-none"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          {(fromDate || toDate) && (
            <button 
              onClick={resetDates}
              className="px-3 py-2 flex items-center gap-2 text-danger hover:bg-danger/10 rounded-lg transition-colors text-sm font-medium"
            >
              <FilterX size={16} />
              Reset
            </button>
          )}
          {(fromDate || toDate) && (
            <div className="ml-auto text-sm text-accent bg-accent/10 px-4 py-2 rounded-lg font-medium self-end">
              Showing data {fromDate ? `from ${fromDate}` : ''} {toDate ? `to ${toDate}` : ''}
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <BorderGlow
                className="h-[140px] w-full"
                edgeSensitivity={30}
                glowColor="270 80 70"
                backgroundColor="#0c0c14"
                borderRadius={20}
                glowRadius={30}
                glowIntensity={0.6}
                coneSpread={20}
                animated={false}
                colors={['#7c3aed']}
              >
                <GlareHover
                  className="rounded-[20px]"
                  width="100%"
                  height="100%"
                  background="transparent"
                  borderColor="transparent"
                  glareColor="#ffffff"
                  glareOpacity={0.1}
                  glareSize={200}
                  transitionDuration={500}
                >
                  <div className="p-5 h-full">
                    <StatCard 
                      title="Total Expenses" 
                      amount={stats.totals.expenses} 
                      icon={ArrowDown}
                      colorClass={{ text: 'text-danger', bg: 'bg-danger/10', bgBar: 'bg-danger/20', bgFill: 'bg-danger/60' }}
                    />
                  </div>
                </GlareHover>
              </BorderGlow>

              <BorderGlow
                className="h-[140px] w-full"
                edgeSensitivity={30}
                glowColor="270 80 70"
                backgroundColor="#0c0c14"
                borderRadius={20}
                glowRadius={30}
                glowIntensity={0.6}
                coneSpread={20}
                animated={false}
                colors={['#7c3aed']}
              >
                <GlareHover
                  className="rounded-[20px]"
                  width="100%"
                  height="100%"
                  background="transparent"
                  borderColor="transparent"
                  glareColor="#ffffff"
                  glareOpacity={0.1}
                  glareSize={200}
                  transitionDuration={500}
                >
                  <div className="p-5 h-full">
                    <StatCard 
                      title="Total Income" 
                      amount={stats.totals.income} 
                      icon={ArrowUp}
                      colorClass={{ text: 'text-success', bg: 'bg-success/10', bgBar: 'bg-success/20', bgFill: 'bg-success/60' }}
                    />
                  </div>
                </GlareHover>
              </BorderGlow>

              <BorderGlow
                className="h-[140px] w-full"
                edgeSensitivity={30}
                glowColor="270 80 70"
                backgroundColor="#0c0c14"
                borderRadius={20}
                glowRadius={30}
                glowIntensity={0.6}
                coneSpread={20}
                animated={false}
                colors={['#7c3aed']}
              >
                <GlareHover
                  className="rounded-[20px]"
                  width="100%"
                  height="100%"
                  background="transparent"
                  borderColor="transparent"
                  glareColor="#ffffff"
                  glareOpacity={0.1}
                  glareSize={200}
                  transitionDuration={500}
                >
                  <div 
                    onClick={() => setShowModal(true)} 
                    className="p-5 h-full cursor-pointer hover:opacity-80 transition relative"
                  >
                    <StatCard 
                      title="Net Balance" 
                      amount={stats.totals.net} 
                      icon={Activity}
                      colorClass={{ text: 'text-accent', bg: 'bg-accent/10', bgBar: 'bg-accent/20', bgFill: 'bg-accent/60' }}
                      subtext={openingBalance > 0 ? `Includes opening ₹${openingBalance}` : undefined}
                      hideBar={true}
                    />
                  </div>
                </GlareHover>
              </BorderGlow>

              <BorderGlow
                className="h-[140px] w-full"
                edgeSensitivity={30}
                glowColor="270 80 70"
                backgroundColor="#0c0c14"
                borderRadius={20}
                glowRadius={30}
                glowIntensity={0.6}
                coneSpread={20}
                animated={false}
                colors={['#7c3aed']}
              >
                <GlareHover
                  className="rounded-[20px]"
                  width="100%"
                  height="100%"
                  background="transparent"
                  borderColor="transparent"
                  glareColor="#ffffff"
                  glareOpacity={0.1}
                  glareSize={200}
                  transitionDuration={500}
                >
                  <div className="p-5 h-full">
                    <StatCard 
                      title="Transactions" 
                      amount={stats.totals.transactionCount} 
                      icon={Hash}
                      colorClass={{ text: 'text-white/70', bg: 'bg-white/10', bgBar: 'bg-white/5', bgFill: 'bg-white/30' }}
                      hideBar={true}
                    />
                  </div>
                </GlareHover>
              </BorderGlow>
            </div>

            {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
              <div className="bg-[#0c0c14] border border-white/10 rounded-2xl p-6 flex flex-col h-full lg:col-span-1 shadow-md">
                <h3 className="text-lg font-medium text-white mb-6">Spending Distribution</h3>
                <div className="flex-1 min-h-[250px]">
                  {transactions.length > 0 && stats.categoryBreakdown.length > 0 ? (
                    <SpendingPieChart data={stats.categoryBreakdown} />
                  ) : (
             <div className="h-full flex items-center justify-center text-gray-500 font-medium">No valid expenses</div>
                  )}
                </div>
              </div>
              <div className="bg-[#0c0c14] border border-white/10 rounded-2xl p-6 flex flex-col h-full lg:col-span-2 shadow-md">
                <h3 className="text-lg font-medium text-white mb-2">Monthly Cashflow</h3>
                <div className="flex-1 min-h-[250px]">
                  {transactions.length > 0 && stats.monthlyData.length > 0 ? (
                    <MonthlyBarChart data={stats.monthlyData} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 font-medium">No valid transaction data</div>
                  )}
                </div>
              </div>
            </div>

            {/* LISTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
              <div className="bg-[#0c0c14] border border-white/10 rounded-2xl p-6 overflow-hidden flex flex-col h-full shadow-md">
                <CategoryBreakdown categories={stats.categoryBreakdown} />
              </div>
              <div className="bg-[#0c0c14] border border-white/10 rounded-2xl p-6 overflow-hidden flex flex-col h-full shadow-md">
                <MonthlySummary recentTransactions={stats.recentTransactions} />
              </div>
            </div>
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-[#1e1e2f] p-6 rounded-xl w-80 shadow-lg">
              <h2 className="text-white text-lg mb-2 font-semibold">
                Enter Opening Balance (Optional)
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Add opening balance only if needed
              </p>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-2 rounded bg-[#2a2a40] text-white mb-4 outline-none"
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 rounded text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const val = Number(inputValue) || 0;
                    setOpeningBalance(val);
                    localStorage.setItem("openingBalance", val);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-purple-600 rounded text-white"
                >
                  Save
                </button>
              </div>
              <button
                onClick={() => {
                  setOpeningBalance(0);
                  localStorage.removeItem("openingBalance");
                  setInputValue("");
                  setShowModal(false);
                }}
                className="mt-4 w-full text-red-400 text-sm"
              >
                Clear Opening Balance
              </button>
            </div>
          </div>
        )}
        {/* Footer Signature */}
        <div className="text-center mt-12 pb-6">
          <p className="text-xs tracking-wide text-white/30">
            Created by{" "}
            <span className="text-purple-400 font-semibold hover:text-purple-300 transition duration-300 cursor-pointer">
              SHANX
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
