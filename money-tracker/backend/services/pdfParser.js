const fs = require('fs');
const pdfParse = require('pdf-parse');
const { extractTransactions } = require('./transactionExtractor');

function preprocessText(rawText) {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, '  ') // Keep at least two spaces if they exist for split detection
    .trim();
}

async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  const text = preprocessText(data.text);
  
  const transactions = extractTransactions(text);
  return transactions;
}

module.exports = {
  parsePDF
};
