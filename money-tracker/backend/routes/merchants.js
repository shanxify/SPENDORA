const express = require('express');
const supabase = require('../utils/supabaseClient');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, uncategorized } = req.query;

    let query = supabase.from('transactions').select('merchant, normalizedMerchant, category, amount').eq('type', 'debit');
    const { data: transactions, error } = await query;
    if (error) throw error;

    // Group by normalized merchant
    const merchantMap = {};
    (transactions || []).forEach(t => {
      const key = t.normalizedMerchant;
      if (!merchantMap[key]) {
        merchantMap[key] = { normalized: key, display: t.merchant, category: t.category, count: 0, totalSpend: 0 };
      }
      merchantMap[key].count += 1;
      merchantMap[key].totalSpend += parseFloat(t.amount) || 0;
    });

    let result = Object.values(merchantMap);

    if (search) result = result.filter(m => m.display.toLowerCase().includes(search.toLowerCase()));
    if (uncategorized === 'true') result = result.filter(m => m.category === 'Uncategorized');

    result.sort((a, b) => b.count !== a.count ? b.count - a.count : b.totalSpend - a.totalSpend);
    result.forEach(r => r.totalSpend = Math.round(r.totalSpend * 100) / 100);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/bulk/assign', async (req, res) => {
  try {
    const { merchants, category } = req.body;
    if (!merchants || !Array.isArray(merchants) || !category) {
      return res.status(400).json({ error: 'Valid merchants array and category are required' });
    }

    // Upsert merchant_map entries
    const upserts = merchants.map(normalized => ({ normalized, category }));
    await supabase.from('merchant_map').upsert(upserts, { onConflict: 'normalized' });

    // Update all matching transactions
    let updatedCount = 0;
    for (const normalized of merchants) {
      const { count } = await supabase
        .from('transactions')
        .update({ category })
        .eq('normalizedMerchant', normalized);
      updatedCount += count || 0;
    }

    res.json({ success: true, updatedMerchants: merchants.length, updatedTransactions: updatedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:normalized', async (req, res) => {
  try {
    const { normalized } = req.params;
    const { category } = req.body;
    if (!category) return res.status(400).json({ error: 'Category is required' });

    // Upsert merchant_map
    await supabase.from('merchant_map').upsert({ normalized, category }, { onConflict: 'normalized' });

    // Update transactions
    const { data, error } = await supabase
      .from('transactions')
      .update({ category })
      .eq('normalizedMerchant', normalized)
      .select();
    if (error) throw error;

    res.json({ success: true, updatedTransactions: data?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
