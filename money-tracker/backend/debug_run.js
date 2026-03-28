const fs = require('fs');
const pdfParse = require('pdf-parse');
async function test() {
  const data = await pdfParse(fs.readFileSync('../TESTFILE.pdf'));
  let txns = data.text.split('\n').filter(l => (l.includes('DEBIT') || l.includes('CREDIT')) && l.includes('₹'));
  console.log('Exact tx lines:', txns.length);
  // Find EXACT matches for the full match regex:
  const r = /^(DEBIT|CREDIT)\s*₹\s*([\d,]+(?:\.\d{1,2})?)\s*(Paid to|Received from|Refund from)\s+(.+)$/i;
  let fullMatches = txns.filter(t => r.test(t.trim()));
  console.log('Matches for FULL_TXN_REGEX:', fullMatches.length);
  
  const r2 = /^(DEBIT|CREDIT)\s*₹\s*([\d,]+(?:\.\d{1,2})?)\s*(Paid to|Received from|Refund from)\s*$/i;
  let noMerchantMatches = txns.filter(t => r2.test(t.trim()));
  console.log('Matches for NO_MERCHANT_TXN_REGEX:', noMerchantMatches.length);
  
  // Total transaction lines that fail BOTH
  let failBoth = txns.filter(t => !r.test(t.trim()) && !r2.test(t.trim()));
  console.log('Failing BOTH:', failBoth.length);
  console.log('Failing lines:', failBoth);
}
test();
