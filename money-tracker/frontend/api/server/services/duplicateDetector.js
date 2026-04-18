function isDuplicate(newTxn, existingTransactions) {
  // UTR is unique per transaction in PhonePe — use it as primary key
  if (newTxn.upiRef && newTxn.upiRef.trim() !== '') {
    return existingTransactions.some(t =>
      t.upiRef &&
      t.upiRef.trim() === newTxn.upiRef.trim()
    );
  }

  // Fallback: use Transaction ID
  if (newTxn.transactionId && newTxn.transactionId.trim() !== '') {
    return existingTransactions.some(t =>
      t.transactionId &&
      t.transactionId.trim() === newTxn.transactionId.trim()
    );
  }

  // Last resort fallback
  return existingTransactions.some(t =>
    t.date === newTxn.date &&
    t.time === newTxn.time &&
    t.amount === newTxn.amount &&
    t.type === newTxn.type &&
    t.normalizedMerchant === newTxn.normalizedMerchant
  );
}

// Add the filterDuplicates function since upload.js calls it
function filterDuplicates(newTransactions, existingTransactions) {
  const added = [];
  const duplicates = [];
  
  // We should also check for duplicates within the new batch itself
  const seenInBatch = new Set();

  for (const t of newTransactions) {
    let batchKey;
    if (t.upiRef && t.upiRef.trim() !== '') {
      batchKey = `utr_${t.upiRef.trim()}`;
    } else if (t.transactionId && t.transactionId.trim() !== '') {
      batchKey = `txnid_${t.transactionId.trim()}`;
    } else {
      batchKey = `${t.date}_${t.amount}_${t.normalizedMerchant}_${t.time}`;
    }
    
    if (isDuplicate(t, existingTransactions) || seenInBatch.has(batchKey)) {
      duplicates.push(t);
    } else {
      added.push(t);
      seenInBatch.add(batchKey);
    }
  }

  return { added, duplicates: duplicates.length };
}

module.exports = { 
  isDuplicate,
  filterDuplicates
};
