import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Client from '../api/client';
import TopNav from '../components/Layout/TopNav';
import MerchantMapper from '../components/Categories/MerchantMapper';
import SearchBar from '../components/Transactions/SearchBar';


const MerchantMapping = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    uncategorized: searchParams.get('uncategorized') === 'true'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [merchs, cats] = await Promise.all([
        Client.getMerchants(filters),
        Client.getCategories()
      ]);
      setMerchants(merchs);
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

  const handleSearchChange = (value) => {
    setFilters(prev => {
      const updated = { ...prev, search: value };
      const params = new URLSearchParams(searchParams);
      if (value) params.set('search', value);
      else params.delete('search');
      setSearchParams(params);
      return updated;
    });
  };

  const handleToggleUncategorized = () => {
    setFilters(prev => {
      const updated = { ...prev, uncategorized: !prev.uncategorized };
      const params = new URLSearchParams(searchParams);
      if (updated.uncategorized) params.set('uncategorized', 'true');
      else params.delete('uncategorized');
      setSearchParams(params);
      return updated;
    });
  };

  const handleUpdateCategory = async (normalized, categoryName) => {
    try {
      await Client.updateMerchantCategory(normalized, categoryName);
      setMerchants(prev => prev.map(m => m.normalized === normalized ? { ...m, category: categoryName } : m));
    } catch (error) {
      console.error("Failed to update merchant category:", error);
    }
  };

  const handleBulkUpdate = async (normalizedIds, categoryName) => {
    try {
      await Client.bulkUpdateMerchants(normalizedIds, categoryName);
      setMerchants(prev => prev.map(m => normalizedIds.includes(m.normalized) ? { ...m, category: categoryName } : m));
    } catch (error) {
      console.error("Failed to bulk update merchants:", error);
    }
  };

  const uncatCount = merchants.filter(m => m.category === 'Uncategorized').length;

  return (
    <div className="min-h-full bg-primary-bg pb-10 flex flex-col">
      <TopNav 
        title="Merchant Mapping"
        meta="Map merchants to categories for automatic categorization"
      />
      
      <div className="px-6 lg:px-10 py-6 max-w-7xl mx-auto w-full space-y-6 flex-1 flex flex-col animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0c0c14] border border-white/10 p-4 rounded-2xl shadow-md">
          <SearchBar value={filters.search} onChange={handleSearchChange} />
          
          <button 
            onClick={handleToggleUncategorized}
            className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all ${
              filters.uncategorized 
                ? 'bg-warning/10 border-warning text-warning' 
                : 'bg-secondary-bg border-border text-text-muted hover:border-text-muted hover:text-text-primary'
            }`}
          >
            {filters.uncategorized ? 'Showing Uncategorized' : `🔴 ${uncatCount > 0 ? uncatCount : 'No'} Uncategorized`}
          </button>
        </div>

        {loading ? (
          <div className="w-full flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <MerchantMapper 
            merchants={merchants}
            categories={categories}
            onUpdateCategory={handleUpdateCategory}
            onBulkUpdate={handleBulkUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default MerchantMapping;
