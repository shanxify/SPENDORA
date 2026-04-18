const { v4: uuidv4 } = require('uuid');

const MONTHS = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};

function stripEmojis(text) {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{E0000}-\u{E007F}]/gu, '')
    .replace(/[\u200D]/g, '')
    .replace(/[\uFE0F]/g, '')
    .replace(/[\u20E3]/g, '')
    .replace(/[^\x20-\x7E\u00C0-\u024F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanMerchant(raw) {
  let name = raw.trim();
  name = name.replace(/^(Paid to|Received from|Refund from)\s*/i, '');
  name = name.replace(/^for\s+/i, '');
  name = name.replace(/\s+(DEBIT|CREDIT)$/i, '');
  name = name.trim();
  // Title case
  name = name.split(' ').map(w => w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
  return name || 'Unknown Merchant';
}

function normalizeMerchant(displayName) {
  return displayName.toLowerCase()
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/[^a-z0-9]/g, '')
    .trim() || 'unknown';
}

function parseAmount(str) {
  const cleaned = str.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

function extractTransactions(rawText) {
  let cleaned = rawText;
  cleaned = cleaned.replace(/Page\s+\d+\s+of\s+\d+/gi, '');
  cleaned = cleaned.replace(/Date\s+Transaction\s+Details\s+Type\s+Amount/gi, '');
  cleaned = cleaned.replace(/This\s+is\s+a\s+system\s+generated\s+statement\./gi, '');
  cleaned = cleaned.replace(/For\s+any\s+queries,?\s+contact\s+us\s+at\s+https?:\/\/[^\s\n]*/gi, '');
  cleaned = cleaned.replace(/https?:\/\/support\.phonepe\.com[^\s\n]*/gi, '');
  cleaned = cleaned.replace(/https?:\/\/www\.phonepe\.com[^\s\n]*/gi, '');
  cleaned = cleaned.replace(/This\s+is\s+an\s+automatically\s+generated\s+statement[\s\S]*?Privacy\s+Policy\./gi, '');
  cleaned = cleaned.replace(/Customer\(s\)\s+are\s+requested[\s\S]*?Privacy\s+Policy\./gi, '');
  cleaned = cleaned.replace(/Disclaimer\s*:[\s\S]*?details are corrected\./gi, '');
  cleaned = cleaned.replace(/Do\s+not\s+fall\s+prey[\s\S]*?details are corrected\./gi, '');
  cleaned = cleaned.replace(/Datetransaction\s*Detailstypeamount/gi, '');
  cleaned = cleaned.replace(/DateTransaction\s*DetailsTypeAmount/gi, '');
  cleaned = cleaned.replace(/Athttps?:\/\/[^\s\n]*/gi, '');
  cleaned = cleaned.replace(/Athttp[^\s\n]*/gi, '');
  cleaned = cleaned.replace(/Transaction\s+Statement\s+for\s+\d+/gi, '');
  cleaned = cleaned.replace(/\d{1,2}\s+\w+,\s+\d{4}\s*-\s*\d{1,2}\s+\w+,\s+\d{4}/g, '');

  const flat = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');

  const transactions = [];
  const MASTER_REGEX = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}:\d{2}\s+(?:am|pm))\s+(DEBIT|CREDIT)\s*(?:Γé╣|₹|INR|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)\s*(Paid to|Received from|Refund from)\s+([^Γé╣₹]+?)(?=\s+(?:DEBIT|CREDIT)\s*(?:Γé╣|₹|INR|Rs\.?)|\s+Transaction ID|\s+UTR No|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}|$)/gi;

  let match;
  while ((match = MASTER_REGEX.exec(flat)) !== null) {
    const monthStr = match[1].toLowerCase();
    const month = MONTHS[monthStr];
    let dateObj = new Date(parseInt(match[3]), month, parseInt(match[2]));
    dateObj = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
    
    const timeStr = match[4];
    const type = match[5].toLowerCase();
    const amount = parseAmount(match[6]);
    let rawMerchantName = match[8].trim();
    
    let cleanedRaw = stripEmojis(rawMerchantName);
    let merchantClean = cleanedRaw.replace(/\s*(Paid by|Credited to)\s+[A-Z0-9X]+/i, '').replace(/\s+/g, ' ').trim();
    merchantClean = cleanMerchant(merchantClean);

    if (amount <= 0 || merchantClean.length < 2) continue;

    const afterMatch = flat.substring(MASTER_REGEX.lastIndex);
    const nextDatePos = afterMatch.search(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/i);
    const segment = nextDatePos > 0 ? afterMatch.substring(0, nextDatePos) : afterMatch.substring(0, 300);

    const utrMatch = segment.match(/UTR No\.?\s*(\d+)/i);
    const txnIdMatch = segment.match(/Transaction ID\s+([A-Z0-9]+)/i);

    transactions.push({
      id: uuidv4(),
      date: dateObj.toISOString().split('T')[0],
      time: timeStr,
      merchant: merchantClean,
      rawMerchant: rawMerchantName,
      normalizedMerchant: normalizeMerchant(merchantClean),
      amount: amount,
      type: type,
      category: 'Uncategorized',
      upiRef: utrMatch ? utrMatch[1] : null,
      transactionId: txnIdMatch ? txnIdMatch[1] : null,
      status: 'Success',
      uploadedAt: new Date().toISOString()
    });
  }

  return transactions;
}

module.exports = {
  extractTransactions,
  parseAmount,
  cleanMerchant,
  normalizeMerchant
};
