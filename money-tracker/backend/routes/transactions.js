const express = require('express');
const { readData, writeData, TRANSACTIONS_FILE } = require('../utils/fileStore');

const router = express.Router();

function parseCustomDate(dateStr) {
  if (!dateStr) return new Date(0);
  // Example: "26 Mar 2026"
  if (dateStr.includes(" ")) {
    const [day, monthStr, year] = dateStr.split(" ");
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    return new Date(year, monthMap[monthStr], parseInt(day));
  }
  // Safe fallback for standard dates like "2026-03-24"
  return new Date(dateStr + 'T00:00:00');
}

router.get('/', (req, res) => {
  try {
    let transactions = readData(TRANSACTIONS_FILE);

    const { search, category, type, fromDate, toDate, page = 1, limit = 20 } = req.query;

    // Additional filters (search, category, type) are preserved per usual route behavior
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

    // FIXED DATE FILTER
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      transactions = transactions.filter(t => {
        const txDate = parseCustomDate(t.date);
        return txDate >= from && txDate <= to;
      });
    }

    // SORT
    transactions.sort((a, b) => parseCustomDate(b.date) - parseCustomDate(a.date));

    // PAGINATION
    const totalCount = transactions.length;
    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);

    const start = (currentPage - 1) * pageLimit;
    const end = start + pageLimit;

    const paginatedData = transactions.slice(start, end);

    res.json({
      data: paginatedData,
      total: totalCount,
      page: currentPage,
      totalPages: Math.ceil(totalCount / pageLimit)
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
