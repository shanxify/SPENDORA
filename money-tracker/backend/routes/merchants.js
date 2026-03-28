const express = require('express');
const { readData, writeData, TRANSACTIONS_FILE, MERCHANT_MAP_FILE } = require('../utils/fileStore');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { search, uncategorized } = req.query;
    const transactions = readData(TRANSACTIONS_FILE);
    
    // Group transactions by normalized merchant
    const merchantMap = {};
    
    transactions.forEach(t => {
      // Only debits are considered for merchants usually
      if (t.type !== 'debit') return;
      
      const key = t.normalizedMerchant;
      
      if (!merchantMap[key]) {
        merchantMap[key] = {
          normalized: key,
          display: t.merchant,
          category: t.category,
          count: 0,
          totalSpend: 0
        };
      }
      
      merchantMap[key].count += 1;
      merchantMap[key].totalSpend += t.amount;
    });
    
    let result = Object.values(merchantMap);
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(m => m.display.toLowerCase().includes(s));
    }
    
    if (uncategorized === 'true') {
      result = result.filter(m => m.category === 'Uncategorized');
    }
    
    // Sort by count and then spend by default
    result.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.totalSpend - a.totalSpend;
    });
    
    // Round total spend for all
    result.forEach(r => r.totalSpend = Math.round(r.totalSpend * 100) / 100);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:normalized', (req, res) => {
  try {
    const { normalized } = req.params;
    const { category } = req.body;
    
    if (!category) return res.status(400).json({ error: 'Category is required' });
    
    // Update map
    const map = readData(MERCHANT_MAP_FILE);
    const existingIndex = map.findIndex(m => m.normalized === normalized);
    
    if (existingIndex >= 0) {
      map[existingIndex].category = category;
    } else {
      map.push({ normalized, category });
    }
    writeData(MERCHANT_MAP_FILE, map);
    
    // Update transactions
    const transactions = readData(TRANSACTIONS_FILE);
    let updatedCount = 0;
    
    transactions.forEach(t => {
      if (t.normalizedMerchant === normalized) {
        t.category = category;
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) writeData(TRANSACTIONS_FILE, transactions);
    
    res.json({ success: true, updatedTransactions: updatedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/bulk/assign', (req, res) => {
  try {
    const { merchants, category } = req.body;
    
    if (!merchants || !Array.isArray(merchants) || !category) {
      return res.status(400).json({ error: 'Valid merchants array and category are required' });
    }
    
    const map = readData(MERCHANT_MAP_FILE);
    let updatedMerchants = 0;
    
    merchants.forEach(normalized => {
      const existingIndex = map.findIndex(m => m.normalized === normalized);
      if (existingIndex >= 0) {
        map[existingIndex].category = category;
      } else {
        map.push({ normalized, category });
      }
      updatedMerchants++;
    });
    
    writeData(MERCHANT_MAP_FILE, map);
    
    const transactions = readData(TRANSACTIONS_FILE);
    let updatedCount = 0;
    
    transactions.forEach(t => {
      if (merchants.includes(t.normalizedMerchant)) {
        t.category = category;
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) writeData(TRANSACTIONS_FILE, transactions);
    
    res.json({ success: true, updatedMerchants, updatedTransactions: updatedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
