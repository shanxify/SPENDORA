import React from 'react';
import { Crown, Repeat, Zap, Calculator } from 'lucide-react';

const InsightsSection = ({ topMerchantBySpend, mostFrequentMerchant, biggestExpense, avgTransaction, transactionCount }) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Insights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: TOP MERCHANT */}
        <div className="bg-[#0c0c14] border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center h-[140px] w-full min-w-0">
          <div className="flex items-center justify-center gap-3 mb-2 w-full">
            <span className="text-text-muted text-sm font-medium uppercase tracking-widest pt-1">
              Top Merchant
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-accent/10">
              <Crown className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div 
            className="text-[32px] leading-none mb-1 font-bold text-text-primary truncate w-full" 
            title={topMerchantBySpend?.display || 'No data'}
          >
            {topMerchantBySpend?.display || '—'}
          </div>
          <div className="mt-2 text-xs text-text-muted w-full truncate">
            {topMerchantBySpend 
              ? `₹${topMerchantBySpend.total.toFixed(2)} total spent` 
              : 'No data yet'}
          </div>
        </div>

        {/* Card 2: MOST FREQUENT */}
        <div className="bg-[#0c0c14] border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center h-[140px] w-full min-w-0">
          <div className="flex items-center justify-center gap-3 mb-2 w-full">
            <span className="text-text-muted text-sm font-medium uppercase tracking-widest pt-1">
              Most Frequent
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-accent/10">
              <Repeat className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div 
            className="text-[32px] leading-none mb-1 font-bold text-text-primary truncate w-full" 
            title={mostFrequentMerchant?.display || 'No data'}
          >
            {mostFrequentMerchant?.display || '—'}
          </div>
          <div className="mt-2 text-xs text-text-muted w-full truncate">
            {mostFrequentMerchant 
              ? `${mostFrequentMerchant.count} transactions` 
              : 'No data yet'}
          </div>
        </div>

        {/* Card 3: BIGGEST EXPENSE */}
        <div className="bg-[#0c0c14] border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center h-[140px] w-full min-w-0">
          <div className="flex items-center justify-center gap-3 mb-2 w-full">
            <span className="text-text-muted text-sm font-medium uppercase tracking-widest pt-1">
              Biggest Expense
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-danger/10">
              <Zap className="w-4 h-4 text-danger" />
            </div>
          </div>
          <div 
            className="text-[32px] leading-none mb-1 font-bold text-text-primary truncate w-full" 
            title={biggestExpense?.merchant || 'No data'}
          >
            {biggestExpense?.merchant || '—'}
          </div>
          <div className="mt-2 text-xs text-text-muted w-full truncate">
            {biggestExpense 
              ? `₹${biggestExpense.amount.toFixed(2)} on ${formatDate(biggestExpense.date)}` 
              : 'No data yet'}
          </div>
        </div>

        {/* Card 4: AVG TRANSACTION */}
        <div className="bg-[#0c0c14] border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center h-[140px] w-full min-w-0">
          <div className="flex items-center justify-center gap-3 mb-2 w-full">
            <span className="text-text-muted text-sm font-medium uppercase tracking-widest pt-1">
              Avg Transaction
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-success/10">
              <Calculator className="w-4 h-4 text-success" />
            </div>
          </div>
          <div 
            className="text-[32px] leading-none mb-1 font-bold number-font text-text-primary truncate w-full" 
            title={`₹${avgTransaction.toFixed(2)}`}
          >
            ₹{avgTransaction.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-text-muted w-full truncate">
            across {transactionCount} transactions
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;
