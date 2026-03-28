function cleanMerchant(raw) {
  let name = raw.trim();
  // Remove prefixes
  name = name.replace(/^(Paid to|Received from|Refund from)\s*/i, '');
  // Remove leading "for " (edge case: "for ALL MAART")
  name = name.replace(/^for\s+/i, '');
  // Remove trailing DEBIT/CREDIT if accidentally included
  name = name.replace(/\s+(DEBIT|CREDIT)$/i, '');
  // Trim again just in case
  name = name.trim();
  // Title case
  name = name.split(' ')
    .map(w => w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ');
  return name || 'Unknown Merchant';
}

function normalizeMerchant(displayName) {
  // Remove all emojis, spaces, special chars — keep only alphanumeric lowercase
  return displayName
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '') // remove emojis
    .replace(/[^a-z0-9]/g, '')              // remove non-alphanumeric
    .trim() || 'unknown';
}

module.exports = {
  cleanMerchant,
  normalizeMerchant
};
