const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
  const data = await pdfParse(fs.readFileSync('../test_statement.pdf'));
  const rawText = data.text;
  let cleaned = rawText
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/Date\s+Transaction\s+Details\s+Type\s+Amount/gi, '')
    .replace(/This\s+is\s+a\s+system\s+generated\s+statement\./gi, '')
    .replace(/For\s+any\s+queries,?\s+contact\s+us\s+at\s+https?:\/\/[^\s\n]*/gi, '')
    .replace(/https?:\/\/support\.phonepe\.com[^\s\n]*/gi, '')
    .replace(/https?:\/\/www\.phonepe\.com[^\s\n]*/gi, '')
    .replace(/DateTransaction\s*DetailsTypeAmount/gi, '');
  
  const flat = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
  
  // Try with a simpler end boundary
  const MASTER_REGEX = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}:\d{2}\s+(?:am|pm))\s+(DEBIT|CREDIT)\s*₹\s*([\d,]+(?:\.\d{1,2})?)\s*(Paid to|Received from|Refund from)\s+([^₹]+?)(?=\s+(?:DEBIT|CREDIT)\s*₹|\s+Transaction ID|\s+UTR No|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}|$)/gi;
  
  const matches = [...flat.matchAll(MASTER_REGEX)];
  console.log("Count:", matches.length);
  const unk = matches.filter(m => !m[8].trim());
  console.log("Empty merchants:", unk.length);
  matches.slice(0,3).forEach((m,i) => {
    console.log(`[${i}] date=${m[1]} ${m[2]}, ${m[3]} type=${m[5]} amount=${m[6]} merchant="${m[8].trim().substring(0,40)}"`);
  });
}
test();
