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

function parseGooglePay(rawText) {
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const GPAY_REGEX = /(\d{1,2})\s*([A-Za-z]+),\s*(\d{4})\s+(\d{1,2}:\d{2})\s*([AP]M|am|pm)\s+(Paid\s*to|Received\s*from)\s*(.+?)\s+UPI\s*Transaction\s*ID\s*:\s*(\d+)\s+(?:Paid\s*by|Received\s*in|Deposit\s*to|Credited\s*to)?\s*(.+?)\s*(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)/gi;

  const transactions = [];
  let match;
  while ((match = GPAY_REGEX.exec(cleanText)) !== null) {
    try {
      const day = parseInt(match[1]);
      const monthName = match[2].replace(/,/g, '').toLowerCase().substring(0, 3);
      const year = parseInt(match[3]);
      const timeStr = `${match[4]} ${match[5]}`;
      const direction = match[6].toLowerCase();
      const rawMerchant = match[7].trim();
      const upiTransactionId = match[8];
      const paymentAccount = match[9].trim();
      const amountStr = match[10];

      // Parse date
      const month = MONTHS[monthName];
      if (isNaN(day) || month === undefined || isNaN(year)) {
        throw new Error(`Invalid date components: day=${day}, monthName=${monthName}, year=${year}`);
      }
      let dateObj = new Date(year, month, day);
      dateObj = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
      const formattedDate = dateObj.toISOString().split('T')[0];

      // Parse amount
      const amount = parseFloat(amountStr.replace(/,/g, ''));
      if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount: ${amountStr}`);
      }

      // Default every transaction to "DEBIT" unless the block contains "Received from" instead of "Paid to"
      // in that case treat it as "CREDIT"
      const transactionType = direction.includes('received') ? 'CREDIT' : 'DEBIT';

      let merchantClean = stripEmojis(rawMerchant);
      merchantClean = cleanMerchant(merchantClean);

      transactions.push({
        id: uuidv4(),
        provider: "GPAY",
        date: formattedDate,
        time: timeStr,
        merchant: merchantClean,
        normalizedMerchant: normalizeMerchant(merchantClean),
        amount: amount,
        transactionType,
        type: transactionType.toLowerCase(), // for pipeline compatibility
        transactionId: upiTransactionId,
        upiRef: null,
        utrNumber: null,
        paymentAccount,
        uploadedAt: new Date().toISOString(),
        status: 'Success'
      });
    } catch (err) {
      console.warn('Skipping GPay transaction due to parsing error:', err.message);
    }
  }

  return transactions;
}

function parsePaytm(rawText) {
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Extract year from header
  // e.g. "19 MAY'26 - 18 JUN'26" or "19 MAY'2026 - 18 JUN'2026"
  const headerMatch = cleanText.match(/(\d{1,2}\s+[A-Za-z]+'?\d{2,4})\s*-\s*(\d{1,2}\s+[A-Za-z]+'?\d{2,4})/i);
  let year = new Date().getFullYear();
  if (headerMatch) {
    const endRange = headerMatch[2];
    const yearMatch = endRange.match(/'?(\d{2,4})$/);
    if (yearMatch) {
      let parsedYear = yearMatch[1];
      if (parsedYear.length === 2) {
        parsedYear = "20" + parsedYear;
      }
      year = parseInt(parsedYear);
    }
  }

  // Regex matches Paytm transaction blocks
  const PAYTM_REGEX = /(\d{1,2})\s*([A-Za-z]{3})\s+(\d{1,2}:\d{2})\s*([AP]M|am|pm)\s+(Paid\s*to|Received\s*from|Refund\s*from|Paid\s*by|Credited\s*to)\s*(.+?)\s+UPI\s*ID\s*:\s*(.+?)\s+on\s*Paytm\s+(?:Tag\s*:\s*.+?\s+)?(.+?)\s+([+-])\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d+)?)\s+UPI\s*Ref\s*No\s*:\s*(\d+)/gi;

  const transactions = [];
  let match;
  while ((match = PAYTM_REGEX.exec(cleanText)) !== null) {
    try {
      const day = parseInt(match[1]);
      const monthName = match[2].toLowerCase().substring(0, 3);
      const timeStr = `${match[3]} ${match[4]}`;
      const merchantRaw = match[6].trim();
      const upiId = match[7].trim();
      const paymentAccount = match[8].trim();
      const sign = match[9];
      const amountStr = match[10];
      const referenceNumber = match[11];

      // Parse date
      const month = MONTHS[monthName];
      if (isNaN(day) || month === undefined) {
        throw new Error(`Invalid date components: day=${day}, monthName=${monthName}`);
      }

      // Dec->Jan edge case: default to header's end-year (known limitation)
      let dateObj = new Date(year, month, day);
      dateObj = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
      const formattedDate = dateObj.toISOString().split('T')[0];

      // Parse amount
      const amount = parseFloat(amountStr.replace(/,/g, ''));
      if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount: ${amountStr}`);
      }

      const transactionType = sign === '+' ? 'CREDIT' : 'DEBIT';

      let merchantClean = stripEmojis(merchantRaw);
      merchantClean = cleanMerchant(merchantClean);

      transactions.push({
        id: uuidv4(),
        provider: "PAYTM",
        date: formattedDate,
        time: timeStr,
        merchant: merchantClean,
        normalizedMerchant: normalizeMerchant(merchantClean),
        amount: amount,
        transactionType,
        type: transactionType.toLowerCase(), // for pipeline compatibility
        transactionId: referenceNumber,
        upiRef: null,
        utrNumber: null,
        paymentAccount,
        upiId,
        uploadedAt: new Date().toISOString(),
        status: 'Success'
      });
    } catch (err) {
      console.warn('Skipping Paytm transaction due to parsing error:', err.message);
    }
  }

  return transactions;
}

function parseGeneric(text) {
  console.log("Generic parser not yet implemented");
  return [];
}

module.exports = {
  extractTransactions,
  parseGooglePay,
  parsePaytm,
  parseGeneric,
  parseAmount,
  cleanMerchant,
  normalizeMerchant
};
