import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, Activity, Hash } from 'lucide-react';
import Client from '../api/client';
import TopNav from '../components/Layout/TopNav';
import StatCard from '../components/Dashboard/StatCard';
import CategoryBreakdown from '../components/Dashboard/CategoryBreakdown';
import MonthlySummary from '../components/Dashboard/MonthlySummary';
import SpendingPieChart from '../components/Charts/SpendingPieChart';
import MonthlyBarChart from '../components/Charts/MonthlyBarChart';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await Client.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshData = () => {
    setLoading(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex-1 h-full bg-primary-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-full bg-primary-bg pb-10">
      <TopNav 
        title="Dashboard" 
        meta={`Last updated: ${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`}
        actions={
          <button onClick={refreshData} className="btn-secondary text-sm">
            Refresh
          </button>
        }
      />
      
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Expenses" 
            amount={stats.totals.expenses} 
            icon={ArrowDown}
            colorClass={{ text: 'text-danger', bg: 'bg-danger/10', bgBar: 'bg-danger/20', bgFill: 'bg-danger/60' }}
          />
          <StatCard 
            title="Total Income" 
            amount={stats.totals.income} 
            icon={ArrowUp}
            colorClass={{ text: 'text-success', bg: 'bg-success/10', bgBar: 'bg-success/20', bgFill: 'bg-success/60' }}
          />
          <StatCard 
            title="Net Balance" 
            amount={stats.totals.net} 
            icon={Activity}
            colorClass={{ text: 'text-accent', bg: 'bg-accent/10', bgBar: 'bg-accent/20', bgFill: 'bg-accent/60' }}
          />
          <StatCard 
            title="Transactions" 
            amount={stats.totals.transactionCount} 
            icon={Hash}
            colorClass={{ text: 'text-text-primary', bg: 'bg-secondary-bg', bgBar: 'bg-border', bgFill: 'bg-text-muted' }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          <div className="glass-panel p-6 flex flex-col h-full lg:col-span-1 border-border-light shadow-xl shadow-black/50">
            <h3 className="text-lg font-syne font-bold text-text-primary mb-6">Spending Distribution</h3>
            <div className="flex-1 min-h-[250px]">
              <SpendingPieChart data={stats.categoryBreakdown} />
            </div>
          </div>
          <div className="glass-panel p-6 flex flex-col h-full lg:col-span-2 border-border-light shadow-xl shadow-black/50">
            <h3 className="text-lg font-syne font-bold text-text-primary mb-2">Monthly Cashflow</h3>
            <div className="flex-1 min-h-[250px]">
              <MonthlyBarChart data={stats.monthlyData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
          <div className="glass-panel p-6 overflow-hidden flex flex-col h-full">
            <CategoryBreakdown categories={stats.categoryBreakdown} />
          </div>
          <div className="glass-panel p-6 overflow-hidden flex flex-col h-full">
            <MonthlySummary recentTransactions={stats.recentTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
