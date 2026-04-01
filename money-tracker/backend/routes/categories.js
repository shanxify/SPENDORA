const express = require('express');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../utils/supabaseClient');

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
  { id: '9', name: 'Investments', icon: '📈', color: '#00D4AA' },
  { id: '10', name: 'Others', icon: '📦', color: '#95A5A6' }
];

router.get('/', async (req, res) => {
  try {
    let { data: categories, error } = await supabase.from('categories').select('*');
    if (error) throw error;

    // Seed defaults if empty
    if (!categories || categories.length === 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('categories')
        .insert(DEFAULT_CATEGORIES)
        .select();
      if (insertError) throw insertError;
      categories = inserted;
    }

    const { data: transactions } = await supabase.from('transactions').select('category');
    const categoriesWithCounts = categories.map(cat => {
      const count = (transactions || []).filter(t => t.category === cat.name).length;
      return { ...cat, transactionCount: count };
    });

    res.json(categoriesWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', name)
      .single();

    if (existing) return res.status(400).json({ error: 'Category already exists' });

    const newCategory = { id: uuidv4(), name, icon: icon || '📁', color: color || '#95A5A6' };
    const { data, error } = await supabase.from('categories').insert(newCategory).select().single();
    if (error) throw error;

    res.status(201).json({ success: true, category: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const { data: existing, error: fetchError } = await supabase
      .from('categories').select('*').eq('id', id).single();
    if (fetchError || !existing) return res.status(404).json({ error: 'Category not found' });

    const oldName = existing.name;
    const updates = {};
    if (name) updates.name = name;
    if (icon) updates.icon = icon;
    if (color) updates.color = color;

    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;

    // If name changed, update transaction categories
    if (name && oldName !== name) {
      await supabase.from('transactions').update({ category: name }).eq('category', oldName);
    }

    res.json({ success: true, category: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: category, error: fetchError } = await supabase
      .from('categories').select('*').eq('id', id).single();
    if (fetchError || !category) return res.status(404).json({ error: 'Category not found' });

    await supabase.from('categories').delete().eq('id', id);

    // Reassign transactions to Uncategorized
    const { count } = await supabase
      .from('transactions')
      .update({ category: 'Uncategorized' })
      .eq('category', category.name);

    res.json({ success: true, reassigned: count || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
