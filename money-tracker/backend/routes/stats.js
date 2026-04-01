const express = require('express');
const supabase = require('../utils/supabaseClient');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data: transactions, error: txError } = await supabase.from('transactions').select('*');
    if (txError) throw txError;

    const { data: apiCategories } = await supabase.from('categories').select('*');

    const expenses = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const income = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const totals = {
      expenses: Math.round(expenses * 100) / 100,
      income: Math.round(income * 100) / 100,
      net: Math.round((income - expenses) * 100) / 100,
      transactionCount: transactions.length
    };

    const debits = transactions.filter(t => t.type === 'debit' && t.status !== 'Failed');
    const breakdown = {};
    debits.forEach(t => {
      const cat = t.category || 'Uncategorized';
      if (!breakdown[cat]) breakdown[cat] = { name: cat, total: 0, count: 0 };
      breakdown[cat].total += parseFloat(t.amount) || 0;
      breakdown[cat].count++;
    });

    let grandTotal = 0;
    Object.values(breakdown).forEach(c => grandTotal += c.total);

    const categoryBreakdown = Object.values(breakdown).map(cat => {
      const dbCat = (apiCategories || []).find(c => c.name === cat.name);
      return {
        ...cat,
        total: Math.round(cat.total * 100) / 100,
        percentage: grandTotal > 0 ? ((cat.total / grandTotal) * 100).toFixed(1) : '0',
        color: dbCat ? dbCat.color : '#95A5A6'
      };
    }).sort((a, b) => b.total - a.total);

    const monthly = {};
    transactions.filter(t => t.status !== 'Failed').forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthly[key]) monthly[key] = { key, label, debit: 0, credit: 0, count: 0 };
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'debit') monthly[key].debit += amt;
      else monthly[key].credit += amt;
      monthly[key].count++;
    });

    const monthlyData = Object.values(monthly)
      .map(m => ({ ...m, debit: Math.round(m.debit * 100) / 100, credit: Math.round(m.credit * 100) / 100 }))
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);

    const merchantMap = {};
    debits.forEach(t => {
      const key = t.normalizedMerchant;
      if (!merchantMap[key]) merchantMap[key] = { display: t.merchant, category: t.category, total: 0, count: 0 };
      merchantMap[key].total += parseFloat(t.amount) || 0;
      merchantMap[key].count++;
    });

    const topMerchants = Object.values(merchantMap)
      .map(m => ({ ...m, total: Math.round(m.total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const recentTransactions = [...transactions]
      .filter(t => t.status !== 'Failed')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({ totals, categoryBreakdown, monthlyData, topMerchants, recentTransactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
