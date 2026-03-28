const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData, CATEGORIES_FILE, TRANSACTIONS_FILE } = require('../utils/fileStore');

const router = express.Router();

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { id: '2', name: 'Groceries', icon: '🛒', color: '#4ECDC4' },
  { id: '3', name: 'Transport', icon: '🚗', color: '#45B7D1' },
  { id: '4', name: 'Shopping', icon: '🛍️', color: '#96CEB4' },
  { id: '5', name: 'Entertainment', icon: '🎬', color: '#FFEEAD' },
  { id: '6', name: 'Bills & Utilities', icon: '⚡', color: '#D4A5A5' },
  { id: '7', name: 'Health & Fitness', icon: '💪', color: '#9B59B6' },
  { id: '8', name: 'Income', icon: '💰', color: '#22C55E' },
  { id: '9', name: 'Investments', icon: '📈', color: '#00D4AA'},
  { id: '10', name: 'Others', icon: '📦', color: '#95A5A6' }
];

router.get('/', (req, res) => {
  try {
    let categories = readData(CATEGORIES_FILE);
    
    // Initialize default categories if none exist
    if (categories.length === 0) {
      categories = DEFAULT_CATEGORIES;
      writeData(CATEGORIES_FILE, categories);
    }
    
    const transactions = readData(TRANSACTIONS_FILE);
    
    // Add transaction counts
    const categoriesWithCounts = categories.map(cat => {
      const count = transactions.filter(t => t.category === cat.name).length;
      return { ...cat, transactionCount: count };
    });
    
    res.json(categoriesWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, icon, color } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const categories = readData(CATEGORIES_FILE);
    
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    const newCategory = {
      id: uuidv4(),
      name,
      icon: icon || '📁',
      color: color || '#95A5A6'
    };
    
    categories.push(newCategory);
    writeData(CATEGORIES_FILE, categories);
    
    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    
    const categories = readData(CATEGORIES_FILE);
    let category = categories.find(c => c.id === id);
    
    if (!category) return res.status(404).json({ error: 'Category not found' });
    
    const oldName = category.name;
    
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    
    writeData(CATEGORIES_FILE, categories);
    
    // If name changed, update transactions
    if (name && oldName !== name) {
      const transactions = readData(TRANSACTIONS_FILE);
      let updatedCount = 0;
      
      transactions.forEach(t => {
        if (t.category === oldName) {
          t.category = name;
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) writeData(TRANSACTIONS_FILE, transactions);
    }
    
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    let categories = readData(CATEGORIES_FILE);
    
    const category = categories.find(c => c.id === id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    
    categories = categories.filter(c => c.id !== id);
    writeData(CATEGORIES_FILE, categories);
    
    const transactions = readData(TRANSACTIONS_FILE);
    let reassignedCount = 0;
    
    transactions.forEach(t => {
      if (t.category === category.name) {
        t.category = 'Uncategorized';
        reassignedCount++;
      }
    });
    
    if (reassignedCount > 0) writeData(TRANSACTIONS_FILE, transactions);
    
    res.json({ success: true, reassigned: reassignedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
