const express = require('express');
const { readData, writeData, TRANSACTIONS_FILE } = require('../utils/fileStore');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    let transactions = readData(TRANSACTIONS_FILE);

    const { search, category, type, from, to, page = 1, limit = 20 } = req.query;

    // Apply filters first
    if (search) {
      transactions = transactions.filter(t =>
        t.merchant.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category && category !== 'All Categories' && category !== 'all') {
      transactions = transactions.filter(t => t.category === category);
    }
    if (type && type !== 'All Types' && type !== 'all') {
      transactions = transactions.filter(t => t.type === type.toLowerCase());
    }
    if (from) {
      transactions = transactions.filter(t => t.date >= from);
    }
    if (to) {
      transactions = transactions.filter(t => t.date <= to);
    }

    // Sort by date descending (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination AFTER filtering
    const totalCount = transactions.length;
    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const totalPages = Math.ceil(totalCount / pageLimit);
    const start = (currentPage - 1) * pageLimit;
    const end = start + pageLimit;
    const paginatedData = transactions.slice(start, end);

    res.json({
      data: paginatedData,
      total: totalCount,
      page: currentPage,
      totalPages: totalPages,
      limit: pageLimit
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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
