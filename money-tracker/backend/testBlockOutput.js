const { extractTransactions } = require('./services/transactionExtractor');

const rawText = `
Transaction Statement for 8300032430
01 Feb, 2026 - 31 Mar, 2026
Date Transaction Details Type Amount
Mar 24, 2026
03:06 pm
Paid to Ruchi🤍 DEBIT ₹10
Transaction ID T2603241506018132532500
UTR No. 848678606191
Paid by XXXXXX7038
Mar 24, 2026
03:05 pm
Received from Ruchi🤍 CREDIT ₹10
Transaction ID T2603241505340337763310
UTR No. 838124444968
Credited to XXXXXX7038
Mar 14, 2026
10:10 am
Paid to DEBIT ₹100
THE VELLORE DISTRICT CONSUMERS COOP WHOLESALE STORES LIMITED
Transaction ID T2602141010365075099162
UTR No. 122212628189
Paid by XXXXXX7038
`;

const txns = extractTransactions(rawText);
console.log(JSON.stringify(txns, null, 2));
