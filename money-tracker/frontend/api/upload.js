const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');
const { extractTransactions } = require('./transactionExtractor');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files accepted'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('*', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;
    if (!rawText || rawText.trim().length < 50)
      return res.status(422).json({ error: 'PDF appears empty or unreadable' });

    const extractedTransactions = extractTransactions(rawText);
    if (extractedTransactions.length === 0)
      return res.status(422).json({ error: 'No transactions found. Make sure this is a PhonePe statement PDF.' });

    const { data: existingData } = await supabase
      .from('transactions')
      .select('"upiRef", "transactionId", date, amount, "normalizedMerchant"');
    const existing = existingData || [];

    const { data: merchantMapData } = await supabase.from('merchant_map').select('*');
    const merchantMap = {};
    (merchantMapData || []).forEach(m => { merchantMap[m.normalized] = m.category; });

    const newTransactions = [];
    let duplicateCount = 0;

    for (const txn of extractedTransactions) {
      let isDuplicate = false;
      if (txn.upiRef) isDuplicate = existing.some(e => e.upiRef === txn.upiRef);
      else if (txn.transactionId) isDuplicate = existing.some(e => e.transactionId === txn.transactionId);
      else isDuplicate = existing.some(e =>
        e.date === txn.date &&
        parseFloat(e.amount) === txn.amount && e.normalizedMerchant === txn.normalizedMerchant
      );

      if (isDuplicate) { duplicateCount++; continue; }

      newTransactions.push({
        id: txn.id, date: txn.date,
        merchant: txn.merchant,
        normalizedMerchant: txn.normalizedMerchant,
        amount: txn.amount, type: txn.type,
        category: merchantMap[txn.normalizedMerchant] || 'Uncategorized',
        upiRef: txn.upiRef || null, transactionId: txn.transactionId || null,
        status: txn.status || 'Success'
      });
    }

    if (newTransactions.length > 0) {
      const { error: insertError } = await supabase.from('transactions').insert(newTransactions);
      if (insertError) throw insertError;
    }

    res.json({ success: true, extracted: extractedTransactions.length, added: newTransactions.length, duplicates: duplicateCount });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
