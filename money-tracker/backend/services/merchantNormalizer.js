function cleanMerchant(raw) {
  if (!raw) return 'Unknown';
  
  let name = raw;

  // STEP 1 — Strip ALL emojis and special unicode characters
  name = name.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');  // Misc symbols, emoticons
  name = name.replace(/[\u{2600}-\u{26FF}]/gu, '');     // Misc symbols
  name = name.replace(/[\u{2700}-\u{27BF}]/gu, '');     // Dingbats
  name = name.replace(/[\u{FE00}-\u{FE0F}]/gu, '');     // Variation selectors
  name = name.replace(/[\u{1F000}-\u{1FFFF}]/gu, '');   // Supplemental symbols
  name = name.replace(/[\u{E0000}-\u{E007F}]/gu, '');   // Tags
  name = name.replace(/[\u200D]/g, '');                  // Zero width joiner
  name = name.replace(/[\uFE0F]/g, '');                  // Variation selector-16
  name = name.replace(/[\u20E3]/g, '');                  // Combining enclosing keycap

  // STEP 2 — Remove transaction prefixes
  name = name.replace(/^(Paid to|Received from|Refund from)\s*/i, '');
  
  // STEP 3 — Remove leading "for " artifact
  name = name.replace(/^for\s+/i, '');
  
  // STEP 4 — Remove trailing DEBIT/CREDIT if accidentally included
  name = name.replace(/\s+(DEBIT|CREDIT)$/i, '');
  
  // STEP 5 — Remove any remaining non-printable characters
  name = name.replace(/[^\x20-\x7E\u00C0-\u024F]/g, '');
  
  // STEP 6 — Collapse multiple spaces
  name = name.replace(/\s+/g, ' ').trim();
  
  // STEP 7 — Title case
  name = name.split(' ')
    .filter(w => w.length > 0)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return name || 'Unknown Merchant';
}

function normalizeMerchant(displayName) {
  if (!displayName) return 'unknown';
  
  return displayName
    .toLowerCase()
    // Strip all emoji unicode ranges
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{E0000}-\u{E007F}]/gu, '')
    .replace(/[\u200D]/g, '')
    .replace(/[\uFE0F]/g, '')
    .replace(/[\u20E3]/g, '')
    // Remove all non-alphanumeric
    .replace(/[^a-z0-9]/g, '')
    .trim() || 'unknown';
}

module.exports = {
  cleanMerchant,
  normalizeMerchant
};
