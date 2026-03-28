import React, { useState } from 'react';
import { ChevronDown, CheckSquare, Square, Check } from 'lucide-react';

const MerchantMapper = ({ merchants, categories, onUpdateCategory, onBulkUpdate }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const toggleSelect = (normalized) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(normalized)) newSelected.delete(normalized);
    else newSelected.add(normalized);
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === merchants.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(merchants.map(m => m.normalized)));
  };

  const handleBulkAssign = (categoryName) => {
    if (selectedIds.size === 0) return;
    onBulkUpdate(Array.from(selectedIds), categoryName);
    setSelectedIds(new Set());
    setActiveDropdown(null);
  };

  return (
    <div className="w-full bg-card border border-border rounded-xl shadow-lg backdrop-blur-md">
      
      {selectedIds.size > 0 && (
        <div className="bg-accent/10 border-b border-accent/20 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-accent font-medium text-sm">
            {selectedIds.size} merchants selected
          </span>
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'bulk' ? null : 'bulk')}
              className="btn-primary text-sm flex items-center gap-2 py-1.5"
            >
              Bulk Assign <ChevronDown className="w-4 h-4" />
            </button>
            
            {activeDropdown === 'bulk' && (
              <div className="absolute right-0 mt-2 w-48 bg-secondary-bg border border-border rounded-xl shadow-2xl z-20 py-2 max-h-60 overflow-y-auto custom-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleBulkAssign(cat.name)}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-card transition-colors flex items-center gap-2"
                  >
                    <span style={{ color: cat.color }}>{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary-bg/50 border-b border-border">
              <th className="py-4 px-6 w-12 text-center">
                <button onClick={toggleAll} className="text-text-muted hover:text-text-primary">
                  {selectedIds.size === merchants.length && merchants.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-accent" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase">Merchant</th>
              <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase text-center">Transactions</th>
              <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase text-right">Total Spend</th>
              <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {merchants.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-text-muted">No merchants found</td></tr>
            ) : null}
            
            {merchants.map(m => {
              const isUncategorized = m.category === 'Uncategorized';
              const isSelected = selectedIds.has(m.normalized);
              
              return (
                <tr key={m.normalized} className={`hover:bg-secondary-bg/30 transition-colors ${isSelected ? 'bg-accent/5' : ''}`}>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => toggleSelect(m.normalized)} className="text-text-muted hover:text-text-primary transition-colors">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-accent" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                      {m.display}
                      {isUncategorized && <span className="w-2 h-2 rounded-full bg-warning animate-pulse" title="Needs Customization"></span>}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-center text-text-secondary font-mono">
                    {m.count}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-medium text-text-primary">
                    {formatCurrency(m.totalSpend)}
                  </td>
                  <td className="py-4 px-6 relative w-64">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === m.normalized ? null : m.normalized)}
                      className={`flex items-center gap-2 px-3 py-1.5 w-full justify-between hover:bg-border rounded-lg text-sm border transition-colors ${isUncategorized ? 'bg-warning/10 border-warning/30 text-warning-light' : 'bg-secondary-bg border-border text-text-primary'}`}
                    >
                      <span className="truncate">{m.category}</span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </button>
                    
                    {activeDropdown === m.normalized && (
                      <div className="absolute top-full left-6 mt-1 w-[calc(100%-3rem)] bg-card border border-border rounded-xl shadow-xl z-20 mx-auto py-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {categories.map(cat => (
                          <div
                            key={cat.id}
                            className={`px-4 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-secondary-bg transition-colors ${m.category === cat.name ? 'text-accent font-medium bg-accent/5' : 'text-text-primary'}`}
                            onClick={() => {
                              onUpdateCategory(m.normalized, cat.name);
                              setActiveDropdown(null);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span style={{ color: cat.color }}>{cat.icon}</span>
                              <span className="truncate">{cat.name}</span>
                            </div>
                            {m.category === cat.name && <Check className="w-4 h-4 text-accent" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MerchantMapper;
