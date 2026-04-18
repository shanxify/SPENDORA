const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../supabase');
const { extractTransactions } = require('../services/transactionExtractor');
const pdfParse = require('pdf-parse');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files accepted'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length < 50) {
      return res.status(422).json({ error: 'PDF appears empty or unreadable' });
    }

    const extractedTransactions = extractTransactions(rawText);

    if (extractedTransactions.length === 0) {
      return res.status(422).json({
        error: 'No transactions found. Make sure this is a PhonePe statement PDF.'
      });
    }

    // Get existing UTR numbers for duplicate detection
    const { data: existingData } = await supabase
      .from('transactions')
      .select('upi_ref, transaction_id, date, amount, normalized_merchant, time');

    const existing = existingData || [];

    // Get merchant map for auto-categorization
    const { data: merchantMapData } = await supabase
      .from('merchant_map')
      .select('*');

    const merchantMap = {};
    (merchantMapData || []).forEach(m => {
      merchantMap[m.normalized_merchant] = m.category_name;
    });

    // Filter duplicates and apply categories
    const newTransactions = [];
    let duplicateCount = 0;

    for (const txn of extractedTransactions) {
      // Check duplicate by UTR
      let isDuplicate = false;

      if (txn.upiRef) {
        isDuplicate = existing.some(e => e.upi_ref === txn.upiRef);
      } else if (txn.transactionId) {
        isDuplicate = existing.some(e => e.transaction_id === txn.transactionId);
      } else {
        isDuplicate = existing.some(e =>
          e.date === txn.date &&
          e.time === txn.time &&
          parseFloat(e.amount) === txn.amount &&
          e.normalized_merchant === txn.normalizedMerchant
        );
      }

      if (isDuplicate) {
        duplicateCount++;
        continue;
      }

      // Apply category from merchant map
      const category = merchantMap[txn.normalizedMerchant] || 'Uncategorized';

      newTransactions.push({
        id: txn.id,
        date: txn.date,
        time: txn.time,
        merchant: txn.merchant,
        raw_merchant: txn.rawMerchant,
        normalized_merchant: txn.normalizedMerchant,
        amount: txn.amount,
        type: txn.type,
        category: category,
        upi_ref: txn.upiRef || null,
        transaction_id: txn.transactionId || null,
        status: txn.status || 'Success',
        uploaded_at: new Date().toISOString()
      });
    }

    // Insert new transactions into Supabase
    if (newTransactions.length > 0) {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(newTransactions);

      if (insertError) throw insertError;
    }

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      extracted: extractedTransactions.length,
      added: newTransactions.length,
      duplicates: duplicateCount
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
