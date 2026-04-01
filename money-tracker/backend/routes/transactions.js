const express = require('express');
const supabase = require('../utils/supabaseClient');

const router = express.Router();

function parseCustomDate(dateStr) {
  const parsed = new Date(dateStr);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

router.get('/', async (req, res) => {
  try {
    const { search, category, type, fromDate, toDate, page = 1, limit = 20 } = req.query;

    let query = supabase.from('transactions').select('*');

    if (search) query = query.ilike('merchant', `%${search}%`);
    if (category && category !== 'All Categories' && category !== 'all') {
      query = query.eq('category', category);
    }
    if (type && type !== 'All Types' && type !== 'all') {
      query = query.eq('type', type.toLowerCase());
    }
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      query = query.gte('date', from.toISOString().split('T')[0]);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      query = query.lte('date', to.toISOString().split('T')[0]);
    }

    const { data: all, error: countError } = await query;
    if (countError) throw countError;

    // Sort by date descending
    all.sort((a, b) => parseCustomDate(b.date) - parseCustomDate(a.date));

    const totalCount = all.length;
    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const start = (currentPage - 1) * pageLimit;
    const paginatedData = all.slice(start, start + pageLimit);

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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/clear', async (req, res) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .neq('id', ''); // delete all rows
    if (error) throw error;
    res.json({ success: true, message: 'All transactions cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { error } = await supabase.from('transactions').delete().neq('id', '');
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
