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

  // PUT /api/categories/:id
  if (method === 'PUT') {
    const idMatch = url.match(/\/api\/categories\/(.+)/);
    if (idMatch) {
      const id = idMatch[1];
      const { name, icon, color } = req.body;
      const { data, error } = await supabase.from('categories').update({ name, icon, color }).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, category: data });
    }
  }

  // DELETE /api/categories/:id
  if (method === 'DELETE') {
    const idMatch = url.match(/\/api\/categories\/(.+)/);
    if (idMatch) {
      const id = idMatch[1];
      const { data: cat } = await supabase.from('categories').select('name').eq('id', id).single();
      if (cat) await supabase.from('transactions').update({ category: 'Uncategorized' }).eq('category', cat.name);
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
  }

  // POST /api/categories
  if (method === 'POST') {
    const { v4: uuidv4 } = require('uuid');
    const { name, icon, color } = req.body;
    const { data, error } = await supabase.from('categories').insert({ id: uuidv4(), name, icon, color }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, category: data });
  }

  // GET /api/categories
  if (method === 'GET') {
    const { data: categories, error } = await supabase.from('categories').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    const { data: txns } = await supabase.from('transactions').select('category');
    const countMap = {};
    (txns || []).forEach(t => { countMap[t.category] = (countMap[t.category] || 0) + 1; });
    const result = (categories || []).map(cat => ({ ...cat, transactionCount: countMap[cat.name] || 0 }));
    return res.json(result);
  }

  res.status(405).json({ error: 'Method not allowed' });
};
