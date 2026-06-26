import React, { createContext, useContext, useState } from 'react';

const DemoContext = createContext();

export const DEMO_CATEGORIES = [
  { id: '1', name: 'Food & Dining',    color: '#f97316', icon: '🍔' },
  { id: '2', name: 'Transport',        color: '#3b82f6', icon: '🚗' },
  { id: '3', name: 'Shopping',         color: '#ec4899', icon: '🛍️' },
  { id: '4', name: 'Entertainment',    color: '#8b5cf6', icon: '🎬' },
  { id: '5', name: 'Utilities',        color: '#10b981', icon: '💡' },
  { id: '6', name: 'Groceries',        color: '#f59e0b', icon: '🛒' },
  { id: '7', name: 'Travel',           color: '#06b6d4', icon: '✈️' },
  { id: '8', name: 'Health',           color: '#ef4444', icon: '💊' },
  { id: '9', name: 'Uncategorized',    color: '#6b7280', icon: '📦' },
];

export const DemoProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [merchants, setMerchants] = useState([]);

  // Derive merchants from transactions list
  const deriveMerchants = (txList) => {
    const groups = {};
    txList.forEach(t => {
      const key = t.normalized;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(t);
    });

    return Object.keys(groups).map(normalized => {
      const group = groups[normalized];
      const display = group[0].merchant;
      
      // Look for first non-uncategorized category in the group, or fallback to first item's category
      const categorizedTx = group.find(t => t.category && t.category !== 'Uncategorized');
      const category = categorizedTx ? categorizedTx.category : (group[0].category || 'Uncategorized');

      const count = group.length;
      const totalSpend = group
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      const debitCount = group.filter(t => t.type === 'debit').length;
      const creditCount = group.filter(t => t.type === 'credit').length;
      const type = debitCount >= creditCount ? 'debit' : 'credit';

      return {
        normalized,
        display,
        category,
        count,
        totalSpend,
        type
      };
    });
  };

  const setTransactionsFromParsed = (parsedArray) => {
    setTransactions(parsedArray);
    setMerchants(deriveMerchants(parsedArray));
  };

  const updateMerchantCategory = (normalizedName, categoryName) => {
    setTransactions(prev => {
      const updated = prev.map(t => {
        if (t.normalized === normalizedName) {
          return { ...t, category: categoryName };
        }
        return t;
      });
      setMerchants(deriveMerchants(updated));
      return updated;
    });
  };

  const bulkUpdateMerchants = (normalizedNamesArray, categoryName) => {
    const namesSet = new Set(normalizedNamesArray);
    setTransactions(prev => {
      const updated = prev.map(t => {
        if (namesSet.has(t.normalized)) {
          return { ...t, category: categoryName };
        }
        return t;
      });
      setMerchants(deriveMerchants(updated));
      return updated;
    });
  };

  const resetDemo = () => {
    setTransactions([]);
    setMerchants([]);
  };

  return (
    <DemoContext.Provider value={{
      transactions,
      merchants,
      categories: DEMO_CATEGORIES,
      setTransactionsFromParsed,
      updateMerchantCategory,
      bulkUpdateMerchants,
      resetDemo
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
