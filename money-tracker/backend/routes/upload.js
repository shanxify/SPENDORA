const express = require('express');
const multer = require('multer');
const { parsePDF } = require('../services/pdfParser');
const { filterDuplicates } = require('../services/duplicateDetector');
const supabase = require('../utils/supabaseClient');

const router = express.Router();

// Use memory storage — no files written to disk (Vercel compatible)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'));
    }
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Pass buffer directly — no disk write needed
    const newTransactions = await parsePDF(req.file.buffer);

    if (!newTransactions || newTransactions.length === 0) {
      return res.status(422).json({
        error: 'No transactions found. Make sure this is a PhonePe statement PDF.'
      });
    }

    // Load merchant map from Supabase to pre-categorize
    const { data: merchantMap } = await supabase.from('merchant_map').select('*');
    const merchantCategoryMap = {};
    (merchantMap || []).forEach(m => merchantCategoryMap[m.normalized] = m.category);

    newTransactions.forEach(t => {
      if (merchantCategoryMap[t.normalizedMerchant]) {
        t.category = merchantCategoryMap[t.normalizedMerchant];
      }
    });

    // Load existing transactions to detect duplicates
    const { data: existingTransactions } = await supabase.from('transactions').select('id, upiRef, transactionId, amount, date');
    const { added, duplicates } = filterDuplicates(newTransactions, existingTransactions || []);

    if (added.length > 0) {
      const { error } = await supabase.from('transactions').insert(added);
      if (error) throw error;
    }

    res.json({
      success: true,
      extracted: newTransactions.length,
      added: added.length,
      duplicates,
      transactions: added
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
