const fs = require('fs');
const tx = JSON.parse(fs.readFileSync('./data/transactions.json', 'utf8'));
console.log("Total transactions:", tx.length);
let e = 0, i = 0;
tx.forEach(t => {
  if (t.type === 'DEBIT') e += t.amount;
  if (t.type === 'CREDIT') i += t.amount;
});
console.log("Total Expenses:", e.toFixed(2));
console.log("Total Income:", i.toFixed(2));
console.log("Net Balance:", (i - e).toFixed(2));
