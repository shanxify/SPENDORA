import React, { useState } from 'react';
import { Trash2, ChevronDown, Check } from 'lucide-react';
import BorderGlow from '../BorderGlow';

const TransactionTable = ({ transactions, categories, onUpdateCategory, onDelete, loading }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="w-full flex-1 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="w-full text-center py-12 text-text-muted bg-card border border-border rounded-xl">
        No transactions found matching your criteria.
      </div>
    );
  }

  return (
    <BorderGlow
      className="w-full"
      edgeSensitivity={40}
      glowColor="270 80 70"
      backgroundColor="#0c0c14"
      borderRadius={20}
      glowRadius={30}
      glowIntensity={0.5}
      coneSpread={20}
      animated={false}
      colors={['#7c3aed']}
    >
      <div className="w-full rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-bg/50 border-b border-border">
                <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase">Date</th>
                <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase">Merchant</th>
                <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase">Category</th>
                <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase text-right">Amount</th>
                <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase text-center">Type</th>
                <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map(tx => {
                const isDebit = tx.type === 'debit';
                const isFailed = tx.status === 'Failed';
                
                return (
                  <tr key={tx.id} className="hover:bg-white/5 transition duration-200 group">
                    <td className="py-4 px-6 text-sm text-text-secondary whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-text-primary capitalize">{tx.merchant.toLowerCase()}</p>
                      {tx.upiRef && <p className="text-xs text-text-muted mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Ref: {tx.upiRef}</p>}
                    </td>
                    <td className="py-4 px-6 relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === tx.id ? null : tx.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary-bg hover:bg-border rounded-lg text-sm border border-border transition-colors w-full justify-between"
                      >
                        <span className="truncate max-w-[120px]">{tx.category}</span>
                        <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                      </button>
                      
                      {activeDropdown === tx.id && (
                        <div className="absolute top-full left-6 mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-20 py-2 max-h-60 overflow-y-auto custom-scrollbar">
                          {categories.map(cat => (
                            <div
                              key={cat.id}
                              className={`px-4 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-secondary-bg transition-colors ${tx.category === cat.name ? 'text-accent font-medium bg-accent/5' : 'text-text-primary'}`}
                              onClick={() => {
                                onUpdateCategory(tx.id, cat.name);
                                setActiveDropdown(null);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span style={{ color: cat.color }}>{cat.icon}</span>
                                <span className="truncate">{cat.name}</span>
                              </div>
                              {tx.category === cat.name && <Check className="w-4 h-4 text-accent" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-medium number-font">
                      <span className={isFailed ? 'text-text-muted line-through' : isDebit ? 'text-danger' : 'text-success'}>
                        {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                      </span>
                      {isFailed && <p className="text-[10px] text-danger mt-1 uppercase tracking-wider">Failed</p>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${isDebit ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => onDelete(tx.id)}
                        className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </BorderGlow>
  );
};

export default TransactionTable;
