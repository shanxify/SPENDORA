import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Client from '../api/client';
import TopNav from '../components/Layout/TopNav';
import TransactionTable from '../components/Transactions/TransactionTable';
import SearchBar from '../components/Transactions/SearchBar';
import FilterPanel from '../components/Transactions/FilterPanel';

const Transactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || 'all',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 50
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ transactions: txs, total: t }, cats] = await Promise.all([
        Client.getTransactions(filters),
        Client.getCategories()
      ]);
      setTransactions(txs);
      setTotal(t);
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters, page: 1 };
      
      // Update URL params
      const params = new URLSearchParams();
      if (updated.search) params.set('search', updated.search);
      if (updated.category) params.set('category', updated.category);
      if (updated.type !== 'all') params.set('type', updated.type);
      if (updated.from) params.set('from', updated.from);
      if (updated.to) params.set('to', updated.to);
      setSearchParams(params);
      
      return updated;
    });
  };

  const handleSearchChange = (value) => {
    handleFilterChange({ search: value });
  };

  const handleUpdateCategory = async (id, categoryName) => {
    try {
      await Client.updateTransactionCategory(id, categoryName);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, category: categoryName } : t));
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await axios.delete('http://localhost:5001/api/transactions/clear');
      setTransactions([]);
      setTotal(0);
      setShowClearConfirm(false);
      alert('All transactions cleared! You can now upload a fresh PDF.');
      fetchData();
    } catch (err) {
      alert('Failed to clear transactions: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await Client.deleteTransaction(id);
        fetchData();
      } catch (error) {
        console.error("Failed to delete transaction:", error);
      }
    }
  };

  return (
    <div className="min-h-full bg-primary-bg pb-10 flex flex-col">
      <TopNav 
        title="Transactions" 
        meta=""
      />
      
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6 flex-1 flex flex-col animate-in fade-in duration-300">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h1 className="text-2xl font-bold text-text">Transactions</h1>
            <p className="text-text-muted">{total} transactions found</p>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🗑️ Clear All Transactions
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-md">
          <SearchBar value={filters.search} onChange={handleSearchChange} />
          <FilterPanel 
            categories={categories} 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        </div>

        <TransactionTable 
          transactions={transactions}
          categories={categories}
          onUpdateCategory={handleUpdateCategory}
          onDelete={handleDelete}
          loading={loading}
        />

        {total > filters.limit && (
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
            <button 
              className="btn-secondary"
              disabled={filters.page === 1}
              onClick={() => handleFilterChange({ page: filters.page - 1 })}
            >
              Previous
            </button>
            <span className="text-text-muted">
              Page {filters.page} of {Math.ceil(total / filters.limit)}
            </span>
            <button 
              className="btn-secondary"
              disabled={filters.page >= Math.ceil(total / filters.limit)}
              onClick={() => handleFilterChange({ page: filters.page + 1 })}
            >
              Next
            </button>
          </div>
        )}
        {showClearConfirm && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1E1E2E',
              border: '1px solid #2A2A3E',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '420px',
              width: '90%',
              textAlign: 'center'
            }}>
              {/* Warning Icon */}
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              
              {/* Title */}
              <h2 style={{ color: '#F0F0F8', marginBottom: '12px', fontSize: '20px' }}>
                Clear All Transactions?
              </h2>
              
              {/* Description */}
              <p style={{ color: '#A0A0B8', marginBottom: '8px', fontSize: '14px', lineHeight: '1.6' }}>
                This will permanently delete ALL transactions from the database.
              </p>
              <p style={{ color: '#EF4444', marginBottom: '24px', fontSize: '13px' }}>
                This action cannot be undone. You will need to re-upload your PDF.
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={clearing}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: '#A0A0B8',
                    border: '1px solid #2A2A3E',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearing}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: clearing ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: clearing ? 0.7 : 1
                  }}
                >
                  {clearing ? 'Clearing...' : 'Yes, Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
