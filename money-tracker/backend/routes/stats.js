const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

router.get('/', async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*');

    if (error) throw error;

    const txns = transactions || [];

    // Totals
    const totalExpenses = txns
      .filter(t => t.type === 'debit')
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    const totalIncome = txns
      .filter(t => t.type === 'credit')
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    const netBalance = totalIncome - totalExpenses;

    // Category breakdown (debits only)
    const catMap = {};
    txns.filter(t => t.type === 'debit').forEach(t => {
      const cat = t.category || 'Uncategorized';
      if (!catMap[cat]) catMap[cat] = { name: cat, total: 0, count: 0 };
      catMap[cat].total += parseFloat(t.amount || 0);
      catMap[cat].count++;
    });

    const grandTotal = Object.values(catMap).reduce((s, c) => s + c.total, 0);
    const categoryBreakdown = Object.values(catMap)
      .map(c => ({
        ...c,
        total: Math.round(c.total * 100) / 100,
        percentage: grandTotal > 0 ? ((c.total / grandTotal) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly breakdown
    const monthMap = {};
    txns.forEach(t => {
      if (!t.date) return;
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthMap[key]) monthMap[key] = { key, label, debit: 0, credit: 0, count: 0 };
      if (t.type === 'debit') monthMap[key].debit += parseFloat(t.amount || 0);
      else monthMap[key].credit += parseFloat(t.amount || 0);
      monthMap[key].count++;
    });

    const monthlyData = Object.values(monthMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(m => ({
        ...m,
        debit: Math.round(m.debit * 100) / 100,
        credit: Math.round(m.credit * 100) / 100
      }));

    // Top 5 merchants by spend
    const merchantMap = {};
    txns.filter(t => t.type === 'debit').forEach(t => {
      const key = t.normalized_merchant || t.merchant;
      if (!merchantMap[key]) {
        merchantMap[key] = { display: t.merchant, category: t.category, total: 0, count: 0 };
      }
      merchantMap[key].total += parseFloat(t.amount || 0);
      merchantMap[key].count++;
    });

    const topMerchants = Object.values(merchantMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(m => ({ ...m, total: Math.round(m.total * 100) / 100 }));

    // Recent 10 transactions
    const recentTransactions = txns
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Last updated month
    const lastUpdated = monthlyData.length > 0
      ? monthlyData[monthlyData.length - 1].label
      : 'No data';

    res.json({
      totals: {
        expenses: Math.round(totalExpenses * 100) / 100,
        income: Math.round(totalIncome * 100) / 100,
        net: Math.round(netBalance * 100) / 100,
        transactionCount: txns.length
      },
      categoryBreakdown,
      monthlyData,
      topMerchants,
      recentTransactions,
      lastUpdated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
