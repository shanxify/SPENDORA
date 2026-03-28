const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parsePDF } = require('../services/pdfParser');
const { filterDuplicates } = require('../services/duplicateDetector');
const { readData, writeData, TRANSACTIONS_FILE, MERCHANT_MAP_FILE } = require('../utils/fileStore');

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
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
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const newTransactions = await parsePDF(filePath);
    
    // Clean up uploaded file
    fs.unlink(filePath, () => {});

    if (!newTransactions || newTransactions.length === 0) {
      return res.status(422).json({ 
        error: 'No transactions found. Make sure this is a PhonePe statement PDF.' 
      });
    }

    const existingTransactions = readData(TRANSACTIONS_FILE);
    const merchantMap = readData(MERCHANT_MAP_FILE);
    
    // Map categories based on recognized merchants
    const merchantCategoryMap = {};
    merchantMap.forEach(m => merchantCategoryMap[m.normalized] = m.category);

    newTransactions.forEach(t => {
      if (merchantCategoryMap[t.normalizedMerchant]) {
        t.category = merchantCategoryMap[t.normalizedMerchant];
      }
    });

    const { added, duplicates } = filterDuplicates(newTransactions, existingTransactions);

    if (added.length > 0) {
      writeData(TRANSACTIONS_FILE, [...existingTransactions, ...added]);
    }

    res.json({
      success: true,
      extracted: newTransactions.length,
      added: added.length,
      duplicates: duplicates,
      transactions: added
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: error.message });
  }
});
router.post('/debug-parse', upload.single('file'), async (req, res) => {
  try {
    const pdfParse = require('pdf-parse');
    const fs = require('fs');
    const { extractTransactions } = require('../services/transactionExtractor');
    
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    const rawText = data.text;
    
    // Extract transactions
    const transactions = extractTransactions(rawText);
    
    // Return full debug info
    res.json({
      rawTextLength: rawText.length,
      rawTextFirst3000: rawText.substring(0, 3000),
      rawTextLast2000: rawText.substring(rawText.length - 2000),
      totalFound: transactions.length,
      allUTRs: transactions.map(t => ({
        date: t.date,
        time: t.time,
        merchant: t.merchant,
        amount: t.amount,
        type: t.type,
        utr: t.upiRef,
        txnId: t.transactionId
      })),
      totalDebit: transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
      totalCredit: transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
