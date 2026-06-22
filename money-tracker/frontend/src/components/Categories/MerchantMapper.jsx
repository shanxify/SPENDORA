import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, CheckSquare, Square, Check, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import BorderGlow from '../BorderGlow';

const MerchantMapper = ({ merchants, categories, onUpdateCategory, onBulkUpdate }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [sortField, setSortField] = useState(null); // 'merchant', 'type', 'count', 'spend'
  const [sortAsc, setSortAsc] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [merchants]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedMerchants = useMemo(() => {
    const list = Array.isArray(merchants) ? [...merchants] : [];
    if (!sortField) return list;

    list.sort((a, b) => {
      let valA, valB;
      if (sortField === 'merchant') {
        valA = a.display || '';
        valB = b.display || '';
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'type') {
        valA = a.type || '';
        valB = b.type || '';
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'count') {
        valA = a.count || 0;
        valB = b.count || 0;
        return sortAsc ? valA - valB : valB - valA;
      }
      if (sortField === 'spend') {
        valA = a.totalSpend || 0;
        valB = b.totalSpend || 0;
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });
    return list;
  }, [merchants, sortField, sortAsc]);

  const itemsPerPage = 20;
  const computedTotalPages = Math.ceil(sortedMerchants.length / itemsPerPage) || 1;

  const paginatedMerchants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedMerchants.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedMerchants, currentPage]);

  const renderSortHeader = (field, label, align = 'left') => {
    const isCurrent = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)}
        className={`py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase cursor-pointer hover:text-text-primary select-none transition-colors ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
      >
        <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
          <span>{label}</span>
          {isCurrent ? (
            sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-accent" /> : <ArrowDown className="w-3.5 h-3.5 text-accent" />
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 opacity-30 hover:opacity-75" />
          )}
        </div>
      </th>
    );
  };

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
    const safeMerchants = Array.isArray(merchants) ? merchants : [];
    if (selectedIds.size === safeMerchants.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(safeMerchants.map(m => m.normalized)));
  };

  const handleBulkAssign = (categoryName) => {
    if (selectedIds.size === 0) return;
    onBulkUpdate(Array.from(selectedIds), categoryName);
    setSelectedIds(new Set());
    setActiveDropdown(null);
  };

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
                {(Array.isArray(categories) ? categories : []).map(cat => (
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

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary-bg/50 border-b border-border">
              <th className="py-4 px-6 w-12 text-center">
                <button onClick={toggleAll} className="text-text-muted hover:text-text-primary">
                  {selectedIds.size === (Array.isArray(merchants) ? merchants : []).length && (Array.isArray(merchants) ? merchants : []).length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-accent" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              {renderSortHeader('merchant', 'Merchant', 'left')}
              {renderSortHeader('type', 'Type', 'center')}
              {renderSortHeader('count', 'Transactions', 'center')}
              {renderSortHeader('spend', 'Total Spend', 'right')}
              <th className="py-4 px-6 text-xs font-syne text-text-muted font-semibold tracking-wider uppercase">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedMerchants.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-text-muted">No merchants found</td></tr>
            ) : null}
            
            {paginatedMerchants.map(m => {
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
                  <td className="py-4 px-6 text-center">
                    {m.type?.toLowerCase() === 'credit' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/20 uppercase tracking-wide">
                        CREDIT
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-danger/10 text-danger border border-danger/20 uppercase tracking-wide">
                        DEBIT
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center text-text-secondary number-font">
                    {m.count}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-text-primary number-font">
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
                        {(Array.isArray(categories) ? categories : []).map(cat => (
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

      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3 p-4">
        {sortedMerchants.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-sm">
            No merchants found
          </div>
        ) : (
          paginatedMerchants.map(m => {
            const isUncategorized = m.category === 'Uncategorized';
            const isSelected = selectedIds.has(m.normalized);
            const isCredit = m.type?.toLowerCase() === 'credit';
            
            return (
              <div key={m.normalized} className={`bg-card border border-border rounded-xl p-4 transition-colors ${isSelected ? 'bg-accent/5' : ''}`}>
                <div className="flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <button onClick={() => toggleSelect(m.normalized)} className="text-text-muted hover:text-text-primary transition-colors shrink-0 mt-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-accent" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  
                  <div className="min-w-0 flex-1">
                    {/* Merchant Name & Uncategorized Indicator */}
                    <p className="text-sm font-medium text-text-primary flex items-center gap-2 truncate">
                      <span className="truncate">{m.display}</span>
                      {isUncategorized && <span className="w-2 h-2 rounded-full bg-warning animate-pulse shrink-0" title="Needs Customization"></span>}
                    </p>
                    {/* Transactions count and total spend */}
                    <p className="text-xs text-text-muted mt-1">
                      {m.count} txns • {formatCurrency(m.totalSpend)}
                    </p>
                  </div>
                  
                  {/* Credit/Debit Badge */}
                  <div className="shrink-0">
                    {isCredit ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/20 uppercase tracking-wide">
                        CREDIT
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-danger/10 text-danger border border-danger/20 uppercase tracking-wide">
                        DEBIT
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Category Selector below */}
                <div className="mt-4 pt-3 border-t border-border/50 relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === m.normalized ? null : m.normalized)}
                    className={`flex items-center gap-2 px-3 py-1.5 w-full justify-between hover:bg-border rounded-lg text-sm border transition-colors ${isUncategorized ? 'bg-warning/10 border-warning/30 text-warning-light' : 'bg-secondary-bg border-border text-text-primary'}`}
                  >
                    <span className="truncate">{m.category}</span>
                    <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                  </button>
                  
                  {activeDropdown === m.normalized && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-20 py-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {(Array.isArray(categories) ? categories : []).map(cat => (
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
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {sortedMerchants.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-6 pb-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || sortedMerchants.length === 0}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 text-sm rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: (currentPage === 1 || sortedMerchants.length === 0) ? 'transparent' : '#6C63FF',
              color: (currentPage === 1 || sortedMerchants.length === 0) ? '#606080' : 'white',
              border: `1px solid ${(currentPage === 1 || sortedMerchants.length === 0) ? '#2A2A3E' : '#6C63FF'}`,
              cursor: (currentPage === 1 || sortedMerchants.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (currentPage === 1 || sortedMerchants.length === 0) ? 0.5 : 1,
            }}
          >
            ← Previous
          </button>

          <p className="text-xs sm:text-sm text-text-muted text-center order-first sm:order-none">
            Page {currentPage} of {computedTotalPages} <span className="mx-1">|</span> {sortedMerchants.length} merchants
          </p>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, computedTotalPages))}
            disabled={currentPage === computedTotalPages || computedTotalPages === 0 || sortedMerchants.length === 0}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 text-sm rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: (currentPage === computedTotalPages || sortedMerchants.length === 0) ? 'transparent' : '#6C63FF',
              color: (currentPage === computedTotalPages || sortedMerchants.length === 0) ? '#606080' : 'white',
              border: `1px solid ${(currentPage === computedTotalPages || sortedMerchants.length === 0) ? '#2A2A3E' : '#6C63FF'}`,
              cursor: (currentPage === computedTotalPages || sortedMerchants.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (currentPage === computedTotalPages || sortedMerchants.length === 0) ? 0.5 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
    </BorderGlow>
  );
};

export default MerchantMapper;
