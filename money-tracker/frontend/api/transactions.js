const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, method } = req;

  // DELETE /api/transactions/clear
  if (method === 'DELETE' && url.includes('/clear')) {
    const { error } = await supabase.from('transactions').delete().neq('id', '');
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, message: 'All transactions cleared' });
  }

  // DELETE /api/transactions/:id
  if (method === 'DELETE') {
    const idMatch = url.match(/\/api\/transactions\/(.+)/);
    if (idMatch) {
      const id = idMatch[1];
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
  }

  // PUT /api/transactions/:id
  if (method === 'PUT') {
    const idMatch = url.match(/\/api\/transactions\/(.+)/);
    if (idMatch) {
      const id = idMatch[1];
      const { category } = req.body;
      const { data, error } = await supabase.from('transactions').update({ category }).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, transaction: data });
    }
  }

  // GET /api/transactions
  if (method === 'GET') {
    const urlObj = new URL(url, 'http://localhost');
    const search = urlObj.searchParams.get('search');
    const category = urlObj.searchParams.get('category');
    const type = urlObj.searchParams.get('type');
    const from = urlObj.searchParams.get('from');
    const to = urlObj.searchParams.get('to');
    const page = parseInt(urlObj.searchParams.get('page') || '1');
    const limit = parseInt(urlObj.searchParams.get('limit') || '20');

    let query = supabase.from('transactions').select('*', { count: 'exact' });
    if (search) query = query.ilike('merchant', `%${search}%`);
    if (category && category !== 'All Categories' && category !== 'all') query = query.eq('category', category);
    if (type && type !== 'All Types' && type !== 'all') query = query.eq('type', type.toLowerCase());
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);

    const start = (page - 1) * limit;
    const { data, error, count } = await query
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .range(start, start + limit - 1);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / limit), limit });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
