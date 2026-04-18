import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Client from '../api/client';
import TopNav from '../components/Layout/TopNav';
import TransactionTable from '../components/Transactions/TransactionTable';
import SearchBar from '../components/Transactions/SearchBar';
import FilterPanel from '../components/Transactions/FilterPanel';
import GlareHover from '../components/GlareHover';

const Transactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // totalPages and totalCount are now derived from filteredTransactions
  const [loading, setLoading] = useState(false);
  const LIMIT = 20;

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '');

  const [categories, setCategories] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    Client.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedType, dateFrom, dateTo]);

  // Fetch whenever filters change (client handles pagination)
  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, selectedCategory, selectedType, dateFrom, dateTo]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100000,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (selectedType && selectedType !== 'All Types') params.type = selectedType;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      // Update URL params
      const urlParams = new URLSearchParams();
      if (params.search) urlParams.set('search', params.search);
      if (params.category) urlParams.set('category', params.category);
      if (params.type) urlParams.set('type', params.type);
      if (params.from) urlParams.set('from', params.from);
      if (params.to) urlParams.set('to', params.to);
      urlParams.set('page', params.page);
      setSearchParams(urlParams);

      const response = await Client.getTransactions(params);

      // response is already response.data from Client; it has a .data array
      const txnData = response?.data;
      setTransactions(Array.isArray(txnData) ? txnData : []);
      // Total pages and count are now calculated from filteredTransactions
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    if ('search' in newFilters) setSearchTerm(newFilters.search);
    if ('category' in newFilters) setSelectedCategory(newFilters.category);
    if ('type' in newFilters) setSelectedType(newFilters.type);
    if ('from' in newFilters) setDateFrom(newFilters.from);
    if ('to' in newFilters) setDateTo(newFilters.to);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
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
      await Client.clearTransactions();
      setTransactions([]);
      setShowClearConfirm(false);
      alert('All transactions cleared! You can now upload a fresh PDF.');
      fetchTransactions();
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
        fetchTransactions();
      } catch (error) {
        console.error("Failed to delete transaction:", error);
      }
    }
  };

  const uiFilters = {
    search: searchTerm,
    category: selectedCategory,
    type: selectedType,
    from: dateFrom,
    to: dateTo
  };

  const filteredTransactions = transactions.filter((txn) => {
    // Convert transaction date
    const txnDate = new Date(txn.date);

    // Convert filter dates
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    // 🔥 IMPORTANT FIX: Normalize time
    txnDate.setHours(0, 0, 0, 0);

    if (from) {
      from.setHours(0, 0, 0, 0);
      if (txnDate < from) return false;
    }

    if (to) {
      to.setHours(23, 59, 59, 999);
      if (txnDate > to) return false;
    }

    // Category filter (keep existing logic intact)
    if (selectedCategory && selectedCategory !== "All Categories") {
      if (txn.category !== selectedCategory) return false;
    }

    // Type filter (keep existing logic intact)
    if (selectedType && selectedType !== "All Types") {
      if ((txn.type || "").toLowerCase() !== selectedType.toLowerCase()) return false;
    }

    return true;
  });

  const itemsPerPage = LIMIT;
  const computedTotalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isFilterActive =
    dateFrom ||
    dateTo ||
    (selectedCategory && selectedCategory !== "All Categories") ||
    (selectedType && selectedType !== "All Types");

  const totalAmount = filteredTransactions.reduce((sum, txn) => {
    const amt = parseFloat(txn.amount) || 0;
    return (txn.type || "").toUpperCase() === "CREDIT"
      ? sum + amt
      : sum - amt;
  }, 0);

  return (
    <div className="min-h-full bg-primary-bg pb-10 flex flex-col">
      <TopNav 
        title="Transactions"
        meta="Manage and track your transactions"
      />
      
      <div className="px-6 lg:px-10 py-6 space-y-6 max-w-7xl mx-auto w-full flex-1 flex flex-col animate-in fade-in duration-300">
        <div className="mt-4 flex flex-col lg:flex-row gap-4 items-center justify-between bg-[#0c0c14] border border-white/10 p-4 rounded-2xl shadow-md">
          <SearchBar value={searchTerm} onChange={handleSearchChange} />
          <FilterPanel 
            categories={categories} 
            filters={uiFilters} 
            onFilterChange={handleFilterChange} 
          />
        </div>

        {isFilterActive && (
          <div className="text-right text-sm text-gray-400 mb-2">
            Filtered Total: ₹{totalAmount}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0B8' }}>
            Loading...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0B8', fontSize: '16px' }}>
            No transactions found
          </div>
        ) : (
          <TransactionTable 
            transactions={paginatedTransactions}
            categories={categories}
            onUpdateCategory={handleUpdateCategory}
            onDelete={handleDelete}
            loading={loading}
          />
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading || filteredTransactions.length === 0}
            style={{
              padding: '8px 20px',
              backgroundColor: (currentPage === 1 || filteredTransactions.length === 0) ? 'transparent' : '#6C63FF',
              color: (currentPage === 1 || filteredTransactions.length === 0) ? '#606080' : 'white',
              border: `1px solid ${(currentPage === 1 || filteredTransactions.length === 0) ? '#2A2A3E' : '#6C63FF'}`,
              borderRadius: '8px',
              cursor: (currentPage === 1 || filteredTransactions.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (currentPage === 1 || filteredTransactions.length === 0) ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Previous
          </button>

          <span style={{ color: '#A0A0B8', fontSize: '14px' }}>
            Page {currentPage} of {computedTotalPages} &nbsp;|&nbsp; {filteredTransactions.length} transactions
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, computedTotalPages))}
            disabled={currentPage === computedTotalPages || computedTotalPages === 0 || loading || filteredTransactions.length === 0}
            style={{
              padding: '8px 20px',
              backgroundColor: (currentPage === computedTotalPages || filteredTransactions.length === 0) ? 'transparent' : '#6C63FF',
              color: (currentPage === computedTotalPages || filteredTransactions.length === 0) ? '#606080' : 'white',
              border: `1px solid ${(currentPage === computedTotalPages || filteredTransactions.length === 0) ? '#2A2A3E' : '#6C63FF'}`,
              borderRadius: '8px',
              cursor: (currentPage === computedTotalPages || filteredTransactions.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (currentPage === computedTotalPages || filteredTransactions.length === 0) ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Next →
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
          >
            Clear All Transactions
          </button>
        </div>

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
