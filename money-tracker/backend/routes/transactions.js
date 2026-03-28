const express = require('express');
const { readData, writeData, TRANSACTIONS_FILE } = require('../utils/fileStore');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { 
      search, category, from, to, type, 
      sort = 'date', order = 'desc', page = 1, limit = 20 
    } = req.query;

    let transactions = readData(TRANSACTIONS_FILE);

    if (search) {
      const s = search.toLowerCase();
      transactions = transactions.filter(t => 
        t.merchant.toLowerCase().includes(s) || 
        t.normalizedMerchant.toLowerCase().includes(s)
      );
    }
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }
    if (from) {
      transactions = transactions.filter(t => t.date >= from);
    }
    if (to) {
      transactions = transactions.filter(t => t.date <= to);
    }
    if (type && type !== 'all') {
      transactions = transactions.filter(t => t.type === type);
    }

    // Sorting
    transactions.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];
      
      if (sort === 'amount') {
        valA = Number(valA);
        valB = Number(valB);
      }
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const total = transactions.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const pages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    
    const paginated = transactions.slice(start, start + limitNum);

    res.json({
      transactions: paginated,
      total,
      page: pageNum,
      pages
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    
    const transactions = readData(TRANSACTIONS_FILE);
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    transactions[index].category = category;
    writeData(TRANSACTIONS_FILE, transactions);
    
    res.json({ success: true, transaction: transactions[index] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE all transactions at once
router.delete('/clear', async (req, res) => {
  try {
    // Write empty array to transactions.json
    writeData(TRANSACTIONS_FILE, []);
    // Optionally also clear merchant mappings for a fresh start
    // writeData('merchantMap', {}); // uncomment if you want full reset
    res.json({ 
      success: true, 
      message: 'All transactions cleared successfully',
      deleted: 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear transactions: ' + err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    let transactions = readData(TRANSACTIONS_FILE);
    
    const count = transactions.length;
    transactions = transactions.filter(t => t.id !== id);
    
    if (transactions.length === count) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    writeData(TRANSACTIONS_FILE, transactions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/', (req, res) => {
  try {
    const transactions = readData(TRANSACTIONS_FILE);
    writeData(TRANSACTIONS_FILE, []);
    res.json({ success: true, deleted: transactions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
