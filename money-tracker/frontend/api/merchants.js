const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, method } = req;

  // PUT /api/merchants/bulk
  if (method === 'PUT' && url.includes('/bulk')) {
    const { merchants, category } = req.body;
    let totalUpdated = 0;
    for (const normalized of (merchants || [])) {
      const { data } = await supabase.from('transactions').update({ category }).eq('normalized_merchant', normalized).select();
      await supabase.from('merchant_map').upsert({ normalized_merchant: normalized, category_name: category });
      totalUpdated += data?.length || 0;
    }
    return res.json({ success: true, updatedTransactions: totalUpdated });
  }

  // PUT /api/merchants/:normalized
  if (method === 'PUT') {
    const parts = url.split('/api/merchants/');
    if (parts[1]) {
      const normalized = decodeURIComponent(parts[1].split('?')[0]);
      const { category } = req.body;
      const { data, error } = await supabase.from('transactions').update({ category }).eq('normalized_merchant', normalized).select();
      if (error) return res.status(500).json({ error: error.message });
      await supabase.from('merchant_map').upsert({ normalized_merchant: normalized, category_name: category });
      return res.json({ success: true, updatedTransactions: data?.length || 0 });
    }
  }

  // GET /api/merchants
  if (method === 'GET') {
    const urlObj = new URL(url, 'http://localhost');
    const search = urlObj.searchParams.get('search');
    const { data: transactions, error } = await supabase.from('transactions').select('merchant, normalized_merchant, category, amount, type');
    if (error) return res.status(500).json({ error: error.message });

    const merchantMap = {};
    (transactions || []).forEach(t => {
      const key = t.normalized_merchant;
      if (!merchantMap[key]) merchantMap[key] = { normalized: key, display: t.merchant, category: t.category, count: 0, totalSpend: 0 };
      merchantMap[key].count++;
      if (t.type === 'debit') merchantMap[key].totalSpend += parseFloat(t.amount || 0);
    });

    let result = Object.values(merchantMap);
    if (search) result = result.filter(m => m.display.toLowerCase().includes(search.toLowerCase()));
    result.sort((a, b) => b.totalSpend - a.totalSpend);
    return res.json(result);
  }

  res.status(405).json({ error: 'Method not allowed' });
};
