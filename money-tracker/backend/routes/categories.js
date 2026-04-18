const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { v4: uuidv4 } = require('uuid');

// GET all categories with transaction count
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    // Get transaction count per category
    const { data: counts } = await supabase
      .from('transactions')
      .select('category');

    const countMap = {};
    (counts || []).forEach(t => {
      countMap[t.category] = (countMap[t.category] || 0) + 1;
    });

    const result = (categories || []).map(cat => ({
      ...cat,
      transactionCount: countMap[cat.name] || 0
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE category
router.post('/', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const newCat = { id: uuidv4(), name, icon, color };

    const { data, error } = await supabase
      .from('categories')
      .insert(newCat)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, category: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const { data, error } = await supabase
      .from('categories')
      .update({ name, icon, color })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, category: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE category — move transactions to Uncategorized
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get category name first
    const { data: cat } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .single();

    if (cat) {
      // Move all transactions to Uncategorized
      await supabase
        .from('transactions')
        .update({ category: 'Uncategorized' })
        .eq('category', cat.name);
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
