const pdfParse = require('pdf-parse');
const { extractTransactions } = require('./transactionExtractor');

function preprocessText(rawText) {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, '  ')
    .trim();
}

// Accepts either a file path (string) or a Buffer (for in-memory/Vercel use)
async function parsePDF(input) {
  const dataBuffer = Buffer.isBuffer(input) ? input : require('fs').readFileSync(input);
  const data = await pdfParse(dataBuffer);
  const text = preprocessText(data.text);
  const transactions = extractTransactions(text);
  return transactions;
}

module.exports = { parsePDF };
