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

router.post('/cleanup-merchants', async (req, res) => {
  try {
    const { data: transactions, error: fetchError } = await supabase.from('transactions').select('*');
    if (fetchError) throw fetchError;
    
    function stripEmojis(text) {
      if (!text) return '';
      return text
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
        .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
        .replace(/[\u{E0000}-\u{E007F}]/gu, '')
        .replace(/[\u200D]/g, '')
        .replace(/[\uFE0F]/g, '')
        .replace(/[\u20E3]/g, '')
        .replace(/[^\x20-\x7E\u00C0-\u024F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const updates = [];
    
    for (const t of transactions) {
      const cleanMerchantText = stripEmojis(t.merchant);
      const cleanNormalized = stripEmojis(t.merchant)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
        
      if (t.merchant !== cleanMerchantText || t.normalizedMerchant !== cleanNormalized) {
        updates.push({
          id: t.id,
          merchant: cleanMerchantText,
          normalizedMerchant: cleanNormalized || 'unknown'
        });
      }
    }
    
    for (const u of updates) {
      await supabase.from('transactions').update({ 
        merchant: u.merchant, 
        normalizedMerchant: u.normalizedMerchant 
      }).eq('id', u.id);
    }

    res.json({ 
      success: true, 
      message: `Cleaned ${updates.length} transactions`,
      example: updates.length > 0 ? updates.find(t => t.merchant.includes('Ruchi')) || updates[0] : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
