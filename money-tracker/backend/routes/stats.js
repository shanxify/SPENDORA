const express = require('express');
const { readData, TRANSACTIONS_FILE, CATEGORIES_FILE } = require('../utils/fileStore');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const transactions = readData(TRANSACTIONS_FILE);
    const apiCategories = readData(CATEGORIES_FILE);
    
    // 1. Totals
    // Total expenses = sum of ALL debit transactions (regardless of category)
    const expenses = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => {
        const amount = parseFloat(t.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
    // Total income = sum of ALL credit transactions
    const income = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => {
        const amount = parseFloat(t.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
    const net = income - expenses;
    
    const totals = {
      expenses: Math.round(expenses * 100) / 100,
      income: Math.round(income * 100) / 100,
      net: Math.round(net * 100) / 100,
      transactionCount: transactions.length
    };
    
    // 2. Category Breakdown
    const debits = transactions.filter(t => t.type === 'debit' && t.status !== 'Failed');
    const breakdown = {};
    
    debits.forEach(t => {
      const cat = t.category || 'Uncategorized';
      if (!breakdown[cat]) {
        breakdown[cat] = { name: cat, total: 0, count: 0 };
      }
      breakdown[cat].total += t.amount;
      breakdown[cat].count++;
    });
    
    let grandTotal = 0;
    Object.values(breakdown).forEach(c => grandTotal += c.total);
    
    const categoryBreakdown = Object.values(breakdown).map(cat => {
      const dbCat = apiCategories.find(c => c.name === cat.name);
      return {
        ...cat,
        total: Math.round(cat.total * 100) / 100,
        percentage: grandTotal > 0 ? ((cat.total / grandTotal) * 100).toFixed(1) : "0",
        color: dbCat ? dbCat.color : '#95A5A6'
      };
    }).sort((a, b) => b.total - a.total);

    // 3. Monthly Data
    const monthly = {};
    transactions
      .filter(t => t.status !== 'Failed')
      .forEach(t => {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!monthly[key]) {
          monthly[key] = { key, label, debit: 0, credit: 0, count: 0 };
        }
        
        if (t.type === 'debit') {
          monthly[key].debit += t.amount;
        } else {
          monthly[key].credit += t.amount;
        }
        monthly[key].count++;
      });
      
    const monthlyData = Object.values(monthly)
      .map(m => ({
        ...m,
        debit: Math.round(m.debit * 100) / 100,
        credit: Math.round(m.credit * 100) / 100
      }))
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6); // Last 6 months
      
    // 4. Top Merchants
    const merchantMap = {};
    debits.forEach(t => {
      const key = t.normalizedMerchant;
      if (!merchantMap[key]) {
        merchantMap[key] = { display: t.merchant, category: t.category, total: 0, count: 0 };
      }
      merchantMap[key].total += t.amount;
      merchantMap[key].count++;
    });
    
    const topMerchants = Object.values(merchantMap)
      .map(m => ({ ...m, total: Math.round(m.total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
      
    // 5. Recent transactions
    const recentTransactions = [...transactions]
      .filter(t => t.status !== 'Failed')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    res.json({
      totals,
      categoryBreakdown,
      monthlyData,
      topMerchants,
      recentTransactions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
