const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET all transactions with filters and pagination
router.get('/', async (req, res) => {
  try {
    const { search, category, type, from, to, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('merchant', `%${search}%`);
    }
    if (category && category !== 'All Categories' && category !== 'all') {
      query = query.eq('category', category);
    }
    if (type && type !== 'All Types' && type !== 'all') {
      query = query.eq('type', type.toLowerCase());
    }
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);

    // Sort by date descending
    query = query.order('date', { ascending: false })
                 .order('time', { ascending: false });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum - 1;

    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      data: data || [],
      total: count || 0,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
      limit: limitNum
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE transaction category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    const { data, error } = await supabase
      .from('transactions')
      .update({ category })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, transaction: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CLEAR all transactions
router.delete('/clear', async (req, res) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .neq('id', '');

    if (error) throw error;
    res.json({ success: true, message: 'All transactions cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE single transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
