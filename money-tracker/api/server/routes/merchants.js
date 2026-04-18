const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET all merchants
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('merchant, normalized_merchant, category, amount, type');

    if (error) throw error;

    // Group by normalized merchant
    const merchantMap = {};
    (transactions || []).forEach(t => {
      const key = t.normalized_merchant;
      if (!merchantMap[key]) {
        merchantMap[key] = {
          normalized: key,
          display: t.merchant,
          category: t.category,
          count: 0,
          totalSpend: 0
        };
      }
      merchantMap[key].count++;
      if (t.type === 'debit') {
        merchantMap[key].totalSpend += parseFloat(t.amount || 0);
      }
    });

    let result = Object.values(merchantMap);

    if (search) {
      result = result.filter(m =>
        m.display.toLowerCase().includes(search.toLowerCase())
      );
    }

    result.sort((a, b) => b.totalSpend - a.totalSpend);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE merchant category — updates all matching transactions
router.put('/:normalized', async (req, res) => {
  try {
    const { normalized } = req.params;
    const { category } = req.body;

    // Update all transactions with this normalized merchant
    const { data, error } = await supabase
      .from('transactions')
      .update({ category })
      .eq('normalized_merchant', normalized)
      .select();

    if (error) throw error;

    // Save to merchant_map table
    await supabase
      .from('merchant_map')
      .upsert({
        normalized_merchant: normalized,
        category_name: category
      });

    res.json({ success: true, updatedTransactions: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BULK update merchants
router.put('/bulk', async (req, res) => {
  try {
    const { merchants, category } = req.body;

    let totalUpdated = 0;
    for (const normalized of merchants) {
      const { data } = await supabase
        .from('transactions')
        .update({ category })
        .eq('normalized_merchant', normalized)
        .select();

      await supabase
        .from('merchant_map')
        .upsert({ normalized_merchant: normalized, category_name: category });

      totalUpdated += data?.length || 0;
    }

    res.json({ success: true, updatedTransactions: totalUpdated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
