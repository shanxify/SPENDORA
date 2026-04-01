import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const MonthlySummary = ({ recentTransactions }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-syne font-bold text-text-primary">Recent Transactions</h3>
        <a href="/transactions" className="text-sm text-accent hover:text-accent-light transition-colors">
          View all
        </a>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-muted">
          No recent transactions
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {recentTransactions.map((tx) => {
            const isDebit = tx.type === 'debit';
            
            return (
              <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-secondary-bg border border-border hover:border-border-light transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDebit ? 'bg-danger/10' : 'bg-success/10'}`}>
                    {isDebit ? 
                      <ArrowDownRight className="w-5 h-5 text-danger" /> : 
                      <ArrowUpRight className="w-5 h-5 text-success" />
                    }
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary truncate max-w-[140px]">{tx.merchant}</h4>
                    <span className="text-xs text-text-muted">{formatDate(tx.date)} &bull; {tx.category}</span>
                  </div>
                </div>
                <div className={`font-semibold ${isDebit ? 'text-danger' : 'text-success'}`}>
                  {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonthlySummary;
